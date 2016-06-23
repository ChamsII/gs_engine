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
* GenesisParam - génération / extraction de paramètres 
*
* @class GenesisParam
* @constructor GenesisParam()
*/
var GenesisParam = function GenesisParam(){
    var ParamType = { RDNUM: "rdnum", RANDOM_ALPHANUM: "rdalphnum", COUNTER: "counter", DATE: "date", TPPART:"tpPart" };
    
    this.genereParam = function (param, runCtxt, callback) {
        switch (param.type) {
            case ParamType.RANDOM_ALPHANUM:
                this.genereRDALPHNUM(param.name, param.arg, param.arg2, callback);
                return;
            case ParamType.DATE:
                this.genereDATE(param.name, param.arg, callback);
                return;
			case ParamType.TPPART:
                this.genereTPPART(param.name, param.source, param.start, param.end, runCtxt, callback);
                return;
        }
        callback(new Error("Unknown parameter type"));
        return;
    }

    // Generate a Random String of length len using chars in charset
    this.genereRDALPHNUM = function (name, len, charSet, callback) {
        if (len == undefined || null) {
            callback(new Error('len is mandatory for RDALPHNUM param'));
            return;
        }
        charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var paramVal = '';
        for (var i = 0; i < len; i++) {
            var randomPoz = Math.floor(Math.random() * charSet.length);
            paramVal += charSet.substring(randomPoz, randomPoz + 1);
        }
        
        logger.debug("ParamName: " + name + " - Value: " + paramVal);
        
        callback(null, paramVal);
    }
    
    
    this.genereDATE = function (name, format, callback) {
        var paramVal = dateFormat(new Date(), format);
        logger.debug("ParamName: " + name + " - Value: " + paramVal);
        callback(null, paramVal);
    }

	this.genereTPPART = function(name, source, start, end, runCtxt, callback){
		var paramVal = '';
		var sourceVal=runCtxt.parameters[source];
		if(sourceVal == undefined || source.length==0){
			callback(new Error('La transferProperty source n existe pas'));
		}
		
		paramVal = sourceVal.substring(start,end);
		
		logger.debug("ParamName: " + name + " - Value: " + paramVal);
		
		callback(null, paramVal);
		
	 }

    if(GenesisParam.caller != GenesisParam.getInstance){
      throw new Error("This object cannot be instanciated");
    }

}


GenesisParam.instance=null;

GenesisParam.getInstance=function(){
   if(this.instance === null){
      this.instance = new GenesisParam();
   }
   return this.instance;
}

module.exports = GenesisParam.getInstance();
