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
var dateFormat = require('dateformat');

/**
* GenesisParam - génération / extraction de paramètres 
*
* @class GenesisParam
* @constructor GenesisParam()
*/
var GenesisParam = function GenesisParam(){
    var ParamSrc = { PATH: "path", QUERY: "query", BODY_XPATH: "body-xpath", HEADER: "header" };
    var ParamType = { RDNUM: "rdnum", RDALPHNUM: "rdalphnum", COUNTER: "counter", DATE: "date", TPPART:"tpPart" };
    
    this.extractParam = function (tp, body, headers, runCtxt , callback) {
        
        switch (tp.source) {
            case ParamSrc.PATH:
                this.extractPATH(tp.name, runCtxt.url_parts.pathname, runCtxt.api.uri, callback);
                return;
            case ParamSrc.QUERY:
                this.extractQUERYorHEADER(tp.name, runCtxt.url_parts.query, callback);
                return;
            case ParamSrc.BODY_XPATH:
                this.extractBODY_XPATH(tp.name, tp.path, body, runCtxt, callback);
                return;
            case ParamSrc.HEADER:
                this.extractQUERYorHEADER(tp.name, headers, callback);
                return;
        }
        
        callback(new Error("Unknown parameter source"));
        
        return;
    }

    this.parsingNeeded=function(tp){
    	return tp.source==ParamSrc.BODY_XPATH;
    }
    
    this.genereParam = function (param, runCtxt, callback) {
        switch (param.type) {
            case ParamType.RDALPHNUM:
                this.genereRDALPHNUM(param.name, param.len, param.charset, callback);
                return;
            case ParamType.DATE:
                this.genereDATE(param.name, param.format, callback);
                return;
			case ParamType.TPPART:
                this.genereTPPART(param.name, param.source, param.start, param.end, runCtxt, callback);
                return;
        }
        callback(new Error("Unknown parameter type"));
        return;
    }
    
    // Extract a parameter from the request PATH
    this.extractPATH = function (name, pathname, uri , callback) {
        
        var index = uri.indexOf(name);
        if (index == -1) {
            callback(new Error('Param not found'));
            return;
        }
        var paramVal = pathname.split('/')[1 + uri.slice(0, index).match(/\//g).length];
        
        logger.debug("ParamName: " + name + " - Value: " + paramVal);
        
        callback(null, paramVal);
    }
    
    
    // Extract a parameter from the request QUERY
    this.extractQUERYorHEADER = function (name, data, callback) {
        var paramVal = data[name];
        if (paramVal == undefined) {
            callback(new Error('Param not found'));
            return;
        }
        
        logger.debug("ParamName: " + name + " - Value: " + paramVal);
        
        callback(null, paramVal);
    }

    this.parseXML= function(xml,runCtxt,callback){
		runCtxt.bodyParsed=et.parse(xml);
		callback(null);
    }
    
    // Extract a parameter from the request BODY XPATH
    this.extractBODY_XPATH = function (name, searchPath, body, runCtxt, callback) {
       
			if(searchPath.indexOf(' or ')!=-1){
				var searchPath1=searchPath.substring(0,searchPath.indexOf(' or '));
					var extractVal=runCtxt.bodyParsed.findtext(searchPath1); 
				if(extractVal!=undefined){
				 callback(null,name,extractVal);
				}
				else{
				var searchPath2=searchPath.substring(searchPath.indexOf(' or ')+4);
				var extractVal=runCtxt.bodyParsed.findtext(searchPath2);
				callback(null,name,extractVal);
				}
			}else{
				var extractVal=runCtxt.bodyParsed.findtext(searchPath);
				callback(null,name,extractVal); 
			}

    }

    this.deleteParse = function (runCtxt, callback){
     
     runCtxt.bodyParsed = null;
    
     callback(null);
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
