const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const releaseDir = path.join(root, 'release');
const version = require(path.join(root, 'package.json')).version;
const msix = `AI-News-${version}-Windows-x64.msix`;
if (!fs.existsSync(path.join(releaseDir, msix))) throw new Error(`Nie znaleziono pakietu w release/: ${msix}`);
const unpackDir = path.join(releaseDir, '.msix-validation');
fs.mkdirSync(unpackDir, { recursive: true });
execFileSync('tar.exe', ['-xf', path.join(releaseDir, msix), '-C', unpackDir], { stdio: 'inherit' });
const manifest = fs.readFileSync(path.join(unpackDir, 'AppxManifest.xml'), 'utf8');
for (const value of [
  'Name="MarekZettel-zetmar.AI-News"',
  "Publisher='CN=15A53D32-C868-48EE-B700-5DBB5449CA1B'",
  'ProcessorArchitecture="x64"',
  'runFullTrust',
  '<DisplayName>AI-News</DisplayName>',
  'DisplayName="AI-News"',
  `Version="${version}.0"`,
  'Language="pl-PL"',
]) {
  if (!manifest.includes(value)) throw new Error(`Manifest nie zawiera: ${value}`);
}
console.log(`PASS: ${msix} ma poprawny manifest aplikacji Win32.`);
