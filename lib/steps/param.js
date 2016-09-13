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
var ParamGenerator = require(__base + 'lib/data/param/paramGenerator.js');
var TpExtractor = require(__base + 'lib/data/tp/tpExtractor.js');
var async = require('async');

exports.execute = function (request, response, runCtxt, callback) {
  
    runCtxt.debug('STEP PARAM - Start');
    var start = new Date().getTime();
    
    var operation = runCtxt.operation;

    async.waterfall([
			function (callback) {
				async.eachSeries(operation.transferProperties,(tp,callback)=>{
					TpExtractor.extract(tp, request, runCtxt, (err,value)=>{
						if(err){
							value = '';
						}
						runCtxt.parameters[tp.name] = value;
						return callback(null);
					});
				},function(err){
					if(err)
						return callback(err);
					return callback(null);
				});
			},
			function(callback){
				//Generate the parameters

				if(operation.parameters.length==0){
				  callback(null);
				  return;
				}


				async.eachSeries(operation.parameters,(param,callback)=>{
					ParamGenerator.generate(param,runCtxt,(err,value) =>{
						if(err)
							value='';
						runCtxt.parameters[param.name]=value;
						return callback(null);
					});
				},function(err){
					if(err)
						return callback(err);
					return callback(null);
				});


				/*for (paramInd in operation.parameters) {
					var param = operation.parameters[paramInd];
					paramManager.genereParam(param, runCtxt, function (err, value) {
						if (err != null) {
							runCtxt.error('Parameter ' + param.name + ' not found!');
							value = '';
						}
						runCtxt.parameters[param.name] = value;
					});
				}*/
				
			}
		], function (err, result) {
			  if(err)
				callback(err);
			  runCtxt.info('STEP PARAM - ' + JSON.stringify(runCtxt.parameters) + '- duration :'+ (new Date().getTime()-start)+'ms');
			  callback(null,request,response, runCtxt);
			  return;
		});
    
}