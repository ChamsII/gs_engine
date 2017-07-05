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
var fs = require('fs-extra');
var util = require('util');

/**
 * Mise à jour du service
 *
 * Si une commande d'administration est passée en option, modification de l'état du service
 * Si un service est passé en input, miseà jour des données du service y compris le status
 *
 * @param {*} args
 * @param {*} options
 * @param {*} input
 * @param {*} ctx
 * @param {*} callback
 */
function execute(args,options,input,ctx,callback){
    if(ctx[CST.OBJ.SERVICE]==undefined){
        return callback(new Error(util.format(CST.MSG_ERR.SERVICE_NOT_EXIST,args[CST.OBJ.SERVICE])));
    }

    if(options.admin.command!=null){
        if(options.admin.command==CST.CMD.START){
            ctx[CST.OBJ.SERVICE].state="running";
            ctx[CST.OBJ.SERVICE].status=1;
        }else if(options.admin.command==CST.CMD.STOP){
            ctx[CST.OBJ.SERVICE].state="stopped";
            ctx[CST.OBJ.SERVICE].status=0;
        }
    }

    if(input==null){
         return callback(null,args,options,input,ctx);
    }

    ctx[CST.OBJ.SERVICE].basepath=input.basepath;
    ctx[CST.OBJ.SERVICE].state=input.state;
    ctx[CST.OBJ.SERVICE].status=input.status;

    //le nom du service ne change pas.
    if(input.basepath==args[CST.OBJ.SERVICE]){
         return callback(null,args,options,input,ctx);
    }

    //Renommage du service
    fs.move(`./${config.get('simusPath')}/${args[CST.OBJ.SERVICE]}`,`./${config.get('simusPath')}/${ctx[CST.OBJ.SERVICE].basepath}`, (err)=>{
        if(err){
            if (err.code === "EEXIST") {
                return callback(new Error(util.format(CST.MSG_ERR.SERVICE_ALREADY_EXIST, input.basepath)));
            }
            return callback(new Error(util.format(CST.MSG_ERR.SERVICE_UPDATE,args[CST.OBJ.SERVICE])));
        }

         return callback(null,args,options,input,ctx);
    });

}

module.exports = execute
