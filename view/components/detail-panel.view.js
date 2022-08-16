import { View } from '../view.js';


export class DetailPanelView extends View {
  #isOpen = false;
  #datasource;
#content = null;
  constructor() {
    super('detail-panel');

    this.addEventListener('store:change', e => {
      console.warn('DetailPanelView STRE UPDATE', e);
    })


  };
  show() {
    this.panelContent.innerHTML = '';
    this.panelContent.textContent = JSON.stringify(content, null, 2);
    this.self.dataset.show = true;
    // this.#isOpen = true
  }

  hide() {
    this.self.dataset.show = false;
    // this.self.hide()
    this.#isOpen = false
  }

  setSource(src) {
    this.#datasource = src;
  }


  #toggle() {
    this.#isOpen = !this.#isOpen
    if (this.#isOpen) this.self.show()
    else this.self.show()
  }

  // get self() { return this.#self };

  get isOpen() { return this.self.dataset.show === 'true' ? true : false };

  get dom() { return this.self }

  get panelContent() { return this.self.querySelector('.panel-content') }

  get value() { return this.contentElement.textContent };
  set value(v) { this.contentElement.textContent = v };

  get id() { return this.self.id };
  set id(v) { this.self.id = v };

}





// export class DetailPanelView extends View {
//   constructor(selector = '#detail-panel-template') {
//     super('detail-panel');
//     this.marginX = 0;
//     this.marginY = 4;
//     // this.displayState = false;
//   }

//   append(node) {
//     this.dom.appendChild(node.dom);
//     return this;
//   }

//   // insert(node, index) {
//   //   if (!(node instanceof NodeView)) return
//   //   this.dom.insertAdjacentElement(index, node.dom)
//   //   return this;
//   // }

//   show(content, x, y) {
//     this.setPosition(x, y)
//     this.displayState = true;
//     this.panelContent.textContent = content;

//     console.warn('x,y', x, y)
//     return this;
//   }

//   hide() {
//     this.displayState = false;
//     return this;
//   }

//   setPosition(x = 0, y = 0) {
//     this.x = x + this.marginX;
//     this.y = y + this.marginY;
//   }




//   focus(state = true, cursorToEnd = true) {
//     this.isFocused = state;
//     this.contentElement.focus()
//     if (cursorToEnd) this.content.cursorToEnd()


//     const onBlur = (e) => { this.dom.removeEventListener('blur', onBlur) }
//     this.dom.onblur = onBlur;

//     return () => this.isFocused = !state;
//   }

//   // activate(state = true) {
//   //   if (!state || (typeof state !== 'boolean' && !['false', 'true'].includes(state))) return
//   //   this.isActive = state;
//   //   return () => this.isActive = !state;
//   // }

//   blur(state = true) {
//     this.focus(false) //= state;
//     return this
//   }

//   select(state = true) {
//     if (!state || (typeof state !== 'boolean' && !['false', 'true'].includes(state))) return
//     this.isSelected = state;

//     return () => this.isSelected = !state;
//   }

//   // Unused/unneeded?
//   // active(state = true) {
//   //   if (!state || (typeof state !== 'boolean' && !['false', 'true'].includes(state))) return
//   //   this.isActive = state;
//   //   return () => this.isActive = !state;
//   // }



//   // get content() {
//   //   const self = this;
//   //   const selection = window.getSelection();
//   //   const range = document.createRange();
//   //   return {
//   //     selectAll: () => {
//   //       selection.removeAllRanges();
//   //       range.selectNodeContents(this.contentElement);
//   //       selection.addRange(range);
//   //     },
//   //     cursorToStart: () => {
//   //       selection.removeAllRanges();
//   //       range.selectNodeContents(this.contentElement);
//   //       range.collapse(true);
//   //       selection.addRange(range);
//   //     },
//   //     cursorToEnd: () => {
//   //       selection.removeAllRanges();
//   //       range.selectNodeContents(self.contentElement);
//   //       range.collapse(false);
//   //       selection.addRange(range);
//   //     },
//   //   }
//   // }

//   get dom() { return this.self }
//   get panelContent() { return this.self.querySelector('.panel-content') }

//   get value() { return this.contentElement.textContent };
//   set value(v) { this.contentElement.textContent = v };

//   get id() { return this.self.id };
//   set id(v) { this.self.id = v };

//   get childElements() { return [...this.list.children].filter(_ => _.classList.contains('list-node')) }

//   get listElement() { return this.self.querySelector('.list') }

//   get contentElement() { return this.self.querySelector('.node-content') }

//   get parentElement() { return this.self.parentElement.closest('.list-node') };

//   get nextSibling() { return this.self.nextElementSibling }

//   get previousSibling() { return this.self.previousElementSibling };

//   get isActive() { return this.self.dataset.active === 'true' ? true : false };
//   set isActive(v) { this.self.dataset.active = v };

//   get displayState() { return this.self.dataset.display === 'true' ? true : false };

//   set displayState(v) { this.self.dataset.display = v };

//   get isSelected() { return this.self.dataset.selected === 'true' ? true : false };
//   set isSelected(v) { this.self.dataset.selected = v };

//   get x() { return thid.self.getBoundingClientRect().x }
//   set x(v) { this.self.style.left = `${v}px` };
//   get y() { return thid.self.getBoundingClientRect().y }
//   set y(v) { this.self.style.top = `${v}px` };

//   get isFocused() { return this.self.dataset.focused === 'true' ? true : false };
//   set isFocused(v) { this.self.dataset.focused = v };

//   get isExpanded() { return this.self.dataset.expanded === 'true' ? true : false };
//   set isExpanded(v) { this.self.dataset.expanded = v };

//   // set children(chs) {chs
//   // .forEach((node, i) => {

//   //   const ch = this.createNode(node);
//   //   this.listEl.appendChild(ch)
//   // }); 

//   // };
// }
