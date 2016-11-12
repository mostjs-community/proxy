import { Stream } from 'most';
import { ProxySource } from './ProxySource';

export interface Proxy<T> {
  attach(stream: Stream<T>): Stream<T>;
  stream: Stream<T>;
}

export function proxy(): Proxy<any>;
export function proxy<T> (): Proxy<T>;
export function proxy<T> (): Proxy<T> {
  const source = new ProxySource<T>();
  const stream = new Stream(source);

  function attach (original: Stream<T>): Stream<T> {
    source.attach(original.source);
    return original;
  }

  return { attach, stream };
}
