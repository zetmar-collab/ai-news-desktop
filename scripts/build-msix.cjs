const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const configPath = path.join(root, 'store-identity.json');
if (!fs.existsSync(configPath)) {
  console.error('Brakuje store-identity.json. Skopiuj store-identity.example.json i wklej wartości z Partner Center.');
  process.exit(1);
}

const identity = JSON.parse(fs.readFileSync(configPath, 'utf8'));
for (const key of ['identityName', 'publisher', 'publisherDisplayName']) {
  if (typeof identity[key] !== 'string' || !identity[key].trim()) {
    throw new Error(`store-identity.json: brakuje pola ${key}`);
  }
}

const packageJsonPath = path.join(root, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const buildConfig = { ...packageJson.build, appx: { ...packageJson.build.appx, ...identity } };
const tempConfigPath = path.join(root, '.store-package.json');
fs.writeFileSync(tempConfigPath, JSON.stringify(buildConfig, null, 2));

try {
  execFileSync(process.execPath, [path.join(root, 'node_modules', 'electron-builder', 'out', 'cli', 'cli.js'), '--config', tempConfigPath, '--win', 'appx', '--x64', '--publish', 'never'], {
    cwd: root,
    stdio: 'inherit',
  });
} finally {
  fs.rmSync(tempConfigPath, { force: true });
}
