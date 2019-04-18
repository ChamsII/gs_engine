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
exports.execute = function (request, response,runCtxt, callback) {
    runCtxt.debug('STEP POST');
    if (request.method == 'POST') {
        var body = '';
        request.on('data', function (chunk) { 
            body += chunk.toString();
            runCtxt.debug( " POST param - " + chunk.toString());
        });
        request.on('end', function () {
            request.post = body;
            callback(null,request,response,runCtxt);
        });
    } else {
        callback(null,request,response,runCtxt);
    }
}