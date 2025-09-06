// Fix index migration script
print("=== StudySphere Conversation Index Migration ===");

// Show current indexes
print("Current indexes:");
db.conversations.getIndexes().forEach(function (idx) {
  printjson(idx);
});

// Drop the old multikey index
print("\nDropping old participants multikey index...");
try {
  db.conversations.dropIndex("participants_1");
  print("Successfully dropped participants_1 index");
} catch (e) {
  print("Index participants_1 not found or already dropped:", e.message);
}

// Normalize participant order
print("\nNormalizing participant order...");
var updates = 0;
db.conversations.find({ participants: { $size: 2 } }).forEach(function (doc) {
  var sorted = doc.participants
    .map(function (p) {
      return p.toString();
    })
    .sort();
  if (
    doc.participants[0].toString() !== sorted[0] ||
    doc.participants[1].toString() !== sorted[1]
  ) {
    db.conversations.updateOne(
      { _id: doc._id },
      { $set: { participants: sorted } }
    );
    updates++;
  }
});
print("Normalized " + updates + " conversation(s)");

// Check for duplicates
print("\nChecking for duplicates...");
var dups = db.conversations
  .aggregate([
    { $match: { participants: { $exists: true, $type: "array", $size: 2 } } },
    {
      $project: {
        pair: {
          $concat: [
            { $toString: { $arrayElemAt: ["$participants", 0] } },
            "_",
            { $toString: { $arrayElemAt: ["$participants", 1] } },
          ],
        },
      },
    },
    {
      $group: {
        _id: "$pair",
        ids: { $push: "$$ROOT._id" },
        count: { $sum: 1 },
      },
    },
    { $match: { count: { $gt: 1 } } },
  ])
  .toArray();

if (dups.length > 0) {
  print("Found " + dups.length + " duplicate groups, removing extras...");
  dups.forEach(function (group) {
    var keep = group.ids[0];
    var toDelete = group.ids.slice(1);
    print("Keeping " + keep + ", deleting " + toDelete.length + " duplicates");
    db.conversations.deleteMany({ _id: { $in: toDelete } });
  });
} else {
  print("No duplicates found");
}

// Create new compound unique index
print("\nCreating new compound unique index...");
try {
  var result = db.conversations.createIndex(
    { "participants.0": 1, "participants.1": 1 },
    { unique: true }
  );
  print("Created compound index:", result);
} catch (e) {
  print("Error creating index:", e.message);
}

// Show final indexes
print("\nFinal indexes:");
db.conversations.getIndexes().forEach(function (idx) {
  printjson(idx);
});

print("=== Migration Complete ===");
