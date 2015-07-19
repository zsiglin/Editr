+function(){
  var createNewDoc = function(){
    Meteor.call("addDoc", session, function(error, docId){
      monitorChanges(docId);
    });
  }

  var monitorChanges = function(docId){
    var query = Docs.find({_id : docId});
    console.log(query.content)

    query.observe({        
      changed: function(newDoc, oldIndex, oldDoc) {
        if(newDoc.sessionId != session){
          editor.setValue(newDoc.content);
        }
      }
    });

    editor.getSession().on("change", function(){
      if(editor.curOp && editor.curOp.command.name){
        var editorVal = editor.getValue();
        Meteor.call("updateDoc", docId, editorVal, session);
      }
    });
  }

  var initDoc = function(){
    var docId = getUrlVars()["docId"];

    if(docId){
      monitorChanges(docId);
    } else {
      createNewDoc();
    }
  }

  var setEventListeners = function(){
    syntaxSelect.addEventListener("change", function(){
      var index = this.selectedIndex;
      var val = this.options[index].value;
      changeSyntax(val);
    });
  }

  var changeSyntax = function(syntax){
    syntaxSelect.value = localStorage.syntax = syntax;
    editor.getSession().setMode("ace/mode/" + syntax);
    editor.focus();
  }

  var getUrlVars = function(){
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,    
    function(m,key,value) {
      vars[key] = value;
    });
    return vars;
  }

  var init = function(){
    // ace editor init
    syntaxSelect = document.querySelector("#syntax");
    editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai");
    editor.setFontSize("16px");
    editor.setShowPrintMargin(false);
    editor.focus();

    // meteor init
    Meteor.subscribe("docs");
    session = Meteor.default_connection._lastSessionId;

    // event listeners
    setEventListeners();

    // set saved/default syntax
    changeSyntax(localStorage.syntax || "javascript");

    // new doc/load doc
    initDoc();
  }

  window.addEventListener("load", init);
}();
  


