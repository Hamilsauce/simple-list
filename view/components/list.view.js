import { ListItem } from './item.view.js';
import { View } from '../view.js';
// import { templater } from '../templater.js';


const toggleCardContent = (cardEl) => {
  cardEl.dataset.displayState = cardEl.dataset.displayState === 'hide' ? 'show' : 'hide';
  return cardEl.dataset.displayState;
};

const setCardSelectionState = (cardEl, state) => {
  cardEl.dataset.selected = state ? state : cardEl.dataset.selected === 'true' ? false : true;
  return cardEl.dataset.selected;
};

const selectionMode = {
  single: 'single',
  multi: 'multi',
}

export class ListView extends View {
  constructor() {
    super('list');

    // this.list;
    this.prompt;
    // this.self;
    this._selectedItems = new Set();
    this.itemDomMap = new Map();

    this.renderEmptyList();

    this.addEventListener('list:loaded', async (e) => {
      e.stopPropagation();
      e.preventDefault();
      await this.render(e.detail.items,'asc');
    });

    this.list.addEventListener('item:click', ({ detail }) => {
      const targ = detail.item;

      if (this.selectedItems.has(targ.dom)) targ.deselect();

      else targ.select();
    });

    this.selectionMode = selectionMode.single;

    this.promptClickHandler = this.#handleEmptyPromptClick.bind(this);
  }

  #handleEmptyPromptClick(e) {
    this.prompt.removeEventListener('click', this.promptClickHandler);

    this.dispatchEvent(
      new CustomEvent('add-item-clicked', { bubbles: true, detail: { action: 'add-item-clicked' } })
    );
  }

  render(list = [], dateSort = 'desc') {
    dateSort = dateSort.toLowerCase();
    if (list.length === 0) {
      this.renderEmptyList()
      return;
    }

    this.clearList();

    delete this.prompt;

    const sortedItems = list.sort((a, b) => {
      if (dateSort === 'desc') { return b.date - a.date }
      else if (dateSort === 'asc') { return a.date - b.date }
    });

    sortedItems.forEach((item, i) => {
      item = this.createItem(item);
      this.itemDomMap.set(item.dom, item);
      this.appendItem(item);
    });
  }

  renderEmptyList() {
    this.clearList();

    this.prompt = document.createElement('div');
    const top = document.createElement('div');
    const bottom = document.createElement('div');

    this.prompt.classList.add('empty-list-prompt');

    top.classList.add('prompt-top');

    top.textContent = 'You have no items in your list ¯\\_(ツ)_/¯';

    bottom.textContent = 'Click here or Add items at bottom to get started.';

    bottom.classList.add('prompt-bottom');

    this.prompt.append(top, bottom);

    this.prompt.addEventListener('click', this.promptClickHandler);

    this.list.append(this.prompt);

    return this;
  }

  clearList() {
    this.items.forEach((item, i) => {
      const removedItem = item.remove();
    });

    this.list.innerHTML = '';

    return this;
  }

  appendItem(item) {
    this.list.append(item.self);

    return this.list;
  }

  createItem(data) {
    const item = new ListItem();

    item.setData(data);

    return item;
  }

  get selectedItems() { return new Set([...this.list.querySelectorAll('.list-item[data-selected="true"]')]) }

  get items() { return [...this.itemDomMap.values()] }

  get itemEls() { return [...this.list.querySelectorAll('.list-item')] }

  get isEmpty() { return this.itemDomMap.size == 0 };

  get list() { return this.self } //.querySelector('#list') };
  // get listEl() { return this.list };
}
