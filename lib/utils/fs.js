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

var fs = require ('fs');
var path = require('path');

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
                     if (fullPath === true)
                        results.files.push(statPath);
                    else
                        results.files.push(path.basename(statPath));
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
module.exports.subdirs = function subdirs(dir, fullPath, recursive, callback) {
    files(dir, 'dir', fullPath, recursive, function (err, subdirs) {
        if (err) return callback(err);
        callback(null, subdirs);
    });
};

module.exports.getFiles= function getFiles(dir, fullPath, recursive, callback) {
    files(dir, 'file', fullPath, recursive, function (err, subdirs) {
        if (err) return callback(err);
        callback(null, subdirs);
    });
};