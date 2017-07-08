var e;
/*global 
	EZ:true, DWfile:true,
	DW:true, site:true, DWajax:true, MM:true,

	EZsetup, EZdisplayCaller, EZformatdate,
	EZtoInt, EZstripFileSlash, EZgetFunctionList,
	EZgetRandomInt, EZstripConfigPath,
	EZnote,

	ActiveXObject, escape, fso, Enumerator,
	g:true, dw:true
*/
(function jshint_noref() {[	//global variables and functions defined but not referenced
	EZsetup, 
	e, g, dw, DWfile]
});
/*---------------------------------------------------------------------------------------
Simulate DW api (by no means perfect or complete).  Pseudo dw api functions ONLY added
as needed for testing outside the DW environment via browser.

Does not need to be included via <script...> tag -- .../startup/EZsimulator.settings.js
loads when any page opened in browser rather than DW enviornment.

As of 06-2015, targeted for Chrome debugger (intially targeted for hta but no effort)

Associated jsp files required for some functions (e,g. DWfile, Preferences)
---------------------------------------------------------------------------------------------*/
/*******************************/
/*BOOKMARK -----dw constructor*/
/*****************************/
function DWclass()
{
	//----- runs after this file loaded -- may be before body onload
	this.init = function init()
	{
		try
		{				
			var body = document.getElementsByTagName('body')[0];
			//body.setAttribute('class', 'simulatorBody');
			EZ.addClass(body, 'simulatorBody');
			
			// add message div at top of page if no element with id=message
			var msgEl = document.getElementById('messages');
			if (!msgEl)
			{
				msgEl = document.createElement('div');
				msgEl.setAttribute('id', 'messages');
				msgEl.className = 'textBox';
				body.insertBefore(msgEl, body.childNodes[0]);
			}
			if (!location.host) return;				//not running as http
								
			//----------------------------------------------------------------------------
			// add DW objects and methods to dw object
			//----------------------------------------------------------------------------
			for (var o in this)						
				if (o != 'init') dw[o] = this[o];
			
			EZ.getFolders();						//already done if EZ-DW-init.js but no harm
			
			// Init all known "EZ preferences" group preferences into memory to avoid server
			// request for every pref -- and prevent infinate loop when used by ajax object
			if (!EZ.prefGroup)
			{
				EZ.prefGroup = '';
				EZ.pref = (EZ.pref || {});
			}
			else DWajax.loadPref();

			//save MRU domain to settings file if changed (for dw enviornment ??)
			if (EZ.simulator.settings.domain != EZ.simulator.domain)	
			{
				EZ.simulator.settings.domain = EZ.simulator.domain;
				EZ.simulator.settings.updated = new Date()+'';
				EZ.simulator.saveSettings(EZ.simulator.settings, 'update domain');
			}
			
			///if (EZsetup.group) EZsetup(EZsetup.group);
			
			EZ.simulatorAPI = 'initialized';
			if (EZ.simulator.callback) EZ.simulator.callback();
		}
		catch (e)
		{
			debugger;
			this.techSupport(e, 'EZdw.simulator.js::init()');
			//dw.displayMessage('EZdw.simulator.js::init() ' + e.message);
			//dw.displayStacktrace(EZstripConfigPath(EZstripConfigPath(e.stack)));
		}
	}
	
	/**
	 *	display exception message
	 */
	this.techSupport = function displayMessage(e,msg)
	{
		msg = msg || '';
		if (typeof(e) == 'object')
		{
			this.displayMessage(msg + '\n' + e.message);
			this.displayStacktrace(msg + '\n' + e.stack);
		}
		else if (/(JAVASCRIPT exception|CALLED FROM)/.test(e+''))
		{
			this.displayMessage(msg);
			this.displayStacktrace(msg.trim() + '\n' + e.trim());
		}
		else
		{
			msg += e;
			this.displayMessage(msg);
			this.displayStacktrace(EZdisplayCaller(msg));
		}
	}
	
	/**
	 *	display simulator info or error messages
	 */
	this.displayMessage = function displayMessage(msg)
	{
		if (!msg) return;
		var time = EZ.formatdate ? EZ.formatdate('','time') : '';
		msg = time + ' ' + msg.replace(/</g, '&lt;')
		
		var el = document.getElementById('messages');
		if (el) el.innerHTML = msg + '\n' + el.innerHTML;
		return msg;
	}
	/**	internal function
	 *	Format and display stacktrace
	 *	Add stacktrace container if not defined and msg not blank
	 */
	this.displayStacktrace = function displayStacktrace(msg)
	{
		if (!msg || !msg.formatStack) 
			return;
		msg = msg.formatStack(msg || '').join('\n');
		
		var el = document.getElementById('stacktrace');
		if (!el && msg)
		{
			el = document.createElement('div');
			el.setAttribute('id', 'stacktrace');
			el.setAttribute('class', 'floatClear textBox');
			
			var tags = document.getElementsByTagName('body');
			if (tags.length)	//may be called before dom fully loaded
				tags[0].appendChild(el);
		}
		msg = msg.replace(/</g, '&lt;');
		msg = msg.replace(/@.../g, '<span class="note">').replace(/...@/g, '</span>');
		el.innerHTML = (EZformatdate ? EZformatdate('','time') + ' ' : '')
					 + msg  
		//			 + '\n' + '_'.dup(120) + '\n' 
					 + (el.innerHTML.trim() ? '<hr>' + el.innerHTML : '');
		//			 + msg  + '\n' + '_'.dup(120) + '\n' + el.innerHTML;
		if (EZ.show) EZ.show(el);
		return msg;
	}
	//----------------------------------------------------------------
	// dw.preference... functions -- uses DWpref server api plugin
	//----------------------------------------------------------------
	this.getPreferenceString = function getPreferenceString(group, name, defaultValue) 
	{
		defaultValue = defaultValue || '';
		
		if (group.toLowerCase() == EZ.prefGroup.toLowerCase() && EZ.pref.cache[name] !== null)
			return EZ.pref.cache[name];				//return value from cache
		
		var value = DWajax.httpGetPref('DWpref', {pref_fn:'get', pref_mode:'string', 
												  pref_group:group, pref_key:name, pref_defaultValue:defaultValue})
		
		if (group == EZ.prefGroup && value != null)
			return EZ.pref.cache[name] = value;		//update cache and return value;
		
		return value == null ? '' : value;			//return value or blank if invalid
	}
	this.getPreferenceInt = function getPreferenceInt(group, name, defaultValue) 
	{
		defaultValue = defaultValue || 0;
		var value = DWajax.httpGetPref('DWpref', {pref_fn:'get', pref_mode:'int', pref_group:group, pref_key:name, pref_defaultValue:defaultValue})
		return EZtoInt(value);						//return int value -- 0 if invalid
	}
	this.setPreferenceString = function setPreferenceString(group, name, value) 
	{
		var status = DWajax.httpGetPref('DWpref', {pref_fn:'set', pref_mode:'string', pref_group:group, pref_key:name, pref_value:value})
		if (status != null && group == EZ.prefGroup)
			EZ.pref.cache[name] = value;			//update cache if EZ preference group
		return status != null;						//return true if no error
	}
	this.setPreferenceInt = function setPreferenceInt(group, name, value)	
	{
		var status = DWajax.httpGetPref('DWpref', {pref_fn:'set', pref_mode:'int', pref_group:group, pref_key:name, pref_value:value})
		return status != null;						//return true if no error
	}
	//----------------------------------------------------------------
	/**	simulator only
	 *	Set url used on dw.getDocumentDOM() if no url specified
	 */
	//----------------------------------------------------------------
	this.setDocumentUrl = function setDocumentUrl(url)
	{
		this.documentUrl = url;
	}
	this.getDocumentUrl = function getDocumentUrl()
	{
		return this.documentUrl || '';
	}
	//----------------------------------------------------------------
	// dw.dom.* functions
	//----------------------------------------------------------------
	//TODO: food for thought
	//https://developer.mozilla.org/en-US/docs/How_to_create_a_DOM_tree
	//this.doc = document.implementation.createDocument("", "", null);
	//----------------------------------------------------------------
	this.dom =					//dom functions
	{
		URL: '',
		documentElement:
		{
			outerHTML: ''
		},
		synchronizeDocument: function synchronizeDocument() {},		//nothing needs doing
		isDesignViewUpdated: function isDesignViewUpdated() {return this.inSync = !this.inSync},	//toggle
		
		source:					//dom.source functions
		{
			codeNavItem: null,
			codeNavList: [],
			getCodeNavList: function getCodeNavList()
			{
				var codeNavList = [];
				var selectedItem = -1;
				var url = dw.getDocumentUrl() || document.URL;
				url = EZstripFileSlash(url);
				url = url.replace(new RegExp(EZ.simulator.domain), EZ.simulator.configPath);
				
				var currentDocUrl = document.URL;
				currentDocUrl = EZstripFileSlash(currentDocUrl);
				currentDocUrl = currentDocUrl.replace(new RegExp(EZ.simulator.domain), EZ.simulator.configPath);
				
				if (url == currentDocUrl) url = 'document';
				
				var functionList = EZgetFunctionList(url);
				if (functionList.length === 0)
					codeNavList.push('not found: ' + EZstripConfigPath(url));
				else	
				{								// pick random selectedItem
					selectedItem = EZgetRandomInt(0, functionList.length)-1;
					for (var i=0; i<functionList.length; i++)
						codeNavList.push(functionList[i].name);
				}
				this.codeNavList = codeNavList.slice(0);
				codeNavList.push('0');				//sort always false
				codeNavList.push(selectedItem);		//checked item
				return codeNavList;
			},
			doCodeNavItem: function doCodeNavItem(id)
			{
				if (id >= this.codeNavList.length) return false;
				this.setCodeNavItem(id);
				return true;
			},
			getCodeNavItem: function getCodeNavItem()
			{
				return this.codeNavItem || null;
			},
			setCodeNavItem: function setCodeNavItem(id)
			{
				if (id >= this.codeNavList.length) return null;
				this.codeNavItem = {id:id, name:this.codeNavList[id]};
				return this.codeNavItem;
			},
			getSelection: function getSelection() {return selection()},
			setSelection: function setSelection(offsetBeg,offsetEnd)
			{
				[offsetBeg,offsetEnd]
				return todo('source.setSelection');
				/*
				DWclass.selectionString = EZ.doc.source.substring(offsetBeg,offsetEnd);
				if (theForm.functionDisplay && EZ.doc.source)
					theForm.functionDisplay.value = DWclass.selectionString
												  + '\n' + DWclass.selectionMarker + '\n'
												  + theForm.functionDisplay.value;
				*/
			},
			name: 'dw.dom.source'
		},
		getSelection: function getSelection(isMultiple) {return selection(isMultiple)},
		setSelection: function setSelection(begOffset, endOffset) 
		{
			[begOffset, endOffset]
			return todo('dom.setSelection')
		},
		name: 'dw.dom'
	};
	
	//----------------------------------------------------------------
	//----- DOM related dw.* functions
	//----------------------------------------------------------------
	
	/**
	 *	dw.releaseDocument(...)
	 */
	this.releaseDocument = function releaseDocument() {};
	
	/**
	 *	dw.getActiveWindow(...)
	 */
	this.getActiveWindow = function getActiveWindow() 
	{
		return document;
	}
	
	/**
	 *	dw.getNewDocumentDOM()
	 *
	 *	Reference: 
	 *	https://developer.mozilla.org/en-US/docs/Web/API/DOMImplementation/createDocument
	 *		var doc = document.implementation.createDocument ('http://www.w3.org/1999/xhtml', docType, null);
	 *		var body = document.createElementNS('http://www.w3.org/1999/xhtml', 'body');
	 *		doc.documentElement.appendChild(body);
	 *	
	 *	http://stackoverflow.com/questions/8227612/how-to-create-document-objects-with-javascript
	 *		var doc = document.implementation.createHTMLDocument('');
	 *		doc.open();
	 *		doc.write(html);
	 *		doc.close();
	 */
	this.getNewDocumentDOM = function getNewDocumentDOM(docType, html)
	{
		var doc;
		if (docType)
		{
			doc = document.implementation.createDocument ('http://www.w3.org/1999/xhtml', docType, null);
			var body = document.createElementNS('http://www.w3.org/1999/xhtml', 'body');
			doc.documentElement.appendChild(body);
		}
		else
		{
			doc = document.implementation.createHTMLDocument('');
			if (html)
			{
				doc.open();
				doc.write(html);
				doc.close();
			}
		}
		return doc;
	}

	/**
	 *	dw.getDocumentDOM(...)
	 */
	this.getDocumentDOM = function getDocumentDOM(url)
	{
		var dom;
		while (true)
		{
			dom = null;
			url = url || this.documentUrl || 'document';
			if (url == 'document' || url == document)
			{
				dom = document;
				break;
			}
			// when url passed -- assume html if not .xml
			if (url.right && url.substr(-4) != '.xml')
			{
				var html = DWfile.read(url);
				dom = this.getNewDocumentDOM('', html)
				dom.URL = url;
				break;
				//return this.dom;
			}
			else
			{
				// convert file to http://
				url = EZstripFileSlash(url.replace(/\\/g, '/'));
				url = url.replace(new RegExp(EZ.simulator.configPath), EZ.simulator.domain);
				
				var xmlhttp = DWajax.getXmlhttp();
				xmlhttp.open('GET',url,false);
				xmlhttp.send();
				dom = DWajax.httpResponse(xmlhttp,url);
				break;
			}
		}
		if (!dom) return null;	//should only occur if ajax xml
		
		// add dw dom objects and methods to dom if not defined
		for (var o in dw.dom)
			if (dom[o] === undefined) 
				dom[o] = dw.dom[o];
		return dom;
	}
	//----------------------------------------------------------------
	//----- general dw.* functions
	//----------------------------------------------------------------
	this.beep = function beep() {};
	this.refreshExtData = function refreshExtData() {};
	this.reloadExtensions = function reloadExtensions() {};
	
	this.getConfigurationPath = function getConfigurationPath()
	{
		return EZ.simulator.configPath;
	}
	this.getSiteRoot = function getSiteRoot() 
	{
		return this.getConfigurationPath()
	};

	//----------------------------------------------------------------
	//----- focus functions
	//----------------------------------------------------------------
	this.getFocus = function getFocus() {return 'textView'}
	this.dom.getView  = function getView() {return 'code'}
	this.dom.getActiveView = function getActiveView() {return 'code'}

	//----------------------------------------------------------------
	//----- dw.* functions using DWmisc server API
	//----------------------------------------------------------------
	this.launchApp = function launchApp(cmd, args) 
	{
		if (!cmd) return '';
		args = args || '';
		return DWajax.httpPost('DWmisc', {fn:'launchApp', cmd:cmd, args:args});
	};

	/**	todo -- internnal function
	 *
	 *	displays message: dreamweaver.simulattor.js::funcName() not implemented
	 */
	function todo(funcName)
	{
		this.displayMessage('dreamweaver.simulattor.js::' + funcName + '() not implemented')
	}
	/**	getSelection(type) -- internnal function
	 *
	 *	simulates dw getSelection() functions by returning offsets to source marked
	 *	with html or javascript marker of the form: ...begSeection[#]...endSelection
	 *		where # is zero based selection index -- each call gets next selection
	 *
	 *	begSelection & endSelection have prefix of: <!--  // or /* and associated suffix
	 *		e.g. <!-- begSelection[0] -->
	 *
	 *  endSelection omitted for insertion point
	 *
	 *	ARGUMENTS:
	 *		type 	=null for: dom.source.getSelection() 
	 *				=true or false for: dom.getSelection(isMutiple)
	 *
	 *	TODO: support type argument
	 */
	function selection(type)				
	{
		[type]
		var msg;
		var source = document.documentElement.outerHTML;
		var theSel = [0,source.length];		//default: all source 
		
		if (!dw.selectionCount || dw.selectionCount > 9) dw.selectionCount = 0;
		for (var count = dw.selectionCount; count<=10; count++)	
		{
			if (count > 9)					//up to 9 selections -- then select all
			{
				msg = 'All source selected -- '
				if (dw.selectionFound)
					msg += 'after last selection marker';
				else
					msg += 'Add <!--begSelection[#]-->...<!--endSelection--> to define other selections'
						 + ' -- see notes in EZdw.simulator.js'
				dw.displayMessage(msg);
				return theSel;
			}
			dw.selectionCount = count;
			//                        1_____INSERT POINT {prefix} begSelection[#] {suffix}______
			//                       /                                                          \
			//                      /2                                                3          \
			var regex = new RegExp('((<!--|/\\*|//)\\s*begSelection\\['+count+'\\]\\s*(-->|\\*/|$))'
			//
			//                        5________ SELECTION if defined
			//                       /         \
								  +'(([\\s\\S]*?)((<!--|/\\*|//)\\s*endSelection\\s*(-->|\\*/|$)))?', 'i');
			//                       \          					                             /
			//                        4_____ {prefix} endSelection {suffix} _____/
			
			var results = document.documentElement.outerHTML.match(regex);
			if (!results) continue;
			
			
			// determine offsets to this selection marker
			theSel[0] = results.index + results[1].length;	//end of begin
			theSel[1] = !results[5] ? theSel[0] 
					  : theSel[0] + results[5].length;
			
			msg = 'begSelection[' + count + '] ' 
				+ (results[5] ? 'selection' : 'insert point') 
				+ ' offsets: ' + theSel;
			dw.message(msg);
			dw.selectionFound = true;
			return theSel;
		}
	}
}
/*********************************/
/*BOOKMARK -----site constructor*/
/*******************************/
function DWsiteClass()
{
	this.getCurrentSite = function getCurrentSite()
	{
		return null;
	}
	this.getLocalRootURL = function getLocalRootURL(siteName)
	{
		[siteName]
		return null;
	}
}
/***********************************/
/*BOOKMARK -----DWfile constructor*/
/*********************************/
function DWfileClass()
{
	if (typeof dw != 'undefined' && !dw.isNotdw)	//safety for unexpected
		EZnote('DWfileClass called from DW environment')
	
	this.fso = null;
	this.fsoREAD = 1;
	this.fsoWRITE = 2;
	this.fsoCREATE = true;	//false appends
	
	if (navigator.appVersion.indexOf('MSIE') != -1) 
		this.fso = new ActiveXObject("Scripting.FileSystemObject");
	
	function fileToUrl(file)
	{
		return file.replace(new RegExp(EZ.simulator.configPath), EZ.simulator.domain);
	}
	[fileToUrl]
	function urlToFile(url)
	{
		return url.replace(new RegExp(EZ.simulator.domain), EZ.simulator.configPath);
	}

	this.exists = function exists(filename)
	{
		filename = urlToFile(filename);
		if (isNotIE()) 		//returns: true, false or null if ajax error
			return DWajax.httpGet('DWfile', {fn:'exists', fileURL:filename});

		return this.fso.FileExists(filename);
	}
	
	this.read = function read(filename)
	{
		filename = urlToFile(filename);
		if (isNotIE())									
		{					//returns text or null if file not found or ajax error
			var text = DWajax.httpGet( 'DWfile', {fn:'read', fileURL:filename} );
			return (text || text === '') ? text : null;
		}
		if (!this.fso.FileExists(filename)) return '';

		var file = this.fso.OpenTextFile(filename,this.fsoREAD);
		var data = file.ReadAll();
		file.Close();
		return data;
	}

	this.write = function write(filename, data, mode)
	{														
		var rtnValue;
		if (!filename)
			return EZ.oops('filename invalid: ' + filename);
		
		filename = urlToFile(filename);
		if ('object function'.indexOf(typeof data) != -1)
			data = EZ.stringify(data, '+all', 4)
		
		for (var pass=1; pass<=2; pass++)
		{	
			if (isNotIE())	//returns: true, false or null if ajax error
				rtnValue = DWajax.httpPost( 'DWfile', {fn:'write', fileURL:filename, text:data, mode:mode} );
			else
			{
				var file = this.fso.OpenTextFile(filename,this.fsoWRITE,this.fsoCREATE);
				rtnValue = file.Write(data);
				file.Close();
			}
			
			if (rtnValue || pass > 1) break;
			var folders = filename.match(/.*?\//g);
			var path = ''
			while (folders.length)
			{
				path += folders.shift();
				if (this.exists(path) || this.createFolder(path)) 
					continue;
				path = '';
				break;
			}
			if (!path) break;
		}
		return rtnValue;
	}

	this.createFolder = function createFolder(filename)
	{
		filename = urlToFile(filename);
		if (isNotIE()) 
			return DWajax.httpGet( 'DWfile', {fn:'createFolder', fileURL:filename} );
		
		return false;
	}

	this.remove = function remove(filename)
	{
		filename = urlToFile(filename);	//deletes files of folders
		if (EZ.simulator.technology)	
			return DWajax.httpGet( 'DWfile', {fn:'remove', fileURL:filename} );
		
		else if (this.fso) 
			this.fso.DeleteFile(filename);
			
		else
			return false;
	}
	/**
	 *	copy
	 */
	this.copy = function copy(fileURL, copyURL)			
	{					//returns: true, false or null if ajax error
		fileURL = urlToFile(fileURL);
		copyURL = urlToFile(copyURL);
		return DWajax.httpGet('DWfile', {fn:'copy', fileURL:fileURL, copyURL:copyURL});
	}
	/**
	 *	getSize
	 */
	this.getSize = function getSize(fileURL)
	{					//returns: integer -- -1 if ajax error
		fileURL = urlToFile(fileURL);
		return EZtoInt(DWajax.httpGet('DWfile', {fn:'getSize', fileURL:fileURL}), -1);
	}
	/**
	 *	getModificationDate
	 */
	this.getModificationDate = function getModificationDate(fileURL)
	{					//returns: integer -- -1 if ajax error
		fileURL = urlToFile(fileURL);
		return EZtoInt(DWajax.httpGet('DWfile', {fn:'getModificationDate', fileURL:fileURL}), -1);
	}
	/**
	*	always returns some array -- empty if no files, bad folder or ajax error
	* 	type: (optional) can be either 'files' or 'folders' (DW: 'directories' ??)
	**/
	this.listFolder = function listFolder(path, type)
	{
		if (path === undefined)
			path = ['listFolder: path undefined'];
		else if (!path) return [];
		
		if (EZ.simulator.technology)	//server configured
		{
			var filter = '';
			if (path.right(1) == '/')
				path = path.clip(1);
			var results = path.match(/(.*\/)(.*)/);
			if (results && results[2] && /[*?]/.test(results[2]))
			{
				path = results[1];
				filter = globStringToRegex(results[2]).source;
			}
			path = urlToFile(path);
			var query = {fn:'listFolder', fileURL:path, listFolderFilter:filter, constraint:type};
			var json = DWajax.httpGet('DWfile', query);
			
			var msg;
			try
			{
				return eval(json);
			}
			catch (e)
			{
				msg = 'eval(json) failed with following json:\n'+json;
				dw.techSupport(e,msg);
				return [];
			}
		}
		else if (!this.fso) return ['EZ simulater not configured for: DWfile.listFolder'];

		var folder = fso.GetFolder(path);
		var files = new Enumerator(folder.files);
		var filelist = [];
		for (; !files.atEnd(); files.moveNext())
			  filelist.push(files.item());
		return filelist;
   }
	function isNotIE()
	{
		if (navigator.appVersion.indexOf('MSIE') != -1) return true;
		if (!this.fso) return true;		//not running as windows script -- e.g. hta
		return false;
	}
	/**
	 *	return regex for shell wildcard
	 *	references: 
	 *		http://stackoverflow.com/questions/13818186/converting-shell-wildcards-to-regex
	 */
	function globStringToRegex(str) 
	{
		return new RegExp(preg_quote(str).replace(/\\\*/g, '.*').replace(/\\\?/g, '.'), 'g');
		function preg_quote (str, delimiter) 
		{
			return (str + '').replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + (delimiter || '') + '-]', 'g'), '\\$&');
		}
	}	
}
/*************************/
/*BOOKMARK -----MM class*/
/***********************/
function MMClass()
{
	this.setBusyCursor = function setBusyCursor() {};
	this.clearBusyCursor = function clearBusyCursor() {};
}
/*****************************/
/*BOOKMARK -----DWajax class*/
/***************************/
function AjaxClass()
{
	/**
	 *	Load all known "EZ preferences" group preferences into memory to avoid server
	 *	request for every pref -- and prevent infinate loop when used by ajax object
	 */
	this.loadPref = function loadPref()
	{
		try
		{
			var text = this.httpGetPref('DWpref', {pref_fn:'getAll', pref_group:EZ.prefGroup, pref_mode:'string'});	
			if (!text) throw 'Not found: ' + EZ.prefGroup;
			text = text.replace(/"""\}/m, '""}');	//hack if last pref is empty string "
			{
				eval('EZ.pref.cache=' + text);
				for (var i=0; i<EZ.pref._keys.length; i++)		
				{											//for prefs not in registry...
					var key = EZ.pref._keys[i];				//...set to default or null
					if (EZ.pref.cache[key] === undefined)							
						EZ.pref.cache[key] = EZ.pref.defaultValues[key] || null;	
				}
			}
		}
		catch (e)
		{
			var msg = 'EZdw.simulator.js::AjaxClass.loadPref() '; 
			if (typeof(e) == 'object')
			{
				dw.displayMessage(msg + '\n' + e.message);
				dw.displayStacktrace(EZstripConfigPath(e.stack));
			}
			else
			{
				msg += e;
				dw.displayMessage(msg);
				dw.displayStacktrace(EZdisplayCaller(msg));
			}
		}
	}
	/**
	 * 	ajax registry request -- add DWpref to param
	 */
	this.httpGetPref = function httpGetPref(api, param)
	{
		param = param || {};
		param.pref_dwBaseKey = EZ.simulator.registryKey;
		return this.httpGet(api, param);
	}
	/**
	 * 	ajax get request
	 *	reference: http://www.w3schools.com/ajax/ajax_xmlhttprequest_send.asp
	 */
	this.httpGet = function httpGet(api, keyValues, callback)
	{
		var xmlhttp = this.getXmlhttp(callback);
		var url = this.getSimulatorUrl(api);
		if (!url) return this.httpResponse({api:api, status:999}, url);
	
		var query = ''
		for (var key in (keyValues || {}))
			query += '&' + key + '=' + escape(keyValues[key]);
		query = '?' + Math.random() + query;
			
		xmlhttp.open("GET", url+query, this.async);	//false means wait for response
		try
		{
			xmlhttp.send();
			return this.httpResponse(xmlhttp, url);
		}
		catch (e)
		{
			if (EZ.techSupport)
				EZ.techSupport(e, 'ajax request failed');
			else
				console.log({error: e, stackTrace: e.stack})
			return '';
		}
	}
	/**
	 * 	ajax post request
	 *  configPath appended to fields if not already included
	 *
	 *	reference: http://www.w3schools.com/ajax/ajax_xmlhttprequest_send.asp
	 */
	this.httpPost = function httpPost(api, fields, callback)
	{
		var xmlhttp = this.getXmlhttp(callback);
		var url = this.getSimulatorUrl(api);
		if (!url) return this.httpResponse({api:api, status:999}, url);
		
		if (!fields.configPath)
			fields.configPath = EZ.simulator.configPath;
			
		var fieldName, text, content = '';
		for (fieldName in fields)
		{
			if (typeof(fields[fieldName]) != 'string') continue;
			text = fields[fieldName].replace(/%/g, escape('%')).replace(/&/g, escape('&')).replace(/\+/g, '@#plus#@')
			content += fieldName + '=' + text + '&';
		}
		content = content.substr(0,content.length-1);
		
		xmlhttp.open("POST", url, this.async);	//false means wait for response
		xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
		xmlhttp.send(content);
		return this.httpResponse(xmlhttp, url);
	}
	/**	internal function
	 * 	return xmlhttp object -- if callback specified, call when ajax request completes
	 */
	this.getXmlhttp = function getXmlhttp(callback)
	{
		var xmlhttp;
		if (window.XMLHttpRequest)	// code for IE7+, Firefox, Chrome, Opera, Safari
			xmlhttp = new XMLHttpRequest();
		else						// code for IE6, IE5
			xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		
		this.async = false;
		callback = callback || EZ.simulator.ajaxCallback;
		if (callback)
		{
			this.async = true;
			xmlhttp.onreadystatechange=function()
			{
				if (xmlhttp.readyState==4 && xmlhttp.status==200) 
					callback(xmlhttp);
			}
		}
		return xmlhttp;
	}
	/**	internal function
	 * 	get url for DW simulator server api plugin
	 *	returns null if server plugin not installed; blank if not http (i.e. file)
	 */
	this.getSimulatorUrl = function getSimulatorUrl(api)
	{
		if (api.substr(-4) == '.xml') return api;
		
		// no url returned unless file opened as http or no server api plugin installed
		if (!EZ.simulator.technology) 
			return null;
		else if (!EZ.simulator.domain)
			return '';
		
		// return url for DW simulator server api plugin
		return EZ.simulator.domain + EZ.simulator.ajaxPath 
			 + api + '.' + EZ.simulator.technology;
	}
	/**	internal function
	 * 	return ajax response -- display error or done messsge -- display stacktrace if error
	 */
	
	this.httpResponse = function httpResponse(xmlhttp, url)
	{
		var results = ['na', 'return', 'message', 'stacktrace'];
		var msg = '';
		var stacktrace = '';
		switch (xmlhttp.status || 999)
		{
			case 200: 	
			{
				if (url.toLowerCase().substr(-4) == '.xml')
				{
					if (!xmlhttp.responseXML && xmlhttp.responseText)
					{
						msg = 'Invalid xml in ' + EZstripConfigPath(url);
						stacktrace = msg + '\n' + xmlhttp.responseText;
					}
					results = ['na', xmlhttp.responseXML, msg, stacktrace];
					break;
				}
				var regEx = /[\s\S]*?<results>([\s\S]*?)<\/results>[\s\S]*?<errmsg>([\s\S]*?)<\/errmsg>[\s\S]*?<stacktrace>([\s\S]*?)<\/stacktrace>/;
				results = xmlhttp.responseText.match(regEx);
				if (!results) 
					results = [undefined, null, 'Invalid simulator ajax response for: ' +url, xmlhttp.responseText];
				break;
			}
			case 404: 	
			{
				msg = 'url not found: ' + url;
				results = [undefined, null, msg];
				break;
			}
			case 999: 	
			{
				if (!xmlhttp.status)
					msg = 'Error processing simulator ajax response for: ' +url;
				else if (url == null) 
					msg = 'no server api installed to simulate: ' + xmlhttp.api + ' functions';
				else
					msg = 'open page via http to simulate ' + xmlhttp.api + ' functions';
				
				//[0]=unused  [1]=returned result  [2]=message  [3]=stacktrace	
				results = [undefined, null, msg];
				break;
			}
			default:
			{
				msg = 'xmlhttp.status: ' + xmlhttp.status + ' ' + xmlhttp.statusText;
				results = [false, null, url + '\n' + msg];
			}
		}	
		msg = results[2] || ('ajax return: ' + url);
		if (typeof(results[1]) == 'string')
			msg += ' -->' + results[1].substr(0,20) + '... [' + results[1].length + ']';
		
		dw.displayMessage(msg);
		dw.displayStacktrace(results[3]);
		
		switch (results[1])
		{
			case 'null': 	return null;
			case 'true':	return true;
			case 'false': 	return false;
			default:		return results[1];
		}
	}
}
//=============================================================================
if (typeof(EZ) == 'undefined') EZ = {};
if (EZ.simulatorAPI != 'initialized')
{
	DW = new DWclass();				
	site = new DWsiteClass();
	DWfile = new DWfileClass();
	DWajax = new AjaxClass();
	MM = new MMClass();
	DW.init();
	
	//--------------------------------------------------------------------------
	// non-standard document functions supported by dw
	//--------------------------------------------------------------------------
	document.getTitle = function getTitle() {return 'title'};
}
if (!EZ.simulatorAPI) EZ.simulatorAPI = 'loaded';	//not yer used
