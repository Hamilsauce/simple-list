/*
 *  EventRegistry: A Map Object keyed with event names
 *    each entry being a Set Object containing
 *    listener callbacks
 */

export class EventEmitter extends EventTarget {
  #eventRegistry = new Map();

  constructor() {
    super();

    // this.#eventRegistry = new Map()

    this.listeners = [];
  }

  #registerEvent(eventName) {
    if (this.#eventRegistry.has(eventName)) return this.#eventRegistry.get(eventName)

    return this.#eventRegistry
      .set(eventName, new Set())
      .get(eventName);
  }

  #registerListener(eventName = '', listener = new EventTarget()) {
    if (typeof eventName != 'string') return console.error("Event Name must be string in EventEmitter")

    this.#registerEvent(eventName).add(listener);

    return this;
  }

  #unregisterListener(eventName, listener = new EventTarget()) {
    return this.#eventRegistry
      .get(eventName)
      .delete(listener);
  }

  on(eventName, listener = new EventTarget()) {
    this.#registerListener(eventName, listener);
    
    return () => this.#unregisterListener(eventName, listener);
  }

  removeListener(eventName, listener = new EventTarget()) {
    const listener2 = this.#eventRegistry.get(eventName);
    listener.removeEventListener(eventName);

    this.#eventRegistry
      .get(eventName)
      .delete(listener);
  }

  off(eventName, listener = new EventTarget()) {
    this.removeEventListener(eventName, listener);
  }

  emit(evt, data) {
    if (!this.#eventRegistry.has(evt)) return;
    
    this.#eventRegistry.get(evt).forEach(_ => _(data));
  }

  dispatch(eventName, detail = {}) {
    this.dispatchEvent(new CustomEvent(eventName, { bubbles: true, detail }));

    this.#eventRegistry.get(eventName)
      .forEach((l, i) => l.dispatchEvent(
        new CustomEvent(
          eventName, {
            bubbles: true,
            detail
          })
      ));
  }
}
