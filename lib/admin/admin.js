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
var assert = require('assert');
var os = require('os');
var http = require('http');
var ConnectorsManager = require(__base + 'lib/admin/connectorsManager.js');
var gsDb=(config.mode=='file')?require(__base + 'lib/dataAccess/fs/fs.js'):require(__base + 'lib/dataAccess/fs/fs.js');
var CST =require('../dataAccess/constants.js');

var WORKERS = config.WEB_CONCURRENCY || 1;

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

/**
 * Accès aux données de l'agent
 * 
 * @param {String} object contient le type d'objet service,api,operation,dataset,template
 * @param {String} command type de la commande GET,ADD,DELETE,SAVE,UPDATE
 * @param {Object} args contient les arguments pour la commande {Nom du service,Nom de l'api, Nom de l'operation,Nom du dataset,Nom du template}
 * @param {Object} opts contient les options de paginations ou de filtre pour les recherches
 * @param {Object} input contient le body de la requête reçue
 * @param {Response} res ServerResponse
 * @param {function} next chains
 * @return la réponse HTTP au format JSON
 */
function caller(object,command,args,opts,input, res, next){
	gsDb(object,command,args,opts,input,(err,data) => {
		if(err){
			logger.error(`ADMIN - [${command} - ${object}] ${args} - Error : ${err.message}`);
			res.writeHead(500);
			res.end(err.message);
		}
		else{
			if(command==CST.CMD.ADD){
				res.status(201);
			}

			if(data==undefined){
				return res.send(404,"");
			}

			if(object==CST.OBJ.TEMPLATE && args[CST.OBJ.TEMPLATE]!=undefined){
				var contentType="application/"+args[CST.OBJ.TEMPLATE].substring(args[CST.OBJ.TEMPLATE].lastIndexOf('.')+1);
				logger.debug(contentType);
				res.header('Content-Type',contentType);
				return res.send(data);
			}else{
				res.header('Content-Type','application/json');
				return res.send(data);
			}
		}
		next();
	});
}

/**
 * Stop le service
 * 
 * @param {Request} req IncomingMessage 
 * @param {Response} res ServerResponse
 * @param {function} next chains
 * @return le service 
 */
function stopService(req, res, next) {
	logger.info(`ADMIN - [STOP] ${req.params.basepath}`);
	
	var options=CST.NEW_OPTS();
	options.admin.command=CST.CMD.STOP;
	caller(CST.OBJ.SERVICE,CST.CMD.UPDATE,{"service":req.params.basepath},options,null,res,next);
}

/**
 * Démarre le service
 * 
 * @param {Request} req IncomingMessage 
 * @param {Response} res ServerResponse
 * @param {function} next chains
 * @return le service  
 */
function startService(req, res, next) {
	logger.info(`ADMIN - [START] ${req.params.basepath}`);

	var options=CST.NEW_OPTS();
	options.admin.command=CST.CMD.START;
	caller(CST.OBJ.SERVICE,CST.CMD.UPDATE,{"service":req.params.basepath},options,null,res,next);
}

/**
 * Supprimer un Service avec les arguments dans la requête
 * req.params.basepath: nom du service
 * 
 * @param {Request} req IncomingMessage 
 * @param {Response} res ServerResponse
 * @param {function} next chains
 * @return le service supprimé
 */
function deleteService (req, res, next) {
	caller(CST.OBJ.SERVICE,CST.CMD.DELETE,{"service":req.params.basepath},CST.NEW_OPTS(),null,res,next);
}

/**
 * Ajouter un Service avec les arguments dans la requête
 * req.params.basepath: nom du service
 * 
 * @param {Request} req IncomingMessage 
 * @param {Response} res ServerResponse
 * @param {function} next chains
 * @return le service créé
 */
function addService (req, res, next) {
	caller(CST.OBJ.SERVICE,CST.CMD.ADD,{"service":req.params.basepath},CST.NEW_OPTS(),JSON.parse(req.body),res,next);
}

/**
 * Modifier un Service avec les arguments dans la requête
 * req.params.basepath: nom du service
 * 
 * @param {Request} req IncomingMessage 
 * @param {Response} res ServerResponse
 * @param {function} next chains
 * @return le service modifié
 */
function updateService (req, res, next) {
	caller(CST.OBJ.SERVICE,CST.CMD.UPDATE,{"service":req.params.basepath},CST.NEW_OPTS(),JSON.parse(req.body),res,next);
}

/**
 * Récupère un Service avec les arguments dans la requête
 * req.params.basepath: nom du service
 * 
 * @param {Request} req IncomingMessage 
 * @param {Response} res ServerResponse
 * @param {function} next chains
 * @return le service recherché
 */
function getService (req, res, next) {
	caller(CST.OBJ.SERVICE,CST.CMD.GET,{"service":req.params.basepath},CST.NEW_OPTS(),null,res,next);
}

/**
 * Liste les services de l'agent
 * Les options particulières de filtre, de pagination sont récupérées dans la requête
 * req.params.pageNum numéro de la page de pagination à récupérer
 * req.params.pageSize taille des pages
 * req.params.filter filtre à appliquer pour la recherche
 * 
 * @param {Request} req IncomingMessage 
 * @param {Response} res ServerResponse
 * @param {function} next chains
 * @return la liste des service de l'agent
 */
function getServices(req, res, next) {
	var options=CST.NEW_OPTS();
	options.pagination.pageNum=req.params.pageNum!=undefined?req.params.pageNum:options.pagination.pageNum;
	options.pagination.pageSize=req.params.pageSize!=undefined?req.params.pageSize:options.pagination.pageSize;
	options.filter=req.params.filter!=undefined?req.params.filter:options.filter;
	caller(CST.OBJ.SERVICE,CST.CMD.GET,{},options,null,res,next);
}

//------------------------------------------------------
// APIS
// ----------------------------------------------------- 

/**
 * Récupère une API avec les arguments dans la requête
 * req.params.basepath: nom du service
 * req.params.api: nom de l'API
 * 
 * @param {Request} req IncomingMessage 
 * @param {Response} res ServerResponse
 * @param {function} next chains
 * @return l'API recherchée
 */
function getApi(req, res, next) {
	caller(CST.OBJ.API,CST.CMD.GET,{"service":req.params.basepath,"api":req.params.api},CST.NEW_OPTS(),null,res,next);
}

/**
 * Liste les APIs d'un service
 * req.params.basepath: nom du service
 * 
 * @param {Request} req IncomingMessage 
 * @param {Response} res ServerResponse
 * @param {function} next chains
 * @return la liste des APIs du service
 */
function getApis(req, res, next) {
	caller(CST.OBJ.API,CST.CMD.GET,{"service":req.params.basepath},CST.NEW_OPTS(),null,res,next);
}

/**
 * Ajoute une API dans un service
 * req.params.basepath: nom du service
 * req.params.api: nom de l'API à ajouter
 * 
 * body: le contenu de l'API
 * 
 * @param {Request} req IncomingMessage 
 * @param {Response} res ServerResponse
 * @param {function} next chains
 * @return l'API ajoutée
 */
function addApi(req, res, next) {
	caller(CST.OBJ.API,CST.CMD.ADD,{"service":req.params.basepath,"api":req.params.api},CST.NEW_OPTS(),JSON.parse(req.body),res,next);
}

/**
 * Modifier une API dans un service
 * req.params.basepath: nom du service
 * req.params.api: nom de l'API à modifier
 * 
 * body: le contenu de l'API
 * 
 * @param {Request} req IncomingMessage 
 * @param {Response} res ServerResponse
 * @param {function} next chains
 * @return l'API modifiée
 */
function updateApi(req, res, next) {
	caller(CST.OBJ.API,CST.CMD.UPDATE,{"service":req.params.basepath,"api":req.params.api},CST.NEW_OPTS(),JSON.parse(req.body),res,next);
}

/**
 * Supprimer une API dans un service
 * req.params.basepath: nom du service
 * req.params.api: nom de l'API à supprimer
 * 
 * @param {Request} req IncomingMessage 
 * @param {Response} res ServerResponse
 * @param {function} next chains
 * @return l'API supprimée
 */
function deleteApi(req, res, next) {
	caller(CST.OBJ.API,CST.CMD.DELETE,{"service":req.params.basepath,"api":req.params.api},CST.NEW_OPTS(),null,res,next);
}

//------------------------------------------------------
// OPERATIONS
// ----------------------------------------------------- 
/**
 * Récupère une opération avec les arguments dans la requête
 * req.params.basepath: nom du service
 * req.params.api: nom de l'API
 * req.params.api: nom de l'Opération
 * 
 * @param {Request} req IncomingMessage 
 * @param {Response} res ServerResponse
 * @param {function} next chains
 * @return l'Opération recherchée
 */
function getOperation(req, res, next) {
	caller(CST.OBJ.OPERATION,CST.CMD.GET,{"service":req.params.basepath,"api":req.params.api,"operation":req.params.operation},CST.NEW_OPTS(),null,res,next);
}
/**
 * Liste les Opérations d'une API
 * req.params.basepath: nom du service
 * req.params.api: nom de l'API
 * 
 * @param {Request} req IncomingMessage 
 * @param {Response} res ServerResponse
 * @param {function} next chains
 * @return la liste des Opérations d'une API
 */
function getOperations(req, res, next) {
	caller(CST.OBJ.OPERATION,CST.CMD.GET,{"service":req.params.basepath,"api":req.params.api},CST.NEW_OPTS(),null,res,next);
}

/**
 * Ajoute une OPERATION dans une API
 * req.params.basepath: nom du service
 * req.params.api: nom de l'API
 * req.params.operation: nom de l'Operation à ajouter
 * 
 * body: le contenu de l'Opération'
 * 
 * @param {Request} req IncomingMessage 
 * @param {Response} res ServerResponse
 * @param {function} next chains
 * @return l'Opération ajoutée
 */
function addOperation(req, res, next) {
	logger.debug(req.body);
	caller(CST.OBJ.OPERATION,CST.CMD.ADD,{"service":req.params.basepath,"api":req.params.api,"operation":req.params.operation},CST.NEW_OPTS(),req.body,res,next);
}

/**
 * Modifier une OPERATION dans une API
 * req.params.basepath: nom du service
 * req.params.api: nom de l'API
 * req.params.operation: nom de l'Operation à modifier
 * 
 * body: le contenu de l'Opération'
 * 
 * @param {Request} req IncomingMessage 
 * @param {Response} res ServerResponse
 * @param {function} next chains
 * @return l'Opération modifiée
 */
function updateOperation(req, res, next) {
	caller(CST.OBJ.OPERATION,CST.CMD.UPDATE,{"service":req.params.basepath,"api":req.params.api,"operation":req.params.operation},CST.NEW_OPTS(),JSON.parse(req.body),res,next);
}

/**
 * Supprimer une OPERATION dans une API
 * req.params.basepath: nom du service
 * req.params.api: nom de l'API
 * req.params.operation: nom de l'Operation à supprimer
 * 
 * @param {Request} req IncomingMessage 
 * @param {Response} res ServerResponse
 * @param {function} next chains
 * @return l'OPERATION supprimée
 */
function deleteOperation(req, res, next) {
	caller(CST.OBJ.OPERATION,CST.CMD.DELETE,{"service":req.params.basepath,"api":req.params.api,"operation":req.params.operation},CST.NEW_OPTS(),null,res,next);
}


//------------------------------------------------------
// DATASET
// ----------------------------------------------------- 
/**
 * Récupère un dataset avec les arguments dans la requête
 * req.params.basepath: nom du service
 * req.params.api: nom de l'API
 * req.params.dataset: nom du Dataset
 * 
 * @param {Request} req IncomingMessage 
 * @param {Response} res ServerResponse
 * @param {function} next chains
 * @return le dataset recherché
 */
function getDataset(req, res, next) {
	caller(CST.OBJ.DATASET,CST.CMD.GET,{"service":req.params.basepath,"api":req.params.api,"dataset":req.params.dataset},CST.NEW_OPTS(),null,res,next);
}
/**
 * Liste les dataset d'une API
 * req.params.basepath: nom du service
 * req.params.api: nom de l'API
 * 
 * @param {Request} req IncomingMessage 
 * @param {Response} res ServerResponse
 * @param {function} next chains
 * @return la liste des Dataset d'une API
 */
function getDatasets(req, res, next) {
	var options=CST.NEW_OPTS();
	options.pagination.pageNum=req.params.pageNum!=undefined?req.params.pageNum:options.pagination.pageNum;
	options.pagination.pageSize=req.params.pageSize!=undefined?req.params.pageSize:options.pagination.pageSize;
	options.filter=req.params.filter!=undefined?req.params.filter:options.filter;
	caller(CST.OBJ.DATASET,CST.CMD.GET,{"service":req.params.basepath,"api":req.params.api},options,null,res,next);
}

/**
 * Ajoute un DATASET dans une API
 * req.params.basepath: nom du service
 * req.params.api: nom de l'API
 * req.params.dataset: nom du dataset à ajouter
 * 
 * body: le contenu du dataset
 * 
 * @param {Request} req IncomingMessage 
 * @param {Response} res ServerResponse
 * @param {function} next chains
 * @return le Dataset ajouté
 */
function addDataset(req, res, next) {
	caller(CST.OBJ.DATASET,CST.CMD.ADD,{"service":req.params.basepath,"api":req.params.api,"dataset":req.params.dataset},CST.NEW_OPTS(),JSON.parse(req.body),res,next);
}

/**
 * Modifier un DATASET dans une API
 * req.params.basepath: nom du service
 * req.params.api: nom de l'API
 * req.params.dataset: nom du dataset à modifier
 * 
 * body: le contenu du dataset
 * 
 * @param {Request} req IncomingMessage 
 * @param {Response} res ServerResponse
 * @param {function} next chains
 * @return le Dataset modifié
 */
function updateDataset(req, res, next) {
	caller(CST.OBJ.DATASET,CST.CMD.UPDATE,{"service":req.params.basepath,"api":req.params.api,"dataset":req.params.dataset},CST.NEW_OPTS(),JSON.parse(req.body),res,next);
}

/**
 * Supprimer un DATASET dans une API
 * req.params.basepath: nom du service
 * req.params.api: nom de l'API
 * req.params.dataset: nom du Dataset à supprimer
 * 
 * @param {Request} req IncomingMessage 
 * @param {Response} res ServerResponse
 * @param {function} next chains
 * @return le DATASET supprimé
 */
function deleteDataset(req, res, next) {
	caller(CST.OBJ.DATASET,CST.CMD.DELETE,{"service":req.params.basepath,"api":req.params.api,"dataset":req.params.dataset},CST.NEW_OPTS(),null,res,next);
}



//------------------------------------------------------
// DATASET
// ----------------------------------------------------- 
/**
 * Récupère un template avec les arguments dans la requête
 * req.params.basepath: nom du service
 * req.params.api: nom de l'API
 * req.params.template: nom du Template
 * 
 * @param {Request} req IncomingMessage 
 * @param {Response} res ServerResponse
 * @param {function} next chains
 * @return le template recherché
 */
function getTemplate(req, res, next) {
	caller(CST.OBJ.TEMPLATE,CST.CMD.GET,{"service":req.params.basepath,"api":req.params.api,"template":req.params.template},CST.NEW_OPTS(),null,res,next);
}
/**
 * Liste les template d'une API
 * req.params.basepath: nom du service
 * req.params.api: nom de l'API
 * 
 * @param {Request} req IncomingMessage 
 * @param {Response} res ServerResponse
 * @param {function} next chains
 * @return la liste des Templates d'une API
 */
function getTemplates(req, res, next) {
	var options=CST.NEW_OPTS();
	options.pagination.pageNum=req.params.pageNum!=undefined?req.params.pageNum:options.pagination.pageNum;
	options.pagination.pageSize=req.params.pageSize!=undefined?req.params.pageSize:options.pagination.pageSize;
	options.filter=req.params.filter!=undefined?req.params.filter:options.filter;
	caller(CST.OBJ.TEMPLATE,CST.CMD.GET,{"service":req.params.basepath,"api":req.params.api},options,null,res,next);
}

/**
 * Ajoute un TEMPLATE dans une API
 * req.params.basepath: nom du service
 * req.params.api: nom de l'API
 * req.params.template: nom du template à ajouter
 * 
 * body: le contenu du template
 * 
 * @param {Request} req IncomingMessage 
 * @param {Response} res ServerResponse
 * @param {function} next chains
 * @return le Template ajouté
 */
function addTemplate(req, res, next) {
	caller(CST.OBJ.TEMPLATE,CST.CMD.ADD,{"service":req.params.basepath,"api":req.params.api,"template":req.params.template},CST.NEW_OPTS(),req.body,res,next);
}

/**
 * Modifier un TEMPLATE dans une API
 * req.params.basepath: nom du service
 * req.params.api: nom de l'API
 * req.params.template: nom du template à modifier
 * 
 * body: le contenu du template
 * 
 * @param {Request} req IncomingMessage 
 * @param {Response} res ServerResponse
 * @param {function} next chains
 * @return le Template modifié
 */
function updateTemplate(req, res, next) {
	caller(CST.OBJ.TEMPLATE,CST.CMD.UPDATE,{"service":req.params.basepath,"api":req.params.api,"template":req.params.template},CST.NEW_OPTS(),req.body,res,next);
}

/**
 * Supprimer un Template dans une API
 * req.params.basepath: nom du service
 * req.params.api: nom de l'API
 * req.params.template: nom du Template à supprimer
 * 
 * @param {Request} req IncomingMessage 
 * @param {Response} res ServerResponse
 * @param {function} next chains
 * @return le TEMPLATE supprimé
 */
function deleteTemplate(req, res, next) {
	caller(CST.OBJ.TEMPLATE,CST.CMD.DELETE,{"service":req.params.basepath,"api":req.params.api,"template":req.params.template},CST.NEW_OPTS(),null,res,next);
}


req_logger= function(req,res,route,error){

	var ip = req.headers['x-forwarded-for'] || 
            req.connection.remoteAddress || 
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;
						
	logger.info(`ADMIN - [${ip}] - [${req.method}] ${req.url} - ${Date.now() - req._time} ms`);
	
	return true;
}

managerLink=function(){
	setInterval(function(){
		var options={
			hostname:config.master.hostname,
			port:config.master.port,
			path:config.master.path,
			method:'POST',
			headers:{
				'Content-Type': 'application/json'
			}
		};
		
		var req=http.request(options,(res)=>{
			res.on('end',()=>{
				if(res.statusCode!='200'){
					logger.error('Agent subscription error - '+ master_res);
				}
				return;
			});
		});
		req.on('error',(e)=>{
			logger.error('Agent subscription error - '+e.message);
			return;
		});
		var subscribeData={
			"hostname":os.hostname(),
			"port":config.admin.port
		};
		req.write(JSON.stringify(subscribeData));
		req.end();
	},config.master.freq);
}


exports.createAdmin = function () {
	var server=restify.createServer();

	ConnectorsManager.initConnectors();

	managerLink();

	server.use(restify.bodyParser());
	server.use(restify.queryParser());
	server.on('after',req_logger);
	server.use(restify.CORS());
	
	//API d'administration
	server.get('/start', start);
	server.get('/stop', stop);
	//server.get('/list', getServices);
	
	server.get('/start/:basepath', startService);
	server.get('/stop/:basepath', stopService);
	
	//API d'accès aux données
	server.get('/services',getServices);
	server.get('/services/:basepath', getService);
	server.put('/services/:basepath', addService);
	server.post('/services/:basepath', updateService);
	server.del('/services/:basepath', deleteService);
	
	server.get('/services/:basepath/apis', getApis);
	server.get('/services/:basepath/apis/:api', getApi);
	server.put('/services/:basepath/apis/:api', addApi);
	server.post('/services/:basepath/apis/:api', updateApi);
	server.del('/services/:basepath/apis/:api', deleteApi);

	server.get('/services/:basepath/apis/:api/operations',getOperations);
	server.get('/services/:basepath/apis/:api/operations/:operation',getOperation);
	server.put('/services/:basepath/apis/:api/operations/:operation',addOperation);
	server.post('/services/:basepath/apis/:api/operations/:operation',updateOperation);
	server.del('/services/:basepath/apis/:api/operations/:operation',deleteOperation);
	
	server.get('/services/:basepath/apis/:api/datasets',getDatasets);
	server.get('/services/:basepath/apis/:api/datasets/:dataset',getDataset);
	server.del('/services/:basepath/apis/:api/datasets/:dataset',deleteDataset);
	server.put('/services/:basepath/apis/:api/datasets/:dataset',addDataset);
	server.post('/services/:basepath/apis/:api/datasets/:dataset',updateDataset);

	server.get('/services/:basepath/apis/:api/templates',getTemplates);
	server.get('/services/:basepath/apis/:api/templates/:template',getTemplate);
	server.del('/services/:basepath/apis/:api/templates/:template',deleteTemplate);
	server.put('/services/:basepath/apis/:api/templates/:template',addTemplate);
	server.post('/services/:basepath/apis/:api/templates/:template',updateTemplate);

	return server;
}
