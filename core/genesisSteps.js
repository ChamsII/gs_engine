var url = require('url');
var fs = require('fs');
var paramManager = require('./genesisParam');
var async = require('async');
var doT = require("dot");
var dataAccess = require('./dataAccess/genesisDataAccess');

exports.onStartStep = function (genesisContext, callback) {
        logger.debug('STEP START - test log');
}

/**
    * Step onPost
    */
exports.onPostStep = function (req, runCtxt, callback) {
    runCtxt.debug('STEP POST');
    if (req.method == 'POST') {
        var body = '';
        req.on('data', function (chunk) { 
            body += chunk.toString();
            runCtxt.debug(chunk.toString());
        });
        req.on('end', function () {
            req.post = body;
            callback();
        });
    } else {
        callback();
    }
}

/**
    * Step onRequest
    */
exports.onRequestStep = function (request, genesisContext, runCtxt, callback) {
    
    var ip = request.headers['x-forwarded-for'] || 
            request.connection.remoteAddress || 
            request.socket.remoteAddress ||
            request.connection.socket.remoteAddress;
    
    runCtxt.ip = ip;
    
    var url_parts = url.parse(request.url, true);
    var basepath = url_parts.pathname.split('/')[1];
    var service = genesisContext.getService(basepath);
    
    runCtxt.url_parts = url_parts;
    runCtxt.basepath = basepath;
    
    runCtxt.debug('STEP REQUEST');
    
    //Check if the service exists
    if (service == undefined) {
        runCtxt.error('STEP REQUEST - SERVICE inconnu');
        callback(new Error('Service inconnu'));
        return;
    }
    
    runCtxt.service = service;
    
    //Check Service status
    if (service.state == 'stopped') {
        runCtxt.info('STEP REQUEST - SERVICE arrêté');
        callback(new Error('Service arrêté'));
        return;
    }
    
    //Check the API 
    for (i in service.apis) {
        var api = service.apis[i];
        var reg = new RegExp("{[a-zA-Z0-9]+}", "g");
        var uri_formatted = api.uri.replace(reg, "[a-zA-Z0-9]+");
        var URI = new RegExp("/" + basepath + uri_formatted + '$', "g");
        
        //Check if the URI match the config for the selected service
        if (url_parts.pathname.match(URI)) {
            break;
        } else {
            api = null;
        }
    }
    if (api == null) {
        runCtxt.info('STEP REQUEST - API inconnue - ' + url_parts.pathname);
        callback(new Error('API inconnue'));
        return;
    }
    runCtxt.api = api;
    
    //Check the request method
    for (opInd in api.operations) {
        var operation = api.operations[opInd];
        if (operation.method == request.method) {
            break;
        } else {
            operation = null;
        }
    }
    if (operation == null) {
        runCtxt.info('STEP REQUEST - Opération inconnue - ' + api.uri + ' - ' + request.method);
        callback(new Error('Méthode non implémentée'));
        return;
    }
    
    runCtxt.info('STEP REQUEST - ' + api.uri + ' - ' + request.method);
    
    runCtxt.operation = operation;
    
    callback(null);

}

/**
    * Step paramStep - Build the parameter list (transferProperties, global parameters...)
    */
exports.paramStep = function (genesisContext, runCtxt, body, headers, callback) {
    
    runCtxt.debug('STEP PARAM - Start');
    var start = new Date().getTime();
    
    var operation = runCtxt.operation;

    async.waterfall([
            function (callback) {
	        var bodyToParse=false;
	    	for (tpInd in operation.transferProperties) {
			var tp = operation.transferProperties[tpInd];
			if(paramManager.parsingNeeded(tp)){
			  bodyToParse=true;
			  break;  
			}
		}
		if(bodyToParse){
	        	paramManager.parseXML(body,runCtxt,function(err){
				if(err){
				 	callback(err);
			 	}	
				else{
				 	callback(null);
				}
			});
		}else{
			callback(null);
		}
	    	
	    },
	    function (callback) {
	        //Extract the transferProperties
		var tpCount=0;
		if(operation.transferProperties.length==0){
		  callback(null);
		}
	    	for (tpInd in operation.transferProperties) {
		 	var tp = operation.transferProperties[tpInd];
			paramManager.extractParam(tp, body, headers, runCtxt , function (err,name,value) {
			 	tpCount++;
				if (err != null) {
					runCtxt.error('Parameter ' + name + ' not found!');
					value = '';
				}
				runCtxt.debug('TP:'+name+' -Value:'+value);
				runCtxt.parameters[name] = value;
				if(tpCount == operation.transferProperties.length){
				  paramManager.deleteParse(runCtxt,function(err){
				    if(err){
				     callback(err);
				    }else{
				     callback(null);
				    }
				  });
				}
			});
		}
	    },
	    function(callback){
		//Generate the parameters
		for (paramInd in operation.parameters) {
		 	var param = operation.parameters[paramInd];
			paramManager.genereParam(param, runCtxt, function (err, value) {
			 	if (err != null) {
				 	runCtxt.error('Parameter ' + param.name + ' not found!');
					value = '';
				}
				runCtxt.parameters[param.name] = value;
			});
		}
		runCtxt.info('STEP PARAM - ' + JSON.stringify(runCtxt.parameters) + '- duration :'+ (new Date().getTime()-start)+'ms');
		callback(null);
	    }
    ], function (err, result) {
	      callback(null);
	      return;
    });
    
}

//look for the JDD by analysing the dispatch key 
exports.dispatchStep = function (genesisContext, runCtxt, callback) {
  
    runCtxt.debug('STEP DISPATCH - Start');
    var target = "default";
    // KEY
    var keys = runCtxt.operation.keys;
    var dispatchVal='';
    for (keyInd in keys) {
        keyVal = runCtxt.parameters[keys[keyInd].name];
        if (keyVal != undefined) {
            if (dispatchVal.length > 0)
                dispatchVal = dispatchVal + '.';
            dispatchVal = dispatchVal + keyVal;
        }
    }
    target=dispatchVal;
    runCtxt.debug("dispatchVal:"+dispatchVal);
	
    //REGEXP
    regExpkeys = runCtxt.operation.regExpKeys;
    for (regExpInd in regExpkeys) {
        regExpVal = runCtxt.parameters[regExpkeys[regExpInd].regle];
        var reg = new RegExp(regExpVal, "g");
        if (dispatchVal.match(reg)) {
            target = regExpkeys[regExpInd].target;
        }
		break;
    }
     runCtxt.debug("target:"+target);
    
    
	// a remplacer par l'accès aux données
	var apiDir = "./"+runCtxt.service.directory + '/' + runCtxt.api.name;
	var ope = "/"+runCtxt.api.name + "-";
    fs.exists(apiDir + ope +  target + ".json", function (exists) {
        if (exists) {
            runCtxt.jdd = apiDir + ope + target + ".json";
            runCtxt.info('STEP DISPATCH - ' + runCtxt.jdd);
            callback(null);
        }
        else {
            runCtxt.jdd = apiDir + ope + ".json";
            runCtxt.info('STEP DISPATCH - ' + runCtxt.jdd);
            callback(null);
         }
        }

    );
    
    return;
}


exports.onResponseStep = function (response, genesisContext, runCtxt, cb) {
    runCtxt.debug('STEP RESPONSE - Start');
    async.waterfall([
        function (callback) {
	    var start = new Date().getTime();
			// a remplacer par l'accès aux données
            fs.readFile(runCtxt.jdd, { encoding: 'utf-8' }, function (err, data) {
                callback(err, JSON.parse(data),start);
            });
        },
        function (jdd,start, callback) {
            runCtxt.info('STEP RESPONSE - template ' + jdd.template);
     	    if(runCtxt.operation.delay != undefined){
		jdd.delay=runCtxt.operation.delay;
	    }else{
         	if(jdd.delay == undefined)
	        	jdd.delay=0;
	    }
	    dataAccess.getTemplate(runCtxt.service.directory,runCtxt.api.name,jdd.template, function(err,tempFn){
	     	if(err)callback(err);
	   	var resultText = tempFn(runCtxt.parameters);
		setTimeout(function(){
	 		runCtxt.info('STEP RESPONSE - Delay:'+jdd.delay + ' - duration:'+(new Date().getTime()-start)+' ms');
			//response.setEncoding('utf8');
	 		response.writeHead(200, { 
			 	'Content-Type': runCtxt.operation.responseType!=undefined?runCtxt.operation.responseType:'text/plain'
				//'Content-Length':Buffer.byteLength(resultText, 'utf-8'),
			//	'Transfer-Encoding': 'chunked'
				});
			response.write(resultText);
	 		response.end();
	 		callback(err);
		},jdd.delay);
	    });
        }
    ], function (err, result) {
        //runCtxt.info('STEP RESPONSE');
        cb(err);
    });
    
}


exports.afterResponseStep = function (genesisContext, callback) {



}


exports.onStopStep = function (genesisContext, callback) {

}




