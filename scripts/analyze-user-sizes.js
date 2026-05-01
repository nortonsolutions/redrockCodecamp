/**
 * MongoDB Shell Script to Analyze User Document Sizes
 * 
 * Run this in mongo shell with:
 * mongo redrockCodecamp scripts/analyze-user-sizes.js
 * 
 * Or connect and paste the contents
 */

print("=== User Document Size Analysis ===\n");

// 1. Get total stats
var stats = db.user.stats();
print("Total users:", stats.count);
print("Total collection size:", (stats.size / 1024 / 1024).toFixed(2), "MB");
print("Average document size:", (stats.avgObjSize / 1024).toFixed(2), "KB\n");

// 2. Find the 10 largest user documents
print("=== Top 10 Largest User Documents ===");
var userSizes = [];
db.user.find({}).forEach(function(user) {
  var size = Object.bsonsize(user);
  userSizes.push({
    username: user.username,
    email: user.email,
    sizeKB: (size / 1024).toFixed(2)
  });
});

userSizes.sort(function(a, b) { return parseFloat(b.sizeKB) - parseFloat(a.sizeKB); });
userSizes.slice(0, 10).forEach(function(user) {
  print("User:", user.username || user.email, "- Size:", user.sizeKB, "KB");
});

// 3. Analyze field sizes for a sample user
print("\n=== Field Size Analysis (Sample User) ===");
var sampleUser = db.user.findOne({ challengeMap: { $exists: true, $ne: {} } });

if (sampleUser) {
  print("\nAnalyzing user:", sampleUser.username);
  
  // Calculate individual field sizes
  var fields = {
    'Full document': Object.bsonsize(sampleUser),
    'challengeMap': Object.bsonsize({ challengeMap: sampleUser.challengeMap || {} }),
    'completedChallenges': Object.bsonsize({ completedChallenges: sampleUser.completedChallenges || [] }),
    'progressTimestamps': Object.bsonsize({ progressTimestamps: sampleUser.progressTimestamps || [] }),
    'All other fields': 0
  };
  
  fields['All other fields'] = fields['Full document'] - 
    fields['challengeMap'] - 
    fields['completedChallenges'] - 
    fields['progressTimestamps'];
  
  for (var field in fields) {
    if (field !== 'All other fields') {
      var sizeKB = (fields[field] / 1024).toFixed(2);
      var percent = ((fields[field] / fields['Full document']) * 100).toFixed(1);
      print(field + ":", sizeKB, "KB (" + percent + "%)");
    }
  }
  
  if (sampleUser.challengeMap) {
    print("\nChallengeMap details:");
    print("  - Number of challenges:", Object.keys(sampleUser.challengeMap).length);
    
    // Sample a challenge to see its structure
    var firstKey = Object.keys(sampleUser.challengeMap)[0];
    if (firstKey) {
      print("  - Sample challenge entry:");
      printjson(sampleUser.challengeMap[firstKey]);
      print("  - Size per challenge entry:", (Object.bsonsize(sampleUser.challengeMap[firstKey])).toFixed(0), "bytes");
    }
  }
  
  if (sampleUser.completedChallenges && sampleUser.completedChallenges.length > 0) {
    print("\nCompletedChallenges (deprecated):");
    print("  - Number of entries:", sampleUser.completedChallenges.length);
    print("  - Sample entry:");
    printjson(sampleUser.completedChallenges[0]);
  }
  
  if (sampleUser.progressTimestamps && sampleUser.progressTimestamps.length > 0) {
    print("\nProgressTimestamps:");
    print("  - Number of entries:", sampleUser.progressTimestamps.length);
    print("  - Sample entry:");
    printjson(sampleUser.progressTimestamps[0]);
  }
}

// 4. Count users with large challengeMaps
print("\n=== Users by Challenge Completion Count ===");
db.user.aggregate([
  { $match: { challengeMap: { $exists: true, $ne: {} } } },
  { 
    $project: { 
      username: 1,
      challengeCount: { 
        $size: { 
          $objectToArray: "$challengeMap" 
        } 
      } 
    } 
  },
  { $sort: { challengeCount: -1 } },
  { $limit: 10 }
]).forEach(function(doc) {
  print("User:", doc.username, "- Challenges completed:", doc.challengeCount);
});

// 5. Check for users with both challengeMap AND completedChallenges (data duplication)
print("\n=== Checking for Data Duplication ===");
var duplicated = db.user.count({ 
  $and: [
    { challengeMap: { $exists: true, $ne: {} } },
    { completedChallenges: { $exists: true, $ne: [] } }
  ]
});
print("Users with BOTH challengeMap and completedChallenges:", duplicated);
if (duplicated > 0) {
  print("⚠️  These users have duplicate data that could be cleaned up!");
  print("   completedChallenges is deprecated and can be removed after migration.");
}

// 6. Estimate potential savings
print("\n=== Potential Space Savings ===");
var sampleWithBoth = db.user.findOne({
  $and: [
    { challengeMap: { $exists: true, $ne: {} } },
    { completedChallenges: { $exists: true, $ne: [] } }
  ]
});

if (sampleWithBoth) {
  var ccSize = Object.bsonsize({ completedChallenges: sampleWithBoth.completedChallenges });
  print("Average completedChallenges size:", (ccSize / 1024).toFixed(2), "KB");
  print("Potential savings if removed from", duplicated, "users:", 
    ((ccSize * duplicated) / 1024 / 1024).toFixed(2), "MB");
}

print("\n=== Analysis Complete ===");
