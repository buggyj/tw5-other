/*\
title: $:/bj/modules/parsers/wikiparser/rules/macrocallblock.js
type: application/javascript
module-type: wikirule

Wiki rule for block macro calls

```
<<name value value2>>
```

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.name = "macrocallblockext";
exports.types = {user: true};

exports.init = function(parser) {
	this.parser = parser;
	// Regexp to match
	this.matchRegExp = /<<([^>\s]+)(?:\s*)((?:[^>]|(?:>(?!>)))*?>?)>>(?:\r?\n|$)/mg;
};

/*
Parse the most recent match
*/
exports.parse = function() {
	// Get all the details of the match
	var macroName = this.match[1],
		paramString = this.match[2];
	// Move past the macro call
	this.parser.pos = this.matchRegExp.lastIndex;
	var params = [],
		reParam = /\s*(?:([A-Za-z0-9\-_]+)\s*:)?(?:\s*(?:"""([\s\S]*?)"""|"([^"]*)"|'([^']*)'|\[\[([^\]]*)\]\]|<([^>]*)>|\{([^\}]*)\}|([^\s>}"':]+)))/g,
		paramMatch = reParam.exec(paramString);
	while(paramMatch) {
		// Process this parameter
		var paramInfo = {
			value: paramMatch[2] || paramMatch[3] || paramMatch[4] || paramMatch[5] || paramMatch[6] || paramMatch[7] || paramMatch[8]
		};
		if(paramMatch[1]) {
			paramInfo.name = paramMatch[1];
		}
		if (paramMatch[6]) {
			paramInfo.type = "var"; 
		} else if (paramMatch[7]) {
			paramInfo.type = "ind";
		}

		params.push(paramInfo);
		// Find the next match
		paramMatch = reParam.exec(paramString);
	}
	return [{
		type: "macrocall",
		name: macroName,
		params: params,
		isBlock: true
	}];
};

})();
