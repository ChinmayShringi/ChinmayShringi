import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateRouting } from '../src/routing.js';

function createDevices() {
  return Object.freeze([
    Object.freeze({
      id: 'remote-first',
      local: false,
      capabilities: Object.freeze(['text', 'vision']),
    }),
    Object.freeze({
      id: 'local-first',
      local: true,
      capabilities: Object.freeze(['text']),
    }),
    Object.freeze({
      id: 'local-second',
      local: true,
      capabilities: Object.freeze(['text']),
    }),
    Object.freeze({
      id: 'remote-second',
      local: false,
      capabilities: Object.freeze(['vision']),
    }),
  ]);
}

function candidateOutcomes(result) {
  return result.candidates.map(({ id, eligible }) => ({ id, eligible }));
}

function assertReasonsPresent(result) {
  for (const candidate of result.candidates) {
    assert.equal(typeof candidate.reason, 'string');
    assert.ok(candidate.reason.trim().length > 0, candidate.id);
  }
}

test('routing prefers the first eligible local device over an earlier remote', () => {
  const devices = createDevices();
  const request = Object.freeze({ capability: 'text', allowRemote: true });
  const result = evaluateRouting(request, devices);

  assert.equal(result.selectedId, 'local-first');
  assert.deepEqual(candidateOutcomes(result), [
    { id: 'remote-first', eligible: true },
    { id: 'local-first', eligible: true },
    { id: 'local-second', eligible: true },
    { id: 'remote-second', eligible: false },
  ]);
  assertReasonsPresent(result);
});

test('routing chooses the first eligible remote when no local has the capability', () => {
  const result = evaluateRouting(
    Object.freeze({ capability: 'vision', allowRemote: true }),
    createDevices(),
  );

  assert.equal(result.selectedId, 'remote-first');
  assert.deepEqual(candidateOutcomes(result), [
    { id: 'remote-first', eligible: true },
    { id: 'local-first', eligible: false },
    { id: 'local-second', eligible: false },
    { id: 'remote-second', eligible: true },
  ]);
  assertReasonsPresent(result);
});

test('disabling remote execution excludes otherwise capable remote devices', () => {
  const result = evaluateRouting(
    Object.freeze({ capability: 'vision', allowRemote: false }),
    createDevices(),
  );

  assert.equal(result.selectedId, null);
  assert.deepEqual(candidateOutcomes(result), [
    { id: 'remote-first', eligible: false },
    { id: 'local-first', eligible: false },
    { id: 'local-second', eligible: false },
    { id: 'remote-second', eligible: false },
  ]);
  assertReasonsPresent(result);
});

test('local execution remains eligible when remote execution is disabled', () => {
  const result = evaluateRouting(
    Object.freeze({ capability: 'text', allowRemote: false }),
    createDevices(),
  );

  assert.equal(result.selectedId, 'local-first');
  assert.deepEqual(candidateOutcomes(result), [
    { id: 'remote-first', eligible: false },
    { id: 'local-first', eligible: true },
    { id: 'local-second', eligible: true },
    { id: 'remote-second', eligible: false },
  ]);
  assertReasonsPresent(result);
});

test('an unsupported capability has no eligible target even when remote is allowed', () => {
  const result = evaluateRouting(
    Object.freeze({ capability: 'audio', allowRemote: true }),
    createDevices(),
  );

  assert.equal(result.selectedId, null);
  assert.deepEqual(candidateOutcomes(result), [
    { id: 'remote-first', eligible: false },
    { id: 'local-first', eligible: false },
    { id: 'local-second', eligible: false },
    { id: 'remote-second', eligible: false },
  ]);
  assertReasonsPresent(result);
});

test('an empty device pool produces no selection and an independent candidates array', () => {
  const devices = Object.freeze([]);
  const result = evaluateRouting(
    Object.freeze({ capability: 'text', allowRemote: true }),
    devices,
  );

  assert.deepEqual(result, { selectedId: null, candidates: [] });
  assert.notStrictEqual(result.candidates, devices);
});

test('routing creates candidate records without changing frozen request or devices', () => {
  const devices = createDevices();
  const request = Object.freeze({ capability: 'text', allowRemote: false });
  const result = evaluateRouting(request, devices);

  assert.notStrictEqual(result.candidates, devices);
  for (const [index, candidate] of result.candidates.entries()) {
    assert.notStrictEqual(candidate, devices[index]);
    assert.equal(candidate.id, devices[index].id);
  }
  assert.deepEqual(request, { capability: 'text', allowRemote: false });
  assert.deepEqual(devices, createDevices());
});
