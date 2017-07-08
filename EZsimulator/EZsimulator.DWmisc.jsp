<%@ page contentType="text/html; charset=utf-8" language="java"
%>
<%@ include file="EZdw.simulator.utils.jsp"
%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>EZ DWmisc Simulator</title>
<link rel="shortcut icon" href="EZdw.simulatorIcon.png" />
<script type="text/javascript" src="../js/EZcore.js"></script>
<link href="../css/EZcommon.css" rel="stylesheet" type="text/css" />
<style type="text/css">
results {
	white-space: pre;
	font-family: monospace;
}
</style>
<%!
/*______________________________________________________________________________________________

Stripped clone of DWfile & DWpref -- originally created to run bat files via dw.launchApp()
______________________________________________________________________________________________*/

/******************************************/
/*BOOKMARK -----DWfile simulator jsp code*/
/****************************************/
%>
<%

String results = "";

//                              0         1
List functions = Arrays.asList("launchApp todo".split(" "));
String fn = getParameterString("fn");
int fnIndex = functions.indexOf(fn);

String configPath = getParameterString("configPath", null);
if (configPath == null)
	configPath = "C:/Users/Dell/AppData/Roaming/Adobe/Dreamweaver CC 2014.1/en_US/Configuration/";

String cmd = getParameterString("cmd");
String args = getParameterString("args");
String mode = getParameterString("mode", "cmd");

//System.out.println("mode: " + mode);
//System.out.println("cmd: " + cmd);
//System.out.println("args: " + args);

String fileURL = getParameterString("fileURL");
String filePath = "future";

try
{
	if (fn.equals(""))
	{
		results = "no function specified";
	}
	else if (fn.equals("launchApp"))
	{
		results = run(cmd, args, mode);
	}
	else
	{
		results = "unsuporrted function: " + fn;
	}
}
catch (Exception e)
{
	FormatException fe = new FormatException(e);
	errmsg = fe.message;
	stacktrace = fe.stacktrace;
}
if (errmsg.equals(""))
	errmsg = message;
%>
<%!
/*******************************************/
/*BOOKMARK -----page specific java methods*/
/*****************************************/

/**
 */
static String run(String cmd, String args, String mode) throws Exception
{
	cmd = cmd.trim();
	if (mode.equals("start"))
		cmd = "start " + cmd;

	if (cmd.indexOf("cmd /c") != 0)			//add cmd /c if omitted
	{
		String q = "\"";
		if (args.indexOf(q) != -1)			//if args contains double quotes
		{
			cmd = q + cmd + " " + args + q;
			args = "";
		}
		cmd = "cmd /c " + cmd;
	}

	if (cmd.indexOf("<") == -1 && cmd.indexOf("|") == -1 )
		cmd += " <nul";						//input not allowed


	cmd += " " + args;
	message = cmd;
	System.out.println("message: " + message);

	Process process = Runtime.getRuntime().exec(cmd);

	//----- get command output
	String sw = "";
	InputStream is = process.getInputStream();

	BufferedReader br = new BufferedReader(new InputStreamReader(is,"windows-1252"), 8192);
	String str = "";
	while ((str = br.readLine()) != null)
		sw += str + '\n';
	return sw;
}
%>
<script type="text/javascript">
/*****************************************/
/*BOOKMARK -----page specific Javascript*/
/***************************************/
/*---------------------------------------------------------------------------------------------
---------------------------------------------------------------------------------------------*/
function setup()
{
	var fm = document.forms[0];
	if (fm.fn.selectedIndex < 1)
		fm.fn.selectedIndex = 1;	//default: dw.launchApp()

	var cmd = fm.cmd.value;
	if (!cmd)
	{
		var bat = fm.configPath.value + 'Shared/EZ/simulator/EZsimulator.DWmisc.test.bat';
		cmd = '"' + bat.replace(/\//g, '\\') + '"';
		fm.cmd.value = cmd;
	}
}
/*---------------------------------------------------------------------------------------------
---------------------------------------------------------------------------------------------*/
</script>
</head>
<body onload="setup()">
<form action="" method="post" name="theForm" id="theForm" onsubmit="//return validateForm(this)">
  <div class="header" id="parametersLayer">
    <!-- useful when testing as standalone pgge -->
    configPath:
    <input name="configPath" type="text" id="configPath" value="<%=configPath%>" size="80" />
    <br />
    DWmisc.fn:
    <select name="fn" id="fn" onchange="setFnClass()">
      <option>-select-</option>
      <%
	for (int i=0; i<functions.size(); i++)
		out.println("<option value=" + functions.get(i) + ">" + functions.get(i) + "</option>");
	%>
    </select>
    run mode:
    <label>
      <input name="mode" type="radio" value="cmd" checked="checked" />
    cmd /c </label>
    <label>
      <input type="radio" name="mode" value="start" />
      cmd /c start</label>
<input type="submit" name="submit" id="submit" value="Submit" />
    <br />
    &nbsp;&nbsp;&nbsp;DOS command:
    <input name="cmd" type="text" id="cmd" value="<%=cmd%>" size="120" />
    <br />
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;arguments:
    <input name="args" type="text" id="args" value="<%=args%>" size="120" />
    <br />
    &nbsp;&nbsp;&nbsp;fileURL:
    <input name="fileURL" type="text" id="fileURL" value="<%=fileURL%>" size="70" />
    <input type="file" name="fileURLBrowse" id="fileURLBrowse"
    		onchange="setURL('fileURL', this.value)"/>
    <br />
    &nbsp;&nbsp;&nbsp;filePath:
    <input name="filePath" type="text" id="filePath" value="<%=filePath%>" size="90" />
    <span class="normal">Display Only</span>
  </div>
  <br />
  <div class="header">
    results:
  </div>
  <results><%=results%></results>
  <br />
  <div class="header border-simple">
    message:<br />
    <errmsg><%=errmsg%></errmsg>
  </div>
  <br />
  <div class="header">
    stacktrace:
  </div>
  <pre class="textBox">
<stacktrace><%=stacktrace%></stacktrace>
</pre>
</form>
</body>
</html>
