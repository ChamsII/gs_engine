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
var fs = require('fs');
var util = require('util');

function execute(args,options,input,ctx,callback){
    if(ctx[CST.OBJ.DATASET]==undefined){
        return callback(new Error(util.format(CST.MSG_ERR.DATASET_NOT_EXIST,args[CST.OBJ.DATASET])));
    }
    var jdd=`./${config.get('simusPath')}/${args[CST.OBJ.SERVICE]}/${args[CST.OBJ.API]}/${args[CST.OBJ.DATASET]}.json`;

    fs.unlink(jdd, (err)=>{
        if(err)
            return callback(new Error(util.format(CST.MSG_ERR.DATASET_DELETE,args[CST.OBJ.DATASET])));
        else{
            return callback(null,args,options,input,ctx);
        }
    });
}

module.exports = execute
