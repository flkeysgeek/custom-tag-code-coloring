/*__________________________________________________________________________________________________

Stremlined setup for either DW enviorbnent (or DW simulator when DW page opened in browser)

The simulator was designed for debugging DW extension pages using standard browser and devtools.
Initially it was tightly coupled to Revize CMS application -- deccoupling starts here.

It has only been tested on google chrome -- its Not perfect simulation and not all API functions 
are available but there is fairly robust set including at least 90% of DWfile API.
Server models and live edit are supported but Adobe is adressing that area.

See additional details in EZsimulatorAPI.js -- fair easy to add missing API calls as needed.
__________________________________________________________________________________________________*/

if (typeof EZ === 'undefined')
{

	if (typeof dw === 'undefined' || dw.isNotdw)
	{								//dw.isNotdw is never true in DW env even before init code
		window.EZ = window.EZ || function EZ() {};

}
}

EZ.global = EZ.global || {};
if (typeof dw === 'undefined') dw = {isNotdw: true};

EZ.isDW = !dw.isNotdw			

//__________________________________________________________________________________________________
EZ.getOpt = function EZgetOpt(key, defaultValue) {
	/** {
	 *	Get value of option specifed by key -- option created and set to defaultValue if not found
	 *	and defaultValue is supplied and not undefined (defaultValue null or blank create option).
	 *
	 *	ARGUMENTS:
	 *		this	Object containing options -- default: EZ.globals if this == EZ
	 *
	 *		key		specifies option using dot notation e.g. "messages.argRequired"
	 *				if option not found using full dot notation
	 *
	 *		defaultValue (optional)
	 *				specifies value used to create option if not undefined
	 *
	 *	EXAMPLE:
	 *		EZ.getOpt('formatValue.MAXLINE', defaultValue)
	 *			first checks for EZ.global.formatValue.MAXLINE
	 *			then EZ.global.MAXLINE
	 *
	 *	RETURNS:
	 *		String containing value of option specified by key -OR- defaultValue if option not found
	}**/
	var baseObj = this == EZ ? EZ.global : this;

	var keys = EZ.isArray(key) ? key
			 : (key || '').trim().split('.').remove();

	if (!keys.length)
		return defaultValue;

	key = '';
	for (var i=0; i<keys.length; i++)
		key += '.' + keys.slice(i).join('.') + ' ';

	var value = key.clip().ov(baseObj);
	if (value == null && defaultValue != null)
		value = EZ.setOpt(keys.join('.'), defaultValue);

	return value;
}

//__________________________________________________________________________________________________
EZ.getFolders = function EZgetFolders() {
	/** {
	 *	Configuration folders and files
	}**/
	"use strict";
	EZ.config = EZ.isDW ? dw.getConfigurationPath() + '/' : '';
	
	if (EZ.isDW)								//appData path -- not Program Files...Configuration
	{
		var len = dw.getConfigurationPath().length+1;
		EZ.configPathname = document.URL.substr(0,len);

		EZ.configPrefix = document.URL.substr(len);
		EZ.configPrefix = EZ.configPrefix.replace(/[^\/]/g, '').replace(/\//g, '../');
		
		var dom = dw.getDocumentDOM(EZ.configPrefix + 'Extensions.txt');
		EZ.configPrograms = dom.URL.replace(/(.*\/).*/, '$1');
		dw.releaseDocument(dom);
	}
	
	EZ.installPath = EZ.config.replace(/(.*)\/Configuration/, '$1');
	EZ.wwwPath = EZ.installPath + 'www/';
	EZ.cmPath = EZ.installPath + 'www/thirdparty/CodeMirror/';
}
//__________________________________________________________________________________________________
EZ.addRemoveClass = function EZaddRemoveClass(sel, adds, deletes)	{
	/** {
	 *	update className of one or more elements by adding or deleting className(s) specified
	 *	by adds and deletes.
	 *	
	 *	ARGUMENTS:
	 *		sel		element, id, delimited String of ids -or- Array of elements / ids 
	 *		
	 *		adds	className, comma/space delimited String or Array of className(s) ADDED*
	 *		deletes	className, comma/space delimited String or Array of className(s) DELETED*
	 *	
	 *		* none added/deleted if null, undefined, empty String or Array
	 *__________________________________________________________________________________________________
	}**/
	if (arguments.length < 3 || deletes == null)
		deletes = true;
	
	var tags = (sel instanceof Element) ? [sel] 
			 : (sel instanceof Array) ? sel
			 : (sel instanceof Object && sel.length != null) ? sel
			 : (typeof(sel) == 'string') ? sel.split(/\s*[ ,]\s*/)
			 : [];
	
	var addList = (adds instanceof Array) ? adds 
				: (typeof(adds) == 'string') ? adds.split(/\s*[ ,]\s*/)
				: [];
	var deleteList = (deletes instanceof Array) ? deletes
				   : (typeof(deletes) == 'string') ? deletes.split(/[ ,]/)
				   : deletes !== false ? deleteList = []	//adds only
				   : false;									//delete only
	
	if (deleteList === false)		//deletes supplied via adds
	{
		deleteList = addList;
		addList = [];
	}
	
	for (var t=0; t<tags.length; t++)
	{
		var el = tags[t];
		el = (el instanceof Element) ? el
		   : (typeof(el) == 'string') ? document.getElementById(el)
		   : '';
		if (!el) continue;
		
		var i, idx, className,
			classList = (el.className) ? el.className.split(/\s+/) : [];

		for (i=0; i<deleteList.length; i++)
		{
			className = deleteList[i];
			if (!className) continue;
			
			while((idx = classList.indexOf(className)) != -1)
				classList.splice(idx, 1);
		}
		for (i=0; i<addList.length; i++)
		{
			className = addList[i];
			if (!className) continue;
			
			if (classList.indexOf(className) == -1)
				classList.push(className);
		}
		el.className = classList.join(' ');
	}
}
//_________________________________________________________________________________________________
EZ.addClass = function EZaddClass(sel, adds, isTrue) {			//add only wrapper
	isTrue = isTrue || arguments.length < 3;	
	return EZ.addRemoveClass(sel, adds, isTrue);
}
//_________________________________________________________________________________________________
EZ.removeClass = function EZremoveClass(sel, deletes, isTrue) {	//delete only wrapper
	isTrue = isTrue || arguments.length < 3;	
	return EZ.addRemoveClass(sel, deletes, !isTrue);
}

/*---------------------------------------------------------------------------------------
Lightweight script containing EZ dw simulator constants and code to load simulator api
if not loaded when html page loaded in browser instead of DW enviornment.

<script type="text/javascript" src="EZ-lib/simulator/EZsimulator.js"></script>
---------------------------------------------------------------------------------------------*/
EZ.simulator = {
	domain: '',
	folder: 'EZsimulator',
	ajaxPath: 'EZsimulator/EZsimulator.',
	apiFile: 'EZsimulator/EZsimulator.api.js',
	settingsFile: 'EZsimulator/EZsimulator.settings.js',
	settings: {},
	technology: 'jsp',
	version: '2017-07-03',
	
	config: function(settings)		//TODO: create config dialog
	{
		/**
		 *	Create or update .../EZsimulator.settings.js if simulator folder exists
		 */
		var settings = {
			registryKey: 'Dreamweaver CC 2017',
			configPath: EZ.config
		}
		EZ.simulator.saveSettings(settings, '');
	},
	/**
	 *	initialize simulator by attaching .../EZsimulator.settings.js to document head
	 */
	init: function()
	{
		if (location.href.indexOf('file:') === 0)
			alert('dw.simulator only available via http://\n\nNOT ' + unescape(location.href));
		
		var results = location.href.match( RegExp("(.*/.*configuration/)","i") );
		if (!results) return;

		//setTimeout("EZ.addClass(document.body, 'dw-simulator')", 1000);
		EZ.simulator.domain = results[1];	
		EZ.simulator.pathname = results[1];

		var src = EZ.simulator.pathname + EZ.simulator.apiFile;
		var fileref = document.createElement('script');
		fileref.setAttribute("type","text/javascript");
		fileref.setAttribute("src", src);
		document.getElementsByTagName("head")[0].appendChild(fileref);
	},
	
	/**
	 *	Save/process settings then load EZ simulator api script.
	 *	Called from last line of .../settings.js after it loads.
	 */
	loadAPI: function()
	{
		for (var key in this.settings)				//copy settings to top level
			this[key] = this.settings[key];
			
		if (EZ.simulatorAPI != 'loaded')
		{											//load EZsimulator.api.js
			var src = this.domain + this.apiFile;		
			var fileref = document.createElement('script');
			fileref.setAttribute("type","text/javascript");
			fileref.setAttribute("src", src);
			document.getElementsByTagName("head")[0].appendChild(fileref);
		}
		else if (EZ.simulatorAPI != 'initialized')
		{
			DW.init();
		}
	},
	/**
	 *	Create or update .../EZsimulator.settings.js 
	 */
	saveSettings: function(settings,logNote)
	{
		var json = '';
		for (var o in settings)
			json += 'EZ.simulator.settings.' + o + "='" + settings[o] + "';\n";
		json += "if (!window.dw || dw.isNotDW) EZ.simulator.loadAPI();";
	
		logNote = 'EZ.simulator.settings' + (logNote || 'update');
		if (dw.log)
			dw.log(logNote, this.settingsFile);
	
		var fileURL = settings.configPath + this.settingsFile;
		var status = DWfile.write(fileURL, json);
		return 'DWfile.write=' + status;
	}
};

(function()
{
	if (EZ.isDW)
	
	
	//----- Initailize and load EZ dreamweaver simulator if page opened in browser
	if (!EZ.simulator.domain || (!window.dw || dw.isNotDW))
		EZ.simulator.init();
	
	else 
		EZ.getFolders();
	
})();

/*--------------------------------------------------------------------------------------------------
Dreamweaver LINT global references and defined variables not used here {
--------------------------------------------------------------------------------------------------*/
var e;			//global used for try/catch
/*global 
unescape,
DW,
EZ, DWfile, dw:true, f:true, g:true
*/
//. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .}
(function() {[	//global variables and functions defined but not used

unescape,

EZ, DWfile, dw, e, f, g ]});
