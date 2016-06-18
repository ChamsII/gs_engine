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
var rmdir = require('rimraf');
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
		rmdir(`./${env.SIMUSPATH}/${basepath}`, (err)=>{
			callback(err);
		});
	});
};

exports.createService=function(service , test, dataset, callback){
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
			 fs.writeFile(`./${env.SIMUSPATH}/${service.basepath}/${service.basepath}.json`, JSON.stringify(service) , (err)=>{
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




