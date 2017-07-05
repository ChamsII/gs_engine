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
var path = require('path');

function getDataSets(args, options, callback) {

    var basepath = args[CST.OBJ.SERVICE];
    var api = args[CST.OBJ.API];
    var pageNum = options.pagination.pageNum;
    var pageSize = options.pagination.pageSize;
    var searchFilter = options.filter;

    var jddDir = `./${config.get('simusPath')}/${basepath}/${api}`;

    fs.readdir(jddDir, function (err, files) {
        var tempArray = files.filter(function (file) {
            if (searchFilter != undefined && searchFilter != "null" && searchFilter != "") {
                return path.extname(file) == '.json' && file.search(searchFilter) != -1;
            }
            return path.extname(file) == '.json';
        }).sort();
        var datasets = [];

        for (var i = (pageNum - 1) * pageSize; i < pageNum * pageSize && i < tempArray.length; i++) {
            datasets.push(tempArray[i].substring(0, tempArray[i].lastIndexOf('.')));
        }

        callback(null, { page: datasets, pageNum: pageNum, pageSize: pageSize, totalSize: tempArray.length });

    });

};

function execute(args, options, input, ctx, callback) {

    //si aucun Dataset n'est renseigné on récupère tous les Dataset de l'API
    if (args[CST.OBJ.DATASET] == undefined) {
        getDataSets(args, options, (err, data) => {
            if (err)
                return callback(err);

            ctx[CST.OBJ.DATASET] = data;
            return callback(null, args, options, input, ctx);
        })

    } else {
        var jdd = `./${config.get('simusPath')}/${args[CST.OBJ.SERVICE]}/${args[CST.OBJ.API]}/${args[CST.OBJ.DATASET]}.json`;

        fs.open(jdd, 'r', (err, fd) => {
            if (err){
                var error=new Error(util.format(CST.MSG_ERR.DATASET_READ, args[CST.OBJ.DATASET]));
                logger.error(error.message);
                return callback(null, args, options, input, ctx);
            } else {
                fs.readFile( fd, { encoding: 'utf-8' }, (err, data) => {
                    fs.close(fd);
                    ctx[CST.OBJ.DATASET] = JSON.parse(data);
                    return callback(null, args, options, input, ctx);
                });
            }
        });
    }


}

module.exports = execute
