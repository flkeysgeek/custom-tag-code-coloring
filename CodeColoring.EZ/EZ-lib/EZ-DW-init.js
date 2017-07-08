/*__________________________________________________________________________________________________

Stremlined setup for either DW enviorbnent (or DW simulator when DW page opened in browser)

The simulator was designed for debugging DW extension pages using standard browser and devtools.
Initially it was tightly coupled to Revize CMS application -- deccoupling starts here.

It has only been tested on google chrome -- its Not perfect simulation and not all API functions 
are available but there is fairly robust set including at least 90% of DWfile API.
Server models and live edit are supported but Adobe is adressing that area.

See additional details in EZsimulatorAPI.js -- fair easy to add missing API calls as needed.

Only a few EZ-lib functions are available, name those needed for CC 2017 color coding extension.
The simulator is not included in that extension -- just used for delelopment.
__________________________________________________________________________________________________*/
var e, EZ;
if (typeof(dw) === 'undefined') dw = {isNotdw: true};
if (!EZ && !dw.isNotdw)		
{									//dw.isNotdw is never true in DW env even before init code	
	EZ = dw.constructor.EZ;
	if (!EZ) EZ = dw.constructor.EZ = function EZlib() {};
}
else 
{
	if (EZ && typeof(EZ) != 'function')
	{
		EZ = null;
		alert('EZ not initialized properly: make EZ-DW-init.js first script.');
	}
	if (!EZ) EZ = function EZlib() {};
}
EZ.global = EZ.global || {};
EZ.isDW = !dw.isNotdw;

//__________________________________________________________________________________________________
EZ.setup = function(callback)
{
	if (EZ.isDW)
	{
		EZ.getFolders();
		if (callback) return callback();	//good to go if SW enviornment

	}
	else if (!EZ.simulator.domain)			//otherwise load DW simulator if not loaded 
		EZ.simulator.init(callback);		//...and available	
}
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
	 *	get useful folders: Configuration, InstallPath, www, cm
	}**/
	"use strict";
	
	if (EZ.isDW)								//appData path -- not Program Files...Configuration
	{
		EZ.configPath = dw.getConfigurationPath() + '/';
		//EZ.configPath = EZ.configPath.replace(/-dev\//, '');
		
		var len = dw.getConfigurationPath().length + 1;
		EZ.configPathname = document.URL.substr(0,len);

		EZ.configPrefix = document.URL.substr(len);
		EZ.configPrefix = EZ.configPrefix.replace(/[^\/]/g, '').replace(/\//g, '../');
		
		var dom = dw.getDocumentDOM(EZ.configPrefix + 'Extensions.txt');
		EZ.configPathAppData = dom.URL.replace(/(.*\/).*/, '$1');
		dw.releaseDocument(dom);
		EZ.installPath = EZ.configPath.replace(/(.*)\/Configuration/, '$1');
	}
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
	
	config: function(settings)		//TODO: not yet used -- call from simulator setup dialog
	{
		/**
		 *	Create or update .../EZsimulator.settings.js if simulator folder exists
		 */
		/*
		EZ.simulator.settings.created='Mon Jul 03 2017 20:03:49 GMT-0400 (Eastern Daylight Time)';
		EZ.simulator.settings.appName='Adobe Dreamweaver CC 2017';
		EZ.simulator.settings.registryKey='Dreamweaver CC 2017';
		EZ.simulator.settings.configPath='C:/Users/otis/AppData/Roaming/Adobe/Dreamweaver CC 2017/en_US/Configuration/';
		EZ.simulator.settings.installPath='C:/Users/otis/AppData/Roaming/Adobe/Dreamweaver CC 2017/en_US/Configuration/';
		EZ.simulator.technology='jsp';
		EZ.simulator.loadAPI();		
		*/		
		var settings = {
			registryKey: 'Dreamweaver CC 2017',
			configPath: EZ.configPath
		}
		EZ.simulator.saveSettings(settings, '');
	},
	/**
	 *	initialize simulator by attaching .../EZsimulator.settings.js to document head
	 */
	init: function(callback)
	{
		if (location.href.indexOf('file:') === 0)
			alert('dw.simulator only available via http://\n\nNOT ' + unescape(location.href));
		
		var results = location.href.match( RegExp("(.*/.*configuration/)","i") );
		if (!results) return;

		//setTimeout("EZ.addClass(document.body, 'dw-simulator')", 1000);
		EZ.simulator.domain = results[1];	
		EZ.simulator.pathname = results[1];
		EZ.simulator.callback = callback;

		var src = EZ.simulator.pathname + EZ.simulator.settingsFile;
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
			
		EZ.configPath = EZ.simulator.configPath;
		EZ.installPath = EZ.simulator.installPath;
		EZ.getFolders();
		
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
	 *	called by DWclass.init() to update url probably for DW logging
	 */
	saveSettings: function(settings,logNote)
	{
		if (true) return;
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

/*--------------------------------------------------------------------------------------------------
Dreamweaver LINT global references and defined variables not used here {
--------------------------------------------------------------------------------------------------*/
/*global 
	unescape,
	DW, DWfile, dw:true, f:true, g:true
*/
//. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .}
(function() {[	//global variables and functions defined but not used

unescape,

EZ, DWfile, dw, e, f, g ]});
