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
var dataAccess = (env.MODE=='file')?require(__base + 'lib/dataAccess/fsAccess'):require(__base + 'lib/dataAccess/mongoAccess');
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

              var command=env.CONNECTORS_MQ_CMD;
              var args=[];
              args.push("-Dlog4j.dir="+env.SIMUSPATH+"/"+srv.basepath);
              args.push("-Dlog4j.lvl="+connector.loglvl);
              args.push("-Dlog4j.configurationFile="+env.CONNECTORS_MQ_LOGCONF);
              args.push("-cp");
              args.push(env.CONNECTORS_MQ_LIB+"/*");
              args.push(env.CONNECTORS_MQ_BIN);
              args.push(connector.qmanager);
              args.push(connector.hostname);
              args.push(connector.port);
              args.push(connector.channel);
              args.push(connector.listenq);
              args.push(connector.destq);
              args.push("http://localhost:"+env.PORT+"/"+srv.basepath+srv.apis[idApi].uri);
              
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

    dataAccess.getServicesSorted(null,(err,serviceList)=>{
      for(var serviceId in serviceList){
        logger.debug("CONNECTOR - Service "+serviceList[serviceId]);
        dataAccess.loadService(serviceList[serviceId],(err,service)=>{
          if(service.state=="running"){
            this.startSrvConnectors(service);
          }
        });
      }
    });
  }


  this.stopSrvConnectors = function(basepath){
    
    if(this.connectors[basepath]===undefined)
      return;

    logger.debug("CONNECTOR - Stopping connectors...");

    for(var id in this.connectors[basepath]){
      logger.info("CONNECTOR "+basepath+" STOPPED - pid: "+this.connectors[basepath][id].pid);
      this.connectors[basepath][id].kill('SIGTERM');
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