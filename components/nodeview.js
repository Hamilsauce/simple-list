import { View } from './view.js';


export class NodeView extends View {
  #cachedValue = '';

  constructor(data, attrs) {
    super('node')

    this.children = new Map()

    this.depth = data.depth
    this.id = data.id
    this.index = data.index
    this.value = data.value
    this.color = data.color
    this.collapsed = false

    // setTimeout(() => {
    //   if (data.active === true) {
    //     this.activate();
    //   } else this.isActive = false;
    // }, 50)

  }

  appendNode(node) {
    if (!(node instanceof NodeView)) node = new NodeView(node)

    this.children.set(node.dom, node);
    node.parent = this;
    this.listElement.append(node.dom);

    return this.children.get(node.dom)
  }

  insert(node, index) {
    if (!(node instanceof NodeView)) return
    this.dom.insertAdjacentElement(index, node.dom)

    return this;
  }

  remove() {
    let ids = [];

    if (this.children.size > 0) {
      this.children.forEach((ch, i) => ids = [...ids, ...ch.remove()]);

      this.children.clear();
    }

    this.dom.remove();

    return [this.id, ...ids];
  }

  focus(state = true, cursorPosition = 'end') {
    this.isFocused = state;
    this.contentElement.focus()

    if (this.content[cursorPosition]) this.content[cursorPosition]()

    return () => this.isFocused = !state;
  }

  findNode() {}

  traverse(cb) {
    for (let [el, vm] of this.children) {
      if (cb(vm) === true || vm.traverse(cb) === true) {
        return true;
      }
    }
  }


  collapse(state = null) {
    this.collapsed = state ? state : !this.collapsed

    if (this.collapsed) {
      // this.deactivate()
    }

  }


  activate(state = true) {
    // this.deactivate()
    this.isActive = true;
    this.#cachedValue = this.contentElement.textContent
    this.contentElement.contentEditable = true
    // this.contentElement.focus()
    // this.contentElement.click()
    this.content['end']();
    this.collapse(true)

    return this;
  }

  deactivate() {
    this.isActive = false;
    this.contentElement.contentEditable = false;

    if (this.valueChanged) {
      this.self.dispatchEvent(
        new CustomEvent('update', { bubbles: true, detail: { node: this } })
      );

      this.#cachedValue = this.value;
    }

    return this;
  }





  blur(state = true) {
    console.log('blur');
    this.focus(false);

    return this;
  }

  get valueChanged() {
    return this.#cachedValue && this.value !== this.#cachedValue
  }

  get content() {
    const self = this;
    const selection = window.getSelection();
    const range = document.createRange();
    return {
      selectAll: () => {
        selection.removeAllRanges();
        range.selectNodeContents(this.contentElement);
        selection.addRange(range);
      },
      start: () => {
        selection.removeAllRanges();
        range.selectNodeContents(this.contentElement);
        range.collapse(true);
        selection.addRange(range);
      },
      end: () => {
        selection.removeAllRanges();
        range.selectNodeContents(self.contentElement);
        range.collapse(false);
        selection.addRange(range);
      }
    }
  }

  get isRoot() { return this.self.dataset.parentId == null ? false : true };

  set isRoot(v) {
    this.self.dataset.isRoot = v

    if (v) {
      this.self.classList.add('root-node');
    }

    else {
      this.self.classList.remove('root-node')
    }
  };

  get value() { return this.contentElement.textContent };

  set value(v) { this.contentElement.textContent = `${this.id.slice(-2)}) ${v}` };

  get id() { return this.self.id };

  set id(v) {
    this.self.id = v
    this.self.dataset.id = v
  };

  get childElements() { return [...this.listElement.children].filter(_ => _.classList.contains('list-node')) }

  get listElement() { return this.self.querySelector('.list') }

  get contentElement() { return this.self.querySelector('.node-content') }

  set color(c) {
    if (this.bullet) {
      this.bullet.setAttribute('fill', c)
    }
  }

  get bullet() { return this.self.querySelector('.list-bullet') }

  get parentElement() { return this.self.parentElement.closest('.node') };

  get nextSibling() { return this.self.nextElementSibling }

  get previousSibling() { return this.self.previousElementSibling };

  // set active(v) { 
  //   console.warn('set active: v, this,id', v,this.id);
  //   this.isActive = v
  //   }

  get isActive() {
    console.warn('get isActive');
    return this.self.dataset.active === 'true' ? true : false
  };

  set isActive(v) {
    console.warn('set isActive: v, this,id', v, this.id);
    this.self.dataset.active = v
  };

  get index() { return (this.self.dataset.index || 0) };

  set index(v) { this.self.dataset.index = v };

  get isSelected() { return this.self.dataset.selected === 'true' ? true : false };

  set isSelected(v) { this.self.dataset.selected = v };

  get parentId() { return this.self.dataset.parentId };

  set parentId(v) {
    this.self.dataset.parentId = v
    if (v === null) {
      this.self.classList.add('root-node');

      let bulletContainer = this.select('.node-left');
      bulletContainer = this.self.querySelector('.node-left')

      bulletContainer.innerHTML = ` 
        <svg id="back-button" width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
          <g id="icon-container">
            <path id="icon" d=" M  13,4 2,16 13,28 13,19 30,19 30,13 13,13 Z" style="stroke-width:2;stroke-linecap:butt;stroke-linejoin:round;stroke-miterlimit:4;stroke-dashoffset:0;" />
          </g>
        </svg>`.trim();

    }
  };

  get depth() { return this.self.dataset.depth };

  set depth(v) { this.self.dataset.depth = v };

  get isFocused() { return this.self.dataset.focused === 'true' ? true : false };

  set isFocused(v) { this.self.dataset.focused = v };

  get collapsed() { return this.self.dataset.collapsed === 'true' ? true : false };

  set collapsed(v) { this.self.dataset.collapsed = v };
}