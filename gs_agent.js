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
global.config = require('./config.json');
global.__base = __dirname + '/';

var gs = require('./lib/gs_engine');
var admin = require('./lib/admin/admin');

global.logger = new (winston.Logger)({
     transports: [
             new (winston.transports.Console)({ 'timestamp': 'true', level: config.log.lvlConsole }),
             new (winston.transports.File)({ filename: config.log.filename ,json:false, maxsize:config.log.maxsize,maxFiles:config.log.maxfiles,timestamp:true, level:config.log.lvlFile})
     ]
});

global.counters=[];


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
	logger.info('INIT - GS Agent Admin listen on port '+ config.admin.port);
    
	var master = admin.createAdmin().listen(config.admin.port);
	http.get('http://localhost:'+config.admin.port+'/start', (res) => {
			res.resume();
	});
}else {
	logger.info('INIT - GS Agent Worker '+ cluster.worker.id+'['+cluster.worker.process.pid+'] listen on port '+ config.PORT);
	var gs_agent = gs.createServer().listen(config.PORT);
}

