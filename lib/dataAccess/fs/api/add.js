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
var async = require('async');

function apiDir(service, api, callback) {
    fs.mkdir(`./${config.get('simusPath')}/${service}/${api}`, (err) => {
        if (err)
            return callback(new Error(util.format(CST.MSG_ERR.API_ADD, api)));

        return callback(null);
    });
}

//ajouter la validation de l'input
function execute(args, options, input, ctx, callback) {
    //INPUT VALIDATION
    if (ctx[CST.OBJ.API] != undefined) {
        return callback(new Error(util.format(CST.MSG_ERR.API_ALREADY_EXIST, args[CST.OBJ.API])));
    }
    //Si on traite un élément de plus haut niveau (SERVICE)
    if (args[CST.OBJ.API] == undefined) {
        async.each(Object.keys(ctx[CST.OBJ.SERVICE].apis), apiDir.bind(null,ctx[CST.OBJ.SERVICE].basepath),
        function (err) {
            if(err)
                return callback(err);
            ctx[CST.OBJ.API] = ctx[CST.OBJ.SERVICE].apis;
            return callback(null, args, options, input, ctx);
        });
    }else{
        //Sinon on traite l'ajout de l'API simple
        apiDir(args[CST.OBJ.SERVICE], args[CST.OBJ.API], (err) => {
            if (err)
                return callback(err);

            if (ctx[CST.OBJ.SERVICE].apis == undefined)
                ctx[CST.OBJ.SERVICE].apis = {};

            ctx[CST.OBJ.SERVICE].apis[args[CST.OBJ.API]] = input;
            ctx[CST.OBJ.API] = ctx[CST.OBJ.SERVICE].apis[args[CST.OBJ.API]];

            return callback(null, args, options, input, ctx);
        });
    }

}

module.exports = execute
