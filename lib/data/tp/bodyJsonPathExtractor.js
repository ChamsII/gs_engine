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
var jp = require('jsonpath');

/**
* BodyJsonPathExtractor - Extrait un paramètre du BODY par JSON 
*
* @class BodyJsonPathExtractor
* @constructor BodyJsonPathExtractor()
*/
var BodyJsonPathExtractor = function BodyJsonPathExtractor(){

    this.extract = function(tp, request, runCtxt, callback){
    	runCtxt.debug("BodyJsonPathExtractor - "+tp.name);

        if(runCtxt.bodyParsed===undefined ||runCtxt.bodyParsed===null ){
            runCtxt.bodyParsed=JSON.parse(request.post);
        }

	var extractVal;	

	extractVal = jp.query(runCtxt.bodyParsed, tp.path)

        if(extractVal===undefined || extractVal===null || extractVal.length==0){
            return callback(new Error("Le paramètre "+tp.name+" n'est pas présent dans le POST de la requête."));
        }
         
        callback(null, extractVal[0]);
    }

}

BodyJsonPathExtractor.instance=null;

BodyJsonPathExtractor.getInstance=function(){
   if(this.instance === null){
      this.instance = new BodyJsonPathExtractor();
   }
   return this.instance;
}

module.exports = BodyJsonPathExtractor.getInstance();
