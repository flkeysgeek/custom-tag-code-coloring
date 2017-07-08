if (typeof(EZ) == 'undefined') EZ = {};
if (typeof(dw) == 'undefined') dw = {isNotDW: true}


/*--------------------------------------------------------------------------------------------------
Dreamweaver LINT global references and defined variables not used here {
--------------------------------------------------------------------------------------------------*/
var e;			//global used for try/catch
/*global 

EZ:true, DWfile, dw:true, f:true, g:true
*/
//. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .}
(function() {[	//global variables and functions defined but not used


EZ, DWfile, dw, e, f, g ]});

/*---------------------------------------------------------------------------------------------
EZ.toString() Global options and default settings
---------------------------------------------------------------------------------------------*/
//EZ.global.toString = EZ.toString()	//native EZ.toString() return value
EZ.global.format = {
	MAXLINE: 500,			//max characters displayed for any value
	ITEMS_LIMIT: 50,		//max number of Array items displayed
	OBJECT_LIMIT: 50,		//max number of object properties
	OBJECT_DEPTH: 5,		//max depth for object display
	INDENT_SIZE: 3,			//number of spaces indented for each levelS
	SHOW_PROTOTYPE: false,	//true to display prototype elements
	SHOW_TYPE: false,		//true to display non-object data types
	
	HTML_FORMAT: false,
	HTML_MAXDEPTH: 3,
	HTML_MAXCHARS: 25,
							//only following show by default for all tags
	HTML_KEYS: 'id className tagName parent'.split(' '),	
							//only following show by default for associated tag types
	HTML_TAGTYPE_KEYS: 'value checked src'.split(' '),	
	
	//following statement gets all property names but not methods
	//Object.getOwnPropertyNames(Object.getPrototypeOf(g.specificMatch))

	DATE_FUNCTIONS: ('getDate getDay getFullYear getHours getMilliseconds getMinutes'
				  + ' getMonth getSeconds getTime getTimezoneOffset getUTCDate getUTCDay'
				  + ' getUTCFullYear getUTCHours getUTCMilliseconds getUTCMinutes getUTCMonth'
				  + ' getUTCSeconds getYear setDate setFullYear setHours setMilliseconds'
				  + ' setMinutes setMonth setSeconds setTime setUTCDate setUTCFullYear setYear'
				  + ' setUTCHours setUTCMilliseconds setUTCMinutes setUTCMonth setUTCSeconds'
				  + ' toDateString toGMTString toISOString toJSON toLocaleDateString toLocaleString'
				  + ' toLocaleTimeString toTimeString toUTCString valueOf').split(' '),
	
	//HTML_EVENTS: get from EZ.event
	
	//HTML_PROPERTIES_MAXLINE: ['value', 'innerHTML', 'outerHTML'],
	HTML_TEXT_NODE: 3,
	
	OBJECT_SPACING: '\n',		//spacing before and after object
}
/*---------------------------------------------------------------------------------------------
EZ.toString(obj [,name [,opts]])

Creates formatted text or html of Object properties, Array items or non-object variable.

Objects are only formatted once; duplicate or recursive references show "...repeated..."
as Object value with reference or link to previously formatted duplicate Object.

For html elements, not all properties are formatted as explained below:
	1.	only properties specified or from html property list are formatted
	2.	all non-blank attributes from the attributes property
	3.	text nodes show text length and the 1st few char with whitespace compressed

ARGUMENTS:
	obj		Object or variable to format as String or HTML for display
	
	name	(optional) String specifing object or variable name
			toplevel Object name then embedded property name or Array item index
		
 	options	(optional) format options specified as either space delimited key=value pairs
			or an object with options supplied as keys/values.
			
			If this argument is omitted and name is intrepreted as options if either object
			or String containing "=".

RETURNS:
	String containing formatted html or text representing Object or variable value(s).
	
TODO: 
	typeof undefined is not displayed properly
	 html elemente have el.contructor == Element is true
---------------------------------------------------------------------------------------------*/
EZ.toString = function EZtoString(obj,name,options/* legacy: options=indent?? */)
{
	switch (arguments.length)
	{
		case 0: 						//for EZ.toString()...
			return Function.prototype.toString.call(this);		
		case 1: 
			name = options = '';
			break;
		case 2:
		{
			if (EZ.isOptions(name, '? object'))
			{
				options = name;
				name = '';
			}
			break;
		}
		case 3:
		{
			if (!EZ.isOptions(options, '? object'))
			{
				options = {indent: options};
			}
		}
	}
	var opts, text, MORE = EZ.MORE;
	try
	{
		//-------------------------------------------------
		opts = new EZ.toString.setupOptions(options, name); 
		//-------------------------------------------------
		var depth = opts.depth;
		if (opts.htmlformat) 
			MORE = MORE.replace(/ /g, '&nbsp;')
		
		//==================================================================================
		EZtoString_format(obj, name, opts, {depth:opts.depth});	// heavy lifting
		//==================================================================================
		EZtoString_appendCollapse(depth);

		//---------------------------------------
		text = EZtoString_postFormatting(opts);
		//---------------------------------------
	}
	//---------------------------------------------------------------------
	// exception reporting . . .
	//---------------------------------------------------------------------
	catch (e)
	{								//get any formatted text
		text = '.formattedText'.ov(opts,'').trim();		
		if (!text)
			text = 'no formatted text';
		else
		{
			text += '\nException formatting: '+ '.dotName'.ov(opts, '');
			if (!'.showseqno'.ov(opts))			//remove seqno(s)
				text = text.replace(/^#\d*?#/gm, '');
		}
	
		if (e.stack)					//format stack
		{
			var stackTrace = (!''.formatStack)
						   ? e.stack
						   : ('.htmlformat'.ov(opts))
						   ? e.stack.formatStack({wrap:'pre', note:'b'})
						   : '\n' + e.stack.formatStack().join('\n');
			text += '\n' + stackTrace;
		}
	}
	
	//console.clear(); console.log(text);
	//==============================================================
	return text; 	//return from EZtoString() -- top level entry
	//==============================================================

	/*********************************************************************************************
	 *	WORK-HORSE: first called with toplevel Object, Array or simple non-object variable.
	 *	For Objects: recursively calls itself for each Object property or Array item.
	 *
	 *	ARGUMENTS:
	 *		obj		toplevel Object, embedded Object property or Array item
	 *		name	optional toplevel Object name then embedded property name or Array item index
	 *		opts	innitial options and global variables shared between recursion levels
	 *
	 *		local	Object containing variables for current instance -- caller instance NOT updated:
	 *				depth	zero based recurrsion depth
	 *				isArray	true while formatting Array items
	 *				dotName	concatenated object/property name starting with toplevel object

		// local objects passed to recursive calls but not changed for caller
		var  depth =  '.depth'.ov(local, 0)
		var  dotName =  '.dotName'.ov(local, '')
		var  isArray =  '.isArray'.ov(local, false)
		var  formatOpts =  '.formatOpts'.ov(local, ','))
		var  parentSeqno =  '.parentSeqno'.ov(local, 0)

	 
	 *	RETURNS:
	 *		nothing	-- "opts.displayText" contains formatted text from all recursive calls.
	 ********************************************************************************************/
	function EZtoString_format(obj, name, opts, localOpts)
	{
		//----- Determine data type and other properties used for displaying
		var idx, note, text, value;
	
		//NOTE: use opts object for global data updated at all recurrsion level
		//		use local for data passed to down to recursive calls but not changed or returned
	
		var formatOpts = '.formatOpts'.ov(localOpts, [])
		formatOpts = EZ.toArray(formatOpts, ',');
		
		//----- Make copy of local data
		var local = {									
			depth: '.depth'.ov(localOpts, 0),
			dotName: '.dotName'.ov(localOpts, ''),
			isArray: '.isArray'.ov(localOpts, false),
			formatOpts: formatOpts,
			parentSeqno: '.parentSeqno'.ov(localOpts, 0)
		}
		
		// local legacy variables previously passed as arguments
		var depth = local.depth;
		var isArray = local.isArray;
		var valueFormat = '';
		
		var spaces = EZ.SPACES.substring(0, depth*opts.indentsize);
		var spacesPlus = spaces + EZ.SPACES.substring(0,opts.indentsize);
		var spacesPlusPlus = spacesPlus + EZ.SPACES.substring(0,opts.indentsize);	
		
		//___________________________________________________
		if (obj instanceof Element && opts.htmlFormatter)
		{
			obj = EZ.format.Element(obj, opts.htmlFormatter);
			if (name && typeof(obj) == 'string')
			{
				valueFormat = 'htmlTag';
				obj = name + ': ' + obj;
			}
		}
		//___________________________________________________
		
		//***************************************************************************
		//***** If NOT object -- addend formatted value and bail -- depth==0 ?? *****
		//***************************************************************************
		if ('object function'.indexOf(typeof obj) == -1 || (depth===0 && obj == null))
		{											//format simple non-object variable
			text = EZtoString_getValue(obj, valueFormat);		
			
			if (!depth)								//addl formatting for depth 0
			{										
				if (text.enclosedWith('"') || text.enclosedWith("'"))
				{									//text enclosed in double quotes. . .
					
					/*11-09-2016 WHY??
					text = text.substr(1).clip();	//remove enclosing quotes
					
					// if text does not contain any MARKERS or newlines, wrap with MARKERS 
					
					if (!text.contains('\n')
					&& !text.contains(EZ.DOT))
						text = EZ.DOT + text + EZ.DOT;
					*/
				}
				if (opts.name)
				{
					var type = obj === null ? 'null'
							 : obj == EZ.undefined ? 'undefined'
							 : obj.constructor ? obj.constructor.name
							 : typeof(obj);
					text = opts.name + ' [' + type + ']\n' + opts.indentSpaces + text; 
				}
				if (opts.htmlformat && !depth)
					text = '<span class="top" id="EZ_' + opts.hashTime + '_0">' 
						  + text + '</span>\n';
			}
			return EZtoString_appendText(text);
		}
		
		  //------------------------------------------\\
		 //----- format Array, Object or Function -----\\
		//----------------------------------------------\\
		var isDone = false;
		var isEmpty = true;
		var isHTML = false;
		var showHtmlKeys = false;
		var processedObj = '';
		//var type = obj ? EZ.getFunctionParts(obj.constructor)[1] : '';
		var type = (obj instanceof Object) ? obj.constructor.name : '';
		
		
		isArray = local.isArray = false;
		var isArrayElement = (isArray && !isNaN(name))	//if recursive call 
		if (EZ.isArrayLike(obj))
		{
			isArray = local.isArray = true;
			type = type || (EZ.isArray(obj) ? type + ' array' : 'arraylike object');
		}
		else if (obj && obj.constructor == Function)
			type = (type + ' function').trim();
		
		else if (obj.childNodes != EZ.undefined)
		{
			isHTML = true;
			type = type || 'html element';
		}
		type = type.trim();
	
		//------------------------------------------------------------
		//----- headings for top level Array, Object ot html element
		//------------------------------------------------------------
		if (!depth)		
		{
			opts.depth = -1;
			EZtoString_appendCollapse(depth, '');
			
			local.dotName = name;
			var heading = name + ' ';
			if (!name || typeof name == 'object') 
			{
				name = '';
				local.dotName = type;
			}
			note = type == 'Array' ? ' (length=' + obj.length + ')' : ''
			heading += '[' + type + ']' + note + ': ';
			
			if (opts.htmlformat)
				EZtoString_appendText('<span class="top" id="EZ_' + opts.hashTime + '_0">' 
						  + heading + '</span>\n');
			else
				EZtoString_appendText(heading + '\n');
			EZtoString_appendText('\n');
		}
		//--------------------------------------------------------------------
		//----- depth > 0: headings for embedded Array, Array item, Object ot html element
		//--------------------------------------------------------------------
		else
		{
			if (depth <= 1 && !opts.collapse) EZtoString_appendText('\n');
			
			EZtoString_appendCollapse(depth, spaces.substr(1));
			
			EZtoString_appendText('#' + (++opts.objectSeqno) + '#');
			opts.objectDepth[opts.objectSeqno] = depth;
			
			while (true)
			{
				//----- for Array items . . .
				if (isArrayElement)
				{
					local.dotName = local.dotName + '[' + name + ']';
					
					note = '';		
					if (isHTML)
					{							//if text or similar node, bail after heading	
						if ('.nodeType'.ov(obj) == opts.HTML_TEXT_NODE)
						{						//if text node show text and length
							isDone = true;
							var text = '.textContent'.ov(obj);
							text = !text ? '' : text.replace(/\s+/g, ' ').trim();
							note = !text ? ' ' + EZ.BLANK
								 : ':' + 
								 (
									 text.length < opts.htmlmaxline
									 ? text 
									 : text.substr(0,opts.htmlmaxline) 
									 + MORE
								 )
							//	 + '[' + text.length + ']';
								 + '(' + text.length + ')';
						}
						else if (!obj.attributes)
							isDone = true;
				
					}
					//EZtoString_appendText('[' + name + ']' 
					EZtoString_appendText( name 
										 + (type ? ' [' + type + ']' : '') 
										 + note + '\n');
					break;
				}
				//----- for non-Array items . . .
				text = isNaN(name) ? ' ' + name : '[' + name + ']';
				//EZtoString_appendText(' ');
				name = EZ.stripConfigPath ? EZ.stripConfigPath(name) : name;
				local.dotName = local.dotName + '.' + name;
	
			//	note = (isArray) ? ' [length:' + obj.length + ']' : ''; 
				note = (isArray) ? ' (length=' + obj.length + ')' : ''; 
			//	EZtoString_appendText(name + ' (' + type + ')' + note + ':\n');
			
				if (type.substr(0,4) == 'HTML')
				{
					type = 'Element ' + obj.tagName
						  + (obj.id ? '#' + obj.id : '')
						  + (obj.className ? '.' + obj.className.split(' ').join('.') : '')
				}
				EZtoString_appendText(text + ' (' + type + ')' + note + ':\n');
				if (isDone) break;
				
				//----- check if maxobject depth reached
				if (depth >= opts.maxdepth) 
				{
					EZtoString_appendText(spacesPlusPlus + MORE);
					EZtoString_appendText('> maxdepth [' + opts.maxdepth + ']\n');
					isDone = true;
					break;
				}
				
				//----- check if called to process unique object
				//if (obj.constructor != document.body.style.constructor)
				{
					idx = opts.processedObjects.indexOf(obj);
					if (idx != -1)
					{
						//========== object already processed ==========\\
						var processedObj = opts.processedObjData[idx];
						processedObj.count++;
						note = spacesPlus + '...repeat of:<a href="#' 
							 + opts.hashTime + '_' + processedObj.seqno + '">' 
							 + processedObj.name + '</a>'
							 + (opts.showseqno ? ' [' + processedObj.seqno + ']' : '')
							 + '\n';
						EZtoString_appendText(note);
						isDone = true;
						break;
						//===============================================//
					}
					else
					{
						//============ 1st time object processed ============\\
						opts.processedObjects.push(obj);
						opts.processedObjData.push(
						{
							name: local.dotName, 
							seqno: opts.objectSeqno, 
							parentSeqno: local.parentSeqno,
							count: 0
						});
						opts.objectChildNodes[opts.objectSeqno] = local.parentSeqno
						opts.parentSeqno[opts.objectSeqno] = local.parentSeqno
						//===================================================//
					}
				}
				break;
			}
		}
		opts.first = false;
		opts.dotName = local.dotName;		//save for exception reporting		
		if (isDone)
			 return EZtoString_appendCollapse(depth);
		
		if (opts.quit) 				//safety for unexpected
			return '...quit ' + local.dotName + '...\n';	
		
		//-----------------------------------------------------------------------
		// For each Array item, Object property, html attribute or childNode. . .
		//------------------------------------------------------------------------
		var excludeList = [];
		while (true)
		{
			showHtmlKeys = false;
			//=============\\
			// HTML elements\\
			//===============\\
			if (isHTML)
			{
				showHtmlKeys = opts.html_keys.length;
				if (!showHtmlKeys) break				
				
				var keys = Object.keys(obj).concat(opts.html_keys);
				var tagType = obj.type || obj.tagName || '';
				switch (tagType.toLowerCase())
				{
					case 'text': 	
					case 'textarea': 	
					case 'password': 	
					case 'hidden': 	
					case 'button': 	
						if (opts.html_tagtype_keys.includes('value'))
							keys.push('value');
						break;
					
					case 'radio': 	
					case 'checkbox': 	
						if (opts.html_tagtype_keys.includes('checked'))
							keys.push('checked');
						break;
					
					case 'image': 	
						if (opts.html_tagtype_keys.includes('src'))
							keys.push('src');
						break;
					
					case 'Text': 	
						break;
					
					default:
						if (obj.nodeType == EZ.global.format.HTML_TEXT_NODE)
							keys = ['parent', 'textContent'];
						//	attributes.push('textContent');
						
						//innerHTML displays as childNodes
						//if (obj.innerHTML) keys.push('innerHTML');
				}
				keys = keys.removeDups();
				
				keys.some(function(attr)
				{
					if (obj.hasOwnProperty(attr))
					{
						value = EZ.format.value ? EZ.format.value(obj[attr]) : '...';
						EZtoString_formatItem(attr, 'value', value);
					}
					else if (attr != 'parent')
						EZtoString_formatItem(attr);
					
					else if (value = obj.parentNode)
					{
						if (EZ.format.Element)
						{
							value = value.toString('brief');
							EZtoString_formatItem('parentNode', 'value', value);
						}
						else
						{
							value = '.parentNode.outerHTML'.ov(obj, '');
							value = value.matchPlus(/(<.*?>)/)[1];
							if (value)
							{
								if (value.length > opts.htmlmaxline)
									value = value.substr(0,opts.htmlmaxline) + '...';
								value = EZtoString_displayEncode(value);
								EZtoString_formatItem('parentNode', 'value', value);
							}
						}
					}
					if (opts.quit) return true;
				});
				if (opts.quit) break;
				
				if (obj.attributes)
				{
					for (var attr=0; attr<obj.attributes.length; attr++)
					{
						if (keys.includes(attr)) break;		//if shown as key/value
						EZtoString_formatItem(obj.attributes[attr].name, 'attr');
						if (opts.quit) break;
					}
				}
				if (obj.style)
					EZtoString_formatItem('style', 'ignoreBlank');
				
				if ('.childNodes.length'.ov(obj))
					EZtoString_formatItem('childNodes');
				
				isEmpty = false;
				break;
			}
			
			//============\\
			// Array items \\
			//==============\\
			if (isArray)
			{
				for (var idx=0; (idx<obj.length && idx<opts.maxitems); idx++)
				{
					EZtoString_formatItem(idx);
					if (opts.quit) break;
				}
				if (obj.length > opts.maxitems)
					EZtoString_appendText( spacesPlusPlus + MORE
							 			 + (obj.length - opts.maxitems) + ' more array item(s)\n');
				if (obj.constructor != Array)
					EZtoString_formatItem('length', 'object');
			}
			if (opts.quit) break;
			
			//====================\\
			// Function properties \\
			//======================\\
			if (typeof(obj) == 'function')
			{
				if ('.name'.ov(obj,'').endsWith('EZoptions'))	//TODO: 12-01-16 think this is wrong place
					break;										//		either way can now use exclude
				
				if (opts.exclude.includes('Function'))			//should only get here for top level??
					break;										//...but safe
				
				if (!opts.exclude.includes('script'))
				{
					text = (obj + '').replace(/\n/gm,'\n'+spacesPlus);
					EZtoString_appendText(spacesPlus + text + '\n');
				}
				isEmpty = false;
			}
			
			//==================\\
			// RegExp properties \\
			//====================\\
			if (obj instanceof RegExp)
			{
				EZtoString_formatItem('', 'RegExp', obj);		//shows lastIndex if not 0
			}
			
			//==================\\
			// Object properties \\
			//====================\\
			else if (obj instanceof Object)
			{
			//	var keys = !Object.getOwnPropertyNames ? Object.keys(obj)
			//			 : Object.getOwnPropertyNames(obj);	
				var keys = Object.keys(obj);					//chrome returns keys in order added
																//...not sure about other browsers
				if (EZ.getConstructorName(obj) == 'Date')
				{
					if (EZ.format.value)
						text = EZ.format.value(value, 30);
					else
						text = EZ.formatDate(obj,'spaces');

					EZtoString_formatItem('', 'value', text);	
				}
				else
				{
					if (opts.sortkeys)	
						keys.sortSlice ? keys.sortSlice('ignoreCase') : keys.sort();
					
					keys.forEach(function(key)
					{											//skip numeric properties for Arrays --
						if (isArray								//...done above	
						&& (key == 'length' || (!isNaN(key) && key < obj.length))) 
							return;

						if (typeof(obj[key]) == 'function')
						{
							if (' length name arguments caller prototype '.includes(' ' + key + ' '))
								return;
							var script = Function.prototype.toString.call(obj[key]);
							if (script.includes('[native'))
								return;
							void(0);
						}
						EZtoString_formatItem(key, '');			//display property -- unless excludes
																
						if (opts.quit) return;
					});
				}
				if (excludeList.length)
				{
					//var msg = excludeList.length + ' of ' + keys.length + ' properties'
					//EZtoString_formatItem('excluded'.wrap(), 'value', msg);
					
					var msg = 'excluded'.wrap() + ' ' + excludeList.length + ' of ' + keys.length + ' properties'
					if (excludeList.length < 6)
					{
						msg = 'excluded'.wrap() 
							+ (excludeList.length == keys.length ? ' only' : '')
							+ (excludeList.length == 1 ? ' property: ' : ' properties: ')
							+ JSON.stringify(excludeList).substr(1).clip();
					}
					else 
					{
						EZtoString_appendText(spacesPlus + msg + '\n');
						if (excludeList.length > 6)
						{
							excludeList.length = 5;
							excludeList[5] = MORE;
							msg = '... ' + JSON.stringify(excludeList).substr(1).clip();
						}
					}
					EZtoString_appendText(spacesPlus + msg + '\n');
				}
			}
			break;
		}
		//____________________________________________________________________________________
		/**
		 *	EZtoString_formatItem() -- called for each Array item, Object porperty or html attributes
		 *	If item obj[key] is Array or Object, formatObject is recurusively called.
		 *			
		 *	ARGUMENTS:
		 *		key		Array index, Object property or html attribute -- designated by format
		 *			
		 *		format 	(string) 'attr' html attribute -- SEE switch below for supported values
		 *				(string) 'ignoreBlank' html element style properties
		 */
		function EZtoString_formatItem(key, format, value)
		{
			format = formatOpts.concat(EZ.toArray(format, ','));
			   //------------------------------------------------------------------\\
			  // process OBJECT properties typeof object or function -- except null \\
			 // (excluding: html el attribute -- including childnodes and styles)    \\
			//------------------------------------------------------------------------\\
			if (obj[key] != null
			&& !/(attr|value)/.test(format)
			&& 'object function'.indexOf(typeof obj[key]) != -1)
			{
				if (EZtoString_overLimit()) return false;
				
				//if (typeof(key) == 'function' && EZtoString_skipPrototype(key,Function)) return;
				/*
				if (typeof(obj[key]) == 'function')
				{												//simple formatting by EZtoString_getValue()
					if (obj[key].constructor == RegExp) return;
				}
				*/
				if (opts.exclude && opts.exclude.length)
				{
					var type = EZ.getType(obj[key], 'NaN Element');	//check for excluded type
					if (opts.exclude.includes(type)
					|| (opts.exclude.includes(obj[key].constructor.name))
					|| (opts.exclude.includes('Number') && typeof(obj[key]) == 'number'))
					{
						excludeList.push(key);
						return;
					}													//may already be skipped
					else if ((opts.exclude.includes('Element') || options.exclude.includes('html')) 
					&& (type.startsWith('HTML') || type == 'NodeList'))
						return;
				}
					
				if (opts.dotNamePlus.isExcluded(key, obj))
					return excludeList.push(key);
				opts.dotNamePlus.push(key)
				//***********************************************************************************
				var localArgs = EZ.clone(local);				//setup for recursive call
				localArgs.depth = depth+1;
				localArgs.formatOpts = format;
				localArgs.parentSeqno = opts.objectSeqno;
				
				//===================================================================================
				EZtoString_format(obj[key], key, opts, localArgs);
				//===================================================================================
				opts.dotNamePlus.pop(key);
				
				//EZ.merge([], local, {depth: depth+1, formatOpts: format, 							 
				//	 parentSeqno: opts.objectSeqno
				//		 /* isArray: local.isArray && format.indexOf('object') != -1 */
				//});
				//***********************************************************************************
				
				opts.firstObject = false;
				opts.lastTypeObject = true;
				isEmpty = false;
			}
			
			  //-----------------------------------------------\\
			 //----- process NON-OBJECT element within obj -----\\
			//---------------------------------------------------\\
			else
			{
				if (!format.length) format = [''];							//force one pass . . .
				if (format.some(function EZtoString_forEachFormatOption(fmt)
				{
					switch(fmt)
					{
						case 'attr': 	
						{
							value = obj.getAttribute(key) ;
							break;
						}
						case 'ignoreBlank': 	
						{
							if (!value && value !== 0) return true; 
							break;
						}
						case 'RegExp':
						case 'value':
						{
							break;		//debugger breakpoint
						}
						default:
						{
							//if (EZtoString_skipPrototype(key)) return;	//if not displaying prototype variables
							if (isArray && isArrayElement && !isHTML) 
								EZtoString_appendText(spaces);				//extra indentation for array objects
							value = obj[key];
							break;
						}
					}
				}))
				{
					return false;	// '  ' + 'all values blank'.wrap();		
				}
				value = EZtoString_getValue(value, format) 					//determine non-object value
				if (format == 'RegExp')
				{
					value = spacesPlus + value;
					EZtoString_appendText(value + '\n');
				}
				else
				{
					if (isArray && !isArrayElement && !isNaN(key))
						key = spacesPlus.substr(1) + '[' + key + ']'
					else
						key = spacesPlus + key

					value = (value + '').replace(/\n/gm,'\n'+spacesPlusPlus);	//apply indent to all lines

					//-----------------------------------------------------------------------------
					EZtoString_appendText(key + ': ' + value + '\n');
					//-----------------------------------------------------------------------------
				}
				opts.lastTypeObject = false;
				isEmpty = false;
			}
		}
	
		//-----------------------------------------------------------------------------
		//Done iterating at current level if nothing displayed, indicate why
		//-----------------------------------------------------------------------------
		if (isEmpty && excludeList.length === 0
		&& (!isHTML || showHtmlKeys))	//empty object (must test after function test above)
		{										//don't
			note = formatOpts.indexOf('ignoreBlank') != -1 
				 ? 'all values blank' 
			///	 : ('no elements' + (!showHtmlKeys ? ' shown' : ''));
				 : ('no elements' + (showHtmlKeys === 0 ? ' shown' : ''));
			EZtoString_appendText(spacesPlus + note.wrap() + '\n');
		}
		else 
		{
			// extra indentation for array objects
			//03-23-2016: NO - done later
			//if (isArray) EZtoString_appendText(spaces);
	
			// special values: null, function, empty
			if (obj === null)							//null object
				EZtoString_appendText(spacesPlus + EZ.DOT + 'null' + EZ.DOT + '\n');
	
			/*
			else if (obj.constructor == Function)		//function (just show name and paramters)
			{
				results = obj.toString().match(/function\s*(\w*)\s*\(([^\)]*)\)/);
				if (results)
					EZtoString_appendText(spacesPlus + results[0] + '...\n');
				else									//name not found (should not get here)
					EZtoString_appendText(spacesPlus  + EZ.DOT+ 'unknown function' + EZ.DOT);
				opts.lastTypeObject = false;
			}
			*/
		}
		//===================
		return EZtoString_appendCollapse(depth);
		//===================
		// remove last newline (it gets added by caller)
		//EZdisplayObject.display = EZdisplayObject.display.substring(0,EZdisplayObject.display.length-1);
		//____________________________________________________________________________________
		/*
		*	Return true if not displaying any more nested objects.
		*/
		function EZtoString_overLimit()
		{
			if (opts.objectCount++ < opts.maxobjects) return false;
			
			var msg = opts.maxobjects + ' objects displayed';
			if (opts.maxprompt)
			{
				if (confirm(msg + '\n\nDisplay more?'))
				{
					opts.objectCount = 0;
					return false;
				}
			}
			EZtoString_appendText(spacesPlus + MORE + msg + '\n');
			opts.quit = true;
			return true;
		}
		//____________________________________________________________________________________
		/*
		*	Return true if not displaying prototype functions or variables.
		*	type (optional: Function if checking for Function constructor
		*/
		function EZtoString_skipPrototype(el,type)
		{
			var status = false;
	
			//js error from EZupdateFieldList trace after EZclearlist(...)
			if (!opts.showprototype
			&& obj && el && obj[el]
			&& obj[el].constructor
			&& obj[el].constructor.prototype)
			{
				if (type && type == Function
				&& obj[el].constructor.prototype.constructor == type)
					status = true;
	
				//else if (!type && obj[el].constructor.prototype == el)
				else if (!type
				&& (obj.constructor != Array || isNaN(el))	//added so array[0] displays
				&& obj[el].constructor.prototype == el)
					status = true;
			}
			return status;
		}
		e = EZtoString_skipPrototype;	//suppress JSHINT not used

		//____________________________________________________________________________________
		/*
		*	determine non-object value
		*/
		function EZtoString_getValue(value, format)
		{
			var maxline = '.maxline'.ov(format, opts.maxline);
			
			var type = typeof(value);
			if (type === 'undefined')
				value = EZ.UNDEFINED;
	
			else if (value === '')
				value = EZ.BLANK;
	
			else if (value === null)
				value = EZ.NULL;
	
			else if (value === true)
				value = EZ.TRUE;
	
			else if (value === false)
				value = EZ.FALSE;
	
			else if (typeof(value) == 'number' && isNaN(value))
				value = EZ.NAN;
			
			else if (value instanceof RegExp)
				value = value + (value.lastIndex !== 0 ? ':' + value.lastIndex : '');
			
			else if (type != 'string')
				value += '';	//EZ.EOL;
			
			  //----------------\\
			 //----- String -----\\
			//--------------------\\
			else 
			{
				if (format == 'htmlTag' 
				|| (value.startsWith('<') && value.endsWith('>')))
				{
					value = spaces + value + '\n';
				}
				else if (value.indexOf(MORE) == -1)
				{							//". . . [23]"
					value = EZ.stripConfigPath ? EZ.stripConfigPath(value) : value;
					if (value.length > (opts.maxline + 10))
					{
						value = EZtoString_getValueString(value.substr(0,maxline)) 
							  + MORE
							  + '  [' + value.length + ']';
					}
					else
					{
						value = EZtoString_getValueString(value,format)
							  + (!opts.showstrlength ? ''
							  : '  [' + value.length + ']');
					}
				}
			}
			//----- if legacy type
			if (opts.showtype && !isHTML)
				value = '(' + type + '): ' + value
					  + (typeof(value) == 'string' 
						&& value.indexOf(MORE) == -1 ? ''
					  : EZ.EOL);
			
			return value;
				
		}
		//____________________________________________________________________________________
		/*
		*	display string as: "...", '...' or :...EOL
		*/
		function EZtoString_getValueString(value /*, format*/ )
		{
			//var isValue = EZ.toArray(format, ',').indexOf('value') != -1;
			value = value.replace(/(['"])(.*)\1/gm, function(all)
			{
				return all.replace(/\t/g, '\\t');
			});
			
			if (isHTML)
			{
				return value 
					 + (value.right(3) == '...' ? ''
					 : EZ.EOL);
			}
			var lineCount = value.count('\n');
			if (lineCount > 1)
			{
				value = value.replace(/(\n\s*?)\n/, '$1'+EZ.EOL+'\n');
				return '(String) [' + (lineCount+1) + ' lines]\n' 
					  + value.replace(/\n(?=\n)/g, '\n' + EZ.EOL + '\n') + EZ.EOL;
			}
			
			if (opts.showtype) 
				return value;
			return value.indexOf('"') == -1 ? '"' + value + '"'
				 : value.indexOf("'") == -1 ? "'" + value + "'"
				 : value + EZ.EOL;
		}
		//____________________________________________________________________________________
		/*
		*	Encode html tags when using html formatting
		*/
		function EZtoString_displayEncode(value)
		{
			return value.replace(/</, '&lt;');
		}
	}
	//____________________________________________________________________________________
	/*
	 *	Append text to accumulated formattedText
	*/
	function EZtoString_appendText(text)
	{
		if (!text) return;
		opts.formattedText += text;
		if (!text.trim()) 
			return;
		
		//var log = '_'.dup(50) + opts.dotName + '\n' + opts.formattedText.trim() + '\n' + '='.dup(70);
		//console.clear(); console.log(log);
	}			
	//____________________________________________________________________________________
	/*
	 *	Append collaspe markers before and after each object level (i.e. depth)
	*/
	function EZtoString_appendCollapse(depth, spaces)
	{
		var start = spaces != EZ.undefined;
		spaces = spaces || '';
		if (!opts.htmlformat || !opts.collapse)	
			return EZtoString_appendText(spaces);
		
		if (depth > opts.depth)
		{
			opts.depth = depth;
			EZtoString_appendText('____' + opts.depth + '@ ' + spaces.substr(3));
			return;
		}
		// start object heading but marker not required
		if (start && depth == opts.depth)
			return EZtoString_appendText('***' + spaces);
		
		var minEnd = start ? 0 : 0;
		while (depth <= (opts.depth-minEnd))
		{
			EZtoString_appendText(opts.depth-- + '____@\n')
		}
		return EZtoString_appendText(spaces);
	}
	//________________________________________________________________________________________
	/**
	 *	postFormatting: called after all object properties are formatted . . .
	 *		1. remove #object-id markers
	 *		2. convert ...repeated... markers to link tags if htmlformat
	 *		3. remove colaspe groups markers -- convert to +/- img if htmlformat
	 */
	function EZtoString_postFormatting(opts)
	{
		//----- get formatted text -- cleanup blank lines
		var text = '.formattedText'.ov(opts).trim();

//TODO: may belong on format string ??
text = text.trimPlus(RegExp(EZ.EOL), '');

		var blanklines = text.matchPlus(/^\s*$/mg).length;
		if (blanklines == 1)
			text = text.replace(/\n/, '');	//if only one blank line, remove it
		if (text)
			text += '\n';					//if any text, append newline to end
		
		//------------------------------------
		EZtoString_formatRepeatedObjects();
		//------------------------------------
		
		//----------------------------------------------------------
		EZtoString_formatCollapse();	//colaspe Step 2
		//----------------------------------------------------------
		
		//----- for htmlformat . . .
		if (!opts.collapse_nocleanup)
		{
			text.replace(/\s*?\n*\S/, '')	//remove leading newlines
			text = text.trimRight();		//remove all trailing whitespace
		}		
		if (opts.timestamp)
			text = opts.formattedTime + ' -- ' + text;
		
		if (text)
		{
			if (!opts.htmlformat)	//single trailing newline if not html format
				text += '\n';		
			else					//otherwise wrap with div
			{					
				text = '<pre class="EZtoString"'
					 + (opts.repeatCount || 'expanded collapsed'.indexOf(text) != -1
					 ? ' onclick="EZ.toString.onClick()"' : '')
					 + '>\n' + text + '</pre>';
			}
		}
		
		//----- bail if keep_groups debug setting is true
		if (opts.collapse_keep_groups) 
			return text;					
		
		//----- setup for formatCollapse_prune
		var regexGroup = /(\s)(<span[^>]*?level_(\d*).>...[\s\S]*?(<div>))([\s\S]*?)(<\/div>)(<!-- level_\3 -->)/
		var regexGroupLabels = 'indent,collapseBegToDiv,level,OpenDiv,detail,closeDiv,collaspeEnd';
		var results = (text+'\n').match(/<span[\s\S]*?level_(\d*).>/g);
		var collapseCount = results ? results.length-1 : 1;	//recursion safety
		
		//------------------------------------------------------------------
		text = EZtoString_pruneCollapse(text,0)	//colaspe Step 3
		//------------------------------------------------------------------
		
		//----- cleanup blank lines after prune
		if (!opts.collapse_nocleanup)
		{
			text = text.replace(/^\s*\n/gm, '');
			text = text.replace(/<(\/)?div>\s*\n(\s*)/gm, '\n<$1div>$2');
			text = text.replace(/<(\/)?div>\s*\n(\s*)/gm, '\n<$1div>$2');
			text = text.replace(/\n\s*((<\/div>)*)\n/g, '$1');
			
			text = text.replace(/0____@/gm, '');
			//text = text.replace(/____0@/gm, '');
		}
	
		//========================================================
		return text; 	//return from EZtoString_postFormatting
		//========================================================
		//____________________________________________________________________________________
		/**
		 *	format collapse markers as html for event handler
		 *	
		 *	TODO: EZtoString_formatCollapseRemoveSame()  --  final logic does final logic require ??
		 */
		function EZtoString_formatCollapse()
		{
			/*
			*/ 
			if (opts.collapse_show_markers) return text;
		//	console.clear(); console.log('text: . . .\n' + text.substr(0,666) + ' . . .');
			text = text.trim();
	
			//---------------------------------------------------------------------------------
			//----- convert collapse markers to html
			//---------------------------------------------------------------------------------
			var regex = /____(\d+)@ (<.*?<\/span>)?(\s*)(.*)(\n*)([\s\S]*?)(\1____@)/m;
			while (regex.test(text))
			{						//iterates on single pattern match till none found
				text = text.replace(regex, function(all,level,tags,spaces,heading,blanklines,detail)
				{
					level = (level || 0).toInt();
					
				//	var t = text.substr(0,555) + ' . . .'; 			
				//	console.clear(); console.log(all.substr(0,666) + ' . . .');
					 
					if (!tags)		//if heading plain text, wrap in span
						heading = '<span>' + heading + '</span>';
					
					else			//if heading inside span (repeated), tweak 
					{				
						detail = heading + spaces + detail;
						if (!level)
						{
							/*
							1 level: 0\n
							2 tags: <span class="top" id="EZ_24658369_0">(HTMLDivElement): </span>\n
							3 spaces: \n \n
							4 heading: tagName: DIV\n\n
							5 blanklines: \n \n
							6 detail: 
							parent: <form action="" method="p...\n
							id: EZtest_wrap\n\n
							____1@ style (CSSStyleDeclaration):\n
							*all values blank*\n
							1____@\n
							____1@ <a name="EZ_24658369_2"></a> <span id="EZ_24658369_2" 
							class="repeat EZ_undefined">childNodes (NodeList) [length:7]: repeated x3</span>\n
							  . . .
							
							1 level: 0\n
							2 tags: <span class="top" id="EZ_26980756_0">(HTMLCollection): </span>\n
							3 spaces: \n \n
							4 heading: ____1@ [0] (HTMLLabelElement)\n
							5 blanklines: \n \n
							6 detail:
							tagName: LABEL\n\n
							parent: <eztest_tag id="EZtest_ta...\n
							id: test_id1\n\n
							class: idandclass\n\n
							____2@ style (CSSStyleDeclaration):\n
							*all values blank*\n
							2____@\n
							  . . .
							*/
							if (detail.trim().indexOf(heading.trim()) !== 0)
								detail = spaces + heading + spaces + detail
						}
						else
						{
							if (spaces.right(1) == '\n')
							{										//if spaces ends with newline, it belongs to detail
								/*
								0: ____1@ style (CSSStyleDeclaration):\n *all values blank*\n 1____@\n
								1 level: 1\n
								2 tags: *undefined*
								3 spaces: \n
								4 heading: style (CSSStyleDeclaration):\n
								5 blanklines: \n \n
								6 detail: *all values blank*\n \n
								7: 1____@\n
								*/						
								spaces = spaces.replace(/\s*\n/,'');	//remove leading spaces up to and including newlinw
								detail = spaces + detail;
								spaces = '';
							}
							else
							{
								/*
								1 level: 1\n
								2 tags: <a name="EZ_28173726_2"></a> <span id="EZ_28173726_2" class="repeat EZ_undefined">childNodes (NodeList) [length:7]: repeated x3</span>\n
								3 spaces: \n \n
								4 heading: ____2@ [0] (Text) *blank*\n
								5 blanklines: \n \n
								6 detail:2____@\n
										 ____2@ [1] (HTMLLabelElement)\n
										 tagName: LABEL\n\n
										 parent: <div id="EZtest_wrap">\n\n
										 id: EZtest_input\n\n
										 ____3@ style (CSSStyleDeclaration):\n
										 *all values blank*\n
										 3____@\n
								*/							
								while (spaces.substr(0,1) == '\n') 	//clip spaces newline prefix
									spaces = spaces.substr(1);	
							}
							if (tags.indexOf('<a') != -1) 			//remove spaces between <a...> and <span...>
							{
								spaces = ' '; //spaces.clip();
								tags = tags.replace(/> <span/, '><span');
							}
						}
						heading  = tags;
	
					}
					var html = '';
					if (detail.indexOf('\n') === 0 && level > 0 && !opts.collapse_keep_groups)
					{							// if no detail lines, just keep indented heading if one	
						if (heading.trim())
							html = spaces + '   ' + heading + '\n';	
					}
					else						
					{	
						var className = 'expanded'				//cannot check line counts	
									  + (!level ? ' all'
									  : heading.indexOf('[') == -1 ? ' obj' : '')
									  + ' level_' + level;
							
	
						// wrap heading with collaspe arrow span -- wrap detail in div
						html = spaces + '<span class="' + className + '">' 
							 + (opts.collapse_show_depth ? level : ' ')
							 + '  ' 
							 + heading + '\n</span><div>' + detail.trimRight() 
							 + '</div><!-- level_' + level + ' -->';  		
					}
			//		console.clear(); console.log(html.substr(0,1200) + ' . . .');
					return html;
				});
			}
		}
	
		//____________________________________________________________________________________
		/**
		 *	remove ...repeat... markers (and format for htmlformat if selected)
		 */
		function EZtoString_formatRepeatedObjects()
		{
			var id, className, seqnoDebug, parentSeqno, parentSeqnoDebug;
			
			//----- For 1st occurance of each repeated Object, append repeat count;
			//		if htmlformat, prepend anchor and wrap Object heading with span.
			opts.repeatCount = 0;
			opts.processedObjData.forEach(function(processedObj)
			{	
				if (!processedObj.count) return;	
	
				opts.repeatCount++;
				var parentSeqno = opts.parentSeqno[processedObj.seqno]
				var id = 'EZ_'+ opts.hashTime + '_' + processedObj.seqno;
				var className = 'repeat EZ_' + parentSeqno;
				
				var seqnoDebug = opts.showseqno ? opts.objectDepth[processedObj.seqno] + ')   #' + processedObj.seqno + '# ' : '';
				var parentSeqnoDebug = opts.showseqno ? ' [' + parentSeqno + ']' : '';
	
				// remove #id# marker at start of repeated Object and append repeat count
				var repl = '$2 repeated x' + processedObj.count + parentSeqnoDebug;
	
				if (!opts.htmlformat)		//if not using html just prepend leading spaces
					repl = '$1' + repl;
				else						//otherwise add anchor, spaces & wrap text in span
				{
					repl = '<a name="' + id + '"></a>'
						 + '$1<span id="' + id + '" class="' + className +'">'
						 + seqnoDebug + repl + '</span>';
				}
				var regex = new RegExp('#' + processedObj.seqno + '#' + '(\\s*)(.*)$', 'm');
				text = text.replace(regex, repl);
			});
			//----- Remove #id# markers from all remaining objects headings;
			//		if htmlformat, wrap Object heading with span for styling.
			text = text.replace(/#(.*?)#(\s*)(.*)$/gm, function(all, seqno, space, heading)
			{
				if (all.indexOf('<span') != -1) 
					return all;		//already processed
				
				var useSpan = false;
				if (opts.htmlformat && opts.parentSeqno.indexOf(seqno) != -1)
				{
					useSpan = true;
					id = 'EZ_'+ opts.hashTime + '_' + seqno;
					parentSeqno = opts.parentSeqno[seqno];
					className = 'EZ_' + opts.parentSeqno[seqno];
				}
				else
				 useSpan = false; 
	
				seqnoDebug = opts.showseqno ? opts.objectDepth[seqno] + ')    #' + seqno + '#' : '';
				parentSeqnoDebug = opts.showseqno && parentSeqno ? ' [' + parentSeqno + ']' : '';
				
				return !useSpan 
					 ? space + seqnoDebug + heading		//no span needed
					 : space + '<span id="' + id + '" class="' + className +'">'
					 + seqnoDebug + heading + parentSeqnoDebug + '</span>';
			});
		}
		
		//____________________________________________________________________________________
		/**
		 *	remove empty or short groups -- auto collapse if maxlines reached
		 *
		 *	prune collapse markers by repeatedly and recursively traversing and pruning the 1st 
		 *	collapse group marker inner tree(s) until no more groups markers exist.  After each 
		 *	inner tree may become the 1st group marker processed on next while loop.
		 *
		 *		delete groups with lines <= opts.collaspe.minlines
		 *		TODO: auto collapse groups with lines >= opts.collaspe.maxlines -- DONE??
		 */
		function EZtoString_pruneCollapse(text,level)
		{
			var ourGroup = text.matchPlus(regexGroup, regexGroupLabels);
			var detail = ourGroup.detail || text || '';
			var updatedDetail = '';
			while (true)				//for all collapse groups in ourGroup detail . . .
			{					
				var nextGroup = detail.matchPlus(regexGroup, regexGroupLabels);
				if (!nextGroup.isFound) break;
										
				level = nextGroup.level 
				updatedDetail += detail.substr(0, nextGroup.index);	//detail upto collapsed group found
				detail = detail.substr(nextGroup.lastIndexOf);		//remove all text for found group
				
				var groupText = nextGroup.detail.indexOf('\n') == -1
							  ? nextGroup.detail
							  : EZtoString_pruneCollapse(nextGroup.detail);	//eval group
				updatedDetail += groupText; 						//append updated group text
			
				if (--collapseCount < 0)
					break;
			}
			updatedDetail += detail; 	//detail after last group
						
			// after all inner collapse groups updated, count lines in this group
			var lineCount = (updatedDetail+'\n').match(/\n/g).length - 1;
			if (lineCount < opts.collapseminlines)
			{
				if (!level)			//for level 0 add na class
					ourGroup.collapseBegToDiv = ourGroup.collapseBegToDiv.replace(/\ball\b/, 'all na');
				else
				{														//remove outer arrow span
					var heading = ourGroup.collapseBegToDiv.replace(/<span[^>*]...([\s\S]*)<\/span>/, '$1');
					heading = heading.replace(/<span>()[\s\S]/, '$1');	//remove heading wrapper if added
					return ourGroup.indent + '   ' + heading + updatedDetail;
				}
			}
			if (lineCount > opts.collapsemaxlines)
				ourGroup.collapseBegToDiv = ourGroup.collapseBegToDiv.replace(/\bexpanded\b/, 'collapsed');
			
			return ourGroup.indent + ourGroup.collapseBegToDiv + updatedDetail + ourGroup.closeDiv;
		}
	}	// end of EZtoString_postFormatting
}	//end of EZ.toString()
/*---------------------------------------------------------------------------------------------
display onClick handler -- currently supports repested object links
---------------------------------------------------------------------------------------------*/
EZ.toString.onClick = function EZtoString_onClick(evt)
{
	var el;
	function EZtoString_onClick_collapseDone() 
	{
		el.className = el.className.replace(/collapsing/, 'collapsed');
	}

	evt = evt || window.event;
	el = evt.srcElement;
	switch (el.tagName) 
	{
		case 'SPAN':	//assume repeated link clicked
		{
			//if ('expanded collapsed'.indexOf('.previousElementSibling.className'.ov(el,'-')) != -1)
			//	el = el.previousElementSibling;
			
			//----- Toggle expanded collapsed
			if ('expanded collapsed'.indexOf('.className'.ov(el,'-')) != -1)
			{
				el.className = el.className.replace(/(collapsed|expanded)/, function(all,mode)
				{
					if (mode == 'expanded')	//if collasping, let transition complete
					{
						if (!['webkitTransitionEnd', 'transitionend'].some(function(fn)
						{	//nothing found for chrome
							if (el.style[fn] == EZ.undefined) return false;	//continue somme loop;
							el.style.EZtransitionEnd = fn;
							el.addEventListener(fn, EZtoString_onClick_collapseDone, false);
							return true;
						}))
						/*
						*/
						{
							el.style.EZtransitionEnd = setTimeout(EZtoString_onClick_collapseDone, 1000);
						}
					}
					// change class -- start transition
					return {collapsed:'expanded', expanded:'collapsing'}[mode];
				});
				
			}
			break;
		}
		case 'A':
		{								//get href -- bail if not repeat link
			var href = el.href.match(/#(.*_)(\d*)/, 'hashTime, seqno');
			if (!href) return true;
			
			var hashTime = href[1];
			var seqno = href[2];		//seqno of 1st instance of repeated object
			var isHighlighted = (el.className.indexOf('highlight') != -1) 
			var tags = document.getElementsByClassName('highlight');
			EZ.toArray(tags).forEach(function(el)
			{								//clear all current highlights
				el.className = el.className.replace(/\bhighlight\b/g, '').trim();
			});
			if (!isHighlighted)				//if clicked el was not highlighted?
			{
				el.className += ' highlight';
				while (seqno && (el = document.getElementById('EZ_' + hashTime + seqno)))
				{							
					el.className += ' highlight';
					seqno = '.className'.ov(el,'').matchPlus(/EZ_(\d*)/i)[1];
				}
			}
			return EZ.event.cancel(evt,true);	//cancel bubble and default browser action
		}
		break;
	}
	return true;
}
/*---------------------------------------------------------------------------------------------
 *	setupOptions(opts) -- EZtoString() function -- had issues as internal function
 *	Init persistant display options shared at all recursion levels
---------------------------------------------------------------------------------------------*/
EZ.toString.setupOptions = function EZtoStringSetupOptions(opts, name)	
{	
	//opts = EZ.getOptions(opts);
	
	
	//-----	set overrideable options to specified value or defaults 
	this.name       = name || '';						
	this.depth		= '.indent .depth'.ov(opts, 0).toInt();	
	this.indentsize = '.indentsize'.ov(opts, EZ.getOpt('format.INDENT_SIZE',2));
	this.sortkeys   = '.sortkeys .sort'.ov(opts, true);
	this.htmlformat = '.format .htmlformat'.ov(opts, EZ.getOpt('format.HTML_FORMAT',false));
	if (this.htmlformat.toLowerCase() == 'string')
		this.htmlformat = false;
	
	this.maxline 	= '.maxline'.ov(opts)	|| EZ.getOpt('format.MAXLINE',99);
	this.maxdepth 	= '.maxdepth'.ov(opts)	|| EZ.getOpt('format.OBJECT_DEPTH',9);
	this.maxobjects = '.maxobjects'.ov(opts)|| EZ.getOpt('format.OBJECT_LIMIT',9);
	this.maxitems	= '.maxitems'.ov(opts)	|| EZ.getOpt('format.ITEMS_LIMIT',9);
	this.maxprompt	= '.maxprompt'.ov(opts, false);
	
	this.timestamp 	= '.timestamp'.ov(opts, true);
	
	this.HTML_TEXT_NODE = EZ.getOpt('format.HTML_TEXT_NODE');		// constant
	this.htmlFormatter = '.htmlFormatter'.ov(opts);
	
	this.htmldepth 	= '.html.maxdepth .htmldepth'.ov(opts, EZ.getOpt('format.HTML_DEPTH',9));
	this.htmlmaxline = '.html.maxline .htmlmaxline'.ov(opts, EZ.getOpt('format.HTML_TEXT_MAXLINE',99));
	this.html_keys = EZ.toArray('.html.attributes .html_keys'.ov(opts, EZ.getOpt('format.HTML_KEYS',[])));
	
													//attributes only shown for button or input tags
	this.html_tagtype_keys = '.html_tagtype_keys'.ov(opts, EZ.getOpt('format.HTML_TAGTYPE_KEYS',[]));
	
	
	this.function_linesize  = '.function_linesize'.ov(opts, 50);
	this.function_maxlines  = '.function_maxlines'.ov(opts, 5);
	
	this.showseqno 		= '.showseqno'.ov(opts, false);
	this.showtype 		= '.showtype'.ov(opts, EZ.getOpt('format.SHOW_TYPE',false));
	this.showprototype 	= '.showprototype'.ov(opts, EZ.getOpt('format.SHOW_PROTOTYPE',false));		
	
	this.collapse	      = '.collapse'.ov(opts, false);
	this.collapsedepth	  = '.collapsedepth'.ov(opts, 3).toInt();
	this.collapseminlines = '.collapseminlines'.ov(opts, 5).toInt();
	this.collapsemaxlines = '.collapsemaxlines'.ov(opts, 10).toInt();
	
	// debug options
	this.collapse_show_depth  	= '.collapse_show_depth'.ov(opts, false);
	this.collapse_show_markers	= '.collapse_show_markers'.ov(opts, false);
	this.collapse_keep_groups 	= '.collapse_keep_groups'.ov(opts, false);
	this.collapse_nocleanup 	= '.collapse_nocleanup'.ov(opts, false);
	
	
	
	//----- internal usage mostly associated with recursion
	//		other variables set below on each call
	this.formattedText = '';
	
	/*
	var now = new Date().getTime();
	var today = new Date(EZtoStringdate(now).substr(0,10).replace(/-/g, '/')).getTime();
	this.formattedTime = EZtoStringdate(now,'time')
	*/
	var now = new Date();
	var today = new Date(now.getMonth() + 1 + '/' + now.getDate() + '/' + now.getFullYear());
	this.formattedTime = EZ.formatdate 
					   ? EZ.formatdate(now.getTime(),'time')
					   : (now+'').match(/(\d{2}:\d{2}:\d{2})/)[1];	
	this.hashTime = !this.htmlformat ? ''
				  : parseInt((now.getTime()-today.getTime()));	//now in minutes
	
	//this.exclude		= EZ.toArray(opts.exclude);
	this.exclude = EZ.toArray(opts.exclude, ', ');
	this.include = EZ.toArray(opts.include, ', ');
	this.ignore = EZ.toArray(opts.ignore, ', ');
	this.dotNamePlus = new EZ.dotName(name);
	this.dotNamePlus.setOptions(this);

	this.dotName = this.name;						
	this.objectCount = 0;
	this.lastTypeObject = false;
	this.first = true;
	this.firstObject = true;
	
	this.indentSpaces = '   ';
	
	this.processedObjects = [];
	this.processedObjData = [];
	this.parentSeqno = [];
	this.objectChildNodes = [];
	this.objectDepth = [];
	this.objectSeqno = 0;
	this.htmlBreak = []
	this.quit = false;
}

/*---------------------------------------------------------------------------------------------
---------------------------------------------------------------------------------------------*/
//if (EZ && EZ.global && EZ.global.setup) EZ.global.setup('EZ', 'EZtoString');
