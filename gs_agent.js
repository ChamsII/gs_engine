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
var winston = require('winston');
var cluster = require('cluster');
var http = require('http');
var axios = require('axios');

global.__base = __dirname + '/';

var gs = require('./lib/gs_engine');
var admin = require('./lib/admin/admin');

var feedersExtractor = require('./lib/data/tp/feedersExtractor');


require('dotenv').config();
var env = process.env;

global.logger = winston.createLogger({
    level: env.LOG_LVLCONSOLE,
    format: winston.format.combine(
        winston.format.splat(),
        winston.format.simple()
    ),
    transports: [
      new winston.transports.Console({ 'timestamp': 'true', level: env.LOG_LVLCONSOLE }),
      new winston.transports.File({ filename: env.LOG_FILENAME ,json:false, maxsize:env.LOG_MAXSIZE,maxFiles:env.LOG_MAXFILES,timestamp:true, level:env.LOG_LVLFILE})
    ]
  });

global.counters=[];


// Global feeders files
global.feederPropertiesFiles=[
    {"id": 1, "name" : "fichierTest.csv", "path": "Feeders/fichierTest.csv", "value": ""}
];
feedersExtractor.readFeederPropertiesFiles();


String.prototype.lpad = function(padString, length) {
    var str = this;
    while (str.length < length)
        str = padString + str;
    return str;
}

String.prototype.rpad = function(padString, length) {
    var str = this;
    while (str.length < length)
        str = str + padString;
    return str;
}



if (cluster.isMaster) {


	logger.info('INIT - GS Agent Admin listen on port '+ env.ADMIN_PORT);
    
	var master = admin.createAdmin().listen(env.ADMIN_PORT);
	http.get('http://localhost:'+env.ADMIN_PORT+'/start', (res) => {
			res.resume();
    });

    axios.get(env.AGENT_ADMIN+'/agent/nbrAgent' )
    .then(function (response) {

        let agent = {
            id : parseInt( response.data.nbrAgent ) + 1,
            name: env.NAME,
            hostname: env.HOSTNAME,
            admin_port: env.ADMIN_PORT,
            agent_port: env.PORT,
            docker: env.DOCKER
        }

        axios.post(env.AGENT_ADMIN+'/agent/create', agent )
        .then(function (response) {
            if( response.data.message == "saving"){
                logger.info('INIT - Agent ['+env.NAME+'] added in the agents lists');
            }else{
                logger.error('ERROR INIT - Agent ['+env.NAME+'] in the agents lists');
            }
        })
        .catch(function (error) {
        });

    })
    .catch(function (error) {
    })

    


}else {
	logger.info('INIT - GS Agent Worker '+ cluster.worker.id+'['+cluster.worker.process.pid+'] listen on port '+ env.PORT);
	var gs_agent = gs.createServer().listen(env.PORT);
}

