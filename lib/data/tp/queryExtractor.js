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
* QueryExtractor - Extrait un paramètre de la query http://host:port/path?key=[ExtractedData]
*
* @class QueryExtractor
* @constructor QueryExtractor()
*/
var QueryExtractor = function QueryExtractor(){
  
    this.extract = function(tp, request, runCtxt, callback){
    	runCtxt.debug("QueryExtractor - "+tp.name);
        var query = runCtxt.url_parts.query;
        var paramVal = query[tp.name];

        if (paramVal === undefined) {
            return callback(new Error("Le paramètre "+tp.name+" n'est pas présent dans la query."));
        }

        callback(null, paramVal);
    }

}

QueryExtractor.instance=null;

QueryExtractor.getInstance=function(){
   if(this.instance === null){
      this.instance = new QueryExtractor();
   }
   return this.instance;
}

module.exports = QueryExtractor.getInstance();