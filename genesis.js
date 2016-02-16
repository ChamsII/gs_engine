global.config = require('./config.json');

var cluster = require('cluster');
var restify = require('restify');
var async = require('async');
var winston = require('winston');

var dataAccess = require('./core/dataAccess/genesisDataAccess');
var serverContext = require('./core/genesisContext');
var steps = require('./core/genesisSteps');
var runContext = require('./core/runContext');


global.logger = new (winston.Logger)({
     transports: [
             new (winston.transports.Console)({ 'timestamp': 'true', level: config.log.lvlConsole }),
             new (winston.transports.File)({ filename: config.log.filename ,json:false, maxsize:config.log.maxsize,maxFiles:config.log.maxfiles,timestamp:true, level:config.log.lvlFile})
     ]
});

var numCPUs = 1;


serve = function (req, res, next) {
    
    var runCtxt = new runContext.RunContext(req.getId());

    runCtxt.debug('NEW REQUEST');
	
    runCtxt.stats={};
    runCtxt.stats.startTime=new Date().getTime();
	
    
    async.waterfall([
        function (callback) {
            steps.onRequestStep(req, genesisContext, runCtxt, function (err) {
                if (err) {
                    callback(err);
                    return;
                }
                callback(null,runCtxt,req);
            });
        }, 
        function (runCtxt,req,callback) {
            steps.onPostStep(req, runCtxt, function (err) {
                if (err) {
                    callback(err);
                    return;
                }
                callback(null,runCtxt,req);
            });
        },
        function (runCtxt,req,callback) {
            steps.paramStep(genesisContext, runCtxt, req.post, req.headers, function (err) {
                if (err) {
                    callback(err);
                    return;
                }
                callback(null,runCtxt);
            });
        },
        function (runCtxt,callback) {
            steps.dispatchStep(genesisContext, runCtxt, function (err) {
                if (err) {
                    callback(err);
                    return;
                }
                callback(null,runCtxt);
            });
        },
        function (runCtxt,callback) {
            steps.onResponseStep(res,genesisContext, runCtxt, function (err) {
                if (err) {
                    callback(err);
                    return;
                }
		runCtxt.stats.responseTime=new Date().getTime();
                callback(null,runCtxt);
            });
        }
    ], function (err, runCtxt) {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end(err.message);
        } 
	runCtxt.stat('TOTAL duration - '+ (runCtxt.stats.responseTime - runCtxt.stats.startTime) + ' ms');
        
	runCtxt=null;
	delete runCtxt;
		
        next();
		
    });

};

if (cluster.isMaster) {
   // Fork workers.
    for (var i = 0; i < numCPUs; i++) {
          cluster.fork();
    }

     cluster.on('exit', function(worker, code, signal) {
          console.log('worker ' + worker.process.pid + ' died');
     });
} else {
 var genesisContext=new serverContext.GenesisContext(config.simusPath, config.port);

 logger.info('INIT - initialisation des simulateurs');

 genesisContext.load();

 var server = restify.createServer();

 server.get('.*',serve.bind(this));
 server.post('.*', serve.bind(this));
 server.put('.*', serve.bind(this));
 server.del('.*', serve.bind(this));
 server.head('.*',serve.bind(this));

 server.on('connection', function (socket) {
     socket.setTimeout(10000);
 });

 server.listen(config.port);

 logger.info("Server started listening on port " + config.port);

}


