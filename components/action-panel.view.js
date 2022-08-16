import { View } from './view.js';



export class ActionPanelView extends View {
  constructor(actions = []) {
    super('action-panel');

    this.marginX = 0;
    
    this.marginY = 4;

    this.clickHandler = this.#handleActionClick.bind(this)

    ;[...this.self.querySelectorAll('.action-button')]
    .forEach((x, i) => {
      x.addEventListener('click', this.clickHandler);
    });
  }

  isActionButton(e) {
    return e.path.some(el => el instanceof Element && el.classList.contains('action-button'))
  }

  getActionFromEvent(e) {
    if (this.isActionButton(e)) {
      return e.target.closest('.action-button').dataset.action
    }

    return null;
  }

  #handleActionClick(e) {
    e.preventDefault()
    e.stopPropagation()

    const action = this.getActionFromEvent(e);

    if (action) {
      this.self.dispatchEvent(
        new CustomEvent(`node:action`, { bubbles: true, detail: {action, id: +this.nodeId || null } })
      )
    }
  }

  append(node) {
    this.dom.appendChild(node.dom);
    return this;
  }

  show(nodeId, x, y) {
    this.nodeId = nodeId;
    this.setPosition(x, y)
    this.displayState = true;

    return this;
  }

  hide() {
    this.nodeId = null;
    this.displayState = false;

    return this;
  }

  setPosition(x = 0, y = 0) {
    this.x = x + this.marginX;
    this.y = y + this.marginY;
  }

  get dom() { return this.self }

  get panelContent() { return this.self.querySelector('.panel-content') }

  get id() { return this.self.id };

  set id(v) { this.self.id = v };

  get isActive() { return this.self.dataset.active === 'true' ? true : false };
  set isActive(v) { this.self.dataset.active = v };

  get displayState() { return this.self.dataset.display === 'true' ? true : false };

  set displayState(v) { this.self.dataset.display = v };

  get isSelected() { return this.self.dataset.selected === 'true' ? true : false };
  set isSelected(v) { this.self.dataset.selected = v };

  get x() { return thid.self.getBoundingClientRect().x }
  set x(v) { this.self.style.left = `${v}px` };
  get y() { return thid.self.getBoundingClientRect().y }
  set y(v) { this.self.style.top = `${v}px` };

  get isFocused() { return this.self.dataset.focused === 'true' ? true : false };
  set isFocused(v) { this.self.dataset.focused = v };

  get isExpanded() { return this.self.dataset.expanded === 'true' ? true : false };
  set isExpanded(v) { this.self.dataset.expanded = v };
}
