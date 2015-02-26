/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

/** Simple extension that adds a "File > Hello World" menu item */
define(function (require, exports, module) {
    "use strict";

    var AppInit = brackets.getModule("utils/AppInit"),
        MainViewManager = brackets.getModule("view/MainViewManager"),
        CommandManager  = brackets.getModule("command/CommandManager"),
        EditorManager   = brackets.getModule("editor/EditorManager"),
        KeyBindingManager   = brackets.getModule("command/KeyBindingManager"),
        DocumentManager   = brackets.getModule("document/DocumentManager"),
        FileUtils = brackets.getModule("file/FileUtils"),
        Menus           = brackets.getModule("command/Menus"),
        INDENT_COMMAND_ID      = "vcfvct.formatter.indent",
        FORMAT_COMMAND_ID      = "vcfvct.formatter.format",
        MIN_COMMAND_ID      = "vcfvct.formatter.min",
        INDENT_KEY = "Ctrl-Shift-I",
        FORMAT_KEY = "Ctrl-Shift-F",
        MIN_KEY = "Ctrl-Shift-M";

    var supportedFile = {xml:true,css:true,sql:true,json:true};

    CommandManager.register("Auto Indent", INDENT_COMMAND_ID, autoIndent);
    CommandManager.register("Auto Format", FORMAT_COMMAND_ID, autoFormat);
    CommandManager.register("Auto Minify", MIN_COMMAND_ID, autoMin);
    function autoIndent() {
        var editor = EditorManager.getFocusedEditor();
        if (!editor) {
            return;
        }
        var doc = editor._codeMirror;
        // var e = doc.fromTextArea(textarea.get(0), {});
        for (var i=0;i<doc.lineCount();i++) { 
            doc.indentLine(i); 
        }
    };

    var formatter = require("lib/format-helper");
    function autoFormat(){
        var editor = EditorManager.getFocusedEditor();
        var file = DocumentManager.getCurrentDocument().file;
        var extention = FileUtils.getFileExtension(file.fullPath);
        if (!editor || !extention) {
            return;
        }
        var doc = editor._codeMirror;
        var options = {method: extention};
        doc.setValue(formatter.doFormat(doc.getValue(), options));
    };

    function autoMin(){
        var editor = EditorManager.getFocusedEditor();
        var file = DocumentManager.getCurrentDocument().file;
        var extention = FileUtils.getFileExtension(file.fullPath);
        if (!editor || !extention) {
            return;
        }
        var doc = editor._codeMirror;
        var options = {method: extention+'min'};
        doc.setValue(formatter.doFormat(doc.getValue(), options));
    };


    var fileChangeHandler = function ($event, newFile, newPaneId, oldFile, oldPaneId) {
        var newExt = FileUtils.getFileExtension(newFile.fullPath);
        // on app init, old file is null.
        if(oldFile === null){
            if(supportedFile[newExt]){
                menu.addMenuItem(FORMAT_COMMAND_ID, [{key: FORMAT_KEY, platform: "win"},
                                                     {key: FORMAT_KEY, platform: "mac"}]);
                menu.addMenuItem(MIN_COMMAND_ID, [{key: MIN_KEY, platform: "win"},
                                                  {key: MIN_KEY, platform: "mac"}]);
            } 
        }
        else{
            var oldExt = FileUtils.getFileExtension(oldFile.fullPath);
            if(newExt !== oldExt){
                if(supportedFile[oldExt]){
                    menu.removeMenuItem(FORMAT_COMMAND_ID);
                    menu.removeMenuItem(MIN_COMMAND_ID);
                    KeyBindingManager.removeBinding(FORMAT_KEY);
                    KeyBindingManager.removeBinding(MIN_KEY);
                }
                if(supportedFile[newExt]){
                    menu.addMenuItem(FORMAT_COMMAND_ID, [{key: FORMAT_KEY, platform: "win"},
                                                         {key: FORMAT_KEY, platform: "mac"}]);
                    menu.addMenuItem(MIN_COMMAND_ID, [{key: MIN_KEY, platform: "win"},
                                                      {key: MIN_KEY, platform: "mac"}]);
                }
            }

        }
    };

    AppInit.appReady(function () {
        $(MainViewManager).on('currentFileChange', fileChangeHandler);
    });

    // Then create a menu item bound to the command
    // The label of the menu item is the name we gave the command (see above)
    var menu = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);
    menu.addMenuItem(INDENT_COMMAND_ID, [{key: INDENT_KEY, platform: "win"},
                                         {key: INDENT_KEY, platform: "mac"}]);

});
