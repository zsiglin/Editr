Docs = new Mongo.Collection("docs");

if(Meteor.isServer) {
  Meteor.publish("docs", function() {
    return Docs.find({_id: "t39p6d"}); 
  });

  function generateRandomKey(){
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var key = "";

    for(var i=0; i<6; i++){
      key += chars.charAt(Math.floor(Math.random() * 62));
    }
      
    return key;
  }
}

Meteor.methods({
  addDoc: function(sessionId){
    return Docs.insert({
      _id: generateRandomKey(),
      content: "",
      sessionId: sessionId,
      created: new Date()
    });
  },

  updateDoc: function (docId, content, sessionId){
    Docs.update(docId, { $set: { content: content, sessionId: sessionId } });
  }
});
