Docs = new Mongo.Collection("docs");

if(Meteor.isServer) {
  Meteor.publish("docs", function () {
    return Docs.find();
  });
}

if (Meteor.isClient) {
  Meteor.subscribe("docs");

  Template.task.events({
    "click .toggle-checked": function () {
      // Set the checked property to the opposite of its current value
      Meteor.call("setChecked", this._id, ! this.checked);
    },
    "click .delete": function () {
      Meteor.call("deleteTask", this._id);
    },
    "click .toggle-private": function () {
      Meteor.call("setPrivate", this._id, ! this.private);
    }
  });
}

Meteor.methods({
  addDoc: function (text) {
    Docs.insert({
      text: text,
      createdAt: new Date()
    });
  },

  setChecked: function (taskId, setChecked) {
    Docs.update(taskId, { $set: { checked: setChecked} });
  }
});