var g = {};
g.body = {};
g.config = '';
/*{ ------------------------------------------------------------------------------------------------
	var g = dw.constructor;

window.g = window.g || {};
window.EZ = window.EZ || {};
window.dw = window.EZ || {};

if (!EZ.dw) EZ.dw = dw;
{									//global data shared by all DW api commands
	EZ.dw = window.dw ? dw.constructor.EZ : {};
	if (!EZ.dw) EZ.dw = dw.constructor.EZ = {};
}
window.g = dw.constructor;

	
	var themeName = dw.getPref();
	var themeList = ';'

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
	 *	arg1: Menu Command selected -- change or config
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
function setup() {
	/** {
	 *
	 *__________________________________________________________________________________________________
	}**/
	g.body = document.body;
	g.form = document.theForm;
	g.form.evalString.value = 'EZ.installPath';

if (true) return;
	EZ.theme = new EZtheme();
	

	//EZ.getFolders();
	g.xmljsEZ = (DWfile.read(EZ.config + 'EZcodeColoring/xml.js') || '');
	g.xmljsNow = (DWfile.read(EZ.cmPath + 'mode/xml/xml.js') || ''); 
	
	var xmljsClass = (g.xmljsNow) 			    ? 'xmljsNotFound'
				   : (g.xmljsNow == g.xmljsEZ)  ? 'xmljsInstalled'
											    : 'xmljsNotInstalled'

[xmljsClass]
//	EZ.addClass(g.body, xmljsClass);
return;	
}

/*{ ------------------------------------------------------------------------------------------------
	g.xmljsPath = getinstallPath() + 'www/CodeMirror/xml';

------------------------------------------------------------------------------------------------} */
function EZtheme() {	

	//__________________________________________________________________________________________________
	this.getinstallPath = function getinstallPath() {
		/** {
		 *	hack to get path where DW installed
		}**/
		var json = DWfile.read(g.config + 'Brackets/state.json');
		var results = json.match(/"project": \{\s*"(.*?\/)Configuration\/BracketsProject/) || Array(2);
		return results[1];
	}
	//__________________________________________________________________________________________________
	this.mainOpen = function mainOpen() {
		/** {
		 *
		}**/
		var pathFile = '';
		var dom = dw.openDocument(pathFile)
		if (typeof dom == 'undefined')
		{
			alert('Error opening site file: ' + pathFile)
			return
		}	
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
}
EZ.theme = new EZtheme();

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
