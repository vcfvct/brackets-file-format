brackets-file-format
============================

This extension adds re-indent and auto-formatting function to certain file types Adobe Brackets.

You can re-indent all file types by using "Edit > Auto Indent" menu or "Ctrl+Shift+I" key. OR you can right click and select 'Auto Indent'.

You can format `XML/HTML`, `CSS`, `JSon`, and `SQL` files by "Edit > Auto Format" menu or "Ctrl+Alt+F" key.

You can minify `XML/HTML`, `CSS`, `JSon`, and `SQL` files by "Edit > Auto Minify" menu or "Ctrl+Alt+M" key.

If you do not want to save to xml/json file to format (i.e file without extension), use:

Ctrl-Alt-Shift-B for pretty XML

Ctrl-Alt-Shift-M for pretty Json

Use the above keys just to make it the same as what we have in notepad++'s xml/json plugin.


Install
===

Please download zip and extract into arbitrary directory (or clone source files), then move the folder to the extensions folder (you can open this folder by clicking "Help > Show Extensions Folder" menu).


License
===
This software is licensed under MIT license.

Change log
===
V1.2.2 show pretty xml/json menu item only for file without extension.

V1.2.1
change the format hotkey to ctrl-alt-L so that it does not flush the system default key. also changed the minify to ctrl-alt-M for consistency.

v1.2.0
added the auto indent to the context menu(right click).

v1.1.0
added Ctrl-Alt-Shift-B for pretty XML AND Ctrl-Alt-Shift-M for pretty Json. These key combination is the same as what we have in notepad++'s xml/json plugin.
