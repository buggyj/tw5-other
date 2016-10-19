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
////////////// have to completely change this function ////////////////////
Widget.prototype.computeAttributes = function(changed) {
	var changedAttributes = {},
		self = this,
		value;
	$tw.utils.each(this.parseTreeNode.attributes,function(attribute,name) {
		var testname;
		if(attribute.type === "indirect") {
			testname= (name.charAt(0) === "@")?name.substr(1):name;
			if (changed && changed[name] == testname) return;
			else value = self.wiki.getTextReference(attribute.textReference,"",self.getVariable("currentTiddler"));
		} else if(attribute.type === "macro") {
			value = self.getVariable(attribute.value.name,{params: attribute.value.params});
		} else { // String attribute
			value = attribute.value;
		}
		// Check whether the attribute has changed
		if (name.charAt(0) === "@") {
			 value = self.wiki.getTextReference(value,"",self.getVariable("currentTiddler"));
			 name = name.substr(1);
		 }
		if(self.attributes[name] !== value) {
			self.attributes[name] = value;
			changedAttributes[name] = true;
		}
	});
	return changedAttributes;
};
})();
