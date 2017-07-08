<%@ page contentType="text/html; charset=utf-8" language="java"
%><%@ include file="EZdw.simulator.utils.jsp"
%><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>EZ DWpref Simulator</title>
<link rel="shortcut icon" href="EZdw.simulatorIcon.png" />
<style type="text/css">
.textBox {
	/* useful when testing as standalone pgge */
	padding: 5px;
	font: 12px Arial,Helvetica,sans-serif;
	border: 2px solid #C00;	/* red */
	background: #FEFEC8;
	overflow: scroll;
  	max-height: 300px;
}
results {
	white-space: pre;
	font-family: monospace;
}
</style><%!
/******************************************/
/*BOOKMARK -----DWfile simulator jsp code*/
/****************************************/
String regBaseKey;
String regRawOutput;
static String regQuery = "";
%><%

String results = "";

String fn = getParameterString("pref_fn");
String mode = getParameterString("pref_mode");

String dwBaseKey = getParameterString("pref_dwBaseKey");
String group = getParameterString("pref_group");
String key = getParameterString("pref_key");
String value = getParameterString("pref_value");
String defaultValue = getParameterString("pref_defaultValue");

regBaseKey = "HKEY_CURRENT_USER\\Software\\Adobe\\" + dwBaseKey + "\\" + group;
regRawOutput = "";	//get 
try
{
	if (fn.equals(""))
	{
		results = "no DWpref fn specified";
	}
	else if (" string int ".indexOf(" " + mode + "") == -1)
	{
		results = "invalid DWpref mode: " + mode;
	}
	else if (fn.equals("get"))
	{
		results = "";
		results = getKey(mode, key, defaultValue);
	}
	else if (fn.equals("getAll"))
	{
		if (mode.equals("string")) mode = "REG_SZ";
		regRawOutput = readRegistry(regBaseKey, mode).trim();
		results = regRawOutput;
		
		errmsg = regQuery;
																	//escape empty values
		results = results.replaceAll( "(\\s*REG_SZ\\s*)\\n", "$1 ##empty## \n");	
		results = results.replaceAll( "\"", "\\\\\"" );				//embedded double quotes
		
																	//heading		
		results = results.replaceFirst( regBaseKey.replace('\\','.') + "\\s*\\n\\s*", "{\"");
		results = results.replaceFirst( "\\s*End of search:.*", "\"}");	//footer
		
		results = results.replaceAll( "\\n\\s+", "\n\"" );
		results = results.replaceAll( "\\s*REG_SZ\\s*", "\": \"" );
		results = results.replaceAll( "\\s*\\n", "\",\n" );
		
		results = results.replaceAll( "\"##empty##\"", "\"\"");		//unescape empty values
	}
	else if (fn.equals("set"))
	{
		results = "false";
		results = setKey(mode, key, value) + "";
	}
	else
	{
		results = "unknown DWpref fn: " + fn;
	}
}
catch (Exception e)
{
	FormatException fe = new FormatException(e);
	errmsg = fe.message;
	stacktrace = fe.stacktrace;
}
if (!errmsg.equals("")) errmsg = "DWpref: " + errmsg;
%><%!
/*******************************************/
/*BOOKMARK -----page specific java methods*/
/*****************************************/
boolean setKey(String mode, String key, String value)
{
	try
	{
		String param = "REG ADD " 
					 + '"' + regBaseKey + '"' + " /v " + '"' + key + '"' 
					 + " /t " + (mode.equals("int") ? "REG_DWORD" : "REG_SZ")
			   		 + " /d " + '"' + value + '"' + " /f";
		errmsg = param;
		Runtime.getRuntime().exec(param);
	}
	catch (Exception e)
	{
		return false;
	}
	return true;
}
/**
 *	get raw output from REQ query.
 * 	for mode=int, return last word of the form x###x -- e.g.
 *
 *	HKEY_CURRENT_USER\Software\Adobe\Dreamweaver CC 2014.1\EZ Preferences
 *   	Max Chars Displayed    REG_DWORD    0x7
 * 	returns "0x7" -- let js convert to number
 *
 *  for mode=string, return string following REG_SZ w/o leading spaces
 *	e.g. below output returns "open"
 *
 *	HKEY_CURRENT_USER\Software\Adobe\Dreamweaver CC 2014.1\EZ Preferences
 *   	Code Search Scope    REG_SZ    open
 */
String getKey(String mode, String key, String defaultValue)
{
	regRawOutput = readRegistry(regBaseKey, key);
	errmsg = regQuery;
	while (regRawOutput != null)
	{
		regRawOutput = regRawOutput.replace('\t', ' ').trim();
		if (regRawOutput.equals("")) break;
		
		int offset = regRawOutput.lastIndexOf(" ");
		if (mode.equals("string"))
		{
			offset = regRawOutput.lastIndexOf("REG_SZ");
			if (offset == -1) break;
			return regRawOutput.substring(offset+6).trim();
		}
		else if (offset > 0)
			return regRawOutput.substring(offset+1);

		break;
	}
	return defaultValue;
}
/**
 */


/**
 * @param location path in the registry
 * @param key registry key
 * @return registry value or null if not found
 * 
 * Base for reading registry:
 * @author Oleg Ryaboy, based on work by Miguel Enriquez
 * http://stackoverflow.com/questions/62289/read-write-to-windows-registry-using-java
 *
 *  Reference for specifying encoding but does not work as expected:
 *  http://stackoverflow.com/questions/4964640/reading-inputstream-as-utf-8
 *  
 *  US-ASCII Seven-bit ASCII, a.k.a. ISO646-US, a.k.a. the Basic Latin block of the Unicode character set 
 *  ISO-8859-1   ISO Latin Alphabet No. 1, a.k.a. ISO-LATIN-1 
 *  UTF-8 Eight-bit UCS Transformation Format 
 *  UTF-16BE Sixteen-bit UCS Transformation Format, big-endian byte order 
 *  UTF-16LE Sixteen-bit UCS Transformation Format, little-endian byte order 
 *  UTF-16 Sixteen-bit UCS Transformation Format, byte order identified by an optional byte-order mark 
 *  
 *  more: http://www.rgagnon.com/javadetails/encoding.html
 *  windows-1252: still nogo
 */
static String readRegistry(String location, String key)
{
	try 
	{
		regQuery = "reg query " + '"' + location + '"' + " /v " + '"' + key + '"';
		
		if (key.equalsIgnoreCase("REG_SZ"))
			regQuery = "reg query " + '"' + location + '"' + " /t " + '"' + key + '"';
		
		// Run reg query, then read output with StreamReader	
		Process process = Runtime.getRuntime().exec(regQuery);
		
		String sw = "";
		InputStream is = process.getInputStream();
		
		BufferedReader br = new BufferedReader(new InputStreamReader(is,"windows-1252"), 8192);
		String str;
		while ((str = br.readLine()) != null) {
			sw += str + '\n';
		}
		
		// hack to recover EZ.constant.DOT (8226) and EZ.constant.EOL (172);
		sw = sw.replace( (char)7, (char)8226 );
		sw = sw.replace( (char)170, (char)172 );
		return sw;
	}
	catch (Exception e) 
	{
		return null;
	}
}
/**
  * not used
 */  
static class StreamReader extends Thread 
{
	private InputStream is;
	private StringWriter sw= new StringWriter();
	public StreamReader(InputStream is) 
	{
		this.is = is;
	}
	public void run() 
	{
		try 
		{
			int c;
			while ((c = is.read()) != -1)
				sw.write(c);
		}
		catch (IOException e){}
	}
	public String getResult() 
	{
		return sw.toString();
	}
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
	if ('<%=fn%>' == '') return;
	fm.pref_dwBaseKey.value = '<%=dwBaseKey%>';
	fm.pref_group.value = '<%=group%>';
	fm.pref_key.value = '<%=key%>';
	fm.pref_value.value = '<%=value%>';
	fm.pref_defaultValue.value = '<%=defaultValue%>';
}
/*---------------------------------------------------------------------------
----------------------------------------------------------------------------*/
function processPref(fn, mode)
{
	var fm = document.forms[0];
	fm.pref_fn.value = fn;
	fm.pref_mode.value = mode;
	fm.submit();
}
/*---------------------------------------------------------------------------
----------------------------------------------------------------------------*/
</script>
</head>
<body onload="setup()" class="importExport">
<form action="" method="get" name="theForm" onsubmit="return validateForm(this)">
  <table width="100%" border="0" cellspacing="5" cellpadding="0">
    <tbody>
      <tr>
        <td nowrap="nowrap">
          <span class="floatLeft">
          <input type="button" value="getPreferenceString" onclick="processPref('get','string')"/>
          </span>
        </td>
        <td>
          <span class="floatLeft">
          <input type="button" value="getPreferenceInt" onclick="processPref('get','int')"/>
          </span>
        </td>
        <td align="right">
          group
        </td>
        <td>
          <input name="pref_group" type="text" id="pref_group" value="EZ Preferences" size="30" />
          <span class="floatLeft">
          <input type="button" value="geAllStrings" onclick="processPref('getAll','string')"/>
          </span>
        </td>
      </tr>
      <tr>
        <td>
          <span class="floatLeft">
          <input type="button" value="setPreferenceString" onclick="processPref('set','string')"/>
          </span>
        </td>
        <td>
          <span class="floatLeft">
          <input type="button" value="setPreferenceInt" onclick="processPref('set','int')"/>
          </span>
        </td>
        <td align="right">
          key
        </td>
        <td>
          <input name="pref_key" type="text" id="pref_key" value="logging" size="30" />
        </td>
      </tr>
      <tr>
        <td>
          dwBaseKey (version)
        </td>
        <td>
          <input name="pref_dwBaseKey" type="text" id="pref_dwBaseKey" value="Dreamweaver CC 2014.1" size="30" />
        </td>
        <td align="right">
          value
        </td>
        <td>
          <input name="pref_value" type="text" id="pref_value" value="true" size="30" />
        </td>
      </tr>
      <tr>
        <td>
          request fn: <span id="pref_result_type"><%=fn%>&nbsp; mode:<%=mode%></span>
        </td>
        <td>
          <input name="pref_results" type="text" id="pref_results" size="30" value="&rarr;<%=results%>&larr;"/>
        </td>
        <td align="right">
          default
        </td>
        <td>
          <input name="pref_defaultValue" type="text" id="pref_defaultValue" size="30" />
        </td>
      </tr>
      <tr>
        <td colspan="4">
          full location: <%=regBaseKey%>
        </td>
      </tr>
      <tr>
        <td valign="top">
          REG raw output
            <br />
        </td>
        <td colspan="3">
          <textarea name="regRawOutput" id="regRawOutput" cols="90" rows="5"><%=regRawOutput%></textarea>
        </td>
      </tr>
    </tbody>
  </table>
  <input type="hidden" name="pref_fn" id="pref_fn" />
  <input type="hidden" name="pref_mode" id="pref_mode" />
<br /><b>results:</b><br />

<results><%=results%></results>

<br /><b>message:</b><br />

<errmsg><%=errmsg%></errmsg>

<br><b>stacktrace:</b><br />
<pre class="textBox">
<stacktrace><%=stacktrace%></stacktrace>
</pre>
</form>
</body>
</html>
