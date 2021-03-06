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
var env = process.env;
var fs = require('fs');
var dataAccess = (env.MODE=='file')?require(__base + 'lib/dataAccess/fsAccess'):require(__base + 'lib/dataAccess/mongoAccess');

exports.execute = function (request, response, runCtxt, callback) {
	runCtxt.debug('STEP DISPATCH - Start');
    var start = new Date().getTime();
    var target = "default";
    // KEY
    var keys = runCtxt.operation.keys;
    var dispatchVal='';
    for (keyInd in keys) {
        keyVal = runCtxt.parameters[keys[keyInd]];
        if (keyVal != undefined) {
            if (dispatchVal.length > 0)
                dispatchVal = dispatchVal + '.';
            dispatchVal = dispatchVal + keyVal;
        }
    }
    target=dispatchVal;
    runCtxt.debug("dispatchVal:["+dispatchVal+"]");
	
    //REGEXP
    regExpkeys = runCtxt.operation.regExpKeys;
    for (regExpInd in regExpkeys) {
        var reg = new RegExp(regExpkeys[regExpInd].regle, "g");
	runCtxt.debug(reg);
        if (reg.test(dispatchVal)) {
	    runCtxt.debug(`match ${regExpkeys[regExpInd].regle}`);
            target = regExpkeys[regExpInd].target;
	    break;
        }
    }
    runCtxt.debug("target: "+target);






    //Start modif
    //DIRECT ACCESS
    if( runCtxt.parameters["template"] != undefined ) {
        runCtxt.debug("Template - target: "+target);
        target = runCtxt.parameters["template"];
    }
    //End modif

  



    
	//search for the JDD
    dataAccess.searchJDD(runCtxt,target,(err) => {
		if(err)
			callback(err);
		else{
            runCtxt.info('STEP DISPATCH - ' + runCtxt.jdd + ' - duration: '+ (new Date().getTime()-start)+' ms');
            return callback(null,request,response,runCtxt);
        }
		
	});

    return;
}
