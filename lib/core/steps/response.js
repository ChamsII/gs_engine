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
var dataAccess = (env.MODE=='file')?require('../dataAccess/genesisFileAccess'):require('../dataAccess/genesisFileAccess');
var fs = require('fs');
var async = require('async');

exports.execute = function (request, response, runCtxt, callback) {
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
		runCtxt.stats.responseTime=new Date().getTime();
        callback(err,request, response, runCtxt);
    });
    
}