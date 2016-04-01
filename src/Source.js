import defaultScheduler from 'most/lib/scheduler/defaultScheduler'

class Source {
  constructor() {
    this.sink = void 0
    this.active = false
    this.source = void 0
    this.disposable = void 0
  }

  run(sink, scheduler) {
    this.sink = sink
    this.active = true
    if (this.source !== void 0) {
      this.disposable = this.source.run(sink, scheduler)
    }
    return this
  }

  dispose() {
    this.active = false
    this.disposable.dispose()
  }

  add(source) {
    if (this.active) {
      this.source = source
      this.disposable = source.run(this.sink, defaultScheduler)
    } else if (!this.source) {
      this.source = source
      return
    } else {
      throw new Error('Can only imitate one stream')
    }
  }

  event(t, x) {
    if (this.sink === void 0) {
      return
    }
    this.ensureActive()
    this.sink.event(t, x)
  }

  end(t, x) {
    this.propagateAndDisable(this.sink.end, t, x)
  }

  error(t, e) {
    this.propagateAndDisable(this.sink.error, t, e)
  }

  propagateAndDisable(method, t, x) {
    if (this.sink === void 0) {
      return
    }
    this.ensureActive()

    this.active = false
    const sink = this.sink
    this.sink = void 0

    method.call(sink, t, x)
  }

  ensureActive() {
    if (!this.active) {
      throw new Error('stream ended')
    }
  }
}

export {Source}
