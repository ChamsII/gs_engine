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

