/*\
title: $:/bj/modules/widgets/widget-extend.js
type: application/javascriptd
module-type: global

Extend the base widget to allow extended macro language

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var Widget = require("$:/core/modules/widgets/widget.js")["widget"];

Widget.prototype.bjWidget_evaluateMacroModule = Widget.prototype.evaluateMacroModule;
Widget.prototype.bjWidget_substituteVariableParameters = Widget.prototype.substituteVariableParameters;

Widget.prototype.substituteVariableParameters = function(text,formalParams,actualParams) {
	if(formalParams) {
		var	givenparams = actualParams,
			actualParams = [];
		//BJ
		for(var p=0; p<givenparams.length; p++) {
			 actualParams[p] = {name:givenparams[p].name, value:this.bjWidget_makevar(givenparams[p])} ;
		 }
		 return this.bjWidget_substituteVariableParameters(text,formalParams,actualParams);
	 }
	 return text;
}

Widget.prototype.evaluateMacroModule = function(name,actualParams,defaultValue) {
	var	givenparams = actualParams,
		actualParams = [];
	//BJ
	for(var p=0; p<givenparams.length; p++) {
		 actualParams[p] = {name:givenparams[p].name, value:this.bjWidget_makevar(givenparams[p])} ;
	 }
	 return this.bjWidget_evaluateMacroModule(name,actualParams,defaultValue);
}

Widget.prototype.bjWidget_makevar = function(x) {
	// allow indirection of variable - <varible-name>
	if (!x.value) return ""; //null str

	if (x.type=="var") {
		return this.getVariable( x.value,{defaultValue: x.value});
	}
	else if (x.type=="ind") {
		return 	this.wiki.getTextReference(x.value,"",this.getVariable("currentTiddler"));
	}
	else {
		return x.value;
	}
}

})();
