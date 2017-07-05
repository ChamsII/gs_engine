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
var CST = require('../../constants.js');
var util = require('util');

//ajouter la validation de l'input 
function execute(args, options, input, ctx, callback) {
    if (ctx[CST.OBJ.OPERATION] == undefined) {
        return callback(new Error(util.format(CST.MSG_ERR.OPERATION_NOT_EXIST, args[CST.OBJ.OPERATION])));
    }
    logger.debug("Update Operation");
    //pas de changement de méthode
    if(args[CST.OBJ.OPERATION]==input.method){
        ctx[CST.OBJ.OPERATION]=input;
        ctx[CST.OBJ.SERVICE].apis[ctx[CST.OBJ.API].name].operations[ctx[CST.OBJ.OPERATION].method]=input;
    }else{
        ctx[CST.OBJ.OPERATION]=input;

        logger.debug("Ancienne opération "+args[CST.OBJ.OPERATION]+ "- nouvelle opération "+ctx[CST.OBJ.OPERATION].method);
        ctx[CST.OBJ.SERVICE].apis[ctx[CST.OBJ.API].name].operations[args[CST.OBJ.OPERATION]]=undefined;
        ctx[CST.OBJ.SERVICE].apis[ctx[CST.OBJ.API].name].operations[ctx[CST.OBJ.OPERATION].method]=input;
    }

    return callback(null, args, options, input, ctx)

}

module.exports = execute