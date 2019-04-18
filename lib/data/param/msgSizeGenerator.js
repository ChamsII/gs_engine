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
* MsgSizeGenerator - Génère une date
*
* @class MsgSizeGenerator
* @constructor MsgSizeGenerator()
*/
var MsgSizeGenerator = function MsgSizeGenerator(){
  
    this.generate = function(param, runCtxt, callback){
    	runCtxt.debug("MsgSizeGenerator - "+param.name);

      if(runCtxt.postParam==undefined)
        runCtxt.postParam=[];
      runCtxt.postParam.push(param);
       
      return callback(null, new String().lpad(' ',param.len));
    }

    this.calculate = function(param, runCtxt, msg, callback){
      runCtxt.debug("MsgSizeGenerator - calculate "+param.name);
      return callback(null,msg.length.toString().lpad(' ',param.len));
    }

}

MsgSizeGenerator.instance=null;

MsgSizeGenerator.getInstance=function(){
   if(this.instance === null){
      this.instance = new MsgSizeGenerator();
   }
   return this.instance;
}

module.exports = MsgSizeGenerator.getInstance();