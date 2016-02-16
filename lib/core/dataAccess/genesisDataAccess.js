var genesisFileAccess = require('./genesisFileAccess');
var doT = require("dot");
var fs = require("fs");

var GenesisDataAccess=function GenesisDataAccess() {
    
    var accessMode = { FILE: "file", DB: "db" };
    this.mode = config.mode;
    this.cacheActif=config.cacheActif;
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
