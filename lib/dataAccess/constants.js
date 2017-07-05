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

const OBJ = {
    SERVICE: "service",
    API: "api",
    OPERATION: "operation",
    DATASET: "dataset",
    TEMPLATE: "template"
};


const CMD = {
    ADD: "add",
    DELETE: "delete",
    UPDATE: 'update',
    GET: "get",
    SAVE: "save",
    FIND:"find",
    STOP:"stop",
    START:"start"
};

var NEW_ARGS = function () {
    return {
        service: null,
        api: null,
        operation: null,
        dataset: null,
        template: null
    }
}

var NEW_OPTS = function () {
    return {
        pagination: {
            pageNum: 1,
            pageSize: 0
        },
        filter: null,
        admin:{
            command:null
        }
    }
}

var ACTIONS = [];
//SERVICE ACTIONS
ACTIONS[OBJ.SERVICE] = [];
ACTIONS[OBJ.SERVICE][CMD.GET] = [
    { object: OBJ.SERVICE, command: CMD.GET }
];

ACTIONS[OBJ.SERVICE][CMD.DELETE] = [
    { object: OBJ.SERVICE, command: CMD.GET },
    { object: OBJ.SERVICE, command: CMD.DELETE }
];

ACTIONS[OBJ.SERVICE][CMD.UPDATE] = [
    { object: OBJ.SERVICE, command: CMD.GET },
    { object: OBJ.SERVICE, command: CMD.UPDATE },
    { object: OBJ.SERVICE, command: CMD.SAVE }
];

ACTIONS[OBJ.SERVICE][CMD.ADD] = [
    { object: OBJ.SERVICE, command: CMD.GET },
    { object: OBJ.SERVICE, command: CMD.ADD },
    { object: OBJ.API, command: CMD.ADD },
    { object: OBJ.SERVICE, command: CMD.SAVE }
];

//API ACTIONS
ACTIONS[OBJ.API] = [];
ACTIONS[OBJ.API][CMD.UPDATE] = [
    { object: OBJ.SERVICE, command: CMD.GET },
    { object: OBJ.API, command: CMD.GET },
    { object: OBJ.API, command: CMD.UPDATE },
    { object: OBJ.SERVICE, command: CMD.SAVE }
];

ACTIONS[OBJ.API][CMD.ADD] = [
    { object: OBJ.SERVICE, command: CMD.GET },
    { object: OBJ.API, command: CMD.GET },
    { object: OBJ.API, command: CMD.ADD },
    { object: OBJ.SERVICE, command: CMD.SAVE }
];

ACTIONS[OBJ.API][CMD.GET] = [
    { object: OBJ.SERVICE, command: CMD.GET },
    { object: OBJ.API, command: CMD.GET }
];

ACTIONS[OBJ.API][CMD.DELETE] = [
    { object: OBJ.SERVICE, command: CMD.GET },
    { object: OBJ.API, command: CMD.GET },
    { object: OBJ.API, command: CMD.DELETE },
    { object: OBJ.SERVICE, command: CMD.SAVE }
];

//OPERATION ACTIONS
ACTIONS[OBJ.OPERATION] = [];
ACTIONS[OBJ.OPERATION][CMD.UPDATE] = [
    { object: OBJ.SERVICE, command: CMD.GET },
    { object: OBJ.API, command: CMD.GET },
    { object: OBJ.OPERATION, command: CMD.GET },
    { object: OBJ.OPERATION, command: CMD.UPDATE },
    { object: OBJ.SERVICE, command: CMD.SAVE }
];

ACTIONS[OBJ.OPERATION][CMD.ADD] = [
    { object: OBJ.SERVICE, command: CMD.GET },
    { object: OBJ.API, command: CMD.GET },
    { object: OBJ.OPERATION, command: CMD.GET },
    { object: OBJ.OPERATION, command: CMD.ADD },
    { object: OBJ.SERVICE, command: CMD.SAVE }
];

ACTIONS[OBJ.OPERATION][CMD.GET] = [
    { object: OBJ.SERVICE, command: CMD.GET },
    { object: OBJ.API, command: CMD.GET },
    { object: OBJ.OPERATION, command: CMD.GET }
];

ACTIONS[OBJ.OPERATION][CMD.DELETE] = [
    { object: OBJ.SERVICE, command: CMD.GET },
    { object: OBJ.API, command: CMD.GET },
    { object: OBJ.OPERATION, command: CMD.GET },
    { object: OBJ.OPERATION, command: CMD.DELETE },
    { object: OBJ.SERVICE, command: CMD.SAVE }
];

//DATASET ACTIONS
ACTIONS[OBJ.DATASET] = [];
ACTIONS[OBJ.DATASET][CMD.UPDATE] = [
    { object: OBJ.SERVICE, command: CMD.GET },
    { object: OBJ.API, command: CMD.GET },
    { object: OBJ.DATASET, command: CMD.GET },
    { object: OBJ.DATASET, command: CMD.UPDATE }
];

ACTIONS[OBJ.DATASET][CMD.ADD] = [
    { object: OBJ.SERVICE, command: CMD.GET },
    { object: OBJ.API, command: CMD.GET },
    { object: OBJ.DATASET, command: CMD.GET },
    { object: OBJ.DATASET, command: CMD.ADD }
];

ACTIONS[OBJ.DATASET][CMD.GET] = [
    { object: OBJ.DATASET, command: CMD.GET }
];

ACTIONS[OBJ.DATASET][CMD.FIND] = [
    { object: OBJ.DATASET, command: CMD.FIND }
];

ACTIONS[OBJ.DATASET][CMD.DELETE] = [
    { object: OBJ.SERVICE, command: CMD.GET },
    { object: OBJ.API, command: CMD.GET },
    { object: OBJ.DATASET, command: CMD.GET },
    { object: OBJ.DATASET, command: CMD.DELETE }
];

//TEMPLATE ACTIONS
ACTIONS[OBJ.TEMPLATE] = [];
ACTIONS[OBJ.TEMPLATE][CMD.UPDATE] = [
    { object: OBJ.SERVICE, command: CMD.GET },
    { object: OBJ.API, command: CMD.GET },
    { object: OBJ.TEMPLATE, command: CMD.GET },
    { object: OBJ.TEMPLATE, command: CMD.UPDATE }
];

ACTIONS[OBJ.TEMPLATE][CMD.ADD] = [
    { object: OBJ.SERVICE, command: CMD.GET },
    { object: OBJ.API, command: CMD.GET },
    { object: OBJ.TEMPLATE, command: CMD.GET },
    { object: OBJ.TEMPLATE, command: CMD.ADD }
];

ACTIONS[OBJ.TEMPLATE][CMD.GET] = [
    { object: OBJ.TEMPLATE, command: CMD.GET }
];

ACTIONS[OBJ.TEMPLATE][CMD.DELETE] = [
    { object: OBJ.SERVICE, command: CMD.GET },
    { object: OBJ.API, command: CMD.GET },
    { object: OBJ.TEMPLATE, command: CMD.GET },
    { object: OBJ.TEMPLATE, command: CMD.DELETE }
];


const MSG_ERR = {
    API_ALREADY_EXIST: "L'API '%s' existe déjà.",
    API_NOT_EXIST: "L'API '%s' n'existe pas.",
    API_DELETE: "Echec de la suppression de l'API '%s'.",
    API_ADD: "Echec de la création de l'API '%s'.",
    API_UPDATE: "Echec du renommage de l'API '%s'.",

    SERVICE_SAVE: "Echec de la sauvgarde du service '%s'.",
    SERVICE_ALREADY_EXIST: "Le service '%s' existe déjà.",
    SERVICE_NOT_EXIST: "Le service '%s' n'existe pas.",
    SERVICE_DELETE: "Echec de la suppression du service '%s'.",
    SERVICE_ADD: "Echec de la création du service '%s'.",
    SERVICE_UPDATE: "Echec du renommage du service '%s'.",

    OPERATION_ALREADY_EXIST: "L'OPERATION '%s' existe déjà.",
    OPERATION_NOT_EXIST: "L'OPERATION '%s' n'existe pas.",

    DATASET_READ: "Impossible de lire le Dataset '%s'.",
    DATASET_ALREADY_EXIST: "Le dataset '%s' existe déjà.",
    DATASET_ADD: "Echec de la création du dataset '%s'.",
    DATASET_NOT_EXIST: "Le Dataset '%s' n'existe pas.",
    DATASET_DELETE: "Echec de la suppression du dataset '%s'.",
    DATASET_UPDATE: "Echec de la mise à jour du dataset '%s'.",

    TEMPLATE_READ: "Impossible de lire le Template '%s'.",
    TEMPLATE_ALREADY_EXIST: "Le Template '%s' existe déjà.",
    TEMPLATE_ADD: "Echec de la création du Template '%s'.",
    TEMPLATE_NOT_EXIST: "Le Template '%s' n'existe pas.",
    TEMPLATE_DELETE: "Echec de la suppression du Template '%s'.",
    TEMPLATE_UPDATE: "Echec de la mise à jour du Template '%s'."
}


module.exports.OBJ = OBJ;
module.exports.CMD = CMD;
module.exports.NEW_ARGS = NEW_ARGS;
module.exports.NEW_OPTS = NEW_OPTS;
module.exports.ACTIONS = ACTIONS;
module.exports.MSG_ERR = MSG_ERR;
