const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'dist', 'app.js'), 'utf8');

function loadApp(saved = '[]') {
  const controls = { f1: 2, a1: 1, f2: 6, a2: .5, phase: 0, angle: 45, harmonics: 5, signalFreq: 17, sampleRate: 20 };
  const canvasContext = new Proxy({}, { get: (target, key) => target[key] || (() => {}) });
  const elements = new Map();
  const element = id => {
    if (!elements.has(id)) elements.set(id, {
      value: controls[id] ?? 0,
      width: 640,
      height: 430,
      style: {},
      classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
      addEventListener() {}, setAttribute() {}, focus() {},
      getBoundingClientRect() { return { width: 640 }; },
      getContext() { return canvasContext; }
    });
    return elements.get(id);
  };
  const document = {
    querySelector: selector => element(selector.slice(1)),
    querySelectorAll: () => [],
    addEventListener() {}
  };
  const localStorage = { getItem: () => saved, setItem() {} };
  const context = vm.createContext({
    document, localStorage,
    window: { devicePixelRatio: 1, addEventListener() {} },
    IntersectionObserver: class { observe() {} },
    console
  });
  vm.runInContext(source, context);
  return { context, element };
}

test('the displayed aliased sine passes through every sample', () => {
  const { context } = loadApp();
  for (const [frequency, sampleRate] of [[17, 20], [13, 20], [29, 20], [7, 20]]) {
    const alias = vm.runInContext(`aliasFrequency(${frequency}, ${sampleRate})`, context);
    for (let n = 0; n <= sampleRate; n++) {
      const time = n / sampleRate;
      assert.ok(Math.abs(Math.sin(2 * Math.PI * frequency * time) - Math.sin(2 * Math.PI * alias * time)) < 1e-12);
    }
  }
});

test('window responses have a central peak and the expected leakage tradeoff', () => {
  const { context } = loadApp();
  const response = (name, offset) => vm.runInContext(`windowResponse('${name}', ${offset})`, context);
  for (const name of ['rect', 'hann', 'blackman']) assert.ok(Math.abs(response(name, 0) - 1) < 1e-12);
  assert.ok(response('rect', 3.5) > response('hann', 3.5));
  assert.ok(response('hann', 3.5) > response('blackman', 3.5));
  assert.ok(response('blackman', .75) > response('hann', .75));
});

test('invalid saved progress cannot prevent the lessons from loading', () => {
  for (const saved of ['not json', '{}', '[1,1,9,"2"]']) {
    const { context, element } = loadApp(saved);
    const expected = saved.startsWith('[') ? '1 / 8' : '0 / 8';
    assert.equal(element('progressText').textContent, expected);
    assert.equal(vm.runInContext('completed.size', context), saved.startsWith('[') ? 1 : 0);
  }
});
