//

export class View extends EventTarget {
  constructor(name = '', template, initFn) {
    super();

    this.self = template;
    if (initFn) initFn(this);
  }
  create() {}
  
  containsElement(el) {
    return this.self = el || this.self.contains(el)
  }

  get dom() { return this.self }
}
