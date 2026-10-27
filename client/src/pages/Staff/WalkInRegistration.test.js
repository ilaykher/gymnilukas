import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const componentPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'WalkInRegistration.jsx');
const statsPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../lib/dashboardStats.js');

test('walk-in page loads its count from the authenticated dashboard API and updates after registration', () => {
  const component = fs.readFileSync(componentPath, 'utf8');
  const stats = fs.readFileSync(statsPath, 'utf8');

  assert.match(component, /import \{ getDashboard, getPricing, registerWalkIn \} from '\.\.\/\.\.\/lib\/api'/);
  assert.match(component, /getDashboard\(\{ signal: controller\.signal \}\)/);
  assert.match(stats, /dashboard\?\.walk_ins_today/);
  assert.match(component, /setWalkInsToday\(\(count\) => Number\.isInteger\(count\) \? count \+ 1 : count\)/);
  assert.match(component, /import \{ parseWalkInsToday \} from '\.\.\/\.\.\/lib\/dashboardStats'/);
  assert.match(component, /setWalkInsToday\(parseWalkInsToday\(dashboard\)\)/);
  assert.match(component, /import \{ useManilaDayRefresh \} from '\.\.\/\.\.\/lib\/useManilaDayRefresh'/);
  assert.match(component, /useManilaDayRefresh\(refreshWalkInsToday\)/);
  assert.match(component, /const refreshWalkInsToday = useCallback\(\(\) => \{\s*setWalkInsToday\(null\);\s*setWalkInsCountError\(''\);\s*loadWalkInsToday\(\);/);
  assert.match(component, /\{walkInsToday \?\? \(walkInsCountError \? '—' : 'Loading…'\)\}/);
  assert.doesNotMatch(component, /<h4[^>]*>\s*12\s*<\/h4>/);
});

test('Back to Dashboard and Cancel navigate to the protected dashboard without signing out', () => {
  const component = fs.readFileSync(componentPath, 'utf8');

  assert.equal((component.match(/onClick=\{\(\) => navigate\('\/dashboard'\)\}/g) || []).length, 2);
  assert.doesNotMatch(component, /navigate\('\/'\)/);
  assert.doesNotMatch(component, /signOut|writeSession\(null\)|fitnexx:unauthorized/);
});
