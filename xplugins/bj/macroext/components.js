/*\
title: $:/bj/modules/widgets/components.js
type: application/javascript
module-type: widget

This widget implements components

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var Widget = require("$:/core/modules/widgets/widget.js").widget;

var VarsWidget = function(parseTreeNode,options) {
	// Call the constructor
	Widget.call(this);
	// Initialise	
	this.initialise(parseTreeNode,options);
};

/*
Inherit from the base widget class
*/
VarsWidget.prototype = Object.create(Widget.prototype);

/*
Render this widget into the DOM
*/
VarsWidget.prototype.render = function(parent,nextSibling) {
	this.parentDomNode = parent;
	this.computeAttributes();
	this.execute();
	this.renderChildren(parent,nextSibling);
};



VarsWidget.prototype.getvars = function(component) {
	var paramString, 
		tid= this.wiki.getTiddler(component),
		params = [];
	if (tid) paramString = tid.fields.parameters;
	if(paramString) {
		var reParam = /\s*([A-Za-z0-9\-_]+)(?:\s*:\s*(?:"""([\s\S]*?)"""|"([^"]*)"|'([^']*)'|\[\[([^\]]*)\]\]|([^"'\s]+)))?/mg,
			paramMatch = reParam.exec(paramString);
		while(paramMatch) {
			// Save the parameter details
			var paramInfo = {name: paramMatch[1]},
				defaultValue = paramMatch[2] || paramMatch[3] || paramMatch[4] || paramMatch[5] || paramMatch[6];
			if(defaultValue) {
				paramInfo["default"] = defaultValue;
			}
			params.push(paramInfo);
			// Look for the next parameter
			paramMatch = reParam.exec(paramString);
		}
	}
	return params;
}
/*
Compute the internal state of the widget
*/
VarsWidget.prototype.execute = function() {
	// Parse variables
	var self = this,templateTree = [];
	this.component = this.attributes["$component"] ;
	// retrive defaults for merge
	if (!this.component) return;
	var defaults = this.getvars(this.component);
	$tw.utils.each(defaults,function(vari) {
			self.setVariable(vari.name,self.attributes[vari.name]?self.attributes[vari.name]:vari["default"]);
	});
	templateTree = [{type: "transbase", attributes: {tiddler: {type: "string", value: this.component}},isBlock:true}];
	// Construct the child widgets
	this.makeChildWidgets(templateTree);
};

/*
Refresh the widget by ensuring our attributes are up to date
*/
VarsWidget.prototype.refresh = function(changedTiddlers) {
	var changedAttributes = this.computeAttributes();
	if(Object.keys(changedAttributes).length||changedTiddlers[this.component] ) {
		this.refreshSelf();
		return true;
	}
	return this.refreshChildren(changedTiddlers);
};

exports["component"] = VarsWidget;

})();
