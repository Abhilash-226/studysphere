// Run this script in package.json folder
const fs = require("fs");
const path = require("path");

// Define path to package.json
const packageJsonPath = path.join(__dirname, "package.json");

// Read package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

// Check if socket.io-client is already in dependencies
if (
  !packageJson.dependencies ||
  !packageJson.dependencies["socket.io-client"]
) {
  // Add socket.io-client dependency
  packageJson.dependencies = packageJson.dependencies || {};
  packageJson.dependencies["socket.io-client"] = "^4.7.4";

  // Write updated package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  console.log("Added socket.io-client dependency to package.json");
} else {
  console.log("socket.io-client dependency already exists");
}
