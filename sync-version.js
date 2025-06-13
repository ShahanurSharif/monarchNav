// sync-version.js
// This script syncs the version from package-solution.json to a git tag and pushes it.

const fs = require('fs');
const { execSync } = require('child_process');

const solutionPath = './config/package-solution.json';

function getVersion() {
  const json = JSON.parse(fs.readFileSync(solutionPath, 'utf8'));
  // SPFx version format: 1.0.0.0 → use first three parts for tag
  const version = json.solution.version.split('.').slice(0, 3).join('.');
  return version;
}

function main() {
  const version = getVersion();
  const tag = `v${version}`;
  try {
    // Commit any staged changes with a version bump message
    execSync(`git commit -am "Bump version to ${version}"`, { stdio: 'inherit' });
  } catch (e) {
    // Ignore if nothing to commit
  }
  try {
    execSync(`git tag ${tag}`, { stdio: 'inherit' });
    execSync(`git push origin ${tag}`, { stdio: 'inherit' });
    console.log(`Tagged and pushed: ${tag}`);
  } catch (e) {
    console.error('Error tagging or pushing:', e.message);
    process.exit(1);
  }
}

main();
