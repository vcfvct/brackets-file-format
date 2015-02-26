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
    // home grow format lib
    var formatter = require("lib/format-helper");

    var supportedFile = {xml:true,css:true,sql:true,json:true};
    var supportedAction = {INDENT:'indent', FORMAT:"format", MINIFY:"minify"};

    CommandManager.register("Auto Indent", INDENT_COMMAND_ID, autoIndent);
    CommandManager.register("Auto Format", FORMAT_COMMAND_ID, autoFormat);
    CommandManager.register("Auto Minify", MIN_COMMAND_ID, autoMin);
    //do indent for the file content
    function autoIndent() {
        modifyContent(supportedAction.INDENT);
    };

    // do format for the content
    function autoFormat(){
        modifyContent(supportedAction.FORMAT);
    };

    //do minify for the content
    function autoMin(){
        modifyContent(supportedAction.MINIFY);
    };

    function modifyContent(action){
        var editor = EditorManager.getFocusedEditor();
        var file = DocumentManager.getCurrentDocument().file;
        var extention = FileUtils.getFileExtension(file.fullPath);
        if (!editor || !extention) {
            return;
        }
        var doc = editor._codeMirror;

        switch(action){
            case supportedAction.INDENT:
                for (var i=0;i<doc.lineCount();i++) { 
                    doc.indentLine(i); 
                }
                break;
            case supportedAction.FORMAT:
                doc.setValue(formatter.doFormat(doc.getValue(), {method: extention}));
                break;
            case supportedAction.MINIFY:
                doc.setValue(formatter.doFormat(doc.getValue(), {method: extention+'min'}));
                break;
            default:
                //do nothing
        }
    }

    // handling file selection change to show/hide format/minify menu
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
            // if new file is not supported and we have the menus, remove them.
            if(supportedFile[oldExt] && !supportedFile[newExt]){
                menu.removeMenuItem(FORMAT_COMMAND_ID);
                menu.removeMenuItem(MIN_COMMAND_ID);
                KeyBindingManager.removeBinding(FORMAT_KEY);
                KeyBindingManager.removeBinding(MIN_KEY);
            }
            // if old file is not supported but new file is,  we add the menus.
            if(!supportedFile[oldExt] && supportedFile[newExt]){
                menu.addMenuItem(FORMAT_COMMAND_ID, [{key: FORMAT_KEY, platform: "win"},
                                                     {key: FORMAT_KEY, platform: "mac"}]);
                menu.addMenuItem(MIN_COMMAND_ID, [{key: MIN_KEY, platform: "win"},
                                                  {key: MIN_KEY, platform: "mac"}]);
            }
        }
    };

    AppInit.appReady(function () {
        //bind the file change event so that we could add/remove the format/minify based on file extension.
        $(MainViewManager).on('currentFileChange', fileChangeHandler);
    });

    // bind indent command since it is for all file type;
    var menu = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);
    menu.addMenuItem(INDENT_COMMAND_ID, [{key: INDENT_KEY, platform: "win"},
                                         {key: INDENT_KEY, platform: "mac"}]);

});
