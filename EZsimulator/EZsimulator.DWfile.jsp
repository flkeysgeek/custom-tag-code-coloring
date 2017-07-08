<%@ page contentType="text/html; charset=utf-8" language="java"%>
<%@ include file="EZdw.simulator.utils.jsp"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>EZ DWfile Simulator</title>
<link rel="shortcut icon" href="EZdw.simulatorIcon.png" />

<!-- script type="text/javascript" src="../js/EZcore.js"></script-->
<link href="../css/EZcommon.css" rel="stylesheet" type="text/css" />
<style type="text/css">
.textBox {
	/* useful when testing as standalone pgge */
	padding: 5px;
	font: 12px Arial, Helvetica, sans-serif;
	border: 2px solid #C00;	/* red */
	background: #FEFEC8;
	overflow: scroll;
	max-height: 300px;
}
results {
	white-space: pre;
	font-family: monospace;
}
#parametersLayer.read .readLayer,
#parametersLayer.write .writeLayer,
#parametersLayer.listFolder .listFolderLayer,
#parametersLayer.copy .copyLayer {
	display: block;
}
</style>
<%!

/******************************************/
/*BOOKMARK -----DWfile simulator jsp code*/
/****************************************/
%>
<%
String results = "";

//                              0      1    2     3      4       5    6          7
List functions = Arrays.asList("exists read write remove getSize copy listFolder createFolder getModificationDate".split(" "));

String fn = getParameterString("fn");
int fnIndex = functions.indexOf(fn);

String fileURL = getParameterString("fileURL");
String copyURL = getParameterString("copyURL");			//copy

String constraint = getParameterString("constraint");	//listFolder
int constraintIndex = 0;
if (constraint.equals("files")) constraintIndex = 1;
if (constraint.equals("folders")) constraintIndex = 2;
String listFolderFilter = getParameterString("listFolderFilter");

String mode = getParameterString("mode");				//write
//String text = getParameterString("text");				// ''
String text = request.getParameter("text");				// ''
//System.out.println(text);
boolean append = mode.equalsIgnoreCase("append");

//----- validate param & process if good
String filePath = "not supplied";
try
{
	results = "false";

	File file = new File(fileURL);
	if (file != null)
		filePath = file.getAbsolutePath();//.replace('\\','/');
	File dir = file;	//alternative name

	switch(fnIndex)
	{
		case 0: 	//exists
		{
			results = file.exists() + "";
			break;
		}
		case 1: 	//read
		{
			results = "null";
			if (file.exists())
			{
				results = readFile(fileURL, "UTF-8");
				text = results;
			}
			break;
		}
		case 2: 	//write
		{
			text = text.replaceAll("%26", "&");
			text = text.replaceAll("%25", "%");
			text = text.replaceAll("@#plus#@", "+");
			results = writeTextFile(fileURL, text, append, "UTF-8") + "";
			break;
		}
		case 3: 	//remove
		{
			if (!file.exists()) break;
			if (file.isFile())
				file.delete();
			else
				deleteFolder(file);
			results = "true";
			break;
		}
		case 4: 	//getSize
		{
			results = file.exists() ? (file.length() + "") : "0";
			break;
		}
		case 5: 	//copy
		{
			//File copyFile = new File(copyURL);
			if (file.exists())
			{
				text = readFile(fileURL, "UTF-8");
				results = writeTextFile(copyURL, text, append, "UTF-8") + "";
			}
			break;
		}
					//TODO: support fileMask via dir.listFiles(FileFilter)
		case 6: 	//listFolder: fileURL: path + "/" + fileMask  constraint=[files|folders]
		{
			FilenameFilter filter = createFilter(listFolderFilter);
			List fileList = new ArrayList();
			if (!dir.exists() || dir.isFile())
			{
				//do nothing -- return empty list
			}
			else if (constraint.equals(""))		//return all files and folders
			{
				fileList = Arrays.asList(dir.list(filter));
			}
			else								//return only files or only folders
			{
				File files[] = dir.listFiles(filter);
				for (int i=0; i<files.length; i++)
				{
					if (constraint.equalsIgnoreCase("files") && !files[i].isFile()) continue;
					if (constraint.equalsIgnoreCase("folders") && files[i].isFile()) continue;
					fileList.add(files[i].getName());
				}
			}
			// return string representation of empty or populated array
			results = toJsonArray(fileList);
			break;
		}
		case 7: 	//createFolder
		{
			if (dir.exists() || dir.isFile())
			{
				//do nothing -- use empty list
			}
			dir.mkdir();
			results = "true";
			break;
		}
		case 8: 	//getModificationDate
		{
			results = file.lastModified() + "";
			break;
		}
		default:
		{
			results = "unknown DWfile fn: " + fn;
		}
	}
	errmsg = "DWfile." + fn + ": " + fileURL;
}
catch (Exception e)
{
	FormatException fe = new FormatException(e);
	errmsg = fe.message;
	stacktrace = fe.stacktrace;
}
%>
<%!
/*******************************************/
/*BOOKMARK -----page specific java methods*/
/*****************************************/
/**
 *	create FilenameFilter from regex
 *	references:
 *		http://www.programcreek.com/java-api-examples/index.php?api=java.io.FilenameFilter
 *		http://examples.javacodegeeks.com/core-java/io/filenamefilter/java-filenamefilter-example/
 */
FilenameFilter createFilter(String pattern)
{
	if (pattern.equals("")) return null;

	//final String regex = pattern.replaceAll("\\.", "\\.");
	final String regex = pattern;

	return new FilenameFilter()
	{
    	public boolean accept(File dir, String name)
		{
			//return name.matches("[a-zA-z]+\\.[a-z]+");
			return name.matches(regex);
		}
	};
}
/**
 * Read and return contents of specified filename.
 *
 * @param fileName path/filename to read
 * @param (String) file encoding e.g. "UTF-8", "US-ANSI"
 * @return String containing contents of filename
 */
String readFile(String fileName, String encoding) throws Exception
{
	// TODO add timeout on web server response
	StringBuffer output = new StringBuffer();
	InputStream pIn = null;
	InputStreamReader reader = null;
	try
	{
		pIn = new FileInputStream(fileName);
		reader = new InputStreamReader(pIn, encoding);

		int bufSize = 1024;
		char[] buf = new char[bufSize];
		int numRead = reader.read(buf, 0, bufSize);
		while (numRead > -1)
		{
			output.append(buf, 0, numRead);
			numRead = reader.read(buf, 0, bufSize);
		}
	}
	catch (IOException e)	//Error reading filename
	{
		throw new Exception(e);
	}
	finally
	{
		try
		{
			if (pIn != null) pIn.close();
			if (reader != null) reader.close();
		}
		catch (IOException e)	//Error closing filename
		{
			throw new Exception(e);
		}
	}
	return output.toString();
}
/**
 * Write text to specified filePath
 * @param filePath (String) specified path / filename
 * @param text (String) text written to file
 * @param (String) file encoding e.g. "UTF-8", "ANSI" (default UTF-8)
 * @return true if success otherwise false
 * @throws Exception
 *
 * @todo create folders if they do not exist
 */
boolean writeTextFile(String filePath, String text, boolean append, String encoding)
throws Exception
{
	if (encoding == null || encoding.length() == 0) encoding = "UTF-8";

	FileOutputStream os = null;
	Writer out = null;
	try
	{
		File fileDir = new File(filePath);
		os = new FileOutputStream(fileDir, append);
		out = new BufferedWriter(new OutputStreamWriter(os, encoding));
		out.write(text);
		out.flush();
	}
	catch (Exception e)
	{
		throw new Exception(e);
	}
	finally
	{
		try
		{
			if (out != null) out.close();
			if (os != null) os.close();
		}
		catch (Exception e)
		{
			throw new Exception(e);
		}
	}
	return errmsg.equals("");
}
/**
 * Delete folder by recursively deleting all sub-folders
 * @throws Exception
 */
boolean deleteFolder(File file)
{
	boolean status = true;
	File[] fileList = file.listFiles();
	if (fileList != null)
	{
		for (int f=0; f<fileList.length; f++)
			status = deleteFolder(fileList[f]) && status;
	}
	status = file.delete() && status;
	return status;
}
%>
<script type="text/javascript">
/*******************************************************/
/*BOOKMARK -----useful when testing as standalone pgge*/
/*****************************************************/
/*---------------------------------------------------------------------------
----------------------------------------------------------------------------*/
function setup()
{
	var fm = document.forms[0];
	fm.fn.selectedIndex = <%= fnIndex + 1 %>;
	fm.constraint.selectedIndex = <%= constraintIndex %>;
	fm.mode.selectedIndex = <%= mode.equals("append") ? 0 : 1 %>;
	setFnClass();
}
/*---------------------------------------------------------------------------
----------------------------------------------------------------------------*/
function setFnClass()
{
	//var fn = EZgetValue('fn');
	//var parametersLayer = EZgetEl('parametersLayer');

	var fn = document.theForm.fn;
	var value = fn.value

	document.getElementById('parametersLayer').className = 'header ' + value;
}
/*---------------------------------------------------------------------------
----------------------------------------------------------------------------*/
function setURL(el, value)
{
	var fm = document.forms[0];
	fm[el].value = value.replace(/.*[\/\\](.*)/, fm.configPath.value + '$1');
}
/*---------------------------------------------------------------------------
----------------------------------------------------------------------------*/
function validateForm(fm)
{
	var fm = document.forms[0];
	fm.fileURLBrowse.value = '';
	fm.copyURLBrowse.value = '';

	if (fm.fn.selectedIndex != 3)	//write
		fm.text.value = '';

/*
	fm.method = 'get';
	if (fm.selectedIndex == 3)	//write
		fm.method = 'post';
	else
		fm.text.value = '';
*/
}
/*---------------------------------------------------------------------------
----------------------------------------------------------------------------*/
</script>
</head>

<body onload="setup()" class="importExport">
<form enctype="application/x-www-form-urlencoded" accept-charset="UTF-8" method="post"
 name="theForm" onsubmit="return validateForm(this)">
  <div class="header" id="parametersLayer">
    <!-- useful when testing as standalone pgge -->
    configPath:
    <input name="configPath" type="text" id="configPath" value="C:/Users/Dell/AppData/Roaming/Adobe/Dreamweaver CC 2014.1/en_US/Configuration/" size="100" />
    <br />
    DWfile.fn:
    <select name="fn" id="fn" onchange="setFnClass()">
      <option>-select-</option>
      <%
	for (int i=0; i<functions.size(); i++)
		out.println("<option value=" + functions.get(i) + ">" + functions.get(i) + "</option>");
	%>
    </select>
    <input type="submit" name="submit" id="submit" value="Submit" />
    <br />
    &nbsp;&nbsp;&nbsp;fileURL:
    <input name="fileURL" type="text" id="fileURL" value="<%=fileURL%>" size="70" />
    <input type="file" name="fileURLBrowse" id="fileURLBrowse"
    		onchange="setURL('fileURL', this.value)"/>
    <br />
    &nbsp;&nbsp;&nbsp;filePath:
    <input name="filePath" type="text" id="filePath" value="<%=filePath%>" size="90" />
    <span class="normal">Display Only</span>
	<div class="copyLayer hidden">
      copyURL:
      <input name="copyURL" type="text" id="copyURL" value="<%=copyURL%>" size="70" />
      <input type="file" name="copyURLBrowse" id="copyURLBrowse"
    		onchange="setURL('copyURL', this.value)"/>
    </div>
    <div class="listFolderLayer hidden">
      listFolder constraint
      <select name="constraint" id="constraint">
        <option value="-" selected="selected">files and folders</option>
        <option value="files">files only</option>
        <option value="folders">folders</option>
      </select>
      regex filter:
      <input name="listFolderFilter" type="text" id="listFolderFilter" value="<%=listFolderFilter%>" />
    e.g. .*\.js
    EZ*.*
    </div>
    <div class="writeLayer hidden">
      write mode
      <select name="mode" id="mode">
        <option value="append">append</option>
        <option value="overwrite" selected="selected">overwrite</option>
      </select>
    </div>
    <div class="writeLayer readLayer hidden">
      text read / text to write:<br />
      <textarea name="text" cols="100" rows="5" id="text" style="width:100%"><%=text%></textarea>
    </div>
  </div>
  <br />
  <div class="header border-simple">results:<br />
  <results><%=results%></results>
  </div>
  <br />
  <div class="header border-simple">message:<br />
  <errmsg><%=errmsg%></errmsg>
  </div>
  <br />
  <div class="header">stacktrace:</div>
  <pre class="textBox">
<stacktrace><%=stacktrace%></stacktrace>
</pre>
</form>
</body>
</html>
