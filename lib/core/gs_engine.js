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
var runContext = require('./runContext');

var stepRequest = require('./steps/request');
var stepPost = require('./steps/post');
var stepParam = require('./steps/param');
var stepDispatch = require('./steps/dispatch');
var stepResponse = require('./steps/response');


exports.engine = function (req, res, next) {
    
    var runCtxt = new runContext.RunContext(req.getId());

    runCtxt.debug('NEW REQUEST');
	
    runCtxt.stats={};
    runCtxt.stats.startTime=new Date().getTime();
    
    async.waterfall([
		async.apply(stepRequest.execute,req,res,runCtxt),
		stepPost.execute,
		stepParam.execute,
		stepDispatch.execute,
		stepResponse.execute
    ], function (err, req,res,runCtxt) {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end(err.message);
        } 
		runCtxt.stat('TOTAL duration - '+ (runCtxt.stats.responseTime - runCtxt.stats.startTime) + ' ms');
			
		runCtxt=null;
		delete runCtxt;
		
        next();
		
    });

};