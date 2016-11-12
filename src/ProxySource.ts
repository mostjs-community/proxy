import { Source, Sink, Disposable, Scheduler, never, defaultScheduler } from 'most';
import { MulticastSource } from '@most/multicast';

import { ProxyDisposable } from './ProxyDisposable';

const neverSource = never().source;

export class ProxySource<T> extends MulticastSource<T> implements Source<T>, Sink<T> {
  // ProxySource specific
  private attached: boolean = false;
  private running: boolean = false;

  private source: Source<T>;
  private sinks: Array<Sink<T>> = [];
  private _disposable: Disposable<T>;

  constructor() {
    super(neverSource);
  }

  public run(sink: Sink<T>, scheduler: Scheduler) {
    this.add(sink);

    if (this.attached && !this.running) {
      this.running = true;
      this._disposable = this.source.run(this, scheduler);
      return this._disposable;
    }

    return new ProxyDisposable<T>(this, sink);
  }

  public attach(source: Source<T>) {
    if (this.attached) throw new Error('Can only proxy 1 stream');
    this.attached = true;

    if (this.sinks.length)
      this._disposable = source.run(this, defaultScheduler);
    else
      this.source = source;
  }

  public end (time: number, value: T) {
    this.attached = false;
    this.running = false;

    return super.end(time, value);
  }
}
