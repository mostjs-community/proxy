# Most Proxy

Create circular stream dependencies that is declarative and designed to avoid
memory leaks.

This codebase is proudly written in TypeScript so you can enjoy beautiful typings.

## Install
```shell
npm install --save most-proxy
```

## Example

```js
import { periodic } from 'most'
import { proxy } from 'most-proxy'

// create a proxy
// returns *attach* to attach proxy to another stream, and a proxy stream *stream*
const { attach, stream } = proxy()

// observe the proxy, taking only three events
// proxy is a real most.Stream
// when stream ends, original will also be disposed of internally
stream.take(3).observe(x => console.log(x)) // 1, 2, 3

// here we create the stream we want to use as the circular dependency
const original = periodic(100, 1).scan((x, y) => x + y, 0)

// pipe events from original to proxy stream
attach(original)
```

## API Documentation

```TypeScript
interface Proxy<T> {
  attach(stream: Stream<T>): Stream<T>;

  stream: Stream<T>;
}
```