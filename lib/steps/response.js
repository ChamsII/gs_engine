/*
	Copyright (C) 2016  Julien Le Fur

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
	
*/
var env = process.env;
var http = require('http');
var dataAccess = (env.MODE=='file')?require(__base + 'lib/dataAccess/fsAccess'):require(__base + 'lib/dataAccess/mongoAccess');
var fs = require('fs');
var async = require('async');
var ParamGenerator = require(__base + 'lib/data/param/paramGenerator.js');
var feedersExtractor = require(__base + 'lib/data/tp/feedersExtractor');


getDelay=function(delay,startTime){
	var now = new Date().getTime();
	if(now-startTime > delay)
		return 0;
	else
		return delay -(now-startTime);
}


feederCallBack = function (value) {

}



exports.execute = function (request, response, runCtxt, callback) {
    runCtxt.debug('STEP RESPONSE - Start');
    async.waterfall([
        function (callback) {
			var start = new Date().getTime();
			dataAccess.getJDD(runCtxt.jdd,(err,data)=>{
				return callback(err, data,start);
			});
        },
        function (jdd,start,callback) {
            runCtxt.info('STEP RESPONSE - template ' + jdd.template);
     	    if(runCtxt.operation.delay != undefined){
				jdd.delay=runCtxt.operation.delay;
			}else{
				if(jdd.delay == undefined)
					jdd.delay=0;
			}

			if(jdd.parameters==undefined)
				return callback(null,jdd,start);

	
            async.eachSeries(jdd.parameters,(param,callback)=>{
                ParamGenerator.generate(param,runCtxt,(err,value) =>{
                    if(err)
                        value='';
                    runCtxt.parameters[param.name]=value;
                    return callback(null);
                });
            },function(err){
                if(err)
                    return callback(err);
                return callback(null,jdd,start);
            });	
        },
        function(jdd,start,callback){
        	dataAccess.getTemplate(runCtxt,jdd.template, (err,tempFn) => {
				if(err){
					return callback(err);
				}
				var resultText = tempFn(runCtxt.parameters);

 				var feederNumber = 0;
				if( runCtxt.parameters.feederIDQUERY ){
					feederNumber = runCtxt.parameters.feederIDQUERY;
				}else if( runCtxt.parameters.feederIDXPATH ){
					feederNumber = runCtxt.parameters.feederIDXPATH;
				}else if( runCtxt.parameters.feederIDPATH ){
					feederNumber = runCtxt.parameters.feederIDPATH;
				}else if( runCtxt.parameters.feederIDHEADER){
					feederNumber = runCtxt.parameters.feederIDHEADER;
				}else if( runCtxt.parameters.feederIDJPATH){
					feederNumber = runCtxt.parameters.feederIDJPATH;
				}else if( runCtxt.parameters.feederIDPOSITION){
					feederNumber = runCtxt.parameters.feederIDPOSITION;
				}else if( runCtxt.parameters.feederIDTLV){
					feederNumber = runCtxt.parameters.feederIDTLV;
				}

				// **************************** Feeders Properties ****************************
                if( runCtxt.operation.feederProperties != undefined ) {

                	runCtxt.debug('STEP FEEDER - Start');
                	var feederProperties = runCtxt.operation.feederProperties;

                    async.eachSeries(feederProperties,(feed,callback)=> {

                    	var rowFeeder = feederPropertiesFiles.find( selectRow => selectRow.name === feed.csvFile );
					    var valueFeeder = JSON.parse( rowFeeder.value );

					    //If random
						var randomeLine;
						var lineNumber = 0;

						if(runCtxt.parameters.feeder){
							randomeLine = valueFeeder.rows.find( randomSelect => randomSelect[runCtxt.parameters.feeder.name] == runCtxt.parameters.feeder.value );
							if( !randomeLine || randomeLine == undefined ){
								lineNumber = Math.floor( Math.random()* (valueFeeder.rows.length - 1) + 1);
								runCtxt.debug( 'FEEDER ERROR - ' + '[' + runCtxt.parameters.feeder.name + '] -> ' + runCtxt.parameters.feeder.value + ' NOT FOUND - Read random ' );
							}
						}else if( parseInt(feederNumber) != 0 && valueFeeder.rows.length >= parseInt(feederNumber)  ){
							lineNumber = parseInt(feederNumber) - 1;
						}else if( parseInt(feed.isRandom) != 0 && valueFeeder.rows.length >= parseInt(feed.isRandom) ) {
							lineNumber = parseInt(feed.isRandom) - 1;
						}else {
							lineNumber = Math.floor( Math.random()* (valueFeeder.rows.length - 1) + 1);
						} 
						
						if( lineNumber != 0 ) {
							//randomeLine = valueFeeder.rows.find( randomSelect => randomSelect.id == lineNumber );
							randomeLine = valueFeeder.rows[lineNumber];
						}

						async.eachSeries(feed.value,(fp,callback)=>{

							runCtxt.debug( 'FEEDER SET - ' + fp.baliseResponse + ' - ' + randomeLine[fp.fileKey] );

							if( feed.type == "xml" ){
								resultText = feedersExtractor.setValueInFrame(resultText, fp.baliseResponse, randomeLine[fp.fileKey]);
							}else{
								resultText = feedersExtractor.setValueInJson(resultText, fp.baliseResponse, randomeLine[fp.fileKey]);
							}
							return callback(null);

						},function(err){
							if(err)
								return callback(err);
							return callback(null,jdd,start,resultText);
						});
						

                    },function(err){
					    if(err)
							return callback(err);
							
					    runCtxt.debug('STEP FEEDER - End');
						return callback(null,jdd,start,resultText);
					});

                }else{
	                runCtxt.debug('STEP FEEDER - No Feeders');
					return callback(null,jdd,start,resultText);
                }

				
			});
        },
        function(jdd,start,msg,callback){
        	if(runCtxt.postParam==undefined){
        		return callback(null,jdd,start,msg);
        	}

        	runCtxt.info('STEP RESPONSE - Recalcule template ' + jdd.template);
			async.eachSeries(runCtxt.postParam,(param,callback)=>{
				ParamGenerator.calculate(param,runCtxt,msg,(err,value) =>{
					if(err)
						value='';
					runCtxt.parameters[param.name]=value;
					return callback(null);
				});
			},function(err){
				if(err)
					return callback(err);
				
				dataAccess.getTemplate(runCtxt,jdd.template, (err,tempFn) => {
					if(err){
						return callback(err);
					}
					var resultText = tempFn(runCtxt.parameters);
					runCtxt.debug(resultText);



					return callback(null,jdd,start,resultText);
				});
		});
			
    },
		function(jdd,start,resultText,callback){
			setTimeout(function(){
				runCtxt.info('STEP RESPONSE [[]]- Delay:'+jdd.delay + ' - duration:'+(new Date().getTime()-start)+' ms');
				response.writeHead(200, { 
					'Content-Type': runCtxt.operation.responseType!=undefined?runCtxt.operation.responseType:'text/plain',
					'Access-Control-Allow-Origin': '*'
				});
				response.write(resultText);
				response.end();
				return callback(null,jdd,new Date().getTime());
			},getDelay(jdd.delay,runCtxt.stats.startTime));

        },
        function (jdd, start, callback) {
        	if(jdd.callback===undefined || jdd.callback.template===undefined){
        		return callback(null);
        	}
        	else{
	        	dataAccess.getTemplate(runCtxt,jdd.callback.template, (err,tempFn) => {
	        		if(err){
					return callback(err);
				}
	        	var resultText = tempFn(runCtxt.parameters);
				runCtxt.debug(resultText);
	        		setTimeout(function(){
						var cbPath=jdd.callback.path;
						var index = cbPath.indexOf('{');
						if(index != -1){
							var deb = cbPath.substring(0,index);
    							var indexE = cbPath.indexOf('}');
    							var fin = cbPath.substring(indexE+1,cbPath.length);
    							var varD = cbPath.substring(index+1,indexE);
							varD = runCtxt.parameters[varD];
							//var varDyn=cbPath.substring(index+1);
							//var indexEnd=varDyn.indexOf('}')
							//varDyn=varDyn.substring(0,indexEnd);
							//varDyn=runCtxt.parameters[varDyn];
							//cbPath=cbPath.substring(0,index)+varDyn+cbPath.substring(indexEnd);
							cbPath= deb + varD + fin;
						}
						var options={
							hostname:jdd.callback.hostname,
							port:jdd.callback.port,
							path:cbPath,
							method:'POST',
							headers:{
								'Content-Length': resultText.length
							}
						};
						for(idHeader in jdd.callback.headers){
			                var h = jdd.callback.headers[idHeader];
			                options.headers[h.name]=h.value;
						}
						var callback_res='';
						var req=http.request(options,(res)=>{
							res.on('data',(chunk)=>{
								callback_res+=chunk;
							});
							res.on('end',()=>{
								if(res.statusCode!='200'){
									runCtxt.error('STEP CALLBACK - '+ callback_res);
								}
								return callback(null);
							});
						});
						req.on('error',(e)=>{
							runCtxt.error('STEP CALLBACK - '+e.message);
							return callback(null);
						});

						runCtxt.info('STEP CALLBACK - URL: http://'+jdd.callback.hostname+':'+jdd.callback.port+cbPath);
						runCtxt.info('STEP CALLBACK - Delay:'+jdd.callback.delay + ' - duration:'+(new Date().getTime()-start)+' ms');

						req.write(resultText);
						response.writeHead(200, { 
							'Content-Type': runCtxt.operation.responseType!=undefined?runCtxt.operation.responseType:'text/plain',
							'Access-Control-Allow-Origin': '*'
						});
						req.end();
						
					},jdd.callback.delay);
        		});
	        }
        }
    ], function (err, result) {
	runCtxt.stats.responseTime=new Date().getTime();
        return callback(err,request, response, runCtxt);
    });   
}
