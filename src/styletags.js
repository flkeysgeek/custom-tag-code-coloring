(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

CodeMirror.defineMode("styletags", 
function (config, modeConfig) 
{
	var modeSpec = modeConfig.inner instanceof Object ? modeConfig.inner
			 	 : {name: modeConfig.inner || "xml"};
	modeSpec.styletagsAdded = true;

	var inner = CodeMirror.getMode(config, modeSpec);
	var copy = {}
	for (var prop in inner) copy[prop] = inner[prop]
	copy.innerMode = function (state) 
	{
		return {
			state: state,
			mode: inner
		}
	}
	copy.token = function (stream, state) 
	{
		var style = inner.token(stream, state)
		if (style == "tag")
			style += " tag-" + stream.current()
		return style
	}
	return copy
})
});

//__________________________________________________________________________________
/**
 *	use by setting your editor's mode option to:
 *
 *		{name: "styletags", inner: "xml"} 
 *						(or inner: "htmlmixed", etc), to wrap a given mode, 
 *
 *	 adding tag-[tagname] token types to each tag name.
 *__________________________________________________________________________________
**/
