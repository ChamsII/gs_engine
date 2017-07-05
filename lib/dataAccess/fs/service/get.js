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
var fs = require('fs-extra');
var path = require('path');
var fsExt = require(__base + 'lib/utils/fs');
var CST = require('../../constants.js');

/**
 * Lit le fichier de configuration d'un service
 * 
 * @param {Path} simulateur IncomingMessage 
 * @return le contenu du fichier service JSON parsé en callback
 */
function getConf (simulateur, cbConf) {
    fs.readdir(simulateur, function (err, files) {
        for (var i in files) {
            if (files[i] !== undefined) {
                if (path.extname(files[i]) == '.json') {
                    return cbConf(null, simulateur + '/' + files[i]);
                }
            }
        }
        var error = new Error("No configuration file in dir");
        logger.error(error.message);
        return cbConf(error, null);
    });
}


/**
 * Retourne la liste des services qui match une regexo
 * 
 * @param {Regexp} searchFilter filtre de la recherche 
 * @return la liste des services correspondant au critère de recherche
 */
function getServices(searchFilter,callback) {
	fsExt.subdirs(config.simusPath, false, false, (err, subdirs) =>{
        if (err) 
            return callback(err);
				
		var tempArray;
		if(searchFilter != undefined  && searchFilter != null  && searchFilter != "null" && searchFilter != ""){
			tempArray = subdirs.filter(function(subdir){return subdir.search(searchFilter) != -1 ;}).sort();
		}else{
			tempArray = subdirs.sort();
		}
		
        return callback(null, tempArray);
    });
};

/**
 * Pagination de la liste des services qui match une regexo
 * 
 * @param {Option} options les options de la recherche et de pagination
 * @return la liste des services correspondant au critère de recherche paginée
 */
function getServicesList(options,callback) {

    var pageNum = options.pagination.pageNum;
    var pageSize = options.pagination.pageSize;
    var searchFilter = options.filter;

	getServices(searchFilter,(err,tempArray)=>{
		 if (err) return callback(err);

		 var services = [];
        //taille infinie
		if(pageSize==0){
            for(var i=0;i<tempArray.length;i++){
                services.push({key:i,value:tempArray[i]});
            }
        }else{//pagination active
            for(var i=(pageNum-1)*pageSize;i < pageNum*pageSize && i < tempArray.length ;i++){
                //datasets.push({key:tempArray[i].substring(0,tempArray[i].lastIndexOf('.')),value:tempArray[i].substring(tempArray[i].indexOf('-')+1,tempArray[i].lastIndexOf('.'))});
                services.push({key:i,value:tempArray[i]});
            }
        }
				
        return callback(null, {page:services, pageNum:pageNum, pageSize:pageSize, totalSize:tempArray.length});
	});

};

/**
 * 
 * @param {*} args 
 * @param {*} options 
 * @param {*} input 
 * @param {*} ctx 
 * @param {*} callback 
 */
function execute(args,options,input,ctx,callback){

    //Si aucun nom de service n'est spécifié on retourne la liste des services
    if(args[CST.OBJ.SERVICE]==undefined){
        getServicesList(options,(err,data)=>{
            if(err)
                return callback(err);
            else{
                ctx[CST.OBJ.SERVICE]=data;
                return callback(null,args,options,input,ctx);
            }
        });
    }else{ //Si le nom du service est spécifié, on retourne le service
        getConf(`${config.simusPath}/${args[CST.OBJ.SERVICE]}`, (err, conf) => {
            if (err) {
                //logger.info("error getConf");
                return callback(null,args,options,input,ctx);
            }
            fs.readFile(conf, (err, data) => {
                var service = JSON.parse(data);
                /*var valid = validate(service);
                logger.info("Validation du service ["+service.basepath+"]");
                if (!valid) console.log(validate.errors);*/
                //logger.debug(service);
                ctx[CST.OBJ.SERVICE]=service;
                return callback(null,args,options,input,ctx);
            });
        });
    }

   
}


module.exports = execute