## GeneSiS engine
GeneSiS-engine permet de créer des mocks de services. Il a été créé dans le cadre d'une utilisation dans une usine de tests de performance. Il permet de simuler un service avec les fonctionnalités suivantes:
- un format de réponse libre : JSON, XML, ...
- une réponse paramétrable en fonction d'éléments parsés dans la requête, génération de variables, gestion de JDD, multi templates de réponse
- temps de réponse paramétrables à chaud
- API REST d'administration
- API REST de paramétrage des API simulées, des JDD, des templates (création, suppression, modification)  

## Installation
```Shell
mkdir genesis
cd genesis
git clone https://github.com/Ju-Li-An/gs_engine
cd gs_engine
npm install
```

## Configuration
L'engine peut être configuré en déposant un fichier 'config.json' à la racine.

Le format est le suivant:

```JSON
{
    "simusPath": {
      "doc": "Chemin d'accès aux services pour le mode 'file'",
      "default": "../Simus",
      "format": "string"
    },
    "mode": {
      "default": "file",
      "format": [
        "file",
        "mongodb"
      ],
      "doc": "Storage mode (file, mongodb)"
    },
    "cacheActif": {
      "default": false,
      "format": "boolean",
      "doc": "Activation du cache de l'accès aux données"
    },
    "PORT": {
      "doc": "Port d'écoute des services exposés",
      "format": "port",
      "default": 9876
    },
    "replica": {
      "doc": "Nombre de process à lancer",
      "format": "number",
      "default": 1
    },
    "log": {
      "properties": {
        "filename": {
          "doc": "Fichier de log",
          "default": "../logs/genesis.log",
          "format": "string"
        },
        "maxsize": {
          "doc": "Taille maximum du fichier de log avant rotation",
          "default": 10000000,
          "format": "number"
        },
        "maxfiles": {
          "doc": "Nombre de fichier historique",
          "default": 10,
          "format": "number"
        },
        "lvlConsole": {
          "doc": "Niveau de log dans la console",
          "default": "info",
          "format": [
            "error",
            "debug",
            "info"
          ]
        },
        "lvlFile": {
          "doc": "Niveau de log dans le fichier",
          "default": "error",
          "format": [
            "error",
            "debug",
            "info"
          ]
        }
      }
    },
    "admin": {
      "properties": {
        "port": {
          "doc": "Port pour l'administration de l'agent",
          "default": 9080,
          "format": "port"
        }
      }
    },
    "master": {
      "properties": {
        "active": {
          "doc": "Activation de la souscription à un master",
          "format": "boolean",
          "default": false
        },
        "url": {
          "doc": "Url de souscription au master",
          "format": "url",
          "default": "http://localhost:3000/agent/subscribe"
        },
        "freq": {
          "doc": "Fréquence de check du master en millisecondes",
          "format": "number",
          "default": 10000
        }
      }
    },
    "connectors": {
      "properties": {
        "lib": {
          "doc": "Chemin d'accès aux librairies de connecteurs",
          "default": "../lib",
          "format": "string"
        },
        "MQ": {
          "properties": {
            "cmd": {
              "doc": "Executable Java",
              "format": "string",
              "default": "java"
            },
            "bin": {
              "doc": "Librairie du connecteur",
              "default": "com.julian.genesis.mqconnect.MQConnector",
              "format": "string"
            },
            "loglvl": {
              "doc": "Niveau de log du connecteur",
              "default": "error",
              "format": [
                "error",
                "debug",
                "info"
              ]
            },
            "logconf": {
              "doc": "Fichier de configuration des logs du connecteur",
              "format": "string",
              "default": "../lib/log4j2.xml"
            }
          }
        }
      }
    },
    "about": {
      "properties": {
        "tag": {
          "doc": "Tag d'identification de l'agent",
          "format": "string",
          "default": "agent 1"
        }
      }
    }
  }
```

## API Reference

## License
