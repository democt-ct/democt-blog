const path = require('path');
const crypto = require('crypto');

// Determine the global config path the same way Vercel CLI does
const vercelModules = path.join(process.env.APPDATA, 'QClaw', 'npm-global', 'node_modules', 'vercel', 'node_modules');

// Load @vercel/cli-config to get the global config path
const cliConfig = require(path.join(vercelModules, '@vercel', 'cli-config'));
const globalConfigPath = cliConfig.getGlobalPathConfig();
console.log('Global config path:', globalConfigPath);

const authConfigFilePath = cliConfig.getAuthConfigFilePath(globalConfigPath);
console.log('Auth config file path:', authConfigFilePath);

// The account key used in keyring is: cli:<16-char-sha256-prefix-of-configPath>
const digest = crypto.createHash('sha256').update(globalConfigPath).digest('hex');
const account = `cli:${digest.slice(0, 16)}`;
console.log('Keyring account:', account);

// Now try to get the token from keyring
const keyringPath = path.join(vercelModules, '@napi-rs', 'keyring');
try {
  const keyring = require(keyringPath);
  const entry = new keyring.Entry('com.vercel.vercel-cli', account);
  const password = entry.getPassword();
  if (password) {
    console.log('TOKEN:', password.substring(0, 30) + '...');
    try {
      const parsed = JSON.parse(password);
      console.log('Parsed:', JSON.stringify(parsed));
    } catch(e) {
      console.log('Raw password, not JSON');
    }
  } else {
    console.log('Password is null');
    
    // Also try file-based auth
    const fs = require('fs');
    if (fs.existsSync(authConfigFilePath)) {
      console.log('Auth file exists:', authConfigFilePath);
      console.log('Content:', fs.readFileSync(authConfigFilePath, 'utf8'));
    } else {
      console.log('Auth file does not exist');
    }
  }
} catch(e) {
  console.log('Keyring error:', e.message);
}
