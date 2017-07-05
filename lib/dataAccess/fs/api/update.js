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

function execute(args, options, input, ctx, callback) {
    if (ctx[CST.OBJ.API] == undefined) {
        return callback(new Error(util.format(CST.MSG_ERR.API_NOT_EXIST, args[CST.OBJ.API])));
    }

    ctx[CST.OBJ.API].name = input.name;
    //TODO vérifier que l'URI est libre sur le service
    ctx[CST.OBJ.API].uri = input.uri;

    //Le nom de l'API n'a pas changé on sort
    if (input.name == args[CST.OBJ.API]) {
        return callback(null, args, options, input, ctx);
    }

    ctx[CST.OBJ.SERVICE].apis[args[CST.OBJ.API]]=undefined;
    ctx[CST.OBJ.SERVICE].apis[ctx[CST.OBJ.API].name]=input;

    //Renommage de l'API
    fs.move(`./${config.get('simusPath')}/${args[CST.OBJ.SERVICE]}/${args[CST.OBJ.API]}`, `./${config.get('simusPath')}/${args[CST.OBJ.SERVICE]}/${ctx[CST.OBJ.API].name}`, (err) => {
        if (err) {
            if (err.code === "EEXIST") {
                return callback(new Error(util.format(CST.MSG_ERR.API_ALREADY_EXIST, input.name)));
            }
            return callback(new Error(util.format(CST.MSG_ERR.API_UPDATE, args[CST.OBJ.API])));
        }
        return callback(null, args, options, input, ctx);
    });

}

module.exports = execute
