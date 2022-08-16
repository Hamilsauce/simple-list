import { EventEmitter } from '../lib/event-emitter.js';

import { template } from './lib/templater.js';

export class View extends EventEmitter {
  #self;

  constructor(templateName) {
    super();

    this.#self = template(templateName)

    if (!this.#self) throw new Error('View failed to find template with provided name.')
  }

render() {}
// select() {}

  selectElement(selector, el = this.self) {
    return el.querySelector(selector);
  }

  selectAllElements(selector, el = this.self) {
    return [...el.querySelectorAll(selector)]
  }

  get dataset() {
    return this.self.dataset
  }

  get self() { return this.#self }

  get dom() { return this.self }
}
