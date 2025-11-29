const { execSync } = require('child_process');
const { version } = require('../package.json');

const tagName = `v${version}`;

try {
  // Check if tag exists
  execSync(`git rev-parse ${tagName}`, { stdio: 'ignore' });
  // If no error, tag exists. Do nothing.
} catch (e) {
  // Tag doesn't exist, create it
  try {
    console.log(`[Husky] Creating tag ${tagName}...`);
    execSync(`git tag ${tagName}`);
    console.log(`[Husky] Tag ${tagName} created.`);

    console.log(`[Husky] Pushing tag ${tagName} to origin...`);
    // Pushing the tag will also push the commit it points to.
    execSync(`git push origin ${tagName}`);
    console.log(`[Husky] Tag ${tagName} pushed successfully! 🚀`);
    
  } catch (error) {
    console.error(`[Husky] Failed during tag creation/push:`, error.message);
    // Don't fail the push process itself, just the tagging.
    // You might want to process.exit(1) if tagging is mandatory.
  }
}