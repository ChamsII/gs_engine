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
var cuid = require('cuid');


function RunContext(req_id){
    this.ip;
    this.service;
    this.runId = req_id;
    this.operation;
    this.url_parts;
    this.api;
    this.basepath;
    this.parameters = new Object();

    this.debug= function (message) {
        logger.debug("%s - %s - %s : %s", this.ip, this.runId, this.basepath, message);
    }

    this.info = function (message) {
        logger.info("%s - %s - %s : %s", this.ip, this.runId, this.basepath, message);
    }

    this.error = function (message) {
        logger.error("%s - %s - %s : %s", this.ip, this.runId, this.basepath, message);
    }

    this.stat = function (message) {
        logger.error("%s - %s - %s : STAT %s", this.ip, this.runId, this.basepath, message);
    }

}




if (typeof module !== 'undefined' && module.exports)
    module.exports.RunContext = RunContext;
else
    this.RunContext = RunContext;

