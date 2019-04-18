var fs = require("fs");


var csv = require("csv-query");
var DOMParser = require('xmldom').DOMParser;
var XMLSerializer = require('xmldom').XMLSerializer;

var async = require('async');

exports.getValueInCSVFile = function(csvFilePath, fileKey, valueKey, callBack){
   csv.createFromFile(csvFilePath).then(function (db) {
        var  jsonData = {};
        jsonData[fileKey] = valueKey;
        return db.findOne( jsonData );
    }).then(function (record) {
        return callBack(record)
    })
}

exports.readFile = function(fileName){
	var contenu;
    contenu = fs.readFileSync(fileName, "UTF-8");
	return contenu;
}


exports.setValueInXMLFile = function(contenuFile, fileKey, fileValue) {
    var doc = new DOMParser().parseFromString(contenuFile, 'application/xml');
    var media = doc.getElementsByTagName(fileKey);

    //SET NEW VALUE
    doc.getElementsByTagName(fileKey)[0].firstChild.data = fileValue;
    console.log(doc.getElementsByTagName(fileKey)[0].firstChild.data);

    //SERIALIZE TO STRING
    var xmlString = new XMLSerializer().serializeToString(doc);
    return xmlString;
}




exports.feedersProperties =  function(csvFilePath, fileKey, valueKey, contenuXML, baliseResponse, returnV) {

    function callBack(value){
        var contenu = setValueInXMLFile(contenuXML, baliseResponse, value.firstName);
       // console.log( "********************** X **********************" )
        console.log( contenu )
        return contenu
    }

   function setValueInXMLFile(contenuFile, fileKey, fileValue) {
        var doc = new DOMParser().parseFromString(contenuFile, 'application/xml');
        var media = doc.getElementsByTagName(fileKey);

        //SET NEW VALUE
        doc.getElementsByTagName(fileKey)[0].firstChild.data = fileValue;

        //SERIALIZE TO STRING
        var xmlString = new XMLSerializer().serializeToString(doc);
        return returnV(xmlString);
    }


    csv.createFromFile(csvFilePath).then(function (db) {
        var  jsonData = {};
        jsonData[fileKey] = valueKey;
        return db.findOne( jsonData );
    }).then(function (record) {
        return callBack(record)
    })

}



/******************************  ***************************** */
exports.readCSVFileToJson = function(csvFilePath, callBack){
   csv.createFromFile(csvFilePath).then(function (db) {
        return db;
    }).then(function (record) {
        return callBack(record)
    })
}


exports.setValueInFrame = function(contenuFile, fileKey, fileValue) {
    var doc = new DOMParser().parseFromString(contenuFile, 'application/xml');
    var media = doc.getElementsByTagName(fileKey);

    //SET NEW VALUE
    doc.getElementsByTagName(fileKey)[0].firstChild.data = fileValue;

    //SERIALIZE TO STRING
    var xmlString = new XMLSerializer().serializeToString(doc);
    return xmlString;
}



exports.setValueInJson = function(contenuFile, fileKey, fileValue) {

    var contenuF = JSON.parse(contenuFile);

    function iterate(obj) {
        for (var property in obj) {

            if (obj.hasOwnProperty(property)) {

                if( property == fileKey ) {
                    obj[property] = fileValue;
                    break;
                }else if (typeof obj[property] == "object") {
                    iterate(obj[property]);
                }

            }
        }
    }

    iterate(contenuF);

    var jsonString = JSON.stringify(contenuF);
    return jsonString;

}



//Chargement des fichiers en memoire
exports.readFeederPropertiesFiles = function(callBack){

    async.each(feederPropertiesFiles,(feed)=>{
        console.log( feed.name )
        
        csv.createFromFile( feed.path ).then(function (db) {
            return db;
        }).then(function (record) {
           // console.log("Result : " + feed.name + " - " + JSON.stringify(record) )
           feed.value = JSON.stringify(record)
           feederPropertiesFiles[feed.id - 1] = feed;
        })

    },function(err){
        if(err)
            console.log(err);
    });

}