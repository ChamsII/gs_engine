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
* TLVExtractor - Extrait un paramètre d'une trame au format TLV (Type Longueur Valeur)
*
* @class TLVExtractor
* @constructor TLVExtractor()
*/
var TLVExtractor = function TLVExtractor(){
    //Format par défaut pour le TLV
    //Champ "Longueur" sur 3 caractères
    this.lengthSize=3;
    //Champ "Type" sur 6 caractères
    this.typeSize=6;
  
    this.extract = function(tp, request, runCtxt, callback){
    	runCtxt.debug("TLVExtractor - "+tp.name);
        var trame = request.post;

        if( request.post === null || request.post === undefined ){
            runCtxt.info("ERROR POST obligatoire ! TLVExtractor - " + tp.name);
            return callback(new Error("POST obligatoire ! "));
        }


        var index = trame.indexOf(tp.name);
        if(index == -1){
            return callback(new Error("Le champ "+name +" n'existe pas dans la requête."));
        }
        if(tp.typeSize!=undefined)
            this.typeSize=tp.typeSize;
        if(tp.lengthSize!=undefined)
            this.lengthSize=tp.lengthSize;

        var length = trame.substring(index+typeSize,index+typeSize+lengthSize);

        var value = trame.substring(index+typeSize+lengthSize,index+typeSize+lengthSize+length);

        return callback(null,value);
    }

}

TLVExtractor.instance=null;

TLVExtractor.getInstance=function(){
   if(this.instance === null){
      this.instance = new TLVExtractor();
   }
   return this.instance;
}

module.exports = TLVExtractor.getInstance();