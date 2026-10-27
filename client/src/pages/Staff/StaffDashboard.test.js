import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const source = fs.readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), 'StaffDashboard.jsx'),
  'utf8'
);

test('Manila day changes reload the dashboard KPIs and activity from the same API response', () => {
  assert.match(source, /import \{ useManilaDayRefresh \} from '\.\.\/\.\.\/lib\/useManilaDayRefresh'/);
  assert.match(source, /const loadDashboard = useCallback\(\(\) => \{/);
  assert.match(source, /getDashboard\(\{ signal: controller\.signal \}\)/);
  assert.match(source, /useManilaDayRefresh\(refreshDashboard\)/);
  assert.match(source, /setData\(dashboard\)/);
  assert.match(source, /rows=\{activityRows\.slice\(0, 5\)\}/);
  assert.match(source, /setData\(null\);[\s\S]*setError\(requestError\.message\)/);
});
