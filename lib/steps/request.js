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
var url = require('url');
var env = process.env;
var dataAccess = (env.MODE=='file')?require(__base + 'lib/dataAccess/fsAccess'):require(__base + 'lib/dataAccess/mongoAccess');

exports.execute = function (request, response, runCtxt, callback) {
    
    var start = new Date().getTime();

    var ip = request.headers['x-forwarded-for'] || 
            request.connection.remoteAddress || 
            request.socket.remoteAddress ||
            request.connection.socket.remoteAddress;
    
    runCtxt.ip = ip;
    
    var url_parts = url.parse(request.url, true);
    var basepath = url_parts.pathname.split('/')[1];
    dataAccess.loadService(basepath,function(err, data){
		if(err){
			runCtxt.error('STEP REQUEST - SERVICE inconnu');
			callback(new Error('Service inconnu'));
			return;
		}
	
		runCtxt.url_parts = url_parts;
		runCtxt.basepath = basepath;
    
		runCtxt.debug('STEP REQUEST');
	
		runCtxt.service = data;
    
		//Check Service status
		if (runCtxt.service.state == 'stopped') {
			runCtxt.info('STEP REQUEST - SERVICE arrêté');
			callback(new Error('Service arrêté'));
			return;
		}
		
		//Check the API 
		for (i in runCtxt.service.apis) {
			var api = runCtxt.service.apis[i];
			var reg = new RegExp("{[a-zA-Z0-9]+}", "g");
			var uri_formatted = api.uri.replace(reg, "[a-zA-Z0-9]+");
			var URI = new RegExp("/" + basepath + uri_formatted + '$', "g");
			
			//Check if the URI match the config for the selected service
			if (url_parts.pathname.match(URI)) {
				break;
			} else {
				api = null;
			}
		}
		if (api == null) {
			runCtxt.info('STEP REQUEST - API inconnue - ' + url_parts.pathname);
			callback(new Error('API inconnue'));
			return;
		}
		runCtxt.debug(api.name);
		runCtxt.api = api;
		
		//Check the request method
		for (opInd in api.operations) {
			var operation = api.operations[opInd];
			if (operation.method == request.method) {
				break;
			} else {
				operation = null;
			}
		}
		if (operation == null) {
			runCtxt.info('STEP REQUEST - Opération inconnue - ' + api.uri + ' - ' + request.method);
			callback(new Error('Méthode non implémentée'));
			return;
		}
		
		runCtxt.info('STEP REQUEST - ' + api.uri + ' - ' + request.method +'duration: '+ (new Date().getTime()-start) +' ms');
		
		runCtxt.operation = operation;
		
		callback(null,request,response,runCtxt);
	
	});
}
