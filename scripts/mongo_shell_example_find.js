db.user.find({ "rand.$numberDouble": { $exists: true } }, { rand: 1 }).forEach(function (doc) {
  var v = parseFloat(doc.rand.$numberDouble);
  db.user.updateOne({ _id: doc._id }, { $set: { rand: v } });
});
