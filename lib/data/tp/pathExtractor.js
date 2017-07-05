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
* PathExtractor - Extrait un paramètre du PATH
*
* @class PathExtractor
* @constructor PathExtractor()
*/
var PathExtractor = function PathExtractor(){
  
    this.extract = function(tp, request, runCtxt, callback){
    	runCtxt.debug("PathExtractor - "+tp.name);
    	var uri = runCtxt.api.uri;
    	var pathname = runCtxt.url_parts.pathname;

    	var index = uri.indexOf(tp.path);
        if (index == -1) {
            return callback(new Error("Le paramètre "+tp.path+" n'est pas présent dans le path: "+uri));
        }
        var paramVal = pathname.split('/')[1 + uri.slice(0, index).match(/\//g).length];

        callback(null, paramVal);
    }

}

PathExtractor.instance=null;

PathExtractor.getInstance=function(){
   if(this.instance === null){
      this.instance = new PathExtractor();
   }
   return this.instance;
}

module.exports = PathExtractor.getInstance();