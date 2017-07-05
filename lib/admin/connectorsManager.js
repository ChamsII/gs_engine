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
var CST =require(__base + 'lib/dataAccess/constants.js');
var gsDb = (config.mode=='file')?require(__base + 'lib/dataAccess/fs/fs.js'):require(__base + 'lib/dataAccess/fs/fs.js');
const spawn = require('child_process').spawn;
var async = require('async');

var ConnectorsManager = function ConnectorsManager(){

  this.connectors=[];

  this.startSrvConnectors = function(srv){
    for(var idApi in srv.apis){
      if(srv.apis[idApi]===undefined)
        continue;
      for(var idOp in srv.apis[idApi].operations){
        if(srv.apis[idApi].operations[idOp].connectors!=undefined){
          var connectors = srv.apis[idApi].operations[idOp].connectors;
          for(var idConn in connectors){
            var connector=connectors[idConn];
            if(connector.type="MQ"){

              var command=config.connectors.MQ.cmd;
              var args=[];
              args.push("-Dlog4j.dir="+config.simusPath+"/"+srv.basepath);
              args.push("-Dlog4j.lvl="+connector.loglvl);
              args.push("-Dlog4j.configurationFile="+config.connectors.MQ.logconf);
              args.push("-cp");
              args.push(config.connectors.MQ.lib+"/*");
              args.push(config.connectors.MQ.bin);
              args.push(connector.qmanager);
              args.push(connector.hostname);
              args.push(connector.port);
              args.push(connector.channel);
              args.push(connector.listenq);
              args.push(connector.destq);
              args.push("http://localhost:"+config.PORT+"/"+srv.basepath+srv.apis[idApi].uri);
              args.push(connector.pattern==undefined?"M":connector.pattern);
              
              var child_connector = spawn(command,args);
              
              child_connector.on('error',(err)=>{
                logger.debug(err);
              });

              if(this.connectors[srv.basepath]===undefined)
                this.connectors[srv.basepath]=[];

              this.connectors[srv.basepath].push(child_connector);
              
              logger.info("CONNECTOR - MQConnector started for "+srv.basepath+srv.apis[idApi].uri +" - PID:"+child_connector.pid);
            }
          }
        }
      }
    }
  }


  this.initConnectors = function(callback){
    logger.debug("CONNECTOR - Starting connectors...");

    gsDb(CST.OBJ.SERVICE,CST.CMD.GET,{},CST.NEW_OPTS(),null,(err,data) => {
      for(var id in data.page){
        logger.debug("CONNECTOR - Service "+data.page[id].value);
        gsDb(CST.OBJ.SERVICE,CST.CMD.GET,{"service":data.page[id].value},CST.NEW_OPTS(),null,(err,service) => {
          if(service.state=="running"){
            this.startSrvConnectors(service);
          }
        });
      }
    });
    
  }


  this.stopConnectors = function(callback){
    logger.debug("CONNECTOR - Stopping connectors...");
     gsDb(CST.OBJ.SERVICE,CST.CMD.GET,{},CST.NEW_OPTS(),null,(err,data) => {
       for(var id in data.page){
        logger.debug("CONNECTOR - Service "+data.page[id].value);
        if(this.connectors[data.page[id].value]===undefined){
          continue;
        }
        gsDb(CST.OBJ.SERVICE,CST.CMD.GET,{"service":data.page[id].value},CST.NEW_OPTS(),null,(err,service) => {
          if(service.state=="running"){
            this.stopSrvConnectors(service);
          }
        });
      }
    });
  }


  this.stopSrvConnectors = function(service){
    
    if(this.connectors[service.basepath]===undefined)
      return;

    logger.debug("CONNECTOR - Stopping connectors...");

    for(var id in this.connectors[service.basepath]){
      logger.info("CONNECTOR "+service.basepath+" STOPPED - pid: "+this.connectors[service.basepath][id].pid);
      this.connectors[service.basepath][id].kill('SIGTERM');
    }

  }
}

ConnectorsManager.instance=null;

ConnectorsManager.getInstance=function(){
   if(this.instance === null){
      this.instance = new ConnectorsManager();
   }
   return this.instance;
}


module.exports = ConnectorsManager.getInstance();
