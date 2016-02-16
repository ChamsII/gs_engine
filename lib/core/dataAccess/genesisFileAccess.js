var fs = require('fs'),
    path = require('path'),
    async = require('async');
	
var env = process.env;



/**
 * find all files or subdirs (recursive) and pass to callback fn
 *
 * @param {string} dir directory in which to recurse files or subdirs
 * @param {string} type type of dir entry to recurse ('file', 'dir', or 'all', defaults to 'file')
 * @param {function(error, <Array.<string>)} callback fn to call when done
 * @example
 * dir.files(__dirname, function(err, files) {
 *      if (err) throw err;
 *      console.log('files:', files);
 *  });
 */
files = function files(dir, type, fullPath, recursive, callback, /* used internally */ ignoreType) {
    
    var pending,
        results = {
            files: [],
            dirs: []
        };
    var done = function () {
        if (ignoreType || type === 'all') {
            callback(null, results);
        } else {
            callback(null, results[type + 's']);
        }
    };
    
    var getStatHandler = function (statPath) {
        return function (err, stat) {
            if (err) return callback(err);
            if (stat && stat.isDirectory() && stat.mode !== 17115) {
                if (type !== 'file') {
                    if (fullPath === true)
                        results.dirs.push(statPath);
                    else
                        results.dirs.push(path.basename(statPath));
                }
                if (recursive === true) {
                    files(statPath, type, true, function (err, res) {
                        if (err) return callback(err);
                        if (type === 'all') {
                            results.files = results.files.concat(res.files);
                            results.dirs = results.dirs.concat(res.dirs);
                        } else if (type === 'file') {
                            results.files = results.files.concat(res.files);
                        } else {
                            results.dirs = results.dirs.concat(res.dirs);
                        }
                        if (!--pending) done();
                    }, true);
                }
                if (!--pending) done();
            } else {
                if (type !== 'dir') {
                    results.files.push(statPath);
                }
                // should be the last statement in statHandler
                if (!--pending) done();
            }
        };
    };
    
    if (typeof type !== 'string') {
        ignoreType = callback;
        callback = type;
        type = 'file';
    }
    
    if (fs.statSync(dir).mode !== 17115) {
        fs.readdir(dir, function (err, list) {
            if (err) return callback(err);
            pending = list.length;
            if (!pending) return done();
            for (var file, i = 0, l = list.length; i < l; i++) {
                file = path.join(dir, list[i]);
                fs.stat(file, getStatHandler(file));
            }
        });
    } else {
        return done();
    }
};



exports.getServicesList = function getServicesList(callback) {
    files(env.SIMUSPATH, 'dir', false, false, function (err, subdirs) {
        if (err) return callback(err);
        callback(null, subdirs);
    });
};

/**
  * Récupère le fichier de configuration d'un simulateur
  *
  * @method getConf
  * @return chemin du fichier de configuration
  */
 getConf = function (simulateur, cbConf) {
    fs.readdir(simulateur, function (err, files) {
        for (var i in files) {
            if (files[i] !== undefined) {
                if (path.extname(files[i]) == '.json') {
                    cbConf(null, simulateur + '/' + files[i]);
                    return;
                }
            }
        }
        var error = new Error("No configuration file in dir");
        cbConf(error, null);
    });
};

loadServices = function (services,item, cb) {
    logger.info(item);
    getConf(item, function (err, conf) {
        if (err) {
            logger.info("error getConf");
            cb();
        }
        else {
            fs.readFile(conf, function (err, data) {
                service = JSON.parse(data);
                if (service.basepath in services) {
                    logger.error('CONTEXT - doublon dans les basepath :' + service.basepath);
                    cb();
                } else {
                    service.directory = item;
                    services[service.basepath] = service;
                    logger.debug(services);
                    cb();
                }
            });
        }
    });
    //.bind({ services : services })
};

exports.getServicesConf = function getServicesConf( cbFunc) {
    var services = {};
    async.waterfall([
        function (callback) {
            files(env.SIMUSPATH, 'dir', true, false, function (err, subdirs) {
                if (err) return callback(err);
                callback(null, subdirs);
            });
        },
        function (subdirs, callback) {
            async.each(subdirs,
                loadServices.bind(null,services),
                function (err) {
                    logger.info("end each");
                    callback(err);
            });
        }
    ], function (err, result) {
        logger.debug('DATA - getServicesConf - ' + JSON.stringify(services));
        cbFunc(err, services);
    });
};





/**
 * find all subdirs (recursive) of a directory and pass them to callback fn
 *
 * @param {string} dir directory in which to find subdirs
 * @param {string} type type of dir entry to recurse ('file' or 'dir', defaults to 'file')
 * @param {function(error, <Array.<string>)} callback fn to call when done
 * @example
 * dir.subdirs(__dirname, function (err, paths) {
 *      if (err) throw err;
 *      console.log('files:', paths.files);
 *      console.log('subdirs:', paths.dirs);
 * });
 */
exports.subdirs = function subdirs(dir, fullPath, recursive, callback) {
    files(dir, 'dir', fullPath, recursive, function (err, subdirs) {
        if (err) return callback(err);
        callback(null, subdirs);
    });
};
