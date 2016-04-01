import {Stream} from 'most'
import {Source} from './Source'

/**
 * @method proxy
 * @returns {Array} [attach, stream] - array containing an 'attach' type
 * function at index 0 and a most.Stream at index 1. Useful when combined with
 * destructuring.
 * @example
 * import {proxy} from 'most-proxy'
 *
 * const [attach, stream] = proxy()
 *
 * const [imitate, actionProxy$] = proxy()
 */
function proxy() {
  const source = new Source()
  const stream = new Stream(source)
  const fn = origin => source.add(origin.source)
  return [fn, stream]
}

export {proxy}
