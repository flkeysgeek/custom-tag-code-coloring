# Dreamweaver Custom Tag Code Coloring (CC 2017)  

Adobe Dreamweaver CC 2017 lost the ability to define custom tag Code Coloring. 
 
![](http://i.imgur.com/ofEBslS.png)

The included xml.js restores that feature as shown below:  
![](http://i.imgur.com/UDrZsS6.png) 
![](http://i.imgur.com/RJg4zVx.png)

The tag colors are defined by adding css of the following form to a custom theme:

    span.cm-m-xml.cm-tag.cm-tag-body {
      color: red;
    }
    span.cm-m-xml.cm-tag.cm-tag-h1 {
      color: hotpink;
    }
    span.cm-m-xml.cm-tag.cm-tag-form {
      color: orange;
    }
    span.cm-m-xml.cm-tag.cm-tag-input {
      color: #0BF90E;
    }
    
# *Coming Soon!!* #

**Dreamweaver extension with screens similar to CC 2015 Code Coloring...**

![CC 2015.1 screenshot](http://i.imgur.com/3QKBcIv.png)  
![CC 2015.1 screenshot](http://i.imgur.com/6DGRxH0.png)

# Notable Code View Cursor and current selection 

Make current selection or cursor highly visible (notable) in Code View.

***...When code view does NOT have focus*** -- **selection -or- cursor shows as follows:**

selection (does not blink) . . . . . . . . . . . . . . . . cursor -- blinks for 15 seconds (default)  

![](http://i.imgur.com/OzB4wvr.png). . . ![](http://i.imgur.com/Do9WrSb.gif)  

- Above arrows are hidden when selection starts in first column
- Below arrows hidden for multi-line selections or selection ends in last column.
  
**Light themes show as follows:**  
![](http://i.imgur.com/zSy4llI.png)  

Notable cursor shows when `find` or any other dialog box is open including right click context menu.

Color/size of cursor, arrows, highlighted selections can all be changed via css.

[additional screen prints](screenprints/code-view-cursor.md)

### Coming Soon...

Dreamweaver extension with GUI screen for setting colors/sizes by theme. 

---------------------------------------------------------------------------

## Installation

- Custom Tag Code Coloring and Notable Code View Cursors are implemented via css styles
- They can be installed separately by selectively adding css to custom theme
- both require a custom Dreamweaver theme -- create or select as follows

1. Download [theme-less.zip](https://github.com/flkeysgeek/custom-tag-colors/raw/master/theme-less.zip)
  
2. From DW menu: edit > preferences > Interface (left panel category)

3. Select or Create new "Color Theme" -- click Apply if new or not selected

4. click on pencil icon to open and edit the selected theme in Dreamweaver  

5. At bottom of file: Add css for custom tag colors and/or Notable Code View cursors

### Create custom Dreamweaver theme as explained by Adobe: 
[Customize code themes](https://helpx.adobe.com/dreamweaver/using/customize-code-coloring.html)  
- good instructions -- no need visit reference links
- Customize code colors for mixed code files (should get done by default)

### Custom Tag Colors requires Dreamweaver code update  

An updated xml.js must be installed -- it adds the additional cm-tag-<...> class.   

- download [xml.js.zip](https://github.com/flkeysgeek/DW-CC-2017-code-coloring-pref/raw/master/src/xml.js%20(custom-tag-colors).2017-06-20%20beta.zip)
- open and copy "www" into...    
...windows: %appdata%\Adobe\Dreamweaver CC 2017\  
...On Mac: ~/Library/Application Support/Adobe/Dreamweaver CC 2017/
- close and reopen Dreamweaver

**caution:** DW releases after 2017.5, DO NOT use updated xml.js unless the installed 
xml.js matches [xml.js](https://github.com/flkeysgeek/DW-CC-2017-code-coloring-pref/raw/master/src/xml.js%20(Adobie%20CC%202017.2%2B%20release).zip) (Adobe installed version for CC 2017.2 and 2017.5)
    
# *Coming Soon -- Dreamweaver extension !!* #

- GUI screen for setting colors/sizes by theme
- select tag colors via color picker
- automatically updates selected theme main.less files
- updates xml.js when necessary
- access to tag color repository 

### tag color repository 

1. default tag colors from CC 2015
2. tag colors shared by other designers
3. share your tag colors with other Designers 

### feedback encouraged

![](http://i.imgur.com/AklRbrW.jpg) flKeysGeek@gmail.com

# *Coming Next -- devtools extension* #

  