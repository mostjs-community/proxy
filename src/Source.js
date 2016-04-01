class Source {
  constructor() {
    this.sink = void 0
    this.active = true
    this.disposable = void 0
  }

  run(sink, scheduler) {
    this.sink = sink
    this.scheduler = scheduler
    return this
  }

  dispose() {
    this.active = false
    this.disposable.dispose()
  }

  add(disposable) {
    if (!this.active || !this.disposable) {
      this.disposable = disposable
      return
    }
    disposable.dispose()
    throw new Error('Can only imitate one stream')
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
