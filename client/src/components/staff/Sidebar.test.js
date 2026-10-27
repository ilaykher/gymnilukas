import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const source = fs.readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), 'Sidebar.jsx'),
  'utf8'
);

test('staff logout confirmation calls the authenticated API before clearing session and redirecting', () => {
  assert.match(source, /import \{ logout as logoutRequest \} from '\.\.\/\.\.\/lib\/api';/);
  assert.match(source, /<LogoutConfirmModal[\s\S]*?onConfirm=\{handleLogout\}/);
  assert.match(
    source,
    /const handleLogout = async \(\) => \{[\s\S]*?await logoutRequest\(\);[\s\S]*?signOut\(\);[\s\S]*?navigate\('\/login', \{ replace: true \}\);/
  );
  assert.match(source, /disabled=\{isLoggingOut\}/);
  assert.match(source, /if \(isLoggingOut\) return;/);
  assert.match(source, /catch \(error\) \{[\s\S]*?setLogoutError\(error\.message/);
});
