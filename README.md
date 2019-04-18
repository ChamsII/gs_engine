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
git clone https://github.com/ChamsII/gs_engine.git
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

##FEEDERS

A : TransferProperies

1 : Depuis la requête

feederIDQUERY
feederIDXPATH
feederIDPATH
feederIDHEADER
feederIDJPATH
feederIDPOSITION
feederIDTLV


2 : Colone du fichier CSV depuis la requête 

isFeeder : true / false
feederName : le nom de la colone dans le fichier CSV

NB : 1 seul feeder par requête. Si plusieurs isFeeder=true, seul le dernier est pris en compte

```JSON
{
    "name": "lastName",
    "source": "JSON_PATH",
    "path": "$.lastName",
    "template": "",
    "isUnique": false,
    "isFeeder": true,
    "feederName": "lastName"
}
```

B : FeederProperties 

Le feederProperties comprend :

csvFile : le nom du fichier de données jdd.csv
type : Type template response JSON/XML
isRandom : Numéro de ligne dans le fichier JDD à lire. Par défaut égale à 0.
value : un tableau d'objet dont : 
	fileKey : La clé dans le fichier de donnée 
	baliseResponse : le champ à modifier dans le template response ( Exemple : firstName le cas JSON ou n2:firstName le cas XML)

```JSON
{
  "csvFile": "fichierTest.csv",
  "value": [
    {
      "fileKey": "lastName",
      "baliseResponse": "lastName"
    },
    {
      "fileKey": "firstName",
      "baliseResponse": "firstName"
    }
  ],
  "type": "JSON",
  "isRandom": 2
}
```
	
C : Le JDD

Le fichier de JDD est chargé au démarrage de l'usine.	
feederPropertiesFiles[] dans gs_agent.js

```JSON
{
  "id": 1, 
  "name" : "fichierTest.csv", 
  "path": "Feeders/fichierTest.csv", 
  "value": ""
}
```


************************* TEMPLATE ************************

Retourner un template en fonction de la requête.
Trois paramètres supplémentaire dans transferProperties :

isUnique : le paramètre dans la requête est unique. Par défault false
template : Le nom du template retourner (Exemple "template": "SearchClient"  qui correspond à default-SearchClient-Template.xml )
value : Si isUnique = false 

```JSON
{
  "name": "feederIDPATH",
  "source": "BODY_XPATH",
  "path": ".//feederID",
  "template": "SearchClient",
  "isUnique": true
}
```


## API Reference

## License
