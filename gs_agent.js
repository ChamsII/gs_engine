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
var restify = require('restify');
var winston = require('winston');
var throng = require('throng');
var gs = require('./lib/core/gs_engine');

var env = process.env;
var WORKERS = process.env.WEB_CONCURRENCY || 1;


//global.genesisContext=new serverContext.GenesisContext(env.SIMUSPATH, env.PORT);

global.logger = new (winston.Logger)({
     transports: [
             new (winston.transports.Console)({ 'timestamp': 'true', level: env.LOG_LVLCONSOLE }),
             new (winston.transports.File)({ filename: env.LOG_FILENAME ,json:false, maxsize:env.LOG_MAXSIZE,maxFiles:env.LOG_MAXFILES,timestamp:true, level:env.LOG_LVLFILE})
     ]
});


throng(start, {
  workers: WORKERS,
  lifetime: Infinity
});


function start(id) {
	
	logger.info('INIT - Started worker '+ id);
	
	logger.info('INIT - initialisation des simulateurs');
	
	var gs_agent = restify.createServer();
    
	gs_agent.get('.*',gs.engine.bind(this));
	gs_agent.post('.*', gs.engine.bind(this));
	gs_agent.put('.*', gs.engine.bind(this));
	gs_agent.del('.*', gs.engine.bind(this));
	gs_agent.head('.*',gs.engine.bind(this));

	gs_agent.on('connection', function (socket) {
		socket.setTimeout(10000);
	});
	
	gs_agent.listen(env.PORT);
	logger.info("Server started listening on port " + env.PORT);
	
	
	/*var gs_admin= restify.createServer();
	

	gs_admin.get('/reload',function(req,res,next){
		logger.info("RELOAD context ... ");
		
		genesisContext.load(function(err){
			if(err){
				logger.error(err);
				process.exit(1);
			}
			res.end();
		});
	});
	
	gs_admin.listen(env.ADMIN_PORT);*/
}

