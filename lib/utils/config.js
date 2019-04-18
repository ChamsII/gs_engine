var convict = require('convict');
var fs = require('fs-extra');

var config = convict({
  simusPath: {
    doc: "Chemin d'accès aux services pour le mode 'file'",
    default:'Simus',
    format: String
  },
  mode:{
    default:'file',
    format:['file','mongodb'],
    doc:"Storage mode (file, mongodb)"
  },
  cacheActif:{
    default:false,
    format:Boolean,
    doc:"Activation du cache de l'accès aux données"
  },
  PORT:{
    doc:"Port d'écoute des services exposés",
    format:'port',
    default:9876
  },
  replica:{
    doc:"Nombre de process à lancer",
    format: Number,
    default:1
  },
  log:{
    filename:{
      doc:"Fichier de log",
      default:'logs/genesis.log',
      format:String
    },
    maxsize:{
      doc:"Taille maximum du fichier de log avant rotation",
      default:10000000,
      format:Number
    },
    maxfiles:{
      doc:"Nombre de fichier historique",
      default:10,
      format:Number
    },
    lvlConsole:{
      doc:"Niveau de log dans la console",
      default:'info',
      format:['error','debug','info']
    },
    lvlFile:{
      doc:"Niveau de log dans le fichier",
      default:'error',
      format:['error','debug','info']
    }
  },
  admin:{
    port:{
      doc:"Port pour l'administration de l'agent",
      default:9080,
      format:'port'
    }
  },
  master:{
    active:{
      doc:"Activation de la souscription à un master",
      format:Boolean,
      default:false
    },
    url:{
      doc:"Url de souscription au master",
      format:'url',
      default:"http://localhost:3001/agent/subscribe"
    },
    freq:{
      doc:"Fréquence de check du master en millisecondes",
      format:Number,
      default:10000
    }
  },
  connectors:{
    lib:{
      doc:"Chemin d'accès aux librairies de connecteurs",
      default:"../lib",
      format:String
    },
    MQ:{
      cmd:{
        doc:"Executable Java",
        format:String,
        default:"java"
      },
      bin:{
        doc:"Librairie du connecteur",
        default:"com.julian.genesis.mqconnect.MQConnector",
        format:String
      },
      loglvl:{
        doc:"Niveau de log du connecteur",
        default:"error",
        format:['error','debug','info']
      },
      logconf:{
        doc:"Fichier de configuration des logs du connecteur",
        format:String,
        default:"../lib/log4j2.xml"
      }
    }
  },
  about:{
    tag:{
      doc:"Tag d'identification de l'agent",
      format:String,
      default:"agent 1"
    }
  }
});

if(fs.pathExistsSync(__base + 'config.json')){
  config.loadFile([__base + 'config.json']);
  config.validate({allowed: 'strict'});
}

module.exports = config;