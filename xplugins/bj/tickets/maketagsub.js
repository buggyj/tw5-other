/*\
title: $:/bj/maketagsub.js
type: application/javascript
module-type: macro

Macro to return a formatted version of the current time

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

/*
Information about this macro
*/

exports.name = "maketagsub";

exports.params = [
	{name: "x"}
];

/*
Run the macro
*/
exports.run = function(x) {

if (x=="notag") 
	return '<<tickettimenew format:"DDth MMM YYYY" dateField:"modified" template:"$:/bj/postit/listview" subfilter:"[tagsub[clip]]-[!field:tags[clip]]">>';

return '<<tickettimenew format:"DDth MMM YYYY" dateField:"modified" template:"$:/bj/postit/listview" subfilter:"[tagsub[clip]]-[!tagsub['+x+']]">>';
}
})();
