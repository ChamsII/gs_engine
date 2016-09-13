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
* ANGenerator - Génère une chaine de caractère 
* @class ANGenerator
* @constructor ANGenerator()
*/
var ANGenerator = function ANGenerator(){
  
    this.generate = function(param, runCtxt, callback){
    	runCtxt.debug("ANGenerator - "+param.name);

      if (param.len == undefined || null) {
        callback(new Error('len is mandatory for RDALPHNUM param'));
        return;
      }
      var charSet = param.charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      var paramVal = '';
      for (var i = 0; i < param.len; i++) {
          var randomPoz = Math.floor(Math.random() * charSet.length);
          paramVal += charSet.substring(randomPoz, randomPoz + 1);
      }
    
      return callback(null, paramVal);
    }

}

ANGenerator.instance=null;

ANGenerator.getInstance=function(){
   if(this.instance === null){
      this.instance = new ANGenerator();
   }
   return this.instance;
}

module.exports = ANGenerator.getInstance();