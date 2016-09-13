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
var dateFormat = require('dateformat');
/**
* DateGenerator - Génère une date
*
* @class DateGenerator
* @constructor DateGenerator()
*/
var DateGenerator = function DateGenerator(){
  
    this.generate = function(param, runCtxt, callback){
    	runCtxt.debug("DateGenerator - "+param.name);

        var paramVal = dateFormat(new Date(), param.format);
       
        return callback(null, paramVal);
    }

}

DateGenerator.instance=null;

DateGenerator.getInstance=function(){
   if(this.instance === null){
      this.instance = new DateGenerator();
   }
   return this.instance;
}

module.exports = DateGenerator.getInstance();