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
var dataAccess = (env.MODE=='file')?require(__base + 'lib/dataAccess/fsAccess'):require(__base + 'lib/dataAccess/mongoAccess');
var fs = require('fs');
var async = require('async');

exports.execute = function (request, response, runCtxt, callback) {
    runCtxt.debug('STEP RESPONSE - Start');
    async.waterfall([
        function (callback) {
			var start = new Date().getTime();
			dataAccess.getJDD(runCtxt.jdd,(err,data)=>{callback(err, data,start)});
        },
        function (jdd,start,callback) {
            runCtxt.info('STEP RESPONSE - template ' + jdd.template);
     	    if(runCtxt.operation.delay != undefined){
				jdd.delay=runCtxt.operation.delay;
			}else{
				if(jdd.delay == undefined)
					jdd.delay=0;
			}
			dataAccess.getTemplate(runCtxt,jdd.template, (err,tempFn) => {
				if(err)callback(err);
				var resultText = tempFn(runCtxt.parameters);
				setTimeout(function(){
					runCtxt.info('STEP RESPONSE - Delay:'+jdd.delay + ' - duration:'+(new Date().getTime()-start)+' ms');
					response.writeHead(200, { 
						'Content-Type': runCtxt.operation.responseType!=undefined?runCtxt.operation.responseType:'text/plain'
					});
					response.write(resultText);
					response.end();
					callback(err);
				},jdd.delay);
			});
        }
    ], function (err, result) {
		runCtxt.stats.responseTime=new Date().getTime();
        callback(err,request, response, runCtxt);
    });   
}