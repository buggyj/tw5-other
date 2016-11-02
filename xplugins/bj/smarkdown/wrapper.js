/*\
title: $:/plugins/tiddlywiki/smarkdown/wrapper.js
type: application/javascript
module-type: parser

Wraps up the markdown-js parser for use in TiddlyWiki5

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var SimpleMarkdown = require("$:/plugins/tiddlywiki/smarkdown/simple-markdown.js").SimpleMarkdown;

var CONFIG_DIALECT_TIDDLER = "$:/config/smarkdown/dialect",
	DEFAULT_DIALECT = "Gruber";

function transformNodes(nodes) {
	var results = [];
	for(var index=0; index<nodes.length; index++) {
		results.push(transformNode(nodes[index]));
	}
	return results;
}

function transformNode(node) {
	if($tw.utils.isArray(node)) {
		for (var n = 0; n < node.length; n++) {
		var p = 0,
			widget = {type: "element", tag: node[p++]};
		if(!$tw.utils.isArray(node[p]) && typeof(node[p]) === "object") {
			widget.attributes = {};
			$tw.utils.each(node[p++],function(value,name) {
				widget.attributes[name] = {type: "string", value: value};
			});
		}
		widget.children = transformNodes(node.slice(p++));
		// Massage images into the image widget
		if(widget.tag === "img") {
			widget.type = "image";
			if(widget.attributes.alt) {
				widget.attributes.tooltip = widget.attributes.alt;
				delete widget.attributes.alt;
			}
			if(widget.attributes.src) {
				widget.attributes.source = widget.attributes.src;
				delete widget.attributes.src;
			}
		}
		// Convert internal links to proper wikilinks
		if (widget.tag === "a" && widget.attributes.href.value[0] === "#") {
			widget.type = "link";
			widget.attributes.to = widget.attributes.href;
			if (widget.attributes.to.type === "string") {
				//Remove '#' before conversion to wikilink
				widget.attributes.to.value = widget.attributes.to.value.substr(1);
			}
			//Children is fine
			delete widget.tag;
			delete widget.attributes.href;
		}
		return widget;
	} 
	}else {
		return {type: "text", text: node};
	}
}

var MarkdownParser = function(type,text,options) {
		// Parse the text into inline runs or blocks
	var mdParse, markdownTree;
	//if(!options.parseAsInline) 
		mdParse = SimpleMarkdown.defaultBlockParse;
	//else
		//mdParse = SimpleMarkdown.defaultInlineParse;
	
	markdownTree = mdParse(text);
	var mdOutput = SimpleMarkdown.defaultMhtmlOutput;
		this.tree = mdOutput(markdownTree);
	//this.tree = [ {type: "text", text: JSON.stringify([this.tree,markdownTree], null, 4)}];
};

/*

[ 'html',
  [ 'p', 'something' ],
  [ 'h1',
    'heading and ',
    [ 'strong', 'other' ] ] ]

*/
/*pretty-print this with 4-space indentation:
console.log(JSON.stringify(syntaxTree, null, 4));
=> [
	{
		"content": [
			{
				"content": "Here is a paragraph and an ",
				"type": "text"
			},
			{
				"content": [
					{
						"content": "em tag",
						"type": "text"
					}
				],
				"type": "em"
			},
			{
				"content": ".",
				"type": "text"
			}
		],
		"type": "paragraph"
	}
]
*/
exports["text/x-smarkdown"] = MarkdownParser;

})();

