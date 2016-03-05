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
var util = require('util');

var Service = function(basepath,method,api,uri){
	this.basepath=basepath;
	this.state='running';
	this.apis=[];
	
	var operation=new Operation(method||"POST");
	var api=new Api(api || "default",uri || '/');
	api.operations.push(operation);
	this.apis.push(api);
} 

var Api = function(name,uri){
	this.name=name;
	this.uri=uri;
	this.operations=[];
} 

var Operation = function(method){
	this.method=method;
	this.transferProperties=[];
	this.parameters=[];
	this.keys=[];
	this.regExpKeys=[];
	this.responseType="text/xml;charset=UTF-8";
	this.delay="0";
} 

var TransferProperty = function(name,source){
	this.name=name;
	this.source=source;
} 

var TransferPropertyXPath = function(name,source,path){
	TransferPropertyXPath.super_.call(this,name, source);
	this.path=path;
} 
util.inherits(TransferPropertyXPath, TransferProperty);

var Parameter = function(name,type){
	this.name=name;
	this.type=type;
} 

var ParameterAlphaNum = function(name,type,len,charset){
	ParameterAlphaNum.super_.call(this,name,type);
	this.len=len;
	this.charset=charset;
} 
util.inherits(ParameterAlphaNum, Parameter);

var ParameterDate = function(name,type,format){
	ParameterDate.super_.call(this,name,type);
	this.format=format;
} 
util.inherits(ParameterDate, Parameter);

var ParameterTpPart = function(name,type,source,start,end){
	ParameterTpPart.super_.call(this,name,type);
	this.source=source;
	this.start=start;
	this.end=end;
} 
util.inherits(ParameterTpPart, Parameter);

module.exports.Service = Service;
module.exports.Api = Api;
module.exports.Operation = Operation;
module.exports.TransferProperty = TransferProperty;
module.exports.TransferPropertyXPath = TransferPropertyXPath;
module.exports.Parameter = Parameter;
module.exports.ParameterAlphaNum = ParameterAlphaNum;
module.exports.ParameterDate = ParameterDate;
module.exports.ParameterTpPart = ParameterTpPart;
