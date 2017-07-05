/*--------------------------------------------------------------------------------------------------
LINT options -- function below not called
--------------------------------------------------------------------------------------------------*/
/*global EZ, e:true */

var e;
(function jshint_globals_not_used() {	//global variables and functions defined but not used
e = [e]
});

EZ.json.INVALID_KEYS = 'default null undefined true false NaN'.split(/\s+/);
//EZ.stringify: 44, 45, 50, 53
EZ.json.options = {};
EZ.json.options.SPACES = 4;

//define default value as true if implicity enabled when all or script=true
//otherwise define as false if option must be explicitly specified
//options with numeric values set to 0 if -*all option specified
EZ.json.options.KEYS = false;			//=true to quote all Object keys else only numeric...
EZ.json.options.NAN = true;
EZ.json.options.INFINITY = true;
EZ.json.options.UNDEFINED = true;
EZ.json.options.REGEXP = true;
EZ.json.options.ARRAYKEYS = true;
EZ.json.options.ARRAYITEMSPERLINE = 10;
EZ.json.options.ARRAYMAXLINELENGTH = 80;
EZ.json.options.CIRCULAR = false;
EZ.json.options.REPEAT = false;
EZ.json.options.FUNCTIONKEYS = true;
EZ.json.options.FUNCTIONSCRIPT = false;
EZ.json.options.FUNCTIONTYPE = false;	//retain typeof function when FUNCTIONSCRIPT=false
										//not sure of value
EZ.json.options.NAME = '';
EZ.json.options.ROOT = '';
EZ.json.options.SCRIPT = false;
EZ.json.options.ALL = false;
/*---------------------------------------------------------------------------------------------
Diagnostic and research tool
---------------------------------------------------------------------------------------------*/
EZ.json.nodeLogger = function nodeLogger(key, value)
{
	var log = EZ.json.log = EZ.json.log || [];
	log.push(
		'key=' + JSON.stringify(key).replace(/"/g,'')
		+ '\t\t' +
		'value=' + JSON.stringify(value) + '\n\t\t' +
		JSON.stringify(this).replace(/"/g,'') // parent
	);
	return value;
}
/*---------------------------------------------------------------------------------------------
EZ.json.stringify(value, replacer, spaces)

DESCRIPTION:

	-----------------------------
	Support following data types:
	-----------------------------

		NaN, Infinity, undefined, RegExp
		function (both script and enumerable properties)
		non-alphanumeric Array properties
		partial support for html Objects

		json format options specify if and how above additional data types
		are represented by json

		native JSON.stringify()	ignores or does not  exactly reprentsent
		these type e.g. NaN formatted as null

	----------------------------
	Additional replacer options:
	----------------------------

		allowes multiple replacer functions
		blacklist of properties in addition to native whitelist

	----------------------------------
	Optional readibility improvements:
	----------------------------------

		individual Array items not intented -- formatted together on same line
		(space added after comma separating items)

		Multiline Strings formatted on multiple un-indented lines

		Object property / keys only enclosed in quotes for invalid varible names
		e.g. "*note" "*%$?"

	-------------------
	Other Enhancements:
	-------------------
		Objects repeated or with circular references are only formatted once

________________________________________________________________________________________

ARGUMENTS:		same as JSON.stringify plus . . .

	value		(required) Array, Object or value to stringify

	replacer	(Function) same as native JSON.stringify()
					specifies single REPLACER FUNCTION -- see below

				(Array) same as native JSON.stringify() plus enhacements described below
					An array of String and Number objects that serve as a whitelist for
					selecting the properties of the value object to be included in the
					JSON string. If this value is null or not specified all properties
					of the object are included in the resulting JSON striing.

				(String) space delimited EZ.json.stringify() json format options described below
					of the following form:

						"NaN=true undefined=false arrayItemsPerLine=10 include=id,name"

				(Object) One or more EZ.json.stringify() json format options provided as key/value
					of the following EZ.json.stringify() options as described below:

			----------------------
			OBJECT PROPERTY NAMES:
			----------------------
			+ option string prefix: include
			- option string prefix: exclude:			
			* NOT option string prefix: extract propertt

				When any property name is specified, Object properties are formatted or ignored
				based on the following rules:
***
					no prefix only format specified names (whitelist) native JSON.stringify()
					+ prefix always format property name in addition to whitelist names
					- prefix do not format property name (blacklist) most precendence


			-------------------
			REPLACER FUNCTIONS:
			-------------------

				One or more functions called for each value, Array, Object or Function before
				creating json. Each function called with the following arguments:

					key		property name or Array index of value -- blank for the root value
							specified as 1st argument to EZ.json.stringify()

					value	root value or Object property value -- may be nested Object

				this is the Object containing value i.e. this[key] === value

				returned value is passed to the next replacer function or formatted as json


			--------------------
			JSON FORMAT OPTIONS:
			--------------------

				The following case-insensitive format options enable functionality if prefixed
				with "+" or have no prefix -or- disabled if prefixed with "-"; options shown
				with numeric values below are set to either specified value, zero if no value
				specified and prefixed with minus "-" or default value for "+" prefix.

				DEFAULTS: options shown with numeric values default to the value shown
						  all other options except *root and *script default to true if
						  *script enabled (true) or false if *script not enabled (false)
						  default for *script is false and *root must explicitly specified.

				*all					enabled or disabled all options e.g. "*all" or "-*all"
										specific option(s) following take precedence

				*NaN					format as: NaN
										if not specified formatted as: null

				*Infinity				format as: Infinity or -Infinity
										if not specified formatted as: null

				*undefined				format as: undefined
										if not specified formatted as: null

				*RegExp					format regular expressions as: /.../gim
										if not specified formatted as: {}

				*html					format all attributes and non-false properties in addition
										to any OBJECT PROPERTY NAMES specified

				*arrayKeys				named Array properties included by either embedding bit
										of javascript if script option specified or by adding an
										additional pseudo Array item with new Object containing
										the named properties.

				*arrayItemsPerLine=10	number of Array items shown on single line
										value of 0, uses separate line for every item

				*arrayMaxLineLength=80 	maximum number of characters before using newline
										for Array items not an Object, Array or multiline
										String (always formatted on separate lines)
										value of 0, uses separate line for every item

				*functionKeys			=true include enumerable function properties including
										nested function and object properties formatted as
										Object json if script option otherwise bit of javascript
										embedded to recreate function Object type

										=false enumerable properties ignored formats as: {}


				*functionScript			=true include full function script either as pseudo
										pseudo Object property ____function____  or with bit of
										embedded javascript to create function when json parsed
										if script option specified

				*functionType			=true adds ____function____ property to Object json for
										functions when *functionScript not enabled so function
										is created by EZ.parse() -or- eval() if *script enabled

				*root={objName}			Specifies a root object variable name if specified,
				*name						prepended to returned json e.g.
											objName = "...json..."

				*script or *			=true
										creates pseudo json using embedded javascript to represent
										some values such as function script or named Array properties

											parsible with EZ.parse() or eval()
											valid inside script tags or js file
											fully recreates all Array, Function and standard Objects
											and enumerable properties (e.g. not html elements)

										alphanumeric Object property names are not quoted e.g.
											{name:"Brenda", age:29, "*note":"tall", "null":false}

										multi line Strings formatted on separate lines: e.g.
											""
											+ "John Tyler \"III\", President"
											+ "Key Largo, FL 80209"

										=false
										pure json created: function script, named Array properties,
										NaN, Infinity and undefined values formatted as pseudo
										property or String as described by each option

										All Object keys quoted -- multiline Strings use "\\n"

	spaces		If omitted and replacer argument is a number, its interpreted as spaces
	
				11-01-2016 EXPERIMENTAL: =0 to compress Array/Object values as follows:
											[1,2] not [1, 2] and {a:1} not {a: 1}

				Specifies number of spaces to indent (up to 10) for each level of nested
				Array or Object -or- specified a String (up to 10 characters) repeated
				by indent level and prepended to beginning of each indented line:
				e.g. spaces = "." -->
					{
					."name": "Jim Cowart",
					."location": {
					.."city": {
					..."name": "Chattanooga",
					..}
					.}
					}

				Intentation is required therefore numbers less than 1 or empty String
				use default: 4 spaces
TODO:
	support replacer function
	expand support of html objects
	support no indent ??

REFERRENCE: nice JSON doc
	http://speakingjs.com/es5/ch22.html
---------------------------------------------------------------------------------------------*/
EZ.json.stringify = function EZstringify(value, replacer, spaces)
{
	if (value == null) return '"' + value + '"';
	try
	{
		//----- if replacer argument omited, use as spaces argument
		if (arguments.length == 2 && typeof(replacer) == 'number')
		{
			spaces = replacer;
			replacer = null;
		}

		//----- define global varibles
		var options = replacer,
			include = [],				//properties included in addition to extract list
			exclude = [],				//properties ignored -- include has precedence
			extract = [],				//only extract these properties unless included
			nestedKeys = ['$'],			//nested key name -- not used but retained for future
			objectKeys = typeof(value) == 'object' ? [Object.keys(value)] : [],
			objectStack = [null],
			processedObj = [],
			processedKey = [],
			repeatedObj = [],
			replacerFunctions = [],
			pad, padding,
		//	errorObj,
		//	topKeys = [],
		//	topValue = value,
										//escape codes
			QUOTE = '@@~@@',
			QUOTE_EMBEDDED = '@@!@@',
			EOL = '@@eol@@',
			NEWLINE = '@@EOL@@',
			BACKSLASH = '@@/@@',
			NAN = '@@NaN@@',
		//	TAB = '@@tab@@',
			REGEXP = '@@RegExp@@',
			UNDEFINED = '@@undefined@@',
			INFINITY_PLUS = '@@Infinity@@',
			INFINITY_NEG = '@@-Infinity@@',
			PREFIX = '@@=@',
			SUFFIX = '@=@@',
			WRAPPER = RegExp('("' + PREFIX + '|' + SUFFIX + '")', 'g');	//("@@=@|@=@@")

		if (this != EZ.json.stringify)		//process arguments and create options
			jsonFormatOptions();

void(0) 
if (EZ.quit) return '"quit"';

		pad = isNaN(options.SPACES) ? options.SPACES
			: '          '.substr(0,options.SPACES)
		pad = pad.substr(0,10);
		padding = '\n' + pad;
		
		/*
		//-----	if object is circular, returns Object of the form: 
		//		{"Object.keys()": "id, name ...", "TypeError": "Converting circular structure to JSON"}
		if (!options.CIRCULAR && (errorObj = EZ.isObjectCircular(value)))
		{
			value = errorObj;
			jsonReplacer = null;
		}
		*/
		//-------------------------------------------------------------
		var json = JSON.stringify(value, jsonReplacer, options.SPACES);
		//-------------------------------------------------------------
		if (json != EZ.undefined)
			json = json.replace(WRAPPER, '');	//remove outer quotes

		if (this == EZ.json.stringify)	//internal call from jsonReplacer()
			return json;

		//=======================
		return jsonFinalize(json);
		//========================
	}
	catch (e)
	{
		var errorObj = { 
			message: 'EZ.stringify failed',
			options: replacer,
			'Object.keys()': Object.keys(value).join(', ') 
		}
		errorObj[e.constructor.name] = e.message;
		errorObj.stackTrace = e.stackTrace().toString().split('\n');
		
		EZ.techSupport(e, arguments, this);	//capture
		
		json = JSON.stringify(errorObj, null, options.SPACES);
		return json;
	}
	//______________________________________________________________________________
	/**
	 *	finalize -- convert or remove escape codes from final json
	 */
	function jsonFinalize(json)
	{
		options.ROOT = options.ROOT = options.NAME
		if (options.ROOT)
			json = options.ROOT + ' = ' + (json || '""');
		else if (json === undefined)
			return '';

		json = json.replace(RegExp(QUOTE, 'g'), '"');

		// must follow un-escape QUOTE to remove nested outer quotes
		json = json.replace(WRAPPER, '');

		json = json.replace(RegExp(NEWLINE, 'g'), '\n');	//NEWLINE --> \n
		json = json.replace(RegExp(EOL, 'g'), '\\n');		//    EOL --> \\n
		json = json.replace(RegExp(BACKSLASH, 'g'), '\\');	//BACKSLASH --> \

		json = json.replace(RegExp('"' + UNDEFINED + '"','g'), 'undefined');
		json = json.replace(RegExp('"' + REGEXP + '(.*)"','g'), function(all,regex)
		{
			return '/' + regex.replace(/\\\\/g, '\\')		//do not need backslash
		});													//escaped for pattern

		json = json.replace(RegExp(QUOTE_EMBEDDED ,'g'), '\\"');

		json = json.replace(/\\t/g, '\t');					//	\\t --> \t

		// NAN, UNDEFINED, INFINITY_PLUS, INFINITY_NEG
		json = json.replace(/"@@(.*?)@@"/g , '$1');
		//json = json.replace(RegExp('"(@@' + NAN + '"','g'), 'NaN');

		//----- un-quote Object keys when valid variable name i.e. alphaumeric
		//	json = EZ.json.unquoteKeys(json);
		//if (options.SCRIPT && !options.KEYS)
		if (!options.KEYS)
		{
			//                 (/([{,]\s*)"([\w_]+?)"        :/gi
			json = json.replace(/([{,]\s*)"([A-Z_$][\w_$]*?)":/gi,
			function(all, sep, key)
			{
				if ('null undefined'.indexOf(key) != -1) return all;
				return sep + key + ":"
			});
		}
		
		return json;
	}
	//______________________________________________________________________________
	/**
	 *	escape embedded newlines, quotes and backslashes from json String so they
	 *	do not get escaped upon return to native JSON.stringify() from jsonReplacer()
	 */
	function jsonEscape(json, wrap)
	{
		if (wrap)							//wrap with escape codes to discard...
			json = PREFIX + json + SUFFIX;	//...outer quotes wrapped upon return

		if (typeof(json) != 'string')
			return json;

		json = json.replace(/"/g, QUOTE);
		json = json.replace(/\n/g, NEWLINE);
		json = json.replace(/\\/g, BACKSLASH);
		return json;
	}
	//______________________________________________________________________________
	/**
	 *	JSON replacer: WORKHORSE for extended json suporrted for EZ.json.stringify()
	 *
	 *	First calls any replacers specified as EZ.json.stringify() replacer arguments
	 *
	 *	Then process NaN, undefined, multiline String, Array, Function or RegExp
	 *	based on EZ.json.stringify() options.
	 */
	function jsonReplacer(key, value)
	{
		/*
		var replacers = replacerFunctions.slice();
		while (replacer.length)
		{								//TODO: not tested
			value = replacers.shift.call(this, key, value, options.SPACES);
		}
		*/

		  //---------------------------------------------------------------------------\\
		 //----- do EZ.json.stringify() replacements after specified replacer functions -----\\
		//-------------------------------------------------------------------------------\\
		var idx, isArray, json, padHere, pre, script,
			obj = {},
			json = '';

		switch (getType(value))
		{
			case 'Null':				//------------------------------------
			case 'Boolean':				// null, boolean -- return value as-is
				return value;			//------------------------------------

			case 'Array':				//------------------------------------------------
			case 'Object':				// Array, Object -- processed by code after switch
				break;					//------------------------------------------------

										//----------------------------------------------
			case 'Undefined': 			// undefined -- return escaped String if enabled
			{							//----------------------------------------------
				return options.UNDEFINED ? UNDEFINED
										 : value;	//value as-is if not enabled
			}
										//--------------------------------------------------
			case 'Number':				// NaN, Infinity -- return escaped String if enabled
			{							//---------------------------------------------------
				return isNaN(value) && options.NAN  ? NAN
					 : value === Infinity ? (options.INFINITY ? INFINITY_PLUS : null)
					 : value === -Infinity ? (options.INFINITY ? INFINITY_NEG : null)
					 : value;
			}
										//-----------------------------------------------
			case 'Element':				// html element -- extract or EZ.format.Element()
			{							//-----------------------------------------------
				if (extract.length)
					break;
					
				else if (!EZ.format || true)
				{
					value = _json_htmlExtract(value);
					break;
				}
				else if (EZ.format)
				{
					value = EZ.format.Element(value, options.htmlFormatter);
					if (typeof(value) != 'string')
						break;
				}
										/* jshint ignore:start*/	//FALL-thru
			}
										//-----------------------------------------------------
			case 'String':				// multiline String -- separate lines if SCRIPT enabled
			{							//-----------------------------------------------------
										/* jshint ignore:end */
				value = value.replace(/"/g, QUOTE_EMBEDDED);
				if (options.SCRIPT && value.indexOf('\n') != -1)
				{							//breakup into multiple lines

					padHere = (objectStack.length > 1) ? padding : '\n';
					value = QUOTE + padHere + '+ ' + QUOTE
						  + value.replace(/\n/g, EOL + QUOTE + padHere + '+ ' + QUOTE)
				}
				else
					value = value.replace(/\n/g, EOL);
				value = jsonEscape(value);
				return value;
			}
										//-------------------------------------------
			case 'RegExp':				// RegExp -- return escaped String if enabled
			{							//-------------------------------------------
				if (options.REGEXP)
				{
					value = REGEXP
						  + value.source + '/'
						  + (value.global ? 'g' : '')
						  + (value.ignoreCase ? 'i' : '')
						  + (value.multiline ? 'm' : '')
					return jsonEscape(value);
				}
				return value;
			}

			/* jshint ignore:start*/	//FALL-thru
			case 'Function':
			/* jshint ignore:end */
			default:
			{
				switch (typeof value)
				{						//----------------------------------------
					case 'function':	// Function constructor or typeof function
					{					//----------------------------------------
						if (!options.FUNCTIONKEYS && !options.FUNCTIONSCRIPT && !options.FUNCTIONTYPE)
						{								//if typeof function not enabled...
							return {};					//...return empty Object
						}
						script = untab(value+'');
						if (options.FUNCTIONSCRIPT)
							void(0);
						else if (options.FUNCTIONTYPE)	//empty script if keeping typeof function
							script = 'function() {}';
						else
							script = '';

						if (options.SCRIPT)				//if SCRIPT format . . .
						{
							if (options.FUNCTIONKEYS)
							{							//copy enumerable properties if any
								Object.keys(value).forEach(function(key) {obj[key] = value[key]});
								json = EZ.json.stringify.call(EZ.json.stringify, obj, options);
								if (json == '{}')
									json = '';
							}
							if (!json)
							{							//if no properties...
								if (!options.FUNCTIONSCRIPT && !options.FUNCTIONTYPE)
									return {};			//...return empty object if NOT keeping script
								json = script;			//...if keeping, return function declaration json
							}
							else						//if properties, use closure function with bit of
							{							//javascript so json parses as typeof function
								pre = '(function()\n'
									+ '{';

								if (script)
									script = padding + 'var ____function____ = ' + script + ';';

								if (json)
									json = 'var ____properties____ = '
										+ indent(json) + ';\n'
										+ pad + 'for (var key in ____properties____)\n'
										+ pad + '{____function____[key] = ____properties____[key];\n'

								json += pad + 'return ____function____;\n'
									  + '})()'

								if (objectStack.length > 1)
								{
									pre = indent(pre);
									json = indent(json);
								}
								json = pre + script + padding + json;
							}
							return jsonEscape(json,true);
						}
						else	//otherwise clone as Object to stringify enumerable properties
						{
							if (script)						//if script...
							{								//add '____function____' property
								key = '____function____';	//for all script from toString()
								obj[key] = script.replace(/\n/g, EOL);
							}
							if (options.FUNCTIONKEYS)		//keep enumerable properties if enabled
							{
								Object.keys(value).forEach(function(key)
								{
									if (value.hasOwnProperty(key))
										obj[key] = value[key];
								});
							}
							value = obj;					//set value to cloned Object
							break;							//then stringify as Object
						}
					}
											//-------------------------------------------
					/* jshint ignore:start*/	//FALL-thru
					case 'object':			// Object not created with Object constructor
					/* jshint ignore:end */
					{						//-------------------------------------------
						//TODO: html object incomplete -- see work in EZ.toString()

						// for HTML object, clone as standard Object with all attributes
						// and acessible properties if replacer argument does not exclude
						if (options.HTML && value.constructor.name.substr(0,4) == 'HTML')
						{
							[].forEach.call(value.attributes,function(key)
							{								//for all attributes . . .
								obj.attributes = obj.attributes || {};
								obj.attributes[key.name] = key.value;
							});
							obj.attributes = jsonExtractFilter(obj.attributes);
							/* jshint ignore:start*/
							if (value.__proto__ != EZ.undefined)
							{								//for all acessible properties
								value = jsonExtractFilter(value.__proto__);
								Object.keys(value).forEach(function(key)
								{
									var e;
									try
									{						//TODO: keep if not circular
										if (!value[key] instanceof Object)
											return;
										if (!(key in obj)) 	//if not already added e.g. attributes
											obj[key] = value[key];
									}
									catch(e)
									{
										void(0);
									}
								});
							}
							/* jshint ignore:end */
							value = obj;	//stringify cloned obj
						}
						break;				//break to complete object processing
					}
											//-------------------------------------------
					/* jshint ignore:start*/	//FALL-thru
					default: 				// process value as-is for any other types
					/* jshint ignore:end */
						return value;		//-------------------------------------------
				}
			}
		}

		  //------------------------------------\\
		 //----- Array or Object processing -----\\
		//----------------------------------------\\
		isArray = getType(value) == 'Array';
		if (value == objectStack[0])
			return value;						//currently processing Object

		if (!isArray)
		{
			value = jsonExtractFilter(value, key);
			if (value === undefined)
				return value;
		}

		//-----
		if (!key)
		{
			if (this[key] == value)
				key = nestedKeys.pop();
			else
			{
				var obj = objectStack[0];
				if (!obj)
					key = '$';
				else
				{
					objectKeys[0].every(function(p,idx)
					{
						if (obj[p] != value) return true;
						key = p;
						objectKeys[0].splice(idx,1);
					});
				}
			}
		}
		if (this[key] != value)
			void(0);							//debugger breakpoint

		objectStack.unshift(value);				//push Object onto process stack
		objectKeys.unshift(Object.keys(value));
		nestedKeys.push(key);

		if (!isArray)
		{
			json = jsonValue(value);
			if (objectStack.length > 2)
				json = indent(json);
		}

		//_______________________________________________________________________________
		/**
		 *	return dotName from nestedKeys
		 */
		function getDotName()
		{
			return nestedKeys.join('.').replace(/\.\[/g, '[');
		}

		//_______________________________________________________________________________
		/**
		 *	Get json for value if object already processed return the following String:
		 *
		 *		"{$.results.args[0]=$.results.arguments[0]}"
		 *
		 *	where:
		 *		$.results.args[0] is dotName of property from root
		 *		$.results..arguments[0] refers to Object already Strinified
		 *
		 *	The placeholders will be replaced in final json returned by EZ.json.stringify()
		 *	if not circular references such as {obj: {o:obj}}
		 *
		 *	If SCRIPT option is specified JavaScript similar to the following is used
		 *	when circular references are found:
		 *
		 *		(function()
		 *		{
		 *			$ = "json ...";
		 *			$.results.args[0]={$.results.arguments[0];
		 *				. . .
		 *			return $;
		 *		})();
		 */
		function jsonValue(value, idx)
		{
			//__________________________________________________________________________
			/**
			 *
			 */
			function getClone(obj)
			{
				var clone = {};
				Object.keys(obj).forEach(function(key)
				{
					var value = obj[key];
					if (value instanceof Object)
					{
						var idx = processedObj.indexOf(value);
						if (idx != -1)
						{
							repeatedObj.push(getDotName());
							value = '"{' + getDotName() + '=' + processedKey[idx] + '}"';
						}
						else value = getClone(obj);
					}
					clone[key] = value;
				});
				return clone;
			}
			//__________________________________________________________________________

			if (value instanceof Object && options.CIRCULAR && isCircularObject(value))
			{
				void(0);
				//var value = getClone(value);
			}
			/*
			if (options.CIRCULAR && value instanceof Object)
			{
				var idx = processedObj.indexOf(value);
				if (idx != -1)
				{
					repeatedObj.push(getDotName());
					return '"{' + getDotName() + '=' + processedKey[idx] + '}"';
				}
			}
			*/
			if (idx != null)
				nestedKeys.push(key);

			else if (typeof(value) == 'object')
			{
				var idx = processedObj.indexOf(value);
				if (idx != -1)
				{
					value = getClone(value);
				}
				processedObj.push(value);
				processedKey.push( getDotName() );
			}
			var sp = spaces === 0 ? 0 : options.SPACES;		//11-01-2016
			//var sp = options.SPACES;						//	 ''
			var	json = JSON.stringify.call(EZ.json.stringify, value, jsonReplacer, sp);

			if (idx != null)
				nestedKeys.pop();

			if (json !== undefined)
				json = json.replace(WRAPPER, '');

			//==========
			return json;
			//==========
			/**
			 *
			 */
			function isCircularObject(obj)
			{
				if (obj instanceof Object)
				{
					try
					{
						JSON.stringify(obj);
						return false;
					}
					catch (e)
					{
						return /circular/i.test(e.message);
					}
				}
				return false;
			}
		}

		  //-------------------------------\\
		 //----- create json for Array -----\\
		//-----------------------------------\\
		if (isArray)
		{
			var delim = '',
				useSepLine,
				itemCount = 0,
				needIndent = false,
				jsonForItem = '',
				jsonForLine = '',
				jsonForItems = '',
				jsonForKeys = '',
				properties = null;

			// Create new Object() for any non-numeric enumerable Array properties
			if (options.ARRAYKEYS)
			{
				Object.keys(value).forEach(function(key)
				{
					if (!isNaN(key) || !value.hasOwnProperty(key)) return;
					properties = properties || {};
					properties[key] = value[key];
				});

				if (properties && !options.SCRIPT)	//named Array properties found AND
				{									//not script format, clone Array items
					value = value.slice();			//then add pseudo item for properties
					value.push({"____properties____": properties});
				}
			}
			//--------------------------
			// for each Array item . . .
			//--------------------------
			for (idx=0; idx<value.length; idx++)	//TODO: why not EZ.json.stringify() ??
			{										//get deep json for each item
				var item = value[idx];
				var jsonForItem = jsonValue(item, idx);
				if (jsonForItem === undefined)
					continue;

				if (typeof(item) != 'object' 		//probably not used
				&& jsonForItem.indexOf('{') === 0)	//remove spaces and newlines
					jsonForItem = jsonForItem.replace(/\s/g, '');

				if (idx == (value.length-1) && properties && jsonForItem == '{}')
					continue;						//no named properties extracted

				useSepLine = false;
				jsonForLine += delim + jsonForItem;

				if (typeof(item) == 'string'
				&& jsonForItem.indexOf('"' + QUOTE + NEWLINE) === 0)
				{
					useSepLine = true;				//separate lines for multiline String
					json += delim
					delim = '';
				}
				if (item instanceof Object && !/(String|Number|Boolean)/.test(getType(item)))
				{
					useSepLine = true;				//separate line for Object json
					if (item.constructor == Array)
						jsonForItem = jsonForItem.replace(/\n/g, padding);
				}
				else if (jsonForItem.length > options.ARRAYMAXLINELENGTH)
				{									//TODO: split into multiple lines??
					useSepLine = true;				//separate line for long String
				}
				else if (itemCount >= options.ARRAYITEMSPERLINE
				|| jsonForItem.length > options.ARRAYMAXLINELENGTH)
				{									//start newline after too many items
					json += delim.replace(/ /, '\n')
					delim = '';
					itemCount = 0;
					jsonForLine = jsonForItem;
					needIndent = true;
				}
				if (useSepLine)
				{									//start newline
					json += delim.replace(/ /, '\n') + jsonForItem;
					delim = ',\n';
					itemCount = 0;
					needIndent = true;
					jsonForLine = '';
				}
				else								//append to current line
				{
					json += delim + jsonForItem;
				//	delim = ', ';					//11-01-2016
					delim = ',' + (spaces === 0 ? '' : ' ');
					itemCount++;
				}
			}
			//-----------------------------------------------------------
			// all Array items processed -- indent and/or wrap with [...]
			//-----------------------------------------------------------
			jsonForItems = json;

			padHere = '';
 			if (needIndent)			//indent Array ITEMS
			{
				json = padding + json.replace(/\n/g, padding);
				if (typeof objectStack[1] == 'object' && objectStack.length > 2)
					json = indent(json, true);
				else if (key)
					padHere = padding;
				else
					padHere = '\n';
			}
			json = '[' + json + padHere + ']';

			//----------------------------------------
			// SCRIPT format of named Array properties
			//----------------------------------------
			while (properties && options.SCRIPT)
			{
				jsonForKeys = EZ.json.stringify.call(EZ.json.stringify, properties, options);
				if (jsonForKeys == '{}') break;

				// encapulate Array json in closure function with named property
				// json and bit of javascript to restore values when json parsed
				json = ''
					 + '(function()\n'
					 + '{' + padding

					 + 'var ____array____ = ['
					 + padding
					 + indent(pad+jsonForItems)
					 + padding
					 + '];' + padding

					 + 'var ____properties____ = ' + indent(jsonForKeys) + ';\n'

					 + pad + 'Object.keys(____properties____).forEach(function(key)\n'
					 + pad + '{____array____[key] = ____properties____[key]});\n'
					 + pad + 'return ____array____;\n'
					 + '})()'
				if (objectStack.length > 2)
					json = indent(json);
				break;
			}
		}
		  //-----------------------------------------------------\\
		 //----- return escaped String as value to stringify -----\\
		//---------------------------------------------------------\\
		obj = objectStack.shift();
		objectKeys.shift();
		nestedKeys.pop();
		//============================
		return jsonEscape(json, true);
		//============================

		//______________________________________________________________________________
		/**
		 *
		 */
		function untab(all)
		{
			return all;
			/*TODO:
			all = all.replace(/(['"])(.*)\1/gm, function(all)
			{
				return all.replace(/\t/g, '##tab##')
			});
			all = all.replace(/\t/gm, '    ');
			all = all.replace(/##tab##/gm, '\t');
			return all;
			*/
		}
		//______________________________________________________________________________
		/**
		 *
		 */
		function indent(json, more)
		{
			var regex = RegExp('(' + NEWLINE + ')', 'g');
			json = json.replace(regex, '$1' + padding.substr(1));
			json = json.replace(/\n/g, padding) + (more ? padding : '');
			return json;
		}
		//______________________________________________________________________________
		/**
		 *	use options.include, options.exclude, options.extract to limit or expand
		 *	Object properties stringified.
		 */
		function jsonExtractFilter(value)
		{
			var includeKeys = [];
			var excludeKeys = [];
			if (extract.length > 0 || exclude.length > 0)
			{								//if extracted keys specified
				for (var key in value)			//for enumerated keys...
				{
					if (key.substr(0,4) == '____' && key.substr(-4) == '____')
					{
						if (exclude.indexOf(key) != -1)
							excludeKeys.push(key);	//...explicit omit
					}
					else if (include.indexOf(key) != -1)
						includeKeys.push(key);		//...explicit keep

					else if (exclude.indexOf(key) != -1)
						excludeKeys.push(key);		//...explicit omit

					else if (extract.indexOf(key) == -1
					&& extract.length > 0)
						excludeKeys.push(key);		//...implicit omit
				}
			}
			extract.concat(include).forEach(function(key)
			{									//for all specified keys...
				if (!(key in value)					//not enumerable
				&& typeof value[idx] != EZ.undefined) 	//but exists
					includeKeys.push(key);			//...add
			});

			if (!includeKeys.length && !excludeKeys.length)
				return value;				//bail if value good "as is"

			var extactKeys = Object.keys(value);
			excludeKeys.forEach(function(key)
			{								//remove excluded from enumerated
				var idxKey = extactKeys.indexOf(key);
				if (idxKey != -1 && includeKeys.indexOf(key) == -1)
					extactKeys.splice(idxKey,1);
			})

			var isEmpty = true, clone = {};
			extactKeys.concat(includeKeys).forEach(function(key)
			{								//clone value from enumerated list
				try							//plus included keys
				{
					clone[key] = value[key];
					if (key != '____properties____')
						isEmpty = false;
				}
				catch(e)
				{
					void(0);
				}
			});
			return !isEmpty ? clone 		//return clone if not empty
							: undefined;	//otherwise, return undefined
		}
	}
	
	//______________________________________________________________________________________
	/**
	 *	extract html element default properties -- avoids circular
	 */
	function _json_htmlExtract(value)
	{
		var extract = 'tagName id name type className'.split(/\s+/);
		var json = JSON.stringify(value, extract);
		return JSON.parse(json);
	}
	//______________________________________________________________________________
	/**
	 *	setup global varibles including options based on EZ.json.stringify() arguments.
	 *	returns options Object.
	 */
	function jsonFormatOptions(/* key, value */)
	{
		options = {};
		options.SPACES = (spaces || options.SPACES);

		  //----------------------------------------------\\
		 //----- process replacer specified as object -----\\
		//--------------------------------------------------\\
		if (getType(replacer) == 'Object')
		{
			var optionsString = '';
			Object.keys(replacer).forEach(function(key)
			{								//add directly to options
				if (/(include|exclude|extract)/.test(key))
					options[key] = EZ.toArray(replacer[key], ', ');

				else if (!replacer[key])	//add key to string
					optionsString += ' *' + key;

				else						//add key=value to string
					optionsString += ' *' + key + '=' + replacer[key];
			});
			replacer = optionsString.trim();
		}
		  //----------------------------------------------------------------\\
		 //----- process replacer argument as String, Array or Function -----\\
		//--------------------------------------------------------------------\\
		switch (getType(replacer))
		{
			case 'Function':
				replacerFunctions = [replacer];

			/* jshint ignore:start*/	//FALL-thru
			case 'String':						//convert comma/space delimited String to Array
			/* jshint ignore:end */
				replacer = replacer.split(/\s*[, ]\s*/);

			/* jshint ignore:start*/	//FALL-thru
			case 'Array':						//process extract properties and EZ options
			/* jshint ignore:end */
			{									//for each Array item . . .
				replacer.forEach(function(item)
				{
					if (typeof(item) == 'function')
						replacerFunctions.push(item);	//replacer function
					else if (typeof(item) != 'string' || !item)
						return;
												//extract property or EZ option
					var results = item.match(/([+-]?)(\*?)(\w*)=?(\w*)/);
					if (!results) return;

					var pre    = results[1] || '';
					var star   = results[2] || '';
					var key    = results[3] || 'SCRIPT';	//blank key
					var text   = results[4] || '';
					var number = results[4] || 0;
					if (star)						//----- EZ options start with * -----\\
					{
						key = key.toUpperCase();
						var defaultValue = EZ.json.options[key];
						options[key] = typeof(defaultValue) == 'boolean' ? pre != '-'
									 : typeof(defaultValue) == 'number' ? Number(number)
									 : typeof(defaultValue) == 'string' ? text
									 : '';
					}
													//----- extract property key name -----\\
					else if (pre == '+')
					{
						include = include || [];
						include.push(key);			//...explicit include if startes with "+"
					}
					else if (pre == '-')
					{
						exclude = exclude || [];
						exclude.push(key);			//...explicit exclude if starts with "-"
					}
					else if (pre === '')
					{
						extract = extract || [];
						extract.push(key);			//...add to extract list if no +/- prefix
					}
				});
			}
		}
		options.SPACES = (spaces || EZ.json.options.SPACES);	//non-zero non-blank required
		if (!isNaN(options.SPACES) && options.SPACES <= 0)
			options.SPACES = EZ.json.options.SPACES

		EZ.json.stringify.options = 'format options:';

		options.SCRIPT = options.SCRIPT || false;
		Object.keys(EZ.json.options).forEach(function(key)
		{
			if (!(key in options)) 					//set default for any non-specified options
			{
				var defVal = EZ.json.options[key];	//for boolean, true if option can be implicitly
				if (typeof(defVal) == 'boolean')	//... enabled -and- ALL or SCRIPT is true
					defVal = defVal  && (options.ALL || options.SCRIPT)
				else if (typeof(defVal) == 'number' && options.ALL === false)
					defVal = 0;						//for numeric, 0 if ALL explictly set false
				options[key] = defVal;
			}
			if (options[key] || options[key] === 0)
				EZ.json.stringify.options += ' ' + key + '=' + options[key];
		});
	}
	//______________________________________________________________________________
	/**
	 *	return type as constructor: Undefined, Null for undefined or null respectively
	 *	else Array, Boolean, Function, Number, Object, RegExp
	 *
	 */
	function getType(value)
	{
		if (value instanceof Element)
			return 'Element';
		var type = Object.prototype.toString.call(value);
		return type.substring(8,type.length-1);
	}
}
//__________________________________________________________________________________________
/**
 *	EZ.json.parse(json,layer)
 *
 *	parse json via eval -- if exception, eval json in fragments to isolate syntax error.
 *
 *	ARGUMENTS:
 *		json	String containing json
 *		layer	html layer OR layer id used for error message
 *				TODO: for full backward compatible with original EASY.js
 *
 *	RETURNS:
 *		EZ.json.parse.objname set to name of variable if json of the form: objname = ...
 *		otherwise blank
 *
 *	with no exception:
 *		EZ.json.eval (and EZ.json.parse.objname variable) set to value from json and returned.
 *		EZ.json.message blank
 *
 *	with SyntaxError exception:
 *		EZ.json.eval set to null and returned -- EZ.json.parse.objname variable unchanged
 *		EZ.json.message contains json fragments parsed sucessfully with message inserted
 *		before fragment with SyntaxError.
 *
 *	FRAGMENTS:
 *		The outermost json Object or Function declaration and each nested Object/Function
 *		is considered as a fragment containing zero or more fragment items.  Fragments
 *		items are either another fragment or non-object data type such as Boolean,
 *		Number or String. Statements within a Function declartions are treated as a
 *		fragment item -- except as noted below.
 *
 *		Closure functions enclosed within paraenthesis take precedence as a fragment
 *		over the function definition.
 *
 *		Closure functions used as argements of forEach, every, some or replace are
 *		treated as a complete fragment item of their containig function.
 *
 *		Fragments are passed to eval as found in json first with no fragment items,
 *		then each item added one at a time until all items are added or an exception
 *		occures.
 */
EZ.json.parse = function(json /*,layer */)
{
	function returnParseValue(rtnValue)			//returned value of parse or exception message 
	{											//as apparent type of value represented by json
		if (EZ.json.syntaxError)
		{										
			if (json.substr(0,1) == '{' || json.substr(-1) == ']}')
			{									//for apparant Object, return syntaxError property
				rtnValue = {syntaxError: EZ.json.syntaxError}
			}
			else if (json.substr(0,1) == '[' && json.substr(-1) == ']')
			{									//for apparant Array, return empty Array also
				rtnValue = [];					//with named property key: syntaxError
				rtnValue.syntaxError = EZ.json.syntaxError;
				rtnValue.json = json;
			}			
			else								//otherwise return exception message pinpointing
				rtnValue = EZ.json.syntaxError;	//where parse failed if EZ.matchPlus() available
		}
		if (EZ.json.parse.objname)				//if objName/variable specified, set to rtnValue
			eval('"' + EZ.json.parse.objname + '=' + EZ.json.eval + '"');
		return rtnValue;
	}
	
	EZ.json.eval = null;
	EZ.json.fault = null;			
	EZ.json.syntaxError = '';
	EZ.json.parse.message = '';		
	EZ.json.parse.objname = '';
	EZ.json.parse.fragments = '';
	EZ.json.parse.details = true;	//more detail returned for parse exceptions

	json = json || '';
	json = json.trim();
	json = json.replace(/\\r/g, '\r');
	json = json.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
	if (!json) 							//json empty
		return EZ.json.eval = '';

	json = json.replace(/^\s*(.*)\s*=\s*/, function(all,objname)
	{									//remove "objname = " prefix if any
		EZ.json.parse.objname = objname;
		return '';
	});

	  //------------------------\\
	 //----- eval full json -----\\
	//----------------------------\\
	try
	{
		var rtnValue = eval('EZ.json.eval = ' + json);
		return returnParseValue(rtnValue);	//good to go if no exception
	}
	catch (e)
	{
		EZ.json.fault = EZ.techSupport(e, '$', arguments);	//get fault Object
		EZ.json.syntaxError = EZ.json.parse.message = e.message;
	}
	if (EZ.matchPlus === undefined)			//if EZ.matchPlus() avail, pinpoint syntax error
		return returnParseValue();
		//return EZ.json.parse.message;

	  //--------------------------------------------------------\\
	 //----- eval json in fragments to isolate syntax error -----\\
	//------------------------------------------------------------\\
	var idx,
		msg = '',
		script = '';
	EZ.trace(json);

	//----- create shadow json with quoted strings neutered (except Object keys)
	var jsonShadow = json.replace(/(\\['"])/g, '@@');		//esc embedded quotes e.g. \" --> @@

	jsonShadow = jsonShadow.replace(/(['"])(.*?)\1(\s*)(\:?)/g, 	//to facitate simple parsing:
	function(all, quote, inner, spaces, colon)				//replace all quoted strings
	{														//with #...# e.g. "abc" --> "###"
		if (colon) return all;								//except Object keys
		return quote + '@'.dup(inner.length) + quote + spaces;
	});
	//----- also neuter "forEach(function(...){...});" to avoid parsing as fragments
	jsonShadow = jsonShadow.replace(/(forEach\()([\s\S]*?\}.*\n)/g, function(all,prefix,fn)
	{
		return prefix + '@'.dup(fn.length);
	});
	/*___________________________________________________________________________________
	//
	//	SAMPLE JSON before pre-processing nueters quoted Strings and some anounmous
	//	functions to simplify parsing into fragments and fragment items.
	//___________________________________________________________________________________
	{
		guess: 123,
		fn: (function()
		{
			var ____properties____ = {
				color: "green",
				array: [1, 2, "red", true]
			};
			Object.keys(____properties____).forEach(function(key)
			{____function____[key] = ____properties____[key]})
			return ____function____;
		})()
	}
	-------------------------------------------------------------------------------------------
	OPEN FRAGMENT OFFSETS
	-------------------------------------------------------------------------------------------
	offsets: 	0:[0,1], 1:[18,43], 2:[44,74], 3:[75,95]
		[0]:	{
		[1]:	.... fn:. (function() .... {
		[2]:	.... var. ____properties____. =. {
		[3]:	.[12]. array:. [
	-------------------------------------------------------------------------------------------
	CLOSE FRAGMENT OFFSETS
	-------------------------------------------------------------------------------------------
	offsets: 0:[75,100], 1:[101,111], 2:[265,273], 3:[274,275]
		[0]:            array: [1, 2]
		[1]:        };
		[2]:    })()
		[3]:}

	-------------------------------------------------------------------------------------------
	//	SAMPLE NUETERED DATA - embedded quotes and forEach converted to @ for parsing
	//	start of fragments marked as -->>...<-- end of fragments marked as --<<...<--
	-------------------------------------------------------------------------------------------
	 __
	|  \................................fragment #0
	|   -->>
	|   {<--
	|    |  guess: 123,
	|	 |_________________________________openOffsets[0] = openResults.end[0] = 1
	|	________
	|  |    -->>\........................fragment #1
	|  |    fn: (function()
	|  |    {<--
	|  |   |_____________________________openOffsets[1] = openResults.end[1] = 43
	|  |   __________________________
	|  |  |                      -->>\.....fragment #2
	|  |  | var ____properties____ = {<--
	|  |  |                           |____openOffsets[2] = openResults.end[2] = 74
	|  |  |
	|  |  |         ________..............fragment #3
	|  |  |        |        \   ___________openOffsets[3] = openResults.end[0] = 95
	|  |  |        |         \ |   _______closeOffsets[3] = closeResults.end[0] = 100 - 1 = 99
	|  |  |        |      -->> <--|
	|  |  |        |   array: [1, 2]
	|  |  |        |           <<-- <--                                          end  - marker size
	|  |  |        |_______________/
	|  |  |     __________________________closeOffsets[2] = (closeResults.end[1] = 111) - 2 = 109
	|  |  |    |
	|  |  | <<--};<--
	|  |  |_______/
	|  |        Object.keys(____properties____).forEach
	|  |        return ____function____;
	|  | <<--})()<--
	|  |________/
	|	    |______________________________closeOffsets[1] = (closeResults.end[2] = 273) - 4 = 269
	|   <<--
	|	}<--
	|  |_________________________________closeOffsets[0] = (closeResults.end[3] = 275) - 1 = 274
	|___/
	*/
	var begWrapPattern = RegExp( "(\\n\\s*)?"      //prefix from line where marker starts
							   + "("               //open marker --	if function...
							   + "(\\(\\s*function||function)"  //optional closure & fn statement
							   + "\\s*[\\w]*\\([^(]*\\)"		//optional fn name & (named args)
							   + "[\\s\\S]*?\\{" 				//optional comment & start of body
							   + "|\\{"            				//...or Object
							   + "|\\["                			//...or Array
							   + ")"               //end of open marker
							   + "(\\s*?\\n?)",    //optional spaces up to optional newline
							     "g");

	var endWrapPattern = RegExp( "(.*)"    			//prefix from line where close marker starts
							   + "(" 				//start of close marker
							   + "\\}\\)\\(\\)" 	//end of optional closure -- TODO: expand
							   + "|\\}|\\];?"    	//end of fn, object, array
							   + ")"				//end of close marker
							   + "(\\s*?\\n*)",		//optional spaces up to optional newline
							     "g");
	var itemPatterns = {
		"[": /(\s*)(())?(([^,]*)\s*)(,?\n?)/,			//array -- value [,\n]
		"{": /(\s*)(([^:]*)[:]\s*)(([^,]*)\s*)(,?\n?)/,	//object -- key: value [,\n]
		"(": /(\s*)(())((.*?);?)(\n?)$/m				//function -- single lines .*[;]$
	}
	itemPatterns[')'] = itemPatterns['('];
	var begWrappers =
	{						//use for eval if defined
		'{': 'EZ.obj={\n'		//Object
	}
	var endWrappers = {
		'[': ']',			//Array
		'{': '\n}',			//Object
		')': '\n}',			//function...
		'(': '\n})'			//(function...)
	}

	  //-----------------------------------------------\\
	 //----- find all start / end fragment markers -----\\
	//---------------------------------------------------\\
	var openTypes = [],
		openOffsets = [],
		closeOffsets = [],
		openResults = jsonShadow.matchPlus(begWrapPattern),
		closeResults = jsonShadow.matchPlus(endWrapPattern);

	idx = 0;
	jsonShadow.replace(begWrapPattern, function(all, prefix, marker, fn, eol)
	{
		var type = !fn ? marker
				 : marker.substr(0,1) == '(' ? '('
				 : ')';
		var offset = openResults.end[idx] + eol.length - (eol ? 1 : 0);

		openResults[idx++] = marker + eol;
		openTypes.push(type);
		openOffsets.push(offset);
	});

	idx = 0;
	jsonShadow.replace(endWrapPattern, function(all,prefix,marker, eol)
	{
		closeResults[idx] = marker + eol;		//?? prefix offsets may handle
		closeOffsets.push(closeResults.end[idx] - marker.length - 1);
		idx++;
	});

	  //--------------------------------------------------------\\
	 //----- reorder closeOffsets to align with openOffsets -----\\
	//------------------------------------------------------------\\
	openOffsets.forEach(function(begOffset,idx)
	{
		var begOffset = openOffsets[idx];
		var endOffset = jsonShadow.length;
		for (var i=idx; i<closeOffsets.length; i++)
		{
			for (var j=i+1; j<openOffsets.length; j++)
			{
				if (openOffsets[j] > closeOffsets[i])
					break;
			}
			if (j == i+1)
				break;
		}
		if (i < closeOffsets.length)
		{										//swap closeOffsets
			endOffset = closeOffsets.splice(i,1)[0];
			closeOffsets.splice(idx,0,endOffset);
			var endWrap = closeResults.splice(i,1)[0];
			closeResults.splice(idx,0,endWrap);
		}
		EZ.json.parse.fragments += '\n' + '-'.dup(50)
								 + '\nfragment #' + (idx + 1)
								 + ' offsets: [' + begOffset + ',' +endOffset + ']'
								 + '\n' + '-'.dup(50)
								 + '\n-->>' + openResults[idx].replace(/([\s\S*?])(\n)/, '$1<--$2')
								 +  jsonShadow.substring(begOffset, endOffset)
								 + '<<--' + closeResults[idx] + '<--';
	});
	openResults.push('');					//fake for idx+1 references
	openOffsets.push(jsonShadow.length);
	EZ.trace('FRAGMENTS', EZ.json.parse.fragments.substr(1));
EZ.json.parse.details = false;
	  //------------------------------\\
	 //----- parse outer fragment -----\\
	//----------------------------------\\
	idx = 0;
	var offset = 0;
	jsonFragment();

	if (!msg && json.substr(offset))		//any remaining json is unexpected
	{
		msg = 'following unexpected';
//out of scope function call
//jsonAppend('=', '@@@error@@@', '@@@good@@@');
		//script += '@@@error@@@' + json.substr(offset);
		//offset += json.substr(offset).length;
	}
	if (msg) 								//add to exception from full json eval
	{
		EZ.json.message += '\nmore detail below...'

		  //------------------------------\\
		 //----- format error message -----\\
		//----------------------------------\\
		if (msg.substr(-1) != '\n') msg += '\n';
		script = script.replace(/([\s\S]*\n)?([\s\S]*)@@@error@@@([\s\S]*)@@@good@@@(.*)(\n?)/,
		function(all, linesBeforeBad, codeBeforeBad, bad, codeAfterBad)
		{
			linesBeforeBad = linesBeforeBad || '';
			var indent = Math.max(0,codeBeforeBad.length - 1);
			var indentBad = Math.max(0,indent + bad.length - 1);
			bad.replace(/[\s\S]*\n(.*)/, function(all, bad /*last line of bad*/)
			{
				indentBad = Math.max(0,bad.length - 1);
			});
			all = linesBeforeBad
				+ (linesBeforeBad ? '='.dup(50) : '')	//	~~~~~~~~~~~~~~~~~~~~~~
				+ '\n...' + msg + ''					//	...msg
				+ '_'.dup(indent) + '\n'				//	_______
				+ ' '.dup(indent) + '\\\n'				//	       \
				+ codeBeforeBad + bad + codeAfterBad	//	before  bad...after
				+ '\n' + '_'.dup(indentBad+1) + '/\n'	//  _____________/
				+ '...end of json parse\n'					//	...end of parse
				+ '='.dup(50) + '\n';					//	~~~~~~~~~~~~~~~~~~~~~~
			return all;
		});
	}
	script += json.substr(offset);
	EZ.trace('SCRIPT returned', script);

	//=============================================================
	EZ.json.message = 'SyntaxError: ' + EZ.json.message
						  + '\n'
			              + '-'.dup(50) + '\n'
						  + script;
	return null;
	//=============================================================
	//_______________________________________________________________________________
	/**
	 *	recursively called for each json fragment until SyntaxError occurs.
	 */
	function jsonFragment(depth/*lastBegWrap, lastEndWrap, lastType*/)
	{
		depth = depth || 0;
		if (idx >= openOffsets.length) return;	//no more fragment markers

		var item,
			begWrap = openResults[idx],
			endWrap = closeResults[idx],
			begOffset = openOffsets[idx],
			endOffset = closeOffsets[idx],

			type = openTypes[idx],
			begWrapType = begWrappers[type] || begWrap,
			endWrapType = endWrappers[type],

			fragmentItems = '';

		jsonAppend(begWrap, '-->>', '<--');
		offset = begOffset;
		fragmentItems = begWrapType;			//reset fragmentItems

		  //--------------------------------\\
		 //----- for each fragment item -----\\
		//------------------------------------\\
		var thisFragment = '';
		var itemPattern = itemPatterns[type];
		var count = jsonShadow.matchPlus(/(function|\]|\})/g).length;
		do
		{
			//_______________________________________________________________________________
			//
			//	EXAMPLE: items marked as #>...#< -- item separators as ^...^
			//			 keys (or closure variable assignments) marked as !...!
			//_______________________________________________________________________________
			/*
			-->>{<--
				#>!guess: !"neutered quotes@red@"<#,
				#>!fn: !>>(function()
				-->>{<--
					#>!var ____properties____ = !-->>{<--#>!
						color: !"red"<#^,
						^#>!array: !-->>[<--#>1<#^, ^#>2<#--<<]<--
					--<<};<--
					#>Object.keys(____properties____).forEach@@@@@@@@@
					#>return ____function____;<#
				--<<})()<--<#
			--<<}<--
			*/
			var nextFragment = openOffsets[idx+1] - openResults[idx+1].length;
			thisFragment = jsonShadow.substring(offset, Math.min(nextFragment, endOffset));
			if (!thisFragment.length)
				break;
			var groups = "prefix, keyGroup, key, valueGroup, value, itemSep";
			var results = thisFragment.matchPlus(itemPattern, groups);
			if (!results.isFound) break;

			results.start.forEach(function(start,idx)
			{								//get un-neutered json results
				item = json.substr(offset+start, results[idx].length);
				results.set(results.keys[idx], item);thisFragment
			});

//fragmentItems += results.prefix;
			jsonAppend(results.prefix, '#>');

			if (!results.keyGroup && !results.valueGroup)
			{
				jsonAppend(results.itemSep, '^', '^');
				continue;
			}
			try
			{
				item = results.keyGroup + results.valueGroup;
				if (type != '[' && item.substr(0,1) == '}')
				{						//end of function or object
					jsonAppend(item);
					break;
				}

				if (type == '[' && results.key)
					msg = 'name unexpected';
				else if (type == '{' && !results.key)
					msg = 'name required';
				else
				{
					if (type == '{') 			//process key for Object
					{
						item = results.key;
						eval('"' + results.key.trim().trimPlus('"') + '"');
						jsonAppend(results.keyGroup, '!', '!')
						item = results.valueGroup;
					}

					if (offset + item.length >= nextFragment)
					{							//value is next fragment e.g. [...] or {...}
						jsonAppend(item);		//append json up to nextFragment

						idx++;
						item = jsonFragment(depth+1);
						if (msg) return;

						fragmentItems += item;	//append json returned from fragment(s)
						EZ.trace('fragmentItems return depth='+ depth, fragmentItems + endWrapType);
					}
					else
					{
						item = results.valueGroup;
						eval(fragmentItems + item + endWrapType);
						jsonAppend(item)	//append valueGroup
					}
					if (EZ.json.parse.details) script += '<#';
					jsonAppend(results.itemSep, '^', '^');
				}
				if (EZ.json.parse.details) script += '<#';
			}
			catch (e)						//SyntaxError
			{
				msg = e.message;			//...set error message
				console.log(e.stack.replace(/([\s\S]*?\))[\s\S]*/,'$1'))
				item = item.trim();
			}
			if (!msg) continue;

			// add message to script and break
			//var padding = Math.max(0,script.length - script.lastIndexOf('\n') - 1);
			jsonAppend(item, '@@@error@@@', '@@@good@@@');

			json.substr(offset).replace(/.*\n/, function(all)
			{
				jsonAppend(all);
				return all;
			})
			break;
		}
		while (count-- > 0)					//safety for unexpected endless loop

		if (msg || thisFragment.trim()) return;

		if (!endWrap)
		{
			msg = 'expected: ' + endWrapType;
			jsonAppend('', '@@@error@@@', '@@@good@@@');
		}
		else								//append end of fragment wrapper and
		{									//replace begWrapType with real begWrap
			jsonAppend(endWrap, '<<--', '<--');
			var regex = RegExp(begWrapType.replace(/([\[{(])/g,'\\$1'));
			return fragmentItems.replace(regex, begWrap);
		}

		//_______________________________________________________________________________
		/**
		 *	Append un-neutered json to script and fragmentItems from current offset
		 *	corresponding to code (i.e. code.length).  Annotate with prefix and suffix if
		 *	specified and starts with "@@@" or EZ.json.parse.details is true.
		 */
		function jsonAppend(code, prefix, suffix)
		{
			code = code || '';
			prefix = prefix || '';
			suffix = suffix || '';

			if (!EZ.json.parse.details && prefix.indexOf('@@@') !== 0)
				prefix = suffix = '';

			if (!code && !prefix && !suffix) return;

			fragmentItems += code;

			if (prefix == '<<--' || prefix == '-->>')	//complex annotate
				script += annotate(code, prefix, suffix);
			else										//simple annotate
				script += prefix + json.substr(offset, code.length) + suffix;

			offset += code.length;

			EZ.trace('fragmentItems depth='+ depth, fragmentItems + endWrapType);
			EZ.trace('SCRIPT: ' + code, script);
		}
		/**
		 *	returns annotated fragment marker
		 */
		function annotate(code, prefix, suffix)
		{
			return code.replace(/(\s*)([\s\S]*?)(\n?)$/,
			function(all,before,marker,after)
			{
				before = before.endsWith('\n') || !before.length ? prefix + '\n'
					   : before.substr(-4) + prefix
				return before + marker + suffix + after;
			});
		}
	}
}
/*--------------------------------------------------------------------------------------------------
EZ.json.unquoteKeys(json)

Uses RegExp to find quoted keys --- 
As safety, returns json unchanged if initial -or- converted json does not eval() without exceptions.

ARGUMENTS:
	json		String containg json returned with Object keys unquoted if valid variable name.
				i.e. not reserved word, no spaces and startsi with "_" or alphabetic character

RETURNS:
	json with unquoted key -- valid JavaScript / eval() but not recognized by JSON.parse()
			if (regex.reserved.includes(arg))				//reserved word
--------------------------------------------------------------------------------------------------*/
EZ.json.unquoteKeys = function unquoteKeys(json)
{
	if (!json || typeof(json) != 'string') return json;
	
	var options = {json: json};
//	if (EZ.capture.check(this,options)) {return EZ.capture()} else if (EZ.test.debug()) debugger;

	var phase = 'validating input';
	try
	{
		var value = eval('value='+json);	
		var unquoted = json.replace(/([{,]\s*)"([\w_]+?)":/gi, function(all, sep, key)
		{
			if (EZ.json.INVALID_KEYS.indexOf(key) != -1) return all;
			return sep + key + ":";
		});
	
		phase = 'validating unquoted';
		var val = eval('val=' + unquoted);
	
		if (EZ.equals(val, value))
			json = unquoted;
		else
			throw new EZ.error('unable to unquote keys');
	}
	catch (e) 
	{ 
		EZ.json.fault = EZ.techSupport(e, '-' + phase, this, options);	 
	}
	return json;
}
/*---------------------------------------------------------------------------------------------
---------------------------------------------------------------------------------------------*/
if (EZ && EZ.global && EZ.global.setup) EZ.global.setup('EZ', 'EZstringify');
