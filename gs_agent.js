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
var fs = require('fs-extra');

global.__base = __dirname + '/';
global.config = require('./lib/utils/config.js');

var gs = require('./lib/gs_engine');
var admin = require('./lib/admin/admin');

//Initialisation des répertoires
try {
  fs.ensureFileSync(config.get('log.filename'));
  fs.ensureDirSync(config.get('simusPath'));
} catch (err) {
  console.error(err);
  process.exit(1);
}



global.logger = new (winston.Logger)({
     transports: [
             new (winston.transports.Console)({ 'timestamp': 'true', level: config.get('log.lvlConsole') }),
             new (winston.transports.File)({ filename: config.get('log.filename') ,json:false, maxsize:config.get('log.maxsize'),maxFiles:config.get('log.maxfiles'),timestamp:true, level:config.get('log.lvlFile')})
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
	logger.info('INIT - GS Agent Admin listen on port '+ config.get('admin.port'));

	var master = admin.createAdmin().listen(config.get('admin.port'));
	http.get('http://localhost:'+config.get('admin.port')+'/start', (res) => {
			res.resume();
	});
}else {
	logger.info('INIT - GS Agent Worker '+ cluster.worker.id+'['+cluster.worker.process.pid+'] listen on port '+ config.get('PORT'));
	var gs_agent = gs.createServer().listen(config.get('PORT'));
}
