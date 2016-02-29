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
var genesisFileAccess = require('__base + 'lib/core/dataAccess/genesisFileAccess');
var doT = require("dot");
var fs = require("fs");
var env = process.env;

var GenesisDataAccess=function GenesisDataAccess() {
    
    var accessMode = { FILE: "file", DB: "db" };
    this.mode = env.MODE;
    this.cacheActif=env.CACHEACTIF;
    var dispatchCache;
    var templateCache={};
    
    /*return list of objects Service */
    this.getServicesConf = function (callback) {
        switch (this.mode) {
            case accessMode.FILE:
                genesisFileAccess.getServicesConf(function (err, data) {
                    logger.debug('DATA ACCESS - ServicesConf - ' + data);
                    callback(err, data);
                });
            case accessMode.DB:
                return;
        }
        return;
    }
	
	this.getServiceConf = function (basepath, callback) {
        switch (this.mode) {
            case accessMode.FILE:
                genesisFileAccess.getServiceConf(basepath, function (err, data) {
                    logger.debug('DATA ACCESS - ServicesConf - ' + data);
                    callback(err, data);
                });
            case accessMode.DB:
                return;
        }
        return;
    }

    /*return the list of String representing the services name */
    this.getServicesList = function (callback) {
        switch (this.mode) {
            case accessMode.FILE:
                genesisFileAccess.getServicesList(function (err, listSrvName) {
                    logger.info('DATA ACCESS - ServicesList - ' + listSrvName);
                    callback(null,listSrvName);
                });
            case accessMode.DB:
                return;
        }
        return;
    }

    this.getDispatchConf=function(service, api){

    }

    this.getTemplate = function (service,api,template, callback){
      var tempId="./" + service+ '/' + api + "/" + template;
      var buildTpl=templateCache[tempId];
      if(buildTpl!=undefined){
        logger.info('Template found');
      	callback(null,buildTpl);
	return;
      }
      fs.readFile(tempId, function (err, data) {
        if(err) callback(err);
	if(this.cacheActif){
       	  templateCache[tempId]=doT.template(data);
      	  callback(null,templateCache[tempId]);
	}else{
	  callback(null,doT.template(data));
	}
      });
      return;
    }

}

GenesisDataAccess.instance=null;

GenesisDataAccess.getInstance=function(){
 if(this.instance===null){
  this.instance=new GenesisDataAccess();
 }
 return this.instance;
}

module.exports=GenesisDataAccess.getInstance();
