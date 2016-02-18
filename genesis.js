var restify = require('restify');
var async = require('async');
var winston = require('winston');
var throng = require('throng');

var dataAccess = require('./lib/core/dataAccess/genesisDataAccess');
var serverContext = require('./lib/core/genesisContext');
var steps = require('./lib/core/genesisSteps');
var runContext = require('./lib/core/runContext');

var env = process.env;
var WORKERS = process.env.WEB_CONCURRENCY || 1;
var genesisContext=new serverContext.GenesisContext(env.SIMUSPATH, env.PORT);

global.logger = new (winston.Logger)({
     transports: [
             new (winston.transports.Console)({ 'timestamp': 'true', level: env.LOG_LVLCONSOLE }),
             new (winston.transports.File)({ filename: env.LOG_FILENAME ,json:false, maxsize:env.LOG_MAXSIZE,maxFiles:env.LOG_MAXFILES,timestamp:true, level:env.LOG_LVLFILE})
     ]
});




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

throng(start, {
  workers: WORKERS,
  lifetime: Infinity
});


function start(id) {
	
	logger.info('INIT - Started worker '+ id);
	
	logger.info('INIT - initialisation des simulateurs');
	
	var server = restify.createServer();
    
	server.get('.*',serve.bind(this));
	server.post('.*', serve.bind(this));
	server.put('.*', serve.bind(this));
	server.del('.*', serve.bind(this));
	server.head('.*',serve.bind(this));

	server.on('connection', function (socket) {
		socket.setTimeout(10000);
	});
	
	
	genesisContext.load(function(err){
		if(err){
			logger.error(err);
			process.exit(1);
		}
		server.listen(env.PORT);
		logger.info("Server started listening on port " + env.PORT);
	});

	

}

