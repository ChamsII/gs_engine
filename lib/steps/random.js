

var fs = require("fs");

exports.readJDD = function(){
	var contenu;
    contenu = fs.readFileSync("ServicePlanJDD.csv", "UTF-8");
	return contenu;
}

exports.readRandom = function(contenu) {

    var lines = contenu.split(';');
    var line = '';
    do {
        line = lines[ (Math.floor(Math.random()* Math.floor(lines.length) ) ) ];
        //console.log(line, (Math.floor(Math.random()* Math.floor(lines.length) )), line.length )
    }while (line.length < 5)

    return line;
}

exports.replaceInFile = function(fileName, contenu) {

    fs.readFile(fileName, 'utf8', function (err,data) {
        if (err) {
            return console.log(err);
        }
        var result = data.replace('"subscriptions": []', '"subscriptions": [' + contenu + ']');

        fs.writeFile(fileName, result, 'utf8', function (err) {
            if (err) return console.log(err);
        });
    });


}
