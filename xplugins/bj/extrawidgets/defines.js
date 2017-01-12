/*\
title: $:/bj/modules/widgets/defines.js
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
 
/*
Compute the internal state of the widget
*/
VarsWidget.prototype.execute = function() {
	// Parse variables
	var self = this,templateTree = [],paramstr,params=[];
	this.name = this.attributes["$name"] ;
	this.text = this.attributes["$text"] ;
	this.params = this.attributes["$params"]||"";
	paramstr = this.params.split(",");
	$tw.utils.each(paramstr,function(val) {
		params.push({name:val});	
	});
	templateTree = [{
				type: "set",
				attributes: {name: {type: "string",value: this.name},value: {type: "string",value:this.text}},
                children: this.parseTreeNode.children,
                params: params
            }];
	// Construct the child widgets
	this.makeChildWidgets(templateTree);
};

/*
Refresh the widget by ensuring our attributes are up to date
*/
VarsWidget.prototype.refresh = function(changedTiddlers) {
	var changedAttributes = this.computeAttributes();
	if(Object.keys(changedAttributes).length) {
		this.refreshSelf();
		return true;
	}
	return this.refreshChildren(changedTiddlers);
};

exports["defines"] = VarsWidget;

})();
