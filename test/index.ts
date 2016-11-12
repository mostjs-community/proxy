import * as assert from 'assert';
import { periodic, iterate } from 'most';
import { proxy } from '../src';

function assertExpected (expected: Array<any>, done: Function) {
  return function (x: any) {
    assert.strictEqual(x, expected.shift());
    if (expected.length === 0) {
      done();
    }
  };
}

describe('most-proxy', () => {
  it('creates a circular dependency', (done) => {
    const { attach, stream } = proxy();

    const original = periodic(10, 1).scan((x, y) => x + y, 0);

    attach(original);

    stream.take(3).observe(assertExpected([0, 1, 2], done));
  });

  it('handles being attached to itself', (done) => {
    const { attach, stream } = proxy<number>();

    function makeAssertions (currentValue: number) {
      if (currentValue === 8) {
        setTimeout(() => done(), 20);
      }

      if (currentValue > 8) {
        done(new Error('You have a memory leak'));
      }
    }

    const original = stream
      .tap(makeAssertions)
      .startWith(1)
      .map((x: number) => x * 2);

    // pipe events from original to proxy stream
    const proxyStream = attach(original.delay(10));

    proxyStream
      .take(3)
      .drain();
  });

  it('allows reattaching after completion', () => {
    const { attach, stream } = proxy();

    const original = iterate(x => x + 1, 0).take(3);

    attach(original);

    return stream.drain().then(() => {
      return attach(original).drain();
    });
  });
});
