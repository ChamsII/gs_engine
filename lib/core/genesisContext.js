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

var genesisDataAccess = require('./dataAccess/genesisDataAccess');
var fs = require('fs');
var async = require('async');
var path = require('path');



function GenesisContext(simuPath, port) {
    this.services = {};
    this.simuPath = simuPath;
    this.port = port;
    
    this.load = function (onLoad) {
	
		that = this;
		logger.info('CONTEXT - chargement...');
		 
		if(that.services.length>0){
			onLoad(null);
			logger.info('CONTEXT - chargement déjà effectué.');
			
		}
       
        genesisDataAccess.getServicesConf(function (err, data) {
			if(err)
				onLoad(err);
            that.services = data;
			logger.info('CONTEXT - chargement terminé.');
			onLoad(null);
        });
		
        //this.services = new Array();
        
        //async.waterfall([
        //    function (callback) {
        //        genesisFileAccess.subdirs(that.simuPath, true, false, function (err, subdirs) {
        //            logger.info('CONTEXT - ' + subdirs.length + ' simulateur(s)');
        //            callback(null, subdirs);
        //        });
        //    },
        //    function (subdirs, callback) {
        //        for (var i in subdirs) {
        //            that.getConf(subdirs[i], i, function (err, conf, nb) {
        //                if (err)
        //                    callback(err);
        //                else
        //                    callback(null, conf, subdirs[nb]);
        //            });
        //        }
        //    },
        //    function (conf, subdir, callback) {
        //        fs.readFile(conf, function (err, data) {
        //            service = JSON.parse(data);
        //            if (service.basepath in that.services) {
        //                logger.error('CONTEXT - doublon dans les basepath :' + service.basepath);
        //                callback(true);
        //            }
        //            service.directory = subdir;
        //            that.services[service.basepath] = service;
        //            logger.info('CONTEXT - initialisation terminé: ' + service.basepath);
        //      //console.log(Object.keys(that.services).length);
        //        });
        //    }
        //], function (err, callback) {

        //});
    }
    
    this.getService = function (basepath) {
        return this.services[basepath];
    }

    
    /**
  * Récupère le fichier de configuration d'un simulateur
  *
  * @method getConf
  * @return chemin du fichier de configuration
  */
//  this.getConf = function (simulateur, index, cbConf) {
//        fs.readdir(simulateur, function (err, files) {
//            for (var i in files) {
//                if (files[i] !== undefined) {
//                    if (path.extname(files[i]) == '.json') {
//                        cbConf(null, simulateur + '/' + files[i], index);
//                        return;
//                    }
//                }
//            }
//            var error = new Error("No configuration file in dir");
//            cbConf(error, index, null);
//        });
//    };


}



if (typeof module !== 'undefined' && module.exports)
    module.exports.GenesisContext = GenesisContext;
else
    this.GenesisContext = GenesisContext;
