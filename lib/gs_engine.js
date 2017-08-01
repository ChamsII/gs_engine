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
var steps = require(__base + 'lib/steps');

/**
 * Engine Gen&SiS
 * @param {*} req 
 * @param {*} res
 * @param {*} next
 */
function engine(req, res, next) {
    var runCtxt = new runContext.RunContext();

    runCtxt.debug('NEW REQUEST');
    runCtxt.stats={};
    runCtxt.stats.startTime=new Date().getTime();

    async.waterfall([
		async.apply(steps.request,req,res,runCtxt),
		steps.post,
		steps.param,
		steps.dispatch,
		steps.response
    ], function (err) {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end(err.message);
        }
		runCtxt.stat('TOTAL duration - '+ (runCtxt.stats.responseTime - runCtxt.stats.startTime) + ' ms');

		runCtxt=null;
		delete runCtxt;
    });
};

function createServer(){
	var server=http.createServer(engine);

	server.on('connection', function (socket) {
		socket.setTimeout(10000);
	});
	return server;
}

module.exports.createServer=createServer
