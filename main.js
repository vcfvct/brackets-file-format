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
        PRETTY_XML_COMMAND_ID      = "vcfvct.formatter.pretty.xml",
        PRETTY_JSON_COMMAND_ID      = "vcfvct.formatter.pretty.json",

        INDENT_KEY = "Ctrl-Shift-I",
        FORMAT_KEY = "Ctrl-Alt-L",
        PRETTY_XML_KEY = "Ctrl-Alt-Shift-B",
        PRETTY_JSON_KEY = "Ctrl-Alt-Shift-M",
        MIN_KEY = "Ctrl-Alt-M";

    // home grow format lib
    var formatter = require("lib/format-helper");

    // file extension <-> format method to be used MAP
    var supportedFile = {xml:'xml',css:'css',sql:'sql',json:'json',html:'xml'};
    // currently supported actions.
    var supportedAction = {INDENT:'indent', FORMAT:"format", MINIFY:"minify"};

    CommandManager.register("Auto Indent", INDENT_COMMAND_ID, autoIndent);
    CommandManager.register("Auto Format", FORMAT_COMMAND_ID, autoFormat);
    CommandManager.register("Auto Minify", MIN_COMMAND_ID, autoMin);
    CommandManager.register("Pretty XML", PRETTY_XML_COMMAND_ID, prettyXml);
    CommandManager.register("Pretty JSON", PRETTY_JSON_COMMAND_ID, prettyJson);
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
                if(supportedFile[extention]){
                    doc.setValue(formatter.doFormat(doc.getValue(), {method:supportedFile[extention]}));
                }
                break;
            case supportedAction.MINIFY:
                if(supportedFile[extention]){
                    doc.setValue(formatter.doFormat(doc.getValue(), {method:supportedFile[extention] + 'min'}));
                }
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

            if(newExt==='' && !Menus.getMenuItem(menu._getMenuItemId(PRETTY_XML_COMMAND_ID))){
                menu.addMenuItem(PRETTY_XML_COMMAND_ID, [{key: PRETTY_XML_KEY, platform: "win"},
                                                         {key: PRETTY_XML_KEY, platform: "mac"}]);
                menu.addMenuItem(PRETTY_JSON_COMMAND_ID, [{key: PRETTY_JSON_KEY, platform: "win"},
                                                          {key: PRETTY_JSON_KEY, platform: "mac"}]);
            }
            if(oldExt === '' && newExt !== ''){
                menu.removeMenuItem(PRETTY_XML_COMMAND_ID);
                menu.removeMenuItem(PRETTY_JSON_COMMAND_ID);
                KeyBindingManager.removeBinding(PRETTY_XML_KEY);
                KeyBindingManager.removeBinding(PRETTY_JSON_KEY);
            }
        }
    };

    function prettyXml(){
        var editor = EditorManager.getFocusedEditor();
        var doc = editor._codeMirror;
        doc.setValue(formatter.doFormat(doc.getValue(), {method:"xml"}));
    }
    function prettyJson(){
        var editor = EditorManager.getFocusedEditor();
        var doc = editor._codeMirror;
        doc.setValue(formatter.doFormat(doc.getValue(), {method:"json"}));
    }

    AppInit.appReady(function () {
        //bind the file change event so that we could add/remove the format/minify based on file extension.
        $(MainViewManager).on('currentFileChange', fileChangeHandler);
    });

    // bind indent command since it is for all file type;
    var menu = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);
    menu.addMenuItem(INDENT_COMMAND_ID, [{key: INDENT_KEY, platform: "win"},
                                         {key: INDENT_KEY, platform: "mac"}]);
//    menu.addMenuItem(PRETTY_XML_COMMAND_ID, [{key: PRETTY_XML_KEY, platform: "win"},
//                                             {key: PRETTY_XML_KEY, platform: "mac"}]);
//    menu.addMenuItem(PRETTY_JSON_COMMAND_ID, [{key: PRETTY_JSON_KEY, platform: "win"},
//                                              {key: PRETTY_JSON_KEY, platform: "mac"}]);

    //add auto indent also to the context menu(right click)
    var contextMenu = Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU);
    contextMenu.addMenuItem(INDENT_COMMAND_ID);

});
