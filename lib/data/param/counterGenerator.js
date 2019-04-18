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
* CounterGenerator - Génère un compteur
* @class CounterGenerator
* @constructor CounterGenerator()
*/
var CounterGenerator = function CounterGenerator(){
  
    this.generate = function(param, runCtxt, callback){
    	runCtxt.debug("CounterGenerator - "+param.name);

      if(counters[param.name]==undefined)
        counters[param.name]=param.start;
      else
        counters[param.name]=counters[param.name]+1;
      
      return callback(null, counters[param.name]);
    }

}

CounterGenerator.instance=null;

CounterGenerator.getInstance=function(){
   if(this.instance === null){
      this.instance = new CounterGenerator();
   }
   return this.instance;
}

module.exports = CounterGenerator.getInstance();