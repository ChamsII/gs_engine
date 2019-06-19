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
var async = require('async');
var http = require('http');

var runContext = require(__base + 'lib/utils/runContext');
//all steps
var stepRequest = require(__base + 'lib/steps/request');
var stepPost = require(__base + 'lib/steps/post');
var stepParam = require(__base + 'lib/steps/param');
var stepDispatch = require(__base + 'lib/steps/dispatch');
var stepResponse = require(__base + 'lib/steps/response');
var SDC = require('statsd-client'), sdc = new SDC({host:'localhost',port:8125});


exports.engine = function (req, res, next) {
    var runCtxt = new runContext.RunContext();

    runCtxt.debug('NEW REQUEST');
    runCtxt.stats={};
    runCtxt.stats.startDate=new Date();
    runCtxt.stats.startTime=new Date().getTime();

	res.setHeader('Access-Control-Expose-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With');
    res.setHeader('Access-Control-Allow-Origin', '*');

  
    async.waterfall([
		async.apply(stepRequest.execute,req,res,runCtxt),
		stepPost.execute,
		stepParam.execute,
		stepDispatch.execute,
		stepResponse.execute
    ], function (err) {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end(err.message);
        }
		sdc.increment("GENESIS.genesis1.all.count");
		sdc.timing("GENESIS.genesis1.all.time",runCtxt.stats.startDate);
		sdc.timing("GENESIS.genesis1."+runCtxt.basepath+".time",runCtxt.stats.startDate);
		sdc.increment("GENESIS.genesis1."+runCtxt.basepath+".count");
		runCtxt.stat('TOTAL duration - '+ (runCtxt.stats.responseTime - runCtxt.stats.startTime) + ' ms');
		
			
		runCtxt=null;
		delete runCtxt;
    });

};

exports.createServer = function(){
    var server=http.createServer(this.engine);
	
	server.on('connection', function (socket) {
		socket.setTimeout(10000);
	});
	return server;
}
