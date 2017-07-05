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

/**
 * Subscribe to the master according to the configuration
 */
function subscribe(){
    if(!config.get('master.active')){
        return;
    }

	setInterval(function(){

    var url_parts = url.parse(config.get('master.url'), true);

		var options={
			hostname:url_parts.hostname,
			port:url_parts.port,
			path:url_parts.path,
			method:'POST',
			headers:{
				'Content-Type': 'application/json'
			}
		};

		var req=http.request(options,(res)=>{
			res.on('end',()=>{
				if(res.statusCode!='200'){
					logger.error('Agent subscription error - '+ master_res);
				}
				return;
			});
		});
		req.on('error',(e)=>{
			logger.error('Agent subscription error - '+e.message);
			return;
		});
		var subscribeData={
			"hostname":os.hostname(),
			"port":config.get('admin.port'),
			"tag":config.get('about.tag')
		};

		req.write(JSON.stringify(subscribeData));
		req.end();

	},config.get('master.freq'));
}

module.exports=subscribe
