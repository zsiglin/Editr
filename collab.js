Docs = new Mongo.Collection("docs");

if(Meteor.isServer) {
  Meteor.publish("docs", function(docId) {
    return Docs.find(docId); 
  });

  function generateRandomKey(){
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var key = "";

    for(var i=0; i<6; i++){
      key += chars.charAt(Math.floor(Math.random() * 62));
    }
      
    return key;
  }

  function applyDelta(docLines, delta){
  	if(!delta){
  		return;
  	}

    var row = delta.start.row;
    var startColumn = delta.start.column;
    var line = docLines[row] || "";
    switch (delta.action) {
      case "insert":
        var lines = delta.lines;
        if (lines.length === 1) {
            docLines[row] = line.substring(0, startColumn) + delta.lines[0] + line.substring(startColumn);
        } else {
            var args = [row, 1].concat(delta.lines);
            docLines.splice.apply(docLines, args);
            docLines[row] = line.substring(0, startColumn) + docLines[row];
            docLines[row + delta.lines.length - 1] += line.substring(startColumn);
        }

        break;

      case "remove":
        var endColumn = delta.end.column;
        var endRow = delta.end.row;
        if (row === endRow) {
            docLines[row] = line.substring(0, startColumn) + line.substring(endColumn);
        } else {
            docLines.splice(
                row, endRow - row + 1,
                line.substring(0, startColumn) + docLines[endRow].substring(endColumn)
            );
        }

        break;
    }
  }
}

Meteor.methods({
  addDoc: function(syntax){
    return Docs.insert({
      _id: generateRandomKey(),
      syntax: "javascript",
      content: [],
      created: new Date()
    });
  },

  changeSyntax: function(docId, syntax){
    Docs.update(docId, { $set: {
        syntax: syntax,
        delta: null
    }});
  },

  postDocDelta: function (docId, delta){
    var content = Docs.findOne(docId).content;
    applyDelta(content, delta);

    Docs.update(docId, { $set: {
        content: content,
        delta: delta
    }});
  },

  retrieveDocContent: function(docId){
    var doc = Docs.findOne(docId);
    
    if(doc){
      var content = doc.content;
      return content.join("\n");
    } else {
      return null;
    }
  }
});
