// mongo_reindex_and_normalize.js
// Run with mongosh, for example:
// mongosh "mongodb://localhost:27017/studysphere" ./backend/scripts/mongo_reindex_and_normalize.js

(function () {
  const TARGET_DB = "studysphere"; // change if needed
  const collName = "conversations";

  print(
    `Running conversation normalization + index migration on DB: ${TARGET_DB}`
  );

  const d = db.getSiblingDB(TARGET_DB);
  const coll = d.getCollection(collName);

  print("\nCurrent indexes:");
  printjson(coll.getIndexes());

  // If a multikey index named participants_1 exists, drop it
  try {
    const idxs = coll.getIndexes();
    const oldIdx = idxs.find((i) => i.key && i.key.participants === 1);
    if (oldIdx) {
      print(`\nDropping old index: ${oldIdx.name}`);
      coll.dropIndex(oldIdx.name);
    } else {
      print("\nNo old participants multikey index found.");
    }
  } catch (err) {
    print("Error while attempting to drop old index:", err);
  }

  // Normalize participants ordering for documents with exactly 2 participants
  print("\nNormalizing participants order for conversations...");
  const cursor = coll.find({ participants: { $size: 2 } });
  let updates = 0;
  while (cursor.hasNext()) {
    const doc = cursor.next();
    const sorted = doc.participants.map((p) => p.toString()).sort();
    if (
      doc.participants[0].toString() !== sorted[0] ||
      doc.participants[1].toString() !== sorted[1]
    ) {
      coll.updateOne({ _id: doc._id }, { $set: { participants: sorted } });
      updates++;
    }
  }
  print(`Normalized ${updates} conversation(s).`);

  // Find and remove exact duplicate conversation documents if any (same ordered participants)
  print(
    "\nChecking for duplicate conversation documents (same participants pair)..."
  );
  const pipeline = [
    { $match: { participants: { $exists: true, $type: "array", $size: 2 } } },
    {
      $project: {
        participants: {
          $map: { input: "$participants", as: "p", in: { $toString: "$$p" } },
        },
        createdAt: "$createdAt",
      },
    },
    {
      $project: {
        pairKey: {
          $concat: [
            { $arrayElemAt: ["$participants", 0] },
            "_",
            { $arrayElemAt: ["$participants", 1] },
          ],
        },
      },
    },
    { $group: { _id: "$pairKey", ids: { $push: "$_id" }, count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
  ];

  const dupGroups = coll.aggregate(pipeline).toArray();
  let removed = 0;
  if (dupGroups.length > 0) {
    print(`Found ${dupGroups.length} duplicate participant pair groups.`);
    dupGroups.forEach((group) => {
      // fetch all docs for this pair (they are normalized so participants positions are consistent)
      const parts = group._id.split("_");
      const docs = coll
        .find({ participants: parts })
        .sort({ _id: 1 })
        .toArray();
      // keep the first, delete the rest
      const keepId = docs[0]._id;
      const toDelete = docs.slice(1).map((d) => d._id);
      if (toDelete.length > 0) {
        const res = coll.deleteMany({ _id: { $in: toDelete } });
        removed += res.deletedCount;
        print(
          `Deduplicated pair ${group._id}: removed ${res.deletedCount} doc(s)`
        );
      }
    });
  } else {
    print("No duplicate conversation groups found.");
  }
  print(`Total removed duplicates: ${removed}`);

  // Create the new compound index
  print(
    "\nCreating compound unique index on participants.0 and participants.1"
  );
  try {
    const idxName = coll.createIndex(
      { "participants.0": 1, "participants.1": 1 },
      { unique: true }
    );
    print("Created index:", idxName);
  } catch (err) {
    print("Error creating compound index:", err);
  }

  print("\nFinal indexes:");
  printjson(coll.getIndexes());
  print("\nDone.");
})();
