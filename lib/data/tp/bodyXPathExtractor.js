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
var et = require('elementtree');
var ElementTree = et.ElementTree;

/**
* BodyXPathExtractor - Extrait un paramètre du BODY par XPATH
*
* @class BodyXPathExtractor
* @constructor BodyXPathExtractor()
*/
var BodyXPathExtractor = function BodyXPathExtractor(){

    this.extract = function(tp, request, runCtxt, callback){
    	runCtxt.debug("BodyXPathExtractor - "+tp.name);
        var searchPath = tp.path;
        var attribut = tp.attr;

        console.log( " ------------------------- ")
        console.log( request.post === null )

        if( request.post === null || request.post === undefined || !request.post ){
            runCtxt.info("ERROR POST obligatoire ! BodyXPathExtractor - " + tp.name);
            return callback(new Error("POST obligatoire ! "));
        }

        if(runCtxt.bodyParsed===undefined ||runCtxt.bodyParsed===null ){
            runCtxt.bodyParsed=et.parse(request.post);
        }

        var extractVal;

        if(searchPath.indexOf(' or ')!=-1){

    	    var searches = searchPath.split(" or ");
     	    runCtxt.debug("BodyXpath searchs:"+searches);
    	    var i=0;
    	    runCtxt.debug("BodyXpath searches.length:"+searches.length);	
    	    while(i <= searches.length-1){
        		extractVal=runCtxt.bodyParsed.find(searches[i]);
        		runCtxt.debug("BodyXpath [or part"+i+"] [search "+searches[i]+"]: "+extractVal);
        		if(extractVal != undefined && extractVal != null){
        		 break;
        		}
        		i++;	
    	    }

                /*var searchPath1=searchPath.substring(0,searchPath.indexOf(' or '));
                extractVal=runCtxt.bodyParsed.find(searchPath1); 
    	    runCtxt.info("BodyXpath (or) part1:"+extractVal);
                if(extractVal===undefined){
                    var searchPath2=searchPath.substring(searchPath.indexOf(' or ')+4);
                    extractVal=runCtxt.bodyParsed.find(searchPath2);
    		runCtxt.info("BodyXpath (or) part2:"+extractVal);
                }*/
        }
	   else{
           if( searchPath )
                extractVal=runCtxt.bodyParsed.find(searchPath);
        }

         if(extractVal===undefined || extractVal===null){
             return callback(new Error("Le paramètre "+tp.name+" n'est pas présent dans le POST de la requête."));
         }

         
        if(attribut!=undefined){
            extractVal=extractVal.get(attribut);
        }else{
            extractVal=extractVal.text;
        }
        

        callback(null, extractVal);
    }

}

BodyXPathExtractor.instance=null;

BodyXPathExtractor.getInstance=function(){
   if(this.instance === null){
      this.instance = new BodyXPathExtractor();
   }
   return this.instance;
}

module.exports = BodyXPathExtractor.getInstance();
