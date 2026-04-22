/**
 * Quick User Size Check
 * Simple queries to paste directly into mongo shell
 * 
 * Connect to mongo:
 * mongo redrockCodecamp
 * 
 * Then paste these queries one at a time:
 */

// 1. Get basic stats
db.user.stats()

// 2. Find users with most challenges completed
db.user.aggregate([
  { $match: { challengeMap: { $exists: true, $ne: {} } } },
  { 
    $project: { 
      username: 1,
      email: 1,
      challengeCount: { $size: { $objectToArray: "$challengeMap" } },
      hasCompletedChallenges: { 
        $cond: { 
          if: { $gt: [{ $size: { $ifNull: ["$completedChallenges", []] } }, 0] },
          then: true,
          else: false
        }
      }
    } 
  },
  { $sort: { challengeCount: -1 } },
  { $limit: 20 }
])

// 3. Check for duplicate data (both old and new format)
db.user.count({ 
  $and: [
    { challengeMap: { $exists: true, $ne: {} } },
    { completedChallenges: { $exists: true, $ne: [] } }
  ]
})

// 4. Sample a large user to inspect
var largeUser = db.user.findOne({ challengeMap: { $exists: true, $ne: {} } })
print("Username:", largeUser.username)
print("ChallengeMap keys:", Object.keys(largeUser.challengeMap).length)
print("CompletedChallenges length:", (largeUser.completedChallenges || []).length)
print("ProgressTimestamps length:", (largeUser.progressTimestamps || []).length)
print("Document BSON size:", Object.bsonsize(largeUser), "bytes", "(" + (Object.bsonsize(largeUser)/1024).toFixed(2) + " KB)")

// 5. Show a sample challengeMap entry
if (largeUser.challengeMap) {
  var firstKey = Object.keys(largeUser.challengeMap)[0]
  print("\nSample challengeMap entry for challenge ID:", firstKey)
  printjson(largeUser.challengeMap[firstKey])
}

// 6. Compare sizes
if (largeUser.challengeMap && largeUser.completedChallenges) {
  print("\nField size comparison:")
  print("challengeMap:", Object.bsonsize({a: largeUser.challengeMap}), "bytes")
  print("completedChallenges:", Object.bsonsize({a: largeUser.completedChallenges}), "bytes")
  print("progressTimestamps:", Object.bsonsize({a: largeUser.progressTimestamps}), "bytes")
}
