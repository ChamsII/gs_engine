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
* PositionExtractor - Extrait un paramètre de la requête à partir de sa position et de sa longueur
*
* @class PositionExtractor
* @constructor PositionExtractor()
*/
var PositionExtractor = function PositionExtractor(){
  
    this.extract = function(tp, request, runCtxt, callback){
    	runCtxt.debug("PositionExtractor - "+tp.name);
        var trame = request.post;
        if(tp.position >= trame.length)
            return callback(new Error("La position de la valeur recherchée est en dehors de la requête."));

        return callback(null,trame.substring(tp.position,tp.position+tp.length));

    }
}

PositionExtractor.instance=null;

PositionExtractor.getInstance=function(){
   if(this.instance === null){
      this.instance = new PositionExtractor();
   }
   return this.instance;
}

module.exports = PositionExtractor.getInstance();