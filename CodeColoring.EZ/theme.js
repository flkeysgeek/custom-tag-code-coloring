var f = {}, g = {};			//this page: fields / global values
/*{ ------------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------------} */

//__________________________________________________________________________________________________
function canAcceptCommand() {
	/** {
	 *	DW api: returns true if menu option is available
	}**/

	//	if (dw.getActiveWindow() == null) return false;
	return true;
}

//__________________________________________________________________________________________________
function receiveArguments(arg1) {
	/** {
	 *	Gets command arguments passed by the DW.runCommand used to load the form (part of DW API)
	 *	arg1: Menu Command selected -- change or configPath
	}**/
	g.callMode = arg1;
}

//__________________________________________________________________________________________________
//function commandButtons() {
//	/** {
//	 *	puts Ok and Cancel buttons on screen (part of DW API)
//	}**/
//	return new Array( "OK","RZprocessDataCall()",
//	                 "Cancel","window.close()",
//	                 "Help", "RZhelp('RevizeDocument-'+RZcallType)"
//	                );
//}
//__________________________________________________________________________________________________
function setup() {EZ.setup(start)}
function start() 
{
	/** {
	 *
	 *__________________________________________________________________________________________________
	}**/
	g.wwwPath = EZ.installPath + 'www/';
	g.cmPath = EZ.installPath + 'www/thirdparty/CodeMirror/';
	g.themePath = EZ.configPath + 'Brackets/extensions/user/'

	g.body = document.body;
	g.form = document.theForm;
	f.js = g.form.evalString;
	f.results = g.form.evalResults;

/*
file:///C|/Program Files/Adobe/Adobe Dreamweaver CC 2017-dev/Configuration//themes/Classic.xml
file:///C|/Program Files/Adobe/Adobe Dreamweaver CC 2017-dev/Configuration/Brackets/extensions/user/Raven III/main.less
                                                            \Configuration\Brackets\extensions\user\Raven III

C:\Users\otis\AppData\Roaming\Adobe\Dreamweaver CC 2017\en_US\Configuration\Brackets\extensions\user\Raven III	
	
*/	
	
	
f.js.value = 'g.pathfile';
	
	g.test = (DWfile.read(EZ.configPath + 'codeColoring.EZ/samples/some.txt') || '');
	
	g.pathfile = EZ.configPath + '/themes/Classic.xml';
	g.classic = DWfile.read(g.pathfile) || '';
	DWfile.write(g.pathfile, g.classic);
	
	g.pathfile = g.themePath + 'Raven4/main.less';
//	g.dom = dw.openDocument(g.pathfile);
	
////////////////////////////////////////////////////////////////////////////////////////////////
//g.files = DWfile.
//				items = DWfile.listFolder(EZ.constant.configPath + folder + '/*.js');


f.results.value = g.dom;

	EZ.theme = new EZtheme();

if (true) return;
	
	var count = EZ.theme.showThemes();
	if (count === 0)
		return EZ.addClass(g.body, 'noThemes');

	var themeName = EZ.theme.getSetting('themeName');
	if (themeName && g.callMode == 'change')
		return EZ.theme.edit(themeName);

	
	
	
	//g.themeList = 
	
	
	//g.test = (DWfile.read(EZ.configPath + 'codeColoring.EZ/samples/some.txt') || '');

	g.xmljsEZ = (DWfile.read(EZ.configPath + 'codeColoring.EZ/src/xml.js') || '');



	g.xmljsNow = (DWfile.read(g.cmPath + 'mode/xml/xml.js') || ''); 
	
	var xmljsClass = (g.xmljsNow) 			    ? 'xmljsNotFound'
				   : (g.xmljsNow == g.xmljsEZ)  ? 'xmljsInstalled'
											    : 'xmljsNotInstalled'

[xmljsClass]
//	EZ.addClass(g.body, xmljsClass);
return;	
}
/*{ ------------------------------------------------------------------------------------------------
	g.xmljsPath = getinstallPath() + 'www/CodeMirror/xml';

		return !key || !_settings[key] ? ''
			 : typeof(!_settings[key]) == 'function' ? !_settings[key]() || ''
			 : !_settings[key] || '';
	
	var _settings = {
		themeName: function() {dw.getPreferenceString('Tag Colors', 'Theme Current Name')}
	}

------------------------------------------------------------------------------------------------} */
function EZtheme() {

	this.getSetting = function(key)
	{
		[key];
		var value = dw.getPreferenceString('Tag Colors', 'Theme Current Name');
		return value;
		
	}
	//__________________________________________________________________________________________________
	this.update = function() {
		/** {
		 *
		}**/
		var pathFile = g.themePath + 'Raven III/main.less';
	g.form.evalResults.value = pathFile;

		var dom = dw.openDocument(pathFile);
		if (typeof dom == 'undefined')
			return alert('Error opening theme: ' + pathFile)
		
		//close();	
	}
	//__________________________________________________________________________________________________
	this.mainRead = function mainRead()
	{
		/** {
		 *
		}**/
	}
	//__________________________________________________________________________________________________
	this.mainWrite = function mainWrite() {
		/** {
		 *
		}**/
	}
	//__________________________________________________________________________________________________
 	this.themeSelected = function themeSelected()
	{
	}
	//__________________________________________________________________________________________________
	this.themeInstall = function themeInstall()
	{

	}
	//__________________________________________________________________________________________________
	this.themeRemove = function themeRemove()
	{

	}
	//__________________________________________________________________________________________________
	this.themeColors = function themeColors()
	{

	}
	//__________________________________________________________________________________________________
	this.tagColors = function tagColors()
	{

	}
	//__________________________________________________________________________________________________
	this.xmlInstall = function xmlInstall()
	{

	}
	//__________________________________________________________________________________________________
	this.xmlremove = function xmlremove()
	{

	}
	
	//__________________________________________________________________________________________________
	this.getinstallPath = function getinstallPath() {
		/** {
		 *	hack to get path where DW installed
		}**/
		var json = DWfile.read(EZ.configPath + 'Brackets/state.json');
		var results = json.match(/"project": \{\s*"(.*?\/)Configuration\/BracketsProject/) || Array(2);
		return results[1];
	}
	return this;
}

//__________________________________________________________________________________________________
/*--------------------------------------------------------------------------------------------------
Dreamweaver LINT global references and defined variables not used here {
--------------------------------------------------------------------------------------------------*/
var e;			//global used for try/catch
/*global 
commandButtons,

EZ, DWfile, dw:true, f:true
*/
//. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .}
(function() {
	[	//global variables and functions defined but not used

	

	setup, canAcceptCommand, receiveArguments, commandButtons,

	EZ, DWfile, dw, e, f, g 
	]
}
);
