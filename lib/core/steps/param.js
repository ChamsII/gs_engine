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
var paramManager = require('../genesisParam');
var async = require('async');

exports.execute = function (request, response, runCtxt, callback) {
  
    runCtxt.debug('STEP PARAM - Start');
    var start = new Date().getTime();
    
    var operation = runCtxt.operation;
	
	var body=request.post;
	var headers=request.headers;

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
			  if(err)
				callback(err);
			  callback(null,request,response, runCtxt);
			  return;
		});
    
}