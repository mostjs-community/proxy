
import {Stream, Sink, Scheduler, Source, Disposable} from 'most';

declare var require: any;
const defaultScheduler = require('most/lib/scheduler/defaultScheduler');

/**
 * Create a proxy stream and a function to attach to a yet to exist stream
 * @example
 * import {proxy} from 'most-proxy'
 * const {attach, stream} = proxy()
 *
 * stream.map(f)
 *
 * attach(otherStream)
 */
export function proxy<A>() {
  const source = new ProxySource<A>();
  const stream = new Stream<A>(source);
  function attach(origin: Stream<A>): Stream<A> {
    source.add(origin.source);
    return origin;
  }

  return {attach, stream};
}

class ProxySource<A> implements Source<A>, Sink<A> {
  private sink: Sink<A>;
  private source: Source<A>;
  private active: boolean;
  private disposable: Disposable<A>;
  constructor() {
    this.sink = void 0;
    this.active = false;
    this.source = void 0;
    this.disposable = void 0;
  }

  run(sink: Sink<A>, scheduler: Scheduler) {
    this.sink = sink;
    this.active = true;
    if (this.source !== void 0) {
      this.disposable = this.source.run(sink, scheduler);
    }
    return this;
  }

  dispose() {
    this.active = false;
    this.disposable.dispose();
  }

  add(source: Source<A>) {
    if (this.active) {
      this.source = source;
      this.disposable = source.run(this.sink, defaultScheduler);
    } else if (!this.source) {
      this.source = source;
      return;
    } else {
      throw new Error('Can only imitate one stream');
    }
  }

  event(t: number, x: any) {
    if (this.sink === void 0) {
      return;
    }
    this.ensureActive();
    this.sink.event(t, x);
  }

  end(t: number, x?: any) {
    this.propagateAndDisable(this.sink.end, t, x);
  }

  error(t: number, e: Error) {
    this.propagateAndDisable(this.sink.error, t, e);
  }

  propagateAndDisable(method: (t: number, x: any) => void, t: number, x: any) {
    if (this.sink === void 0) {
      return;
    }
    this.ensureActive();

    this.active = false;
    const sink = this.sink;
    this.sink = void 0;

    method.call(sink, t, x);
  }

  ensureActive() {
    if (!this.active) {
      throw new Error('stream ended');
    }
  }
}

export {Source}
