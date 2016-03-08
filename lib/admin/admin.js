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
var restify=require('restify');
var cluster = require('cluster');
var assert = require('assert');
var os = require('os');

var dataAccess = (env.MODE=='file')?require(__base + 'lib/dataAccess/fsAccess'):require(__base + 'lib/dataAccess/mongoAccess');

var WORKERS = process.env.WEB_CONCURRENCY || 1;

start = function(req, res, next) {
	logger.info('ADMIN - [START]');
	
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
	logger.info('ADMIN - [STOP]');
	
	for (var id in cluster.workers) {
		cluster.workers[id].kill('SIGINT');
		logger.debug(`Kill worker ${id}`);
	}
	
	res.end('['+os.hostname()+'] GS Agent arrêté - '+WORKERS+' worker(s)');
	
	next();
}

list= function(req, res, next) {
	logger.info('ADMIN - [LIST]');
	
	dataAccess.getServicesList((err,data) => {
		res.header('Content-Type','application/json');
		//res.header('Access-Control-Allow-Origin', '*');
		res.end(JSON.stringify(data));
		next();
	});
}

stopService = function(req, res, next) {
	logger.info(`ADMIN - [STOP] ${req.params.basepath}`);
	
	dataAccess.stopService(req.params.basepath, (err,data) => {
		if(err){
			logger.error(`ADMIN - [STOP] ${req.params.basepath} - Error : ${err.message}`);
			res.end(err.message);
		}
		else
			res.end(JSON.stringify(data));
		next();
	});
}

startService = function(req, res, next) {
	logger.info(`ADMIN - [START] ${req.params.basepath}`);
	
	dataAccess.startService(req.params.basepath, (err,data) => {
		if(err){
			logger.error(`ADMIN - [START] ${req.params.basepath} - Error : ${err.message}`);
			res.end(err.message);
		}
		else
			res.end(JSON.stringify(data));
		next();
	});
}

addModifyService = function(req, res, next) {
	logger.info(`ADMIN - [ADD] ${req.params.basepath}`);
	assert(req.params.service,'The service description is not specified.');
	
	logger.debug(req.params);
	
	var service =  req.params.service;
	var dataset = req.params.dataset;
	var test = req.params.test;
	
	service.basepath = req.params.basepath;
	
	dataAccess.createService(service, test, dataset, (err) => {
		if(err){
			logger.error(`ADMIN - [ADD] ${req.params.basepath} - Error : ${err.message}`);
			res.end(err.message);
		}
		else
			res.end();
		next();
	});
		
}

deleteService = function(req, res, next) {
	logger.info(`ADMIN - [DELETE] ${req.params.basepath}`);
	dataAccess.deleteService(req.params.basepath,(err) => {
		if(err){
			logger.error(`ADMIN - [DELETE] ${req.params.basepath} - Error : ${err.message}`);
			res.end(err.message);
		}
		else
			res.end();
		next();
	});
	
}

getService = function(req, res, next) {
	logger.info(`ADMIN - [GET] ${req.params.basepath}`);
	
	dataAccess.loadService(req.params.basepath, (err,data) => {
		if(err){
			logger.error(`ADMIN - [GET] ${req.params.basepath} - Error : ${err.message}`);
			res.end(err.message);
		}
		else{
			res.header('Content-Type','application/json');
			res.end(JSON.stringify(data));
		}
		next();
	});
};

addApi = function(req, res, next) {
}

deleteApi = function(req, res, next) {
}

addOperation = function(req, res, next) {
}

deleteOperation = function(req, res, next) {
}

addDataset = function(req, res, next) {
}

deleteDataset = function(req, res, next) {
}

exports.createAdmin = function () {
	var server=restify.createServer();
	server.use(restify.bodyParser());
	server.use(restify.CORS());
	
	server.get('/start', start);
	server.get('/stop', stop);
	server.get('/list', list);
	
	server.get('/start/:basepath', startService);
	server.get('/stop/:basepath', stopService);
	
	server.get('/:basepath', getService);
	server.del('/:basepath', deleteService);
	server.put('/:basepath', addModifyService);

	server.put('/:basepath/:api', addApi);
	server.del('/:basepath/:api', deleteApi);
	
	server.put('/:basepath/:api/:operation', addOperation);
	server.del('/:basepath/:api/:operation', deleteOperation);
	
	server.put('/:basepath/:api/:key', addDataset);
	server.del('/:basepath/:api/:key', deleteDataset);
	
	return server;
}