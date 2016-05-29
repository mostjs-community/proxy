import assert from 'power-assert'
import {periodic} from 'most'
import {proxy} from '../../lib/index'

describe('proxy', () => {
  it('should create a circular dependency', (done) => {
    const {attach, stream} = proxy()
    const expected = [0, 1, 2]
    stream.take(3)
      .observe(x => {
        assert.strictEqual(x, expected.shift())
      })
      .then(() => done())
      .catch(done)

    const original = periodic(10, 1).scan((x, y) => x + y, 0)

    attach(original)
  })

  it('should not run origin stream until actively observed', (done) => {
    const {attach, stream} = proxy()
    const action$ = periodic(100, 1).scan((x, y) => x + y, 0)
    attach(action$)

    const expected = [0, 1, 2]

    setTimeout(() => {
      stream.take(3)
        .observe(x => {
          assert.strictEqual(x, expected.shift())
        })
        .then(() => done())
        .catch(done)
    }, 100)
  })
})
