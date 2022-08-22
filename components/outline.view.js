//
import { View } from './view.js';
import { NodeView } from './nodeview.js';
import { DetailPanelView } from './detail-panel.view.js';
import { ActionPanelView } from './action-panel.view.js';

const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of , fromEvent, merge, empty, delay, from } = rxjs;
const { distinctUntilChanged, flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;

// const nodeColors = ['#477BBF', '#E9BA11', '#FF9150', '#36A631', '#477BBF', ];

const nodeColor = (() => {
  // const nodeColors = colors;

  function* colorGenerator() {
    const nodeColors = ['#477BBF', '#E9BA11', '#FF9150', '#36A631', '#477BBF', ];
    let index = 0

    while (true) {
      yield nodeColors[index++ % nodeColors.length];
    }
  }

  const gen = colorGenerator();

  return () => gen.next().value;
})();


export class OutlineView extends View {
  #activeNode = null

  constructor() {
    super('outline');

    this.root;

    this.updateHandler = this.#handleUpdate.bind(this)
    this.focusHandler = this.#handleFocus.bind(this)
    this.collapseHandler = this.#handleCollapse.bind(this)
    this.insertNodeHandler = this.#handleInsert.bind(this)
    this.removeNodeHandler = this.#handleRemove.bind(this)
    this.activeNodeHandler = this.#handleActivate.bind(this);

    this.actionPanel = new ActionPanelView();

    this.cnt = 0

  }

  get activeNode() { return this.#activeNode; }

  set activeNode(newNode) {
    if (!newNode) return null;

    if (this.#activeNode) {
      this.#activeNode.deactivate()
    }

    newNode.activate();

    this.#activeNode = newNode;
    console.log('Outline, set activeNode', this.#activeNode.id);
  }

  render(root) {
    this.cnt++
    console.warn('OutlineView render()', this.cnt)

    if (root) {
      this.#createTree(root)
      this.#setEventListeners()

      if (!this.self.querySelector('#action-panel')) {
        this.self.append(this.actionPanel.dom)

        this.actionPanel.hide();
      } else this.actionPanel.hide();
    }
  }

  activateNode(nodeId) {
    console.log('nodeId === this.root.id', nodeId === this.root.id)
    if ( this.activeNode && nodeId === this.activeNode.id) return;
    if (nodeId === this.root.id) {
      this.activeNode = this.root;
    }
    else {
      this.root.traverse((node) => {
        if (node.id == nodeId) {
          this.activeNode = node;

          return true;
        }
      });
    }

    this.activeNode.collapse(false)

    this.actionPanel.show(
      this.activeNode.id,
      this.self.getBoundingClientRect().right - (this.actionPanel.dom.getBoundingClientRect().width || 200) - 8,
      this.activeNode.contentElement.getBoundingClientRect().bottom
    );

    navigator.virtualKeyboard.show();
    // navigator.virtualKeyboard.overlaysContent = true
  }

  collapseNode(nodeId) {
    if (nodeId === this.root.id) {
      this.root.collapse()
          return true;
    }
    else {
      this.root.traverse((node) => {
        if (node.id == nodeId || nodeId === this.root.id) {
          node.collapse(true)

          return true;
        }
      });
    }

    // this.actionPanel.show(
    //   this.activeNode.id,
    //   this.self.getBoundingClientRect().right - (this.actionPanel.dom.getBoundingClientRect().width || 200) - 8,
    //   this.activeNode.contentElement.getBoundingClientRect().bottom
    // );

    navigator.virtualKeyboard.show();
    // navigator.virtualKeyboard.overlaysContent = true
  }

  clear(node) {
    node = node ? node : this.root;

    let cleared = []

    if (node instanceof NodeView) {
      cleared = node.remove();
    }

    return cleared;
  }

  #createTree(nodeModel, parent) {
    if (!nodeModel) return

    nodeModel.color = nodeColor()
    // nodeModel.color = nodeModel.depth ? nodeColors[nodeModel.depth] : nodeColors[0]

    const node = new NodeView(nodeModel)

    if (parent) {
      node.parentId = parent.id

      parent.appendNode(node)
    }

    else {
      this.clear();

      node.parentId = null;
      node.parent = null;
      node.parentNode = null;

      this.root = node;

      this.self.append(node.dom)
    }

    if (nodeModel.children) {
      nodeModel.children.forEach((ch, i) => {
        this.#createTree(ch, node)
      });
    }
  }

  #setEventListeners() {

    // FOCUS node (sets as display root)
    this.self.addEventListener('click', this.focusHandler);

    this.self.addEventListener('click', this.collapseHandler);

    // ACTIVATE node (sets as editing)
    this.self.addEventListener('click', this.activeNodeHandler);

    this.self.addEventListener('update', this.updateHandler)

    this.self.addEventListener('node:insert', this.insertNodeHandler)

    this.self.addEventListener('node:remove', this.removeNodeHandler)
  }


  #handleInsert({ detail }) {
    if (detail.parentId) {
      detail = { ...detail, value: '' }

      this.self.dispatchEvent(
        new CustomEvent('insert', { bubbles: true, detail })
      );
    }
  }

  #handleRemove({ detail }) {
    if (detail.id) {
      this.self.dispatchEvent(
        new CustomEvent('remove', { bubbles: true, detail })
      );
    }
  }

  #handleFocus(e) {
    if (
      e.target.classList.contains('list-bullet') ||
      e.target.classList.contains('list-bullet-container')
    ) {

      const node = e.target.closest('.list-node')
      if (node) {
        this.self.dispatchEvent(
          new CustomEvent('focus', { bubbles: true, detail: { id: node.id } })
        );
      }
    }
  }

  #handleCollapse(e) {
    if (
      !(e.target.classList.contains('list-bullet') ||
        e.target.classList.contains('list-bullet-container')
      ) &&
      e.path.some(el => el instanceof Element && el.classList.contains('node-left'))
    ) {


      const node = e.target.closest('.list-node')
      const nodeId = +e.target.closest('.list-node').id
      if (nodeId && !node.classList.contains('root-node')) {
        this.collapseNode(nodeId)

      }
    }
  }

  #handleActivate(e) {
    if (!e.target.classList.contains('node-content')) return;

    const targ = e.target.closest('.list-node')
    const targId = targ.closest('.list-node').id
    const targetContent = targ.querySelector('.node-content')

    if (this.#activeNode && targId == this.#activeNode.id) {
      this.actionPanel.hide()

      return;
    }

    this.self.dispatchEvent(
      new CustomEvent('node:active', { bubbles: true, detail: { id: targId } })
    );

  }

  #handleUpdate(e) {
    const { value, id } = e.detail.node;

    if (value && id) {
      this.self.dispatchEvent(
        new CustomEvent('node:update', { bubbles: true, detail: { node: { value, id } } })
      );
    }
  }
}
