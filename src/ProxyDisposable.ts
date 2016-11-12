import { Disposable, Sink } from 'most';
import { ProxySource } from './ProxySource';

export class ProxyDisposable<T> implements Disposable<T> {
  private source: ProxySource<T>;
  private sink: Sink<T>;
  private disposed: boolean;

  constructor(source: ProxySource<T>, sink: Sink<T>) {
    this.source = source;
    this.sink = sink;
    this.disposed = false;
  }

  public dispose() {
    if (this.disposed) return;

    this.disposed = true;
    const remaining = this.source.remove(this.sink);
    return remaining === 0 && (this.source as any)._dispose();
  }
}
