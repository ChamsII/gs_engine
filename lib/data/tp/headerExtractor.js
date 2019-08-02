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

/**
* HeaderExtractor - Extrait un paramètre des headers de la requête
*
* @class HeaderExtractor
* @constructor HeaderExtractor()
*/
var HeaderExtractor = function HeaderExtractor(){
  
    this.extract = function(tp, request, runCtxt, callback){
    	runCtxt.debug("HeaderExtractor - "+tp.path);
        var headers = request.headers;

        if( request.headers === null || request.headers === undefined ){
            runCtxt.info("ERROR HEADERS obligatoire ! HeaderExtractor - " + tp.path);
            return callback(new Error("headers obligatoire ! "));
        }

	    var paramVal = headers[tp.path];

        if (paramVal === undefined) {
            return callback(new Error("Le paramètre "+tp.name+" n'est pas présent dans les headers."));
        }

        callback(null, paramVal);
    }

}

HeaderExtractor.instance=null;

HeaderExtractor.getInstance=function(){
   if(this.instance === null){
      this.instance = new HeaderExtractor();
   }
   return this.instance;
}

module.exports = HeaderExtractor.getInstance();
