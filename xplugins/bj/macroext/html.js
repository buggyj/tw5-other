/*\
title: $:/bj/modules/parsers/wikiparser/rules/html2.js
type: application/javascript
module-type: wikirule

Wiki rule for HTML elements and widgets. For example:

\*/


(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var utils = require ("$:/bj/modules/utils/parseutils.js");
exports.name = "html2";
exports.types = {user: true};

exports.init = function(parser) {
	this.parser = parser;
};

exports.findNextMatch = function(startPos) {
	// Find the next tag
	this.nextTag = this.findNextTag(this.parser.source,startPos,{
		requireLineBreak: this.is.block
	});
	return this.nextTag ? this.nextTag.start : undefined;
};

/*
Parse the most recent match
*/
exports.parse = function() {
	// Retrieve the most recent match so that recursive calls don't overwrite it
	var tag = this.nextTag;
	this.nextTag = null;
	// Advance the parser position to past the tag
	this.parser.pos = tag.end;
	// Check for an immediately following double linebreak
	var hasLineBreak = !tag.isSelfClosing && !!utils.p.parseTokenRegExp(this.parser.source,this.parser.pos,/([^\S\n\r]*\r?\n(?:[^\S\n\r]*\r?\n|$))/g);
	// Set whether we're in block mode
	tag.isBlock = this.is.block || hasLineBreak;
	// Parse the body if we need to
	if(!tag.isSelfClosing && $tw.config.htmlVoidElements.indexOf(tag.tag) === -1) {
			var reEndString = "</" + $tw.utils.escapeRegExp(tag.tag) + ">",
				reEnd = new RegExp("(" + reEndString + ")","mg");
		if(hasLineBreak) {
			tag.children = this.parser.parseBlocks(reEndString);
		} else {
			tag.children = this.parser.parseInlineRun(reEnd);
		}
		reEnd.lastIndex = this.parser.pos;
		var endMatch = reEnd.exec(this.parser.source);
		if(endMatch && endMatch.index === this.parser.pos) {
			this.parser.pos = endMatch.index + endMatch[0].length;
		}
	}
	// Return the tag
	return [tag];
};

/*
Look for an HTML tag. Returns null if not found, otherwise returns {type: "element", name:, attributes: [], isSelfClosing:, start:, end:,}
*/
exports.parseTag = function(source,pos,options) {
	options = options || {};
	var token,
		node = {
			type: "element",
			start: pos,
			attributes: {}
		};
	// Define our regexps
	var reTagName = /([a-zA-Z0-9\-\$\@]+)/g;
	// Skip whitespace
	pos = utils.p.skipWhiteSpace(source,pos);
	// Look for a less than sign
	token = utils.p.parseTokenString(source,pos,"<");
	if(!token) {
		return null;
	}
	pos = token.end;
	// Get the tag name
	token = utils.p.parseTokenRegExp(source,pos,reTagName);
	if(!token) {
		return null;
	}
	node.tag = token.match[1];
	if(node.tag.charAt(0) === "$") {
		node.type = node.tag.substr(1);
	}
	else if(node.tag.charAt(0) === "@") {
		node.type = "component";
		//node.attributes["$component"] = "component";
		var attribute = $tw.utils.parseAttribute('$component="'+node.tag.substr(1)+'"',0);
		node.attributes[attribute.name] = attribute;
		node.tag = "$"+node.tag.substr(1);
	}
	pos = token.end;
	// Process attributes
	var attribute = utils.p.parseAttribute(source,pos);
	while(attribute) {
		node.attributes[attribute.name] = attribute;
		pos = attribute.end;
		// Get the next attribute
		attribute = utils.p.parseAttribute(source,pos);
	}
	// Skip whitespace
	pos = utils.p.skipWhiteSpace(source,pos);
	// Look for a closing slash
	token = utils.p.parseTokenString(source,pos,"/");
	if(token) {
		pos = token.end;
		node.isSelfClosing = true;
	}
	// Look for a greater than sign
	token = utils.p.parseTokenString(source,pos,">");
	if(!token) {
		return null;
	}
	pos = token.end;
	// Check for a required line break
	if(options.requireLineBreak) {
		token = utils.p.parseTokenRegExp(source,pos,/([^\S\n\r]*\r?\n(?:[^\S\n\r]*\r?\n|$))/g);
		if(!token) {
			return null;
		}
	}
	// Update the end position
	node.end = pos;
	return node;
};

exports.findNextTag = function(source,pos,options) {
	// A regexp for finding candidate HTML tags
	var reLookahead = /<([a-zA-Z\-\$\@]+)/g;
	// Find the next candidate
	reLookahead.lastIndex = pos;
	var match = reLookahead.exec(source);
	while(match) {
		// Try to parse the candidate as a tag
		var tag = this.parseTag(source,match.index,options);
		// Return success
		if(tag && this.isLegalTag(tag)) {
			return tag;
		}
		// Look for the next match
		reLookahead.lastIndex = match.index + 1;
		match = reLookahead.exec(source);
	}
	// Failed
	return null;
};

exports.isLegalTag = function(tag) {
	// Widgets are always OK
	if(tag.type !== "element") {
		return true;
	// If it's an HTML tag that starts with a dash then it's not legal
	} else if(tag.tag.charAt(0) === "-") {
		return false;
	} else {
		// Otherwise it's OK
		return true;
	}
};

})();
