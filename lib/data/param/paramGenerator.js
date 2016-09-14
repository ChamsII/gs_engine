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

var DateGenerator = require(__base + 'lib/data/param/dateGenerator.js');
var TLVGenerator = require(__base + 'lib/data/param/TLVGenerator.js');
var TPPARTGenerator = require(__base + 'lib/data/param/TPPARTGenerator.js');
var ANGenerator = require(__base + 'lib/data/param/ANGenerator.js');
var CounterGenerator = require(__base + 'lib/data/param/counterGenerator.js');
var MsgSizeGenerator = require(__base + 'lib/data/param/msgSizeGenerator.js');
var PadStrGenerator = require(__base + 'lib/data/param/padStrGenerator.js');
/**
* ParamGenerator: bibliothèque des générateurs de paramètre depuis le config global du simulateur et/ou le JDD
*
* @class ParamGenerator
* @constructor ParamGenerator()
*/
var ParamGenerator = function ParamGenerator(){
	//TODO :  A faire porter par le dictionnaire de Service GENESIS
    this.type = { 
    	DATE: "DATE", 
    	COUNTER: "COUNTER", 
    	TLV: "TLV", 
    	TPPART: "TPPART",
        RANDOM_ALPHANUM:"RANDOM_ALPHANUM",
        MSG_SIZE:"MSG_SIZE",
        PADSTR:"PADSTR"
    };

    this.generators=[];
    this.generators[this.type.DATE]=DateGenerator;
    this.generators[this.type.COUNTER]=CounterGenerator;
    this.generators[this.type.TLV]=TLVGenerator;
    this.generators[this.type.TPPART]=TPPARTGenerator;
    this.generators[this.type.RANDOM_ALPHANUM]=ANGenerator;
    this.generators[this.type.MSG_SIZE]=MsgSizeGenerator;
    this.generators[this.type.PADSTR]=PadStrGenerator;

    this.generate = function(param, runCtxt, callback){
    	if(this.generators[param.type]==undefined){
    		return callback(new Error("Le générateur de type "+param.type+" n'existe pas."));
    	}
    	this.generators[param.type].generate(param, runCtxt, (err,value)=>{
    		if(err){
    			runCtxt.debug("Erreur à la génération: "+err.message);
    			return callback(err);
    		}
    		runCtxt.debug('Param:'+param.name+' -Value:'+value);
    		return callback(null,value);
    	});
    }

    this.calculate = function(param,runCtxt,msg,callback){
        if(this.generators[param.type]==undefined){
            return callback(new Error("Le générateur de type "+param.type+" n'existe pas."));
        }
        this.generators[param.type].calculate(param, runCtxt,msg, (err,value)=>{
            if(err){
                runCtxt.debug("Erreur à la génération: "+err.message);
                return callback(err);
            }
            runCtxt.debug('Param:'+param.name+' -Value:'+value);
            return callback(null,value);
        });
    }
}

ParamGenerator.instance=null;

ParamGenerator.getInstance=function(){
   if(this.instance === null){
      this.instance = new ParamGenerator();
   }
   return this.instance;
}

module.exports = ParamGenerator.getInstance();