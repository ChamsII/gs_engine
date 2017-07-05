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

function execute(args,options,input,ctx,callback){

    //si aucune Opération n'est renseignée on récupère toutes les Opérations de l'API
    if(args[CST.OBJ.OPERATION]==undefined){
        ctx[CST.OBJ.OPERATION]=ctx[CST.OBJ.API].operations;
    }else{
        ctx[CST.OBJ.OPERATION]=ctx[CST.OBJ.API].operations[args[CST.OBJ.OPERATION]];
    }
    
    return callback(null,args,options,input,ctx);
}

module.exports = execute