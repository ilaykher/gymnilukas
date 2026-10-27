const assert = require('node:assert/strict');
const test = require('node:test');
const validation = require('../utils/validation');

test('required strings are trimmed and enforce a maximum length', () => {
  assert.equal(validation.requiredString('  member  ', 'Name', 20), 'member');
  assert.throws(() => validation.requiredString('   ', 'Name', 20), { status: 400 });
  assert.throws(() => validation.requiredString('x'.repeat(21), 'Name', 20), { status: 400 });
});

test('email, phone, and PIN validators reject malformed values', () => {
  assert.equal(validation.validEmail('member@example.com'), true);
  assert.equal(validation.validEmail('not-an-email'), false);
  assert.equal(validation.validPhone('09123456789'), true);
  assert.equal(validation.validPhone('0912345678'), false);
  assert.equal(validation.validPin('0427'), true);
  assert.equal(validation.validPin('427'), false);
});

test('positive amounts allow cents but reject zero, excessive precision, and unsafe values', () => {
  assert.equal(validation.positiveAmount('15.25'), 15.25);
  for (const value of [0, -1, '1.001', 'not-a-number', 1000000.01]) {
    assert.throws(() => validation.positiveAmount(value), { status: 400 });
  }
});

test('GCash requires a 13-digit reference while cash references are discarded', () => {
  assert.deepEqual(validation.paymentDetails('cash', 'ignored'), { method: 'cash', reference: null });
  assert.deepEqual(validation.paymentDetails('gcash', '1234567890123'), {
    method: 'gcash',
    reference: '1234567890123',
  });
  assert.throws(() => validation.paymentDetails('gcash', '123'), { status: 400 });
  assert.throws(() => validation.paymentDetails('other', null), { status: 400 });
});
