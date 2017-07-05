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
var CST = require('../constants.js');
var async = require('async');


var fs_cmds=[];
fs_cmds[CST.OBJ.SERVICE]=[];
fs_cmds[CST.OBJ.SERVICE][CST.CMD.ADD]=require('./service/add.js');
fs_cmds[CST.OBJ.SERVICE][CST.CMD.DELETE]=require('./service/delete.js');
fs_cmds[CST.OBJ.SERVICE][CST.CMD.GET]=require('./service/get.js');
fs_cmds[CST.OBJ.SERVICE][CST.CMD.UPDATE]=require('./service/update.js');
fs_cmds[CST.OBJ.SERVICE][CST.CMD.SAVE]=require('./service/save.js');

fs_cmds[CST.OBJ.API]=[];
fs_cmds[CST.OBJ.API][CST.CMD.ADD]=require('./api/add.js');
fs_cmds[CST.OBJ.API][CST.CMD.DELETE]=require('./api/delete.js');
fs_cmds[CST.OBJ.API][CST.CMD.GET]=require('./api/get.js');
fs_cmds[CST.OBJ.API][CST.CMD.UPDATE]=require('./api/update.js');

fs_cmds[CST.OBJ.OPERATION]=[];
fs_cmds[CST.OBJ.OPERATION][CST.CMD.ADD]=require('./operation/add.js');
fs_cmds[CST.OBJ.OPERATION][CST.CMD.DELETE]=require('./operation/delete.js');
fs_cmds[CST.OBJ.OPERATION][CST.CMD.GET]=require('./operation/get.js');
fs_cmds[CST.OBJ.OPERATION][CST.CMD.UPDATE]=require('./operation/update.js');

fs_cmds[CST.OBJ.DATASET]=[];
fs_cmds[CST.OBJ.DATASET][CST.CMD.ADD]=require('./dataset/add.js');
fs_cmds[CST.OBJ.DATASET][CST.CMD.DELETE]=require('./dataset/delete.js');
fs_cmds[CST.OBJ.DATASET][CST.CMD.GET]=require('./dataset/get.js');
fs_cmds[CST.OBJ.DATASET][CST.CMD.UPDATE]=require('./dataset/update.js');
fs_cmds[CST.OBJ.DATASET][CST.CMD.FIND]=require('./dataset/find.js');

fs_cmds[CST.OBJ.TEMPLATE]=[];
fs_cmds[CST.OBJ.TEMPLATE][CST.CMD.ADD]=require('./template/add.js');
fs_cmds[CST.OBJ.TEMPLATE][CST.CMD.DELETE]=require('./template/delete.js');
fs_cmds[CST.OBJ.TEMPLATE][CST.CMD.GET]=require('./template/get.js');
fs_cmds[CST.OBJ.TEMPLATE][CST.CMD.UPDATE]=require('./template/update.js');



function execute(object, command, args, options, inputData, callback){

    var workflow = [];
    var actions = CST.ACTIONS[object][command];
    var ctx={};

    for(var id in actions){
        var ACT= actions[id];
        if(workflow.length==0)
            workflow.push(async.apply(fs_cmds[ACT.object][ACT.command],args,options,inputData,ctx));
        else
            workflow.push(fs_cmds[ACT.object][ACT.command]);
    }

    async.waterfall(workflow,function(err,args,options,inputData,ctx){
        if(err){
            return callback(err);
        }
        return callback(null,ctx[object]);
    });

}


module.exports = execute