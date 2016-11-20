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
var path = require('path');
var async = require('async');
var doT = require("dot");
var fs = require('fs-extra')
var fsExt = require(__base + 'lib/utils/fs');
var model = require(__base + 'lib/dataAccess/model');

doT.templateSettings.strip=false;

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

exports.loadService = function (basepath, cb) {
    getConf(`${env.SIMUSPATH}/${basepath}`, (err, conf) => {
        if (err) {
            //logger.info("error getConf");
            cb(err);
        }
        else {
            fs.readFile(conf, (err, data) => {
                var service = JSON.parse(data);
                /*var valid = validate(service);
                logger.info("Validation du service ["+service.basepath+"]");
                if (!valid) console.log(validate.errors);*/
				//logger.debug(service);
				cb(null,service);
            });
        }
    });
};


exports.changeServiceState = function(serviceName,state, callback){
	this.loadService(serviceName, (err,data)=> {
		if(data.state==state){
			callback(new Error('Service already '+state));
		}
		data.state = state;
		fs.writeFile(env.SIMUSPATH+'/'+data.basepath+'/'+data.basepath+'.json', JSON.stringify(data), function(err) {
			if(err) {
				callback(err);
			} else {
				callback(null,data);
			}
		}); 
	});
};


exports.stopService = function(serviceName,callback){
	this.changeServiceState(serviceName,'stopped',(err,data)=>{
		callback(err,data);
	});
};

exports.startService = function(serviceName,callback){
	this.changeServiceState(serviceName,'running',(err,data)=>{
		callback(err,data);
	});
};

exports.getServicesSorted = function getServicesList(searchFilter,callback) {
	fsExt.subdirs(env.SIMUSPATH, false, false, (err, subdirs) =>{
        if (err) return callback(err);
				
		var tempArray;
		if(searchFilter != undefined  && searchFilter != "null" && searchFilter != ""){
			tempArray = subdirs.filter(function(subdir){return subdir.search(searchFilter) != -1 ;}).sort();
		}else{
			tempArray = subdirs.sort();
		}
		
        callback(null, tempArray);
    });
};

exports.getServicesList = function getServicesList(pageNum, pageSize, searchFilter,callback) {

	this.getServicesSorted(searchFilter,(err,tempArray)=>{
		 if (err) return callback(err);

		 var services = [];
		
		for(var i=(pageNum-1)*pageSize;i < pageNum*pageSize && i < tempArray.length ;i++){
			//datasets.push({key:tempArray[i].substring(0,tempArray[i].lastIndexOf('.')),value:tempArray[i].substring(tempArray[i].indexOf('-')+1,tempArray[i].lastIndexOf('.'))});
			services.push({key:i,value:tempArray[i]});
		}
				
        callback(null, {page:services, pageNum:pageNum, pageSize:pageSize, totalSize:tempArray.length});
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


exports.getDataSets= function (basepath, api, operation, pageNum, pageSize, searchFilter, callback) {
		var jddDir=`./${env.SIMUSPATH}/${basepath}/${api}`;
		
		fs.readdir(jddDir, function (err, files) {
				var tempArray = files.filter(function(file){
					if(searchFilter != undefined  && searchFilter != "null" && searchFilter != ""){
						return path.extname(file)=='.json' && file.search(searchFilter) != -1 ;
					}
					return path.extname(file)=='.json';
				}).sort();
				var datasets = [];
				
				for(var i=(pageNum-1)*pageSize;i < pageNum*pageSize && i < tempArray.length ;i++){
					//datasets.push({key:tempArray[i].substring(0,tempArray[i].lastIndexOf('.')),value:tempArray[i].substring(tempArray[i].indexOf('-')+1,tempArray[i].lastIndexOf('.'))});
					datasets.push({key:tempArray[i].substring(0,tempArray[i].lastIndexOf('.')),value:tempArray[i].substring(0,tempArray[i].lastIndexOf('.'))});
				}
				
				 callback(null, {page:datasets, pageNum:pageNum, pageSize:pageSize, totalSize:tempArray.length});
  
    });

};

exports.getDataSet= function (basepath, api, operation, name, callback) {
		var jdd=`./${env.SIMUSPATH}/${basepath}/${api}/${name}.json`;
		
		fs.readFile(jdd, { encoding: 'utf-8' }, (err, data) => {
			callback(err, JSON.parse(data));
    });
};


exports.updateDataSet= function (basepath, api, operation, name, dataset, callback) {
		var jdd=`./${env.SIMUSPATH}/${basepath}/${api}/${name}.json`;
		
		fs.writeFile(jdd, dataset, (err)=>{
			callback(err,dataset);
		});
};

exports.getTemplateData= function (basepath, api, operation, name, callback) {
		var template=`./${env.SIMUSPATH}/${basepath}/${api}/${name}`;
		
		fs.readFile(template, { encoding: 'utf-8' }, (err, data) => {
			callback(err,data);
    });
};

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

exports.deleteService=function(basepath ,callback){
	fs.access(`./${env.SIMUSPATH}/${basepath}`, (err)=>{
		if(err){
			callback(new Error('Le service n\'existe pas: '+basepath));
		}
		fs.remove(`./${env.SIMUSPATH}/${basepath}`, (err)=>{
			callback(err);
		});
	});
};

exports.renameService=function(old_val, new_val, callback){
	var self=this;
	async.waterfall([
		 function (callback) {
			 fs.access(`./${env.SIMUSPATH}/${new_val}`, (err) => {
				if(err){
					callback(null);
				}else{
					callback(new Error(`The service ${new_val} already exists.`));
				}
			});
		 },
		function (callback) {
			fs.move(`./${env.SIMUSPATH}/${old_val}`,`./${env.SIMUSPATH}/${new_val}`, (err) => {
				if(err){
					fs.remove(`./${env.SIMUSPATH}/${new_val}`, (err) => {
						return callback(new Error(`Error while moving ${old_val} to ${new_val}.`));
					});
				}else{
					return callback(null);
				}
			});
		},
		function (callback) {
			fs.readFile(`./${env.SIMUSPATH}/${new_val}/${old_val}.json`, (err, data) => {
				if(err)
					return callback(err);
                return callback(null,JSON.parse(data));
            });
		},
		function (srv,callback) {
			 srv.basepath=new_val;
			 self.updateService(srv,(err)=>{
				 callback(err);
			 });
		},
		function (callback) {
			 fs.remove(`./${env.SIMUSPATH}/${new_val}/${old_val}.json`, (err)=>{
				 return callback(err);
			 });
		 }
		],function (err) {
			if(err){
				logger.error(err);
			}
        	return callback(err);
   		}
   	);
};

exports.updateService=function(service,callback){
	fs.writeFile(`./${env.SIMUSPATH}/${service.basepath}/${service.basepath}.json`, JSON.stringify(service) , (err)=>{
		 callback(err);
	});
};

exports.updateOperation=function(basepath, api_name, method, operation, callback){
	logger.debug(`[DATA] - UpdateOperation - Service [${basepath}] - Api [${api_name}] - Updating Operation ${method}.`);
	var self=this;
	async.waterfall([
		function (callback) {
			//chargement du service
			self.loadService(basepath,(err,service) => {
				return callback(err,service);
			});
		},
		function (service,callback) {
			for(var id in service.apis){
				var api = service.apis[id];
				if(api.name == api_name){
					for(var idOpe in api.operations){
						var ope = api.operations[idOpe];
						if(ope.method==method){
							service.apis[id].operations[idOpe]=operation;
							return callback(null,service);
						}
					}
					service.apis[id].operations.push(operation);
					return callback(null,service);
				}
			}
			return callback(new Error(`Service [${basepath}] - API ${api_name} not found.`));
		},
		function (service,callback) {
			self.updateService(service,(err)=>{
				return callback(err,service);
			});
		}
	],function (err,data) {
		if(err)
			logger.error(err.message);
	    return callback(err,data);
    });
};

exports.addOperation=function(basepath, api_name, method, operation, callback){
	logger.debug(`[DATA] - AddOperation - Service [${basepath}] - Api [${api_name}] - Updating Operation ${method}.`);
	var self=this;
	async.waterfall([
		function (callback) {
			//chargement du service
			self.loadService(basepath,(err,service) => {
				return callback(err,service);
			});
		},
		function (service,callback) {
			for(var id in service.apis){
				var api = service.apis[id];
				if(api.name == api_name){
					for(var idOpe in api.operations){
						var ope = api.operations[idOpe];
						if(ope.method==method){
							return callback(new Error(`Service [${basepath}] - API ${api_name} - Opeation ${method} already exists!.`));
						}
					}
					service.apis[id].operations.push(operation);
					return callback(null,service);
				}
			}
			return callback(new Error(`Service [${basepath}] - API ${api_name} not found.`));
		},
		function (service,callback) {
			self.updateService(service,(err)=>{
				return callback(err,service);
			});
		}
	],function (err,data) {
		if(err)
			logger.error(err.message);
	    return callback(err,data);
    });
};

exports.deleteOperation=function(basepath, api_name, method, callback){
	logger.debug(`[DATA] - DeleteOperation - Service [${basepath}] - Api [$[api_name}] - Deleting Operation ${method}.`);
	var self=this;
	async.waterfall([
		function (callback) {
			//chargement du service
			self.loadService(basepath,(err,service) => {
				return callback(err,service);
			});
		},
		function (service,callback) {
			for(var id in service.apis){
				var api = service.apis[id];
				if(api.name == api_name){
					for(var idOpe in api.operations){
						var operation = api.operations[idOpe];
						if(operation.method==method){
							if(api.operations.length==1){
								return callback(new Error(`Only one Operation in API [${api.name}]. Cannot delete it!`));
								break;
							}
							
							service.apis[id].operations.splice(idOpe,1);
							
							return callback(null,service);
						}
					}
				}
			}
			return callback(new Error(`Service [${basepath}] - API ${api_name} - Operation ${method} not found.`));
		},
		function (service,callback) {
			self.updateService(service,(err)=>{
				return callback(err,service);
			});
		}
	],function (err,data) {
		if(err)
			logger.error(err.message);
	    return callback(err,data);
    });
};

exports.deleteApi=function(basepath, api_name, callback){
	logger.debug(`[DATA] - DeleteApi - Service [${basepath}] - Deleting API ${api_name}.`);
	var self=this;
	async.waterfall([
		function (callback) {
			//chargement du service
			self.loadService(basepath,(err,service) => {
				return callback(err,service);
			});
		},
		function (service,callback) {
			for(var id in service.apis){
				if(service.apis[id].name == api_name){
					if(service.apis.length == 1){
						return callback(new Error(`Only one API in service [${basepath}]. Cannot delete it!`));
						break;
					}
					service.apis.splice(id,1);
					return callback(null,service);
					break;
				}
			}
			return callback(new Error(`Service [${basepath}] - API ${api_name} not found.`));
		},
		function (service,callback) {
			self.updateService(service,(err)=>{
				return callback(err,service);
			});
		},
		function (service,callback) {
			fs.remove(`./${env.SIMUSPATH}/${basepath}/${api_name}`, (err)=>{
				 return callback(err,service);
			});
		}
	],function (err,data) {
		if(err)
			logger.error(err.message);
        return callback(err,data);
    });
};

exports.addApi=function(basepath, api_name, service, callback){
	logger.debug(`[DATA] - AddApi - Service [${basepath}] - Adding API ${api_name}.`);
	var self=this;
	async.waterfall([
		function (callback) {
			//chargement du service
			self.loadService(basepath,(err,storedService) => {
				return callback(err,storedService);
			});
		},
		function (storedService,callback) {
			if(storedService.apis.map(function(api){return api.name;}).includes(api_name)){
				return callback(new Error(`The Api ${api_name} already exists.`));
			}
			return callback(null);
		},
		function (callback) {
			fs.mkdir(`./${env.SIMUSPATH}/${basepath}/${api_name}`, (err)=>{
				 callback(err);
			});
		},
		function (callback) {
			fs.writeFile(`./${env.SIMUSPATH}/${basepath}/${api_name}/${api_name}-.json`, `{\"template\":\"${api_name}--Template.xml\",\"delay\":0}` , (err)=>{
				callback(err);
			});
		},
		function (callback) {
			fs.writeFile(`./${env.SIMUSPATH}/${basepath}/${api_name}/${api_name}--Template.xml`, "<?xml version=\"1.0\" encoding=\"UTF-8\"?><genesis>This is a simulator</genesis>" , (err)=>{
				callback(err);
			});
		},
		function (callback) {
		 	self.updateService(service,(err)=>{
				callback(err);
			});
		}
	],function (err) {
		if(err)
			logger.error(err.message);
        return callback(err,service);
    });
};

exports.updateApi=function(basepath, old_api_name, new_api_data, callback){
	logger.debug(`[DATA] - UpdateApi - Service [${basepath}] - Updating API ${old_api_name}.`);
	var self=this;
	async.waterfall([
		function (callback) {
			//chargement du service
			self.loadService(basepath,(err,service) => {
				return callback(err,service);
			});
		},
		function (service,callback) {

			var apiNames=service.apis.map(function(api){return api.name});
			var apiUris=service.apis.map(function(api){return api.uri});

			if(apiNames.includes(new_api_data.name) && new_api_data.name != old_api_name){
				return callback(new Error(`API name [${new_api_data.name}] already exists.`),service);
			}

			if(apiNames.includes(new_api_data.name) && apiUris.includes(new_api_data.uri)){
				return callback(new Error(`Aucune modification.`),service);
			}

			//vï¿½rifiation nom d'API unique
			if(!apiNames.includes(new_api_data.name) 
				&& old_api_name != new_api_data.name){
				//Renommer le rï¿½pertoire de l'API dans le simulateur
				logger.debug(`[DATA] - UpdateApi - Service [${basepath}] - Renaming API ${old_api_name} to ${new_api_data.name}.`);
				fs.move(`./${env.SIMUSPATH}/${basepath}/${old_api_name}`,`./${env.SIMUSPATH}/${basepath}/${new_api_data.name}`, (err) => {
					return callback(err,service);
				});
			}else{
				return callback(null,service);
			}

		},
		function (service, callback) {
			//Mise ï¿½ jour des donnï¿½es de l'API
			for(id in service.apis){
				if(service.apis[id].name == old_api_name){
					service.apis[id]=new_api_data;
					self.updateService(service,(err) => {
						logger.debug(`[DATA] - UpdateApi - Service [${basepath}] - updated.`);
						return callback(err,service);
					});
					break;
				}
			}
		},
		function (service,callback) {
			//Renommer les JDD
			logger.debug(`[DATA] - UpdateApi - Service [${basepath}] - Renaming Dataset for API ${new_api_data.name}.`);

			if(old_api_name == new_api_data.name){
				return callback(null,service);
			}
			fsExt.getFiles(`./${env.SIMUSPATH}/${basepath}/${new_api_data.name}`,false,false, (err,files) => {
				var toRename = files.filter(function(file){
					return file.startsWith(old_api_name) && path.extname(file)=='.json';
				});
				toRename.forEach(function(oldfile,index,array){
					var newName = new_api_data.name + oldfile.substring(old_api_name.length);
					fs.move(`./${env.SIMUSPATH}/${basepath}/${new_api_data.name}/${oldfile}`,`./${env.SIMUSPATH}/${basepath}/${new_api_data.name}/${newName}`,(err) => {
						return callback(err,service);
					});
				});
			});
		}
	],function (err,data) {
		if(err !=undefined && err!=null && err.message=='NO_RENAME')
			return callback(null,data);
		if(err)
			logger.error(err.message);
        return callback(err,data);
    });
};



exports.createService=function(service , callback){
	var self=this;
	async.series([
		 function (callback) {
			 fs.access(`./${env.SIMUSPATH}/${service.basepath}`, (err) => {
				if(err){
					callback(null);
				}else{
					callback(new Error(`The service ${service.basepath} already exists.`));
				}
			});
		 },
		 function (callback) {
			 fs.mkdir(`./${env.SIMUSPATH}/${service.basepath}`, (err)=>{
				 callback(err);
			 });
		 },
		 function (callback) {
		 	 self.updateService(service,(err)=>{
				 callback(err);
			 });
		 },
		 function (callback) {
			  fs.mkdir(`./${env.SIMUSPATH}/${service.basepath}/${service.apis[0].name}`, (err)=>{
				 callback(err);
			 });
		  },
		  function (callback) {
			  fs.writeFile(`./${env.SIMUSPATH}/${service.basepath}/${service.apis[0].name}/${service.apis[0].name}-.json`, `{\"template\":\"${service.apis[0].name}--Template.xml\",\"delay\":0}` , (err)=>{
				 callback(err);
			 });
		  },
		  function (callback) {
			  fs.writeFile(`./${env.SIMUSPATH}/${service.basepath}/${service.apis[0].name}/${service.apis[0].name}--Template.xml`, "<?xml version=\"1.0\" encoding=\"UTF-8\"?><genesis>This is a simulator</genesis>" , (err)=>{
				 callback(err);
			 });
		  }
	], function (err) {
        callback(err);
    });
};




