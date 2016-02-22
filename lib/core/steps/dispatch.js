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
var fs = require('fs');

exports.execute = function (request, response, runCtxt, callback) {
	runCtxt.debug('STEP DISPATCH - Start');
    var target = "default";
    // KEY
    var keys = runCtxt.operation.keys;
    var dispatchVal='';
    for (keyInd in keys) {
        keyVal = runCtxt.parameters[keys[keyInd].name];
        if (keyVal != undefined) {
            if (dispatchVal.length > 0)
                dispatchVal = dispatchVal + '.';
            dispatchVal = dispatchVal + keyVal;
        }
    }
    target=dispatchVal;
    runCtxt.debug("dispatchVal:"+dispatchVal);
	
    //REGEXP
    regExpkeys = runCtxt.operation.regExpKeys;
    for (regExpInd in regExpkeys) {
        regExpVal = runCtxt.parameters[regExpkeys[regExpInd].regle];
        var reg = new RegExp(regExpVal, "g");
        if (dispatchVal.match(reg)) {
            target = regExpkeys[regExpInd].target;
        }
		break;
    }
     runCtxt.debug("target:"+target);
    
    
	// a remplacer par l'accès aux données
	var apiDir = "./"+runCtxt.service.directory + '/' + runCtxt.api.name;
	var ope = "/"+runCtxt.api.name + "-";
    fs.exists(apiDir + ope +  target + ".json", function (exists) {
        if (exists) {
            runCtxt.jdd = apiDir + ope + target + ".json";
            runCtxt.info('STEP DISPATCH - ' + runCtxt.jdd);
            callback(null,request,response, runCtxt);
        }
        else {
            runCtxt.jdd = apiDir + ope + ".json";
            runCtxt.info('STEP DISPATCH - ' + runCtxt.jdd);
            callback(null,request,response, runCtxt);
         }
        }

    );
    
    return;
}