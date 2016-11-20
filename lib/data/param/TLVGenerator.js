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
* TLVGenerator - Génère une date
*
* @class DateGenerator
* @constructor DateGenerator()
*/
var TLVGenerator = function TLVGenerator(){
  
    this.generate = function(param, runCtxt, callback){
    	runCtxt.debug("TLVGenerator - "+param.name);

      var paramVal;

      if(param.value.indexof("tp.")==-1){
        paramVal=param.value;
       
      }else{
        paramVal=runCtxt.parameters[param.value.substring(3)];
        if(paramVal==undefined){
           return callback(new Error("La transferProperty "+param.value +" n'existe pas."));
        }
      }

      var len=paramVal.trim().length;
      paramVal=param.name.rpad(' ',6)+len.toString().lpad(' ',3)+paramVal.trim();
       
      return callback(null, paramVal);
      
    }
}

TLVGenerator.instance=null;

TLVGenerator.getInstance=function(){
   if(this.instance === null){
      this.instance = new TLVGenerator();
   }
   return this.instance;
}

module.exports = TLVGenerator.getInstance();