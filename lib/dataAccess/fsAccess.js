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
var fs = require('fs');
var path = require('path');
var async = require('async');
var doT = require("dot");
var fsExt = require(__base + 'lib/utils/fs');
var model = require(__base + 'lib/dataAccess/model');

/**
  * Récupère le fichier de configuration d'un simulateur
  *
  * @method getConf
  * @return chemin du fichier de configuration
 **/
getConf = function (simulateur, cbConf) {
    fs.readdir(simulateur, function (err, files) {
        for (var i in files) {
            if (files[i] !== undefined) {
                if (path.extname(files[i]) == '.json') {
                    cbConf(null, simulateur + '/' + files[i]);
                    return;
                }
            }
        }
        var error = new Error("No configuration file in dir");
        cbConf(error, null);
    });
};

changeServiceState = function(serviceName,state, callback){
	this.getServiceConf(serviceName,function(err,data){
		data.state = state;
		fs.writeFile(env.SIMUSPATH+'/'+data.basepath+'/'+data.basepath+'.json', JSON.stringify(data), function(err) {
			if(err) {
				callback(err);
			} else {
				callback(null);
			}
		}); 
	});
};


loadService = function (services,item, cb) {
    getConf(item, (err, conf) => {
        if (err) {
            logger.info("error getConf");
            cb(err);
        }
        else {
            fs.readFile(conf, (err, data) => {
                service = JSON.parse(data);
                if (service.basepath in services) {
                    logger.error('CONTEXT - doublon dans les basepath :' + service.basepath);
                    cb();
                } else {
                    services[service.basepath] = service;
                    logger.debug(services);
                    cb(null,service);
                }
            });
        }
    });
    //.bind({ services : services })
};

exports.stopService = function(serviceName,callback){
	this.changeServiceState(serviceName,'stopped',(err)=>{
		callback(err);
	});
};

exports.startService = function(serviceName,callback){
	this.changeServiceState(serviceName,'running',(err)=>{
		callback(err);
	});
};

exports.getServicesList = function getServicesList(callback) {
    fsUtils.files(env.SIMUSPATH, 'dir', false, false, function (err, subdirs) {
        if (err) return callback(err);
        callback(null, subdirs);
    });
};

exports.getServicesConf = function( cbFunc) {
    var services = {};
    async.waterfall([
        function (callback) {
            fsExt.subdirs(env.SIMUSPATH, true, false, (err, subdirs) => {
                if (err) return callback(err);
                callback(null, subdirs);
            });
        },
        function (subdirs, callback) {
            async.each(subdirs,
                loadService.bind(null,services),
                function (err) {
                    logger.info("end each");
                    callback(err);
            });
        }
    ], function (err, result) {
        logger.debug('DATA - getServicesConf - ' + JSON.stringify(services));
        cbFunc(err, services);
    });
};

exports.getServiceConf =  function( basepath, cbFunc) {
	loadService({}, `${env.SIMUSPATH}/${basepath}`, (err,data) => {
		cbFunc(err, data);
	});
};

exports.getTemplate = function (runCtxt,template, callback){
  var tempId=`./${env.SIMUSPATH}/${runCtxt.service.basepath}/${runCtxt.api.name}/${template}`;
  //var buildTpl=templateCache[tempId];
  var buildTpl;
  if(buildTpl!=undefined){
	logger.info('Template found');
	callback(null,buildTpl);
	return;
  }
  fs.readFile(tempId, function (err, data) {
	if(err) callback(err);
	//if(env.CACHEACTIF){
	//  templateCache[tempId]=doT.template(data);
	//  callback(null,templateCache[tempId]);
	//}else{
		callback(null,doT.template(data));
	//}
  });
  return;
}

exports.searchJDD = function(runCtxt,target,callback){
	var apiDir = `./${env.SIMUSPATH}/${runCtxt.service.basepath}/${runCtxt.api.name}`;
	var ope = `/${runCtxt.api.name}-`;
	fs.access(apiDir + ope +  target + ".json", (err) => {
		if(err){
			runCtxt.jdd = apiDir + ope + ".json";
			callback(null);
		}else{
			runCtxt.jdd = apiDir + ope + target + ".json";
			callback(null);
		}
    });
};

exports.getJDD = function(jdd,callback){
	fs.readFile(jdd, { encoding: 'utf-8' }, (err, data) => {
		callback(err, JSON.parse(data));
    });
};

exports.createService=function(basepath ,callback){
	
	async.waterfall([
		 function (callback) {
			 fs.mkdir(`./${env.SIMUSPATH}/${basepath}`, (err)=>{
				 callback(err);
			 });
		 },
		 function (callback) {
			 var service = new model.Service(basepath);
			 fs.writeFile(`./${env.SIMUSPATH}/${basepath}/${basepath}.json`, JSON.stringify(service) , (err)=>{
				 callback(err,service);
			 });
		 },
		 function (service, callback) {
			  fs.mkdir(`./${env.SIMUSPATH}/${basepath}/${service.apis[0].name}`, (err)=>{
				 callback(err,service);
			 });
		  },
		  function (service, callback) {
			  fs.writeFile(`./${env.SIMUSPATH}/${basepath}/${service.apis[0].name}/${service.apis[0].name}-.json`, `{\"template\":\"${service.apis[0].name}--Template.xml\",\"delay\":0}` , (err)=>{
				 callback(err,service);
			 });
		  },
		  function (service, callback) {
			  fs.writeFile(`./${env.SIMUSPATH}/${basepath}/${service.apis[0].name}/${service.apis[0].name}--Template.xml`, "<?xml version=\"1.0\" encoding=\"UTF-8\"?><genesis>This is a simulator</genesis>" , (err)=>{
				 callback(err);
			 });
		  }
	], function (err, result) {
        callback(err);
    });
};




