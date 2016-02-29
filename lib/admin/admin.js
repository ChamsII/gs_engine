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
var restify=require('restify');
var cluster = require('cluster');
var os = require('os');
var env = process.env;

var dataAccess = (env.MODE=='file')?require(__base + 'lib/core/dataAccess/genesisFileAccess'):require(__base + 'lib/core/dataAccess/genesisFileAccess');

var WORKERS = process.env.WEB_CONCURRENCY || 1;

start = function(req, res, next) {

	logger.info('ADMIN - commande [START]');
	for(var i=0; i<WORKERS; i++){
		 cluster.fork();
		
		 cluster.on('exit', (worker, code, signal) => {
			logger.info('GS Agent Worker '+ worker.id+'['+worker.process.pid+'] arrêté');
			worker.removeListener('exit');
		});
	}
	
	res.end('['+os.hostname()+'] GS Agent démarré - '+WORKERS+' worker(s)');
	
	next();
}

stop = function(req, res, next) {

	logger.info('ADMIN - commande [STOP]');
	
	for (var id in cluster.workers) {
		cluster.workers[id].kill('SIGINT');
		logger.debug(`Kill worker ${id}`);
	}
	
	res.end('['+os.hostname()+'] GS Agent arrêté - '+WORKERS+' worker(s)');
	
	next();
}

list= function(req, res, next) {
	logger.info('ADMIN - commande [LIST]');
	
	dataAccess.getServicesList(function(err,data){
		res.end(JSON.stringify(data));
		next();
	});
	
	
}

stopService = function(req, res, next) {

	logger.info('ADMIN - commande [STOP SERVICE]');
	
	dataAccess.stopService(req.params.name, function(err,data){
		if(err)
			res.end('erreur');
		else
			res.end('Service arrêté');
		next();
	});
}

startService = function(req, res, next) {

	logger.info('ADMIN - commande [START SERVICE]');
	
	dataAccess.startService(req.params.name, function(err,data){
		if(err)
			res.end('erreur');
		else
			res.end('Service démarré');
		next();
	});
}


exports.createAdmin = function () {

	var server=restify.createServer();
	
	server.get('/start', start);
	server.get('/stop', stop);
	server.get('/list', list);
	
	server.get('/stop/:name', stopService);
	server.get('/start/:name', startService);
	
	return server;
}