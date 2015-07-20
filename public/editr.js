var app = {
  addDoc: function(){
    Meteor.call("addDoc", "javascript", function(error, docId){
      history.pushState({}, "ID", "?docId=" + docId);

      app.docId = docId;
      app.monitorChanges();
    });
  },

  monitorChanges: function(){
    var docId = this.docId;

    Meteor.subscribe("docs", docId, function(){ 
      var doc = Docs.find(docId);
      var docProperties = doc.fetch();

      // invalid id => add a new document
      if(docProperties.length == 0){
        app.addDoc();
      } else {
        var syntax = docProperties[0].syntax;
        console.log(syntax)
        app.changeSyntax(syntax);
      }

      doc.observe({        
        changed: function(newDoc, oldIndex, oldDoc){
          var delta = newDoc.delta;
          var deltaSessionId = delta.sessionId;
          var syntax = newDoc.syntax;

          if(syntax != app.syntaxSelect.value){
            app.changeSyntax(syntax);
          }

          if(deltaSessionId != app.sessionId){
            app.editor.getSession().getDocument().applyDelta(delta);
          }
        }
      });

      app.editor.getSession().on("change", function(delta){
        if(app.editor.curOp && app.editor.curOp.command.name){
          delta.sessionId = app.sessionId;
          Meteor.call("postDocDelta", docId, delta);
        }
      });
    });
  },

  retrieveDocContent: function(){
    Meteor.call("retrieveDocContent", this.docId, function(err, content){ 
      app.editor.getSession().setValue(content);
    });
  },

  initDoc: function(){
    if(this.docId){
      this.monitorChanges();
      this.retrieveDocContent();

    } else {
      this.addDoc();
    }
  },

  setEventListeners: function(){
    this.syntaxSelect.addEventListener("change", function(){
      var index = this.selectedIndex;
      var val = this.options[index].value;

      app.changeSyntax(val);
      Meteor.call("changeSyntax", app.docId, val);
    });
  },

  changeSyntax: function(syntax){
    this.syntaxSelect.value = syntax;
    this.editor.getSession().setMode("ace/mode/" + syntax);
    this.editor.focus();
  },

  getUrlVars: function(){
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,    
    function(m,key,value) {
      vars[key] = value;
    });
    return vars;
  },

  init: function(){
    var t = this;
    var d = document;

    // ace editor init
    t.editor = ace.edit("editor");
    t.editor.setTheme("ace/theme/monokai");
    t.editor.setFontSize("15px");
    t.editor.setShowPrintMargin(false);
    t.editor.$blockScrolling = Infinity;
    t.editor.focus();

    // selectors
    t.syntaxSelect = d.querySelector("#syntax");

    // generate random session id for deltas
    this.sessionId = Math.floor(Math.random() * 9000000000) + 1000000000;

    // get url params
    this.docId = this.getUrlVars()["docId"];

    t.initDoc();
    t.setEventListeners();
  } 
};

window.addEventListener("load", function() { app.init(); });

  


