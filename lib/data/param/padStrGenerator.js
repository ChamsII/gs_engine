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
* PadStrGenerator - Génère une chaine de caractère paddé à gauche ou a droite par le caractère 
*
* @class PadStrGenerator
* @constructor PadStrGenerator()
*/
var PadStrGenerator = function PadStrGenerator(){
  
    this.generate = function(param, runCtxt, callback){
    	runCtxt.debug("PadStrGenerator - "+param.name);

      var paramVal='';

      if(param.char==undefined)
        param.char=' ';

      if(param.value.indexof("tp.")!=-1){
        paramVal=runCtxt.parameters[param.value.substring(3)];
      }

      if(param.way=="R")
        paramVal=param.value.rpad(param.char,param.len);
      else
        paramVal=param.value.lpad(param.char,param.len);

       
      return callback(null, paramVal);
    }

}

PadStrGenerator.instance=null;

PadStrGenerator.getInstance=function(){
   if(this.instance === null){
      this.instance = new PadStrGenerator();
   }
   return this.instance;
}

module.exports = PadStrGenerator.getInstance();