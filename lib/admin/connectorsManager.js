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
const exec = require('child_process').exec;
var async = require('async');

var ConnectorsManager = function ConnectorsManager(){

  this.connectors=[];

  this.startConnectors = function(srv,api,connectors){
    for(var idConn in connectors){
      var connector=connectors[idConn];
      if(connector.type="MQ"){
        var command=env.CONNECTORS_MQ_CMD;
        command+=" ";
        command+="-Dlog4j.dir=\""+env.SIMUSPATH+"/"+srv.basepath+"\"";
        command+=" ";
        command+="-Dlog4j.lvl="+connector.loglvl;
        command+=" ";
        command+="-Dlog4j.configurationFile=\""+env.CONNECTORS_MQ_LOGCONF+"\"";
        command+=" ";
        command+="-cp "+env.CONNECTORS_MQ_LIB+"/*";
        command+=" ";
        command+=env.CONNECTORS_MQ_BIN;
        command+=" ";
        command+=connector.qmanager+" "+connector.hostname+" "+connector.port+" "+connector.channel+" "+connector.listenq+" "+connector.destq;
        command+=" http://localhost:"+env.PORT+"/"+srv.basepath+api.uri;
        var child_connector = exec(command, (error, stdout, stderr) => {
          if (error) {
            logger.error(`exec error: ${error}`);
            return;
          }
        });
        this.connectors.push(child_connector);
        logger.info("CONNECTOR - MQConnector started for "+srv.basepath+api.uri);
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
            for(var idApi in service.apis){
              for(var idOp in service.apis[idApi].operations){
                if(service.apis[idApi].operations[idOp].connectors!=undefined){
                  this.startConnectors(service,service.apis[idApi],service.apis[idApi].operations[idOp].connectors);
                }
              }
            }
          }
        });
      }
    });
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