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
var PathExtractor = require(__base + 'lib/data/tp/pathExtractor.js');
var QueryExtractor = require(__base + 'lib/data/tp/queryExtractor.js');
var BodyXPathExtractor = require(__base + 'lib/data/tp/bodyXPathExtractor.js');
var HeaderExtractor = require(__base + 'lib/data/tp/headerExtractor.js');
var TLVExtractor = require(__base + 'lib/data/tp/TLVExtractor.js');
var PositionExtractor = require(__base + 'lib/data/tp/positionExtractor.js');


/**
* TPExtractor - Bibliothèque des extracteurs de transfertProperties depuis la requête
*
* @class TPExtractor
* @constructor TPExtractor()
*/
var TPExtractor = function TPExtractor(){
	//TODO :  A faire porter par le dictionnaire de Service GENESIS
    this.src = { 
    	PATH: "PATH", 
    	QUERY: "QUERY", 
    	BODY_XPATH: "BODY_XPATH", 
    	HEADER: "HEADER", 
    	TLV:"TLV", 
    	POSITION:"POSITION" 
    };

    this.extractor=[];
    this.extractor[this.src.PATH]=PathExtractor;
    this.extractor[this.src.QUERY]=QueryExtractor;
    this.extractor[this.src.BODY_XPATH]=BodyXPathExtractor;
    this.extractor[this.src.HEADER]=HeaderExtractor;
    this.extractor[this.src.TLV]=TLVExtractor;
    this.extractor[this.src.POSITION]=PositionExtractor;

    this.extract = function(tp, request, runCtxt, callback){
    	if(this.extractor[tp.source]==undefined){
    		return callback(new Error("L'extractor de type "+tp.source+" n'existe pas."));
    	}
    	this.extractor[tp.source].extract(tp, request, runCtxt, (err,value)=>{
    		if(err){
    			runCtxt.debug("Erreur à l'extraction: "+err.message);
    			return callback(err);
    		}
    		runCtxt.debug('TP:'+tp.name+' -Value:'+value);
    		return callback(null,value);
    	});
    }
}

TPExtractor.instance=null;

TPExtractor.getInstance=function(){
   if(this.instance === null){
      this.instance = new TPExtractor();
   }
   return this.instance;
}

module.exports = TPExtractor.getInstance();