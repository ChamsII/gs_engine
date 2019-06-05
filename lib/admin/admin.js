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
var ConnectorsManager = require(__base + 'lib/admin/connectorsManager.js');


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

        ConnectorsManager.stopConnectors();
	
	for (var id in cluster.workers) {
		cluster.workers[id].kill('SIGINT');
		logger.debug(`Kill worker ${id}`);
	}
	
	res.end('['+os.hostname()+'] GS Agent arrêté - '+WORKERS+' worker(s)');
	
	next();
}

list= function(req, res, next) {

	dataAccess.getServicesList(req.query.pageNum,req.query.pageSize,req.query.filter,(err,data) => {
	//dataAccess.getServicesList(req.params.pageNum,req.params.pageSize,req.params.filter,(err,data) => {
		res.header('Content-Type','application/json');
		res.header('Access-Control-Allow-Origin', '*');
		res.end(JSON.stringify(data));
		next();
	});
}



findAndReplace = function(string, target, replacement) {
 
	var i = 0, length = string.length;
	for (i; i < length; i++) {
		string = string.replace(target, replacement);
	}
	return string;
	
 }


stopService = function(req, res, next) {
	logger.info(`ADMIN - [STOP] ${req.params.basepath}`);
	
	dataAccess.stopService(req.params.basepath, (err,data) => {
		if(err){
			logger.error(`ADMIN - [STOP] ${req.params.basepath} - Error : ${err.message}`);
			res.writeHead(500);
			res.end(err.message);
		}
		else{
			ConnectorsManager.stopSrvConnectors(data);
			res.header('Content-Type','application/json');
			res.header('Access-Control-Allow-Origin', '*');
			res.end(JSON.stringify(data));
		}
		next();
	});
}

startService = function(req, res, next) {
	logger.info(`ADMIN - [START] ${req.params.basepath}`);
	
	dataAccess.startService(req.params.basepath, (err,data) => {
		if(err){
			logger.error(`ADMIN - [START] ${req.params.basepath} - Error : ${err.message}`);
			res.writeHead(500);
			res.end(err.message);
		}
		else{
			ConnectorsManager.startSrvConnectors(data);
			res.header('Content-Type','application/json');
			res.header('Access-Control-Allow-Origin', '*');
			res.end(JSON.stringify(data));
		}
		next();
	});
}

addModifyService = function(req, res, next) {
	logger.info(`ADMIN - [ADD-MODIFY] ${req.params.basepath}`);
	
	logger.debug(req.body);
	
	var service =  JSON.parse(req.body);

	
	if(req.params.basepath != service.basepath){
		dataAccess.renameService(req.params.basepath, service.basepath, (err,data) => {
			if(err){
				logger.error(`ADMIN - [RENAME] ${req.params.basepath} - Error : ${err.message}`);
				res.writeHead(500);
				res.end(err.message);
			}
			else{
				res.header('Content-Type','application/json');
				res.header('Access-Control-Allow-Origin', '*');
				res.end();
			}
			next();
		});
	}else{
		dataAccess.createService(service, (err) => {
			if(err){
				logger.error(`ADMIN - [ADD] ${req.params.basepath} - Error : ${err.message}`);
				res.writeHead(500);
				res.end(err.message);
			}
			else{
				res.header('Content-Type','application/json');
				res.header('Access-Control-Allow-Origin', '*');
				res.end();
			}
			
			next();
		});
	}
		
}


editTemplateService = function(req, res, next) {

        logger.info(`ADMIN - [EDIT TEMPLATE] ${req.params.basepath}`);
        var templateDetail =  JSON.parse(req.body);

        dataAccess.updateTemplate(req.params.basepath, templateDetail.template, templateDetail.currentApi, (err) => {
                if(err){
                        logger.error(`ADMIN - [EDIT TEMPLATE] ${templateDetail.template} - Error : ${err.message}`);
                        res.writeHead(500);
                        res.end(err.message);
                }
                else
                        res.end();
                next();
        });

}


editTemplate = function(req, res, next) {
	logger.info(`ADMIN - [UPDATE TEMPLATE] ${req.params.basepath} - ${req.params.api} - ${req.params.key}`);
	
	var template =  JSON.parse(req.body);
	dataAccess.editTemplate(req.params.basepath,req.params.api,req.params.key, template, (err,service) => {
		if(err){
			logger.error(`ADMIN - [UPDATE TEMPLATE] ${req.params.basepath} - ${req.params.api} - ${req.params.key} - Error : ${err.message}`);
			res.header('Content-Type','application/json');
			res.header('Access-Control-Allow-Origin', '*');
			res.writeHead(500);
			res.end(err.message);
		}
		else{
			res.header('Content-Type','application/json');
			res.header('Access-Control-Allow-Origin', '*');
			res.end(JSON.stringify(service));
		}
		next();
	});
}



deleteService = function(req, res, next) {
	logger.info(`ADMIN - [DELETE] ${req.params.basepath}`);

	dataAccess.deleteService(req.params.basepath,(err) => {
		if(err){
			logger.error(`ADMIN - [DELETE] ${req.params.basepath} - Error : ${err.message}`);
			res.writeHead(500);
			res.end(err.message);
		}
		else{
			res.header('Content-Type','application/json');
			res.header('Access-Control-Allow-Origin', '*');
			res.end();
		}
			
		next();
	});
	
}

getService = function(req, res, next) {

	logger.debug("GET SERVICE PAS SUPP");
	logger.debug(req.body);
	logger.debug(req.params);

	
	dataAccess.loadService(req.params.basepath, (err,data) => {
		if(err){
			logger.error(`ADMIN - [GET] ${req.params.basepath} - Error : ${err.message}`);
			res.end(err.message);
		}
		else{
			res.header('Content-Type','application/json');
			res.header('Access-Control-Allow-Origin', '*');
			res.end(JSON.stringify(data));
		}
		next();
	});
}

getDataSets = function(req, res, next) {


	dataAccess.getDataSets(req.params.basepath, req.params.api,req.params.operation, req.query.pageNum,req.query.pageSize,req.query.filter,(err,data) => {
		if(err){
			logger.error(`ADMIN - [GET] List Datasets ${req.params.basepath} ${req.params.api} ${req.params.operation} - Error : ${err.message}`);
			res.end(err.message);
		}
		else{
			res.header('Content-Type','application/json');
			res.header('Access-Control-Allow-Origin', '*');
			res.end(JSON.stringify(data));
		}
		next();
	});
	
}

getDataSet = function(req, res, next) {

	dataAccess.getDataSet(req.params.basepath, req.params.api,req.params.operation, req.params.name,(err,data) => {
		if(err){
			logger.error(`ADMIN - [GET] Dataset ${req.params.basepath} ${req.params.api} ${req.params.operation} ${req.params.name} - Error : ${err.message}`);
			res.end(err.message);
		}
		else{
			res.header('Content-Type','application/json');
			res.header('Access-Control-Allow-Origin', '*');
			res.end(JSON.stringify(data));
		}
		next();
	});
	
}

getTemplates = function(req, res, next) {
}


getTemplate = function(req, res, next) {


	dataAccess.getTemplateData(req.params.basepath, req.params.api,req.params.operation, req.params.name,(err,data) => {
		if(err){
			logger.error(`ADMIN - [GET] Template ${req.params.basepath} ${req.params.api} ${req.params.operation} ${req.params.name} - Error : ${err.message}`);
			res.end(err.message);
		}
		else{
			//res.header('Content-Type','text/xml');
			res.header('Content-Type','application/json');
			res.header('Access-Control-Allow-Origin', '*')
			res.end(data);
		}
		next();
	});
}

updateApi = function(req, res, next) {
	logger.info(`ADMIN - [UPDATE API] ${req.params.basepath} -  ${req.params.api}`);
	
	logger.debug(req.body);
	
	var api =  JSON.parse(req.body);

	dataAccess.updateApi(req.params.basepath,req.params.api,api,(err,service) => {
		if(err){
			logger.error(`ADMIN - [UPDATE API] ${req.params.basepath} - ${req.params.api} - Error : ${err.message}`);
			res.writeHead(500);
			res.end(err.message);
		}
		else{
			res.header('Content-Type','application/json');
			res.header('Access-Control-Allow-Origin', '*');
			res.end(JSON.stringify(service));
		}
		next();
	});
	
}

addApi = function(req, res, next) {
	logger.info(`ADMIN - [ADD API] ${req.params.basepath} -  ${req.params.api}`);
	
	logger.debug(req.body);
	
	var service =  JSON.parse(req.body);

	dataAccess.addApi(req.params.basepath,req.params.api,service,(err,data) => {
		if(err){
			logger.error(`ADMIN - [ADD API] ${req.params.basepath} - ${req.params.api} - Error : ${err.message}`);
			res.writeHead(500);
			res.end(err.message);
		}
		else{
			res.header('Content-Type','application/json');
			res.header('Access-Control-Allow-Origin', '*');
			res.end(JSON.stringify(data));
		}
		next();
	});
}

deleteApi = function(req, res, next) {
	logger.info(`ADMIN - [DELETE API] ${req.params.basepath} -  ${req.params.api}`);
	
	dataAccess.deleteApi(req.params.basepath,req.params.api,(err,service) => {
		if(err){
			logger.error(`ADMIN - [DELETE API] ${req.params.basepath} - ${req.params.api} - Error : ${err.message}`);
			res.header('Content-Type','application/json');
			res.header('Access-Control-Allow-Origin', '*');
			res.writeHead(500);
			res.end(err.message);
		}
		else{
			res.header('Content-Type','application/json');
			res.header('Access-Control-Allow-Origin', '*');
			res.end(JSON.stringify(service));
		}
		next();
	});
}

addOperation = function(req, res, next) {
	logger.info(`ADMIN - [ADD OPERATION] ${req.params.basepath} -  ${req.params.api} - ${req.params.operation}`);
	
	logger.debug(req.body);
	
	var operation =  JSON.parse(req.body);

	dataAccess.addOperation(req.params.basepath,req.params.api,req.params.operation,operation,(err,service) => {
		if(err){
			logger.error(`ADMIN - [ADD OPERATION] ${req.params.basepath} - ${req.params.api} - ${req.params.operation} - Error : ${err.message}`);
			res.header('Content-Type','application/json');
			res.header('Access-Control-Allow-Origin', '*');
			res.writeHead(500);
			res.end(err.message);
		}
		else{
			res.header('Content-Type','application/json');
			res.header('Access-Control-Allow-Origin', '*');
			res.end(JSON.stringify(service));
		}
		next();
	});
}

updateOperation = function(req, res, next) {
	logger.info(`ADMIN - [UPDATE OPERATION] ${req.params.basepath} -  ${req.params.api} - ${req.params.operation}`);
	
	logger.debug(req.body);
	
	var operation =  JSON.parse(req.body);

	dataAccess.updateOperation(req.params.basepath,req.params.api,req.params.operation,operation,(err,service) => {
		if(err){
			logger.error(`ADMIN - [UPDATE OPERATION] ${req.params.basepath} - ${req.params.api} - ${req.params.operation} - Error : ${err.message}`);
			res.header('Content-Type','application/json');
			res.header('Access-Control-Allow-Origin', '*');
			res.writeHead(500);
			res.end(err.message);
		}
		else{
			res.header('Content-Type','application/json');
			res.header('Access-Control-Allow-Origin', '*');
			res.end(JSON.stringify(service));
		}
		next();
	});
}

deleteOperation = function(req, res, next) {
	logger.info(`ADMIN - [DELETE OPERATION] ${req.params.basepath} - ${req.params.api} - ${req.params.operation}`);
	
	dataAccess.deleteOperation(req.params.basepath,req.params.api,req.params.operation,(err,service) => {
		if(err){
			logger.error(`ADMIN - [DELETE OPERATION] ${req.params.basepath} - ${req.params.api} - ${req.params.operation} - Error : ${err.message}`);
			res.header('Content-Type','application/json');
			res.header('Access-Control-Allow-Origin', '*');
			res.writeHead(500);
			res.end(err.message);
		}
		else{
			res.header('Content-Type','application/json');
			res.header('Access-Control-Allow-Origin', '*');
			res.end(JSON.stringify(service));
		}
		next();
	});
}


addDataset = function(req, res, next) {
	// server.post('/add/:basepath/:api/datasets/:key', addDataset);
	logger.info(`ADMIN - [ADD DATASET] ${req.params.basepath} - ${req.params.api} - ${req.params.key}`);
	
	dataAccess.addDataset(req.params.basepath,req.params.api,req.params.key,(err,service) => {
		if(err){
			logger.error(`ADMIN - [ADD DATASET] ${req.params.basepath} - ${req.params.api} - ${req.params.key} - Error : ${err.message}`);
			res.header('Content-Type','application/json');
			res.header('Access-Control-Allow-Origin', '*');
			res.writeHead(500);
			res.end(err.message);
		}
		else{
			res.header('Content-Type','application/json');
			res.header('Access-Control-Allow-Origin', '*');
			res.end(JSON.stringify(service));
		}
		next();
	});
}

deleteDataset = function(req, res, next) {
	logger.info(`ADMIN - [DELETE DATASET] ${req.params.basepath} - ${req.params.api} - ${req.params.key}`);
	
	dataAccess.deleteDataset(req.params.basepath,req.params.api,req.params.key,(err,service) => {
		if(err){
			logger.error(`ADMIN - [DELETE DATASET] ${req.params.basepath} - ${req.params.api} - ${req.params.key} - Error : ${err.message}`);
			res.header('Content-Type','application/json');
			res.header('Access-Control-Allow-Origin', '*');
			res.writeHead(500);
			res.end(err.message);
		}
		else{
			res.header('Content-Type','application/json');
			res.header('Access-Control-Allow-Origin', '*');
			res.end(JSON.stringify(service));
		}
		next();
	});
}

updateDataset= function(req, res, next) {
	logger.info(`ADMIN - [UPDATE DATASET] ${req.params.basepath} - ${req.params.api} - ${req.params.key}`);
	
	var dataset =  JSON.parse(req.body);
	dataAccess.updateDataset(req.params.basepath,req.params.api,req.params.key, dataset, (err,service) => {
		if(err){
			logger.error(`ADMIN - [UPDATE DATASET] ${req.params.basepath} - ${req.params.api} - ${req.params.key} - Error : ${err.message}`);
			res.header('Content-Type','application/json');
			res.header('Access-Control-Allow-Origin', '*');
			res.writeHead(500);
			res.end(err.message);
		}
		else{
			res.header('Content-Type','application/json');
			res.header('Access-Control-Allow-Origin', '*');
			res.end(JSON.stringify(service));
		}
		next();
	});
}


updateDetail= function(req, res, next) {
	logger.info(`ADMIN - [UPDATE DETAIL] ${req.params.basepath} - ${req.params.api} - ${req.params.key}`);
	
	var dataset =  JSON.parse(req.body);
	dataAccess.updateDetail(req.params.basepath,req.params.api,req.params.key, dataset, (err,service) => {
		if(err){
			logger.error(`ADMIN - [UPDATE DETAIL] ${req.params.basepath} - ${req.params.api} - ${req.params.key} - Error : ${err.message}`);
			res.header('Content-Type','application/json');
			res.header('Access-Control-Allow-Origin', '*');
			res.writeHead(500);
			res.end(err.message);
		}
		else{
			res.header('Content-Type','application/json');
			res.header('Access-Control-Allow-Origin', '*');
			res.end(JSON.stringify(service));
		}
		next();
	});
}

req_logger= function(req,res,route,error){

	var ip = req.headers['x-forwarded-for'] || 
            req.connection.remoteAddress || 
            req.socket.remoteAddress //||
          //  req.connection.socket.remoteAddress;
						
	logger.info(`ADMIN - [${ip}] - [${req.method}] ${req.url} - ${Date.now() - req._time} ms`);
	
	return true;
}


updateDelay = function(req, res, next) {

        logger.info(`ADMIN - [EDIT DELAY] ${req.params.basepath}`);
        var newDelay =  JSON.parse(req.body);

        dataAccess.updateDelay(req.params.basepath, req.params.api, newDelay.delay, (err) => {
                if(err){
                        logger.error(`ADMIN - [EDIT DELAY] ${newDelay.delay} - Error : ${err.message}`);
                        res.writeHead(500);
                        res.end(err.message);
                }
                else
                        res.end();
                next();
        });

}

exports.createAdmin = function () {
	var server=restify.createServer();

	ConnectorsManager.initConnectors();

	server.use(restify.plugins.bodyParser());
	server.use(restify.plugins.queryParser());
	server.on('after',req_logger);
	//server.use(restify.CORS());
	
	server.get('/start', start);
	server.get('/stop', stop);
	server.get('/list', list);
	
	server.get('/start/:basepath', startService);
	server.get('/stop/:basepath', stopService);
	
	server.get('/:basepath', getService);
	server.get('/delete/:basepath', deleteService);
	server.del('/:basepath', deleteService);
	server.post('/:basepath', addModifyService);

	 server.post('/edittemplate/:basepath', editTemplateService);
	 server.post('/edittemplate/:basepath/:api/:key', editTemplate);

	server.post('/:basepath/:api', updateApi);
	server.post('/:basepath/new/:api', addApi);
	server.put('/:basepath/:api', addApi);
	server.del('/:basepath/:api', deleteApi);
	server.get('/:basepath/delete/:api', deleteApi);

	server.post('/editdelay/:basepath/:api', updateDelay);
	
	server.post('/:basepath/:api/:operation', updateOperation);
	server.put('/:basepath/:api/:operation', addOperation);
	server.post('/add/:basepath/:api/:operation', addOperation);
	server.del('/:basepath/:api/:operation', deleteOperation);
	server.get('/delete/:basepath/:api/:operation', deleteOperation);

	server.get('/:basepath/:api/:operation/datasets',getDataSets);
	server.get('/:basepath/:api/:operation/dataset/:name',getDataSet);
	server.post('/add/:basepath/:api/datasets/:key', addDataset);
	server.post('/edit/:basepath/:api/datasets/:key', updateDataset);
	server.get('/delete/:basepath/:api/datasets/:key', deleteDataset);

	server.post('/edit/:basepath/:api/details/:key', updateDetail);
	
	server.get('/:basepath/:api/:operation/templates/:pageNum',getTemplates);
	server.get('/:basepath/:api/:operation/template/:name',getTemplate);
	

	
	return server;
}
