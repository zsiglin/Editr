+function(){
  var ready = function(){
    var syntaxSelect = document.querySelector("#syntax");
    var editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai");
    editor.setFontSize("16px");
    editor.setShowPrintMargin(false);
    editor.getSession().on("change", function(){
      alert("test");
    });

    editor.focus();

    function changeSyntax(syntax){
      localStorage.syntax = syntaxSelect.value = syntax;
      editor.getSession().setMode("ace/mode/" + syntax);
      editor.focus();
    }

    syntaxSelect.addEventListener("change", function(){
      var index = this.selectedIndex;
      var val = this.options[index].value;
      changeSyntax(val);
    });

    changeSyntax(localStorage.syntax || "javascript");
  };
    
  window.addEventListener("load", ready);
}();
