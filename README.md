# Notable code view cursor and selections
When code view does ***NOT*** have focus, selection -or- cursor shows as follows:

selection . . . . . . . . . . . . . . . . cursor -- blinks for 9 seconds (default)  

![](http://i.imgur.com/OzB4wvr.png). . . ![](http://i.imgur.com/Do9WrSb.gif) 
**note:** Above arrows are hidden when selection starts in first column. Below arrows hidden for multi-line selections or selection ends in last column. The purpose is to make a small design view selections Notable. 

***...when design view has focus*** -- **code view shows associated notable  cursor...**
![design view has focus](http://i.imgur.com/uR4CWfn.png)  

**...no tail when code view has focus...** 
![code view has focus](http://i.imgur.com/Eyvv7Qm.png)

**...one or more tags selected -- highlighting *NOT* hidden when design has focus...**
![](http://i.imgur.com/2lurRGy.png)
![](http://i.imgur.com/WP9xyxt.png)

**...only selected text highlighted when design has focus...**
![](http://i.imgur.com/Gh6ybyE.png)

***...when code has focus*** -- **all strings matching selected text underlined...**
![](http://i.imgur.com/BLh0aHL.png)

***...when text selected in design view*** -- **arrows make selection notable...**
![](http://i.imgur.com/raiQB44.png)

**...current selection notable in dialog windows -- e.g. find and replace...** 
![](http://i.imgur.com/fN2BGnO.png)

Exceptions: Notable cursor shows when `find` dialog box open but no cursor appears when either replace dialog is open.
## exceptions ##


# Restore Dreamweaver Code Coloring Pref (Under Review) #  

![CC 2015.1 screenshot](http://i.imgur.com/3QKBcIv.png)
![CC 2015.1 screenshot](http://i.imgur.com/6DGRxH0.png)

## Installation

### Notable Code View Cursor...
Currently available as small css/less snippet for DW CC 2017.1 (build 9583)  

1. Download [notable css/less snippet](https://github.com/flkeysgeek/DW-CC-2017-code-coloring-pref/blob/master/notable.zip)
  
2. Create custom theme as explained by Adobe: [Customize code themes](https://helpx.adobe.com/dreamweaver/using/customize-code-coloring.html)  
good instructions -- no need visit reference links

3. under section: ***Edit selectors in the main.less file***  
simply add downloaded `notable css/less snippet` to bottom of main.less

coming... included as part of Code Coloring DW Extension 

### Code Coloring Preference... 

- under review / development -- expected beta release July 2017
- plan to release as Dreamweaver Extension 