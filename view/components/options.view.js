import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
const { event, array, utils, text } = ham;
import { View } from '../view.js';

export class Options extends View {

  constructor() {
    super('options')

    this.clickHandler = this.#handleClick.bind(this);
    this.keyUpHandler = this.#handleKeyUp.bind(this);
    this.listLoadHandler = this.#handleListLoad.bind(this);
    this.stateLoadHandler = this.#handleStateLoad.bind(this);
    this.editListHandler = this.#handleListEdit.bind(this);
    this.stopEditHandler = this.#stopEdit.bind(this);

    this.addEventListener('list:loaded', this.listLoadHandler);

    this.addEventListener('state:loaded', this.stateLoadHandler);

    this.addEventListener('edit-list-start', this.editListHandler);

    this.self.addEventListener('click', this.clickHandler);

    event.longPress(this.self, 700, this.#handleLongPress.bind(this));
  }

  async render(optionsList = [], defaultListId) {
    this.isLoaded = true;


    const frag = optionsList
      .reduce((fragment, opt, i) => {
        fragment.append(this.#createOption(opt))

        return fragment;
      }, new DocumentFragment());

    this.optionsContainer.innerHTML = '';

    this.optionsContainer.append(frag);

    this.selectOption(defaultListId);
  }

  #createOption({ id, name }) {
    const opt = document.createElement('div');

    opt.classList.add('option');
    opt.dataset.listId = id;
    opt.textContent = (name || '').replace('\n', '');
    opt.dataset.active = false;
    opt.enterKeyHint = 'done'

    return opt;
  }

  #getOptionId(el) { return el.dataset.listId }

  selectOption(id) {
    const option = this.options.find(_ => _.dataset.listId === id);
    if (option) {
      this.activeOption = option;
      this.activeOption.scrollIntoView({ behavior: 'smooth' });
    }
  }

  #emitSelection(id) {
    if (id) {
      this.emit('option:select', { optionId: id });
    }
  }

  #handleClick(e) {
    const { target } = e;
    const id = target.dataset.listId;

    if (this.#isOption(e) && !this.#isNewOption(target)) {
      this.#emitSelection(id);
    } else if (this.#isAddOptionButton(e)) {
      this.#handleAddOption();
    }
  }

  #handleKeyUp(e) {
    let { key } = e;
    key = key.toLowerCase()

    if (key === 'enter') {
    e.preventDefault()
    e.stopPropagation()
      
      // this.stopEditHandler()
      this.activeOption.removeEventListener('keyup', this.keyUpHandler);
      // opt.addEventListener('blur', e => this.stopEditHandler);
    }
  }

  #stopEdit(prevValue) {
    const opt = this.activeOption;
    const newOptionValue = opt.textContent.trim().replace('\n', '');

    opt.textContent = newOptionValue || prevValue;

    if (opt.dataset.listId.includes('temp')) {
      this.emit('option:add', { name: opt.textContent });
    }

    else if (newOptionValue != prevValue) {
      this.emit('option:edit', {
        id: opt.dataset.listId,
        name: opt.textContent,
      });
    }

    opt.blur();

    opt.contentEditable = false;

    this.self.addEventListener('click', this.clickHandler);
  }


  #handleLongPress(e) {
    this.selectOption(this.#getOptionId(e.target))
    this.#emitSelection(this.activeOption.dataset.listId);
    this.#handleListEdit(e);
  }

  #handleAddOption() {
    const id = `temp-option-id-${this.lists.length}`;
    const name = `New Lists`;

    this.optionsContainer.append(this.#createOption({ id, name }));

    this.selectOption(id);

    this.#handleListEdit();
  }


  #handleListEdit(e) {
    const opt = this.activeOption;
    const previousOptionValue = this.activeOption.textContent;

    this.self.removeEventListener('click', this.clickHandler);

    opt.contentEditable = true;

    opt.focus();
    event.selectAllContent(opt);
    opt.click();

    const blurOption = fn => {
      opt.removeEventListener('keyup', this.keyUpHandler);
      opt.removeEventListener('blur', fn);
      opt.removeEventListener('click', fn);
    }

    this.blur = blurOption.bind(this);

    opt.addEventListener('blur', this.stopEditHandler);
    opt.addEventListener('keyup', this.keyUpHandler);
  }

  async #handleStateLoad(e) {
    const { activeListId, lists } = e.detail;
    if (!(activeListId && lists)) return;

    this.lists = lists;

    await this.render(lists, activeListId);

    this.selectOption(activeListId);

    setTimeout(() => {
      if (this.activeOption) {
        this.activeOption.scrollIntoView({ behavior: 'smooth' });
      }
    }, 200);
  }

  #handleListLoad(e) {
    const { activeListId, lists } = e.detail;
    if (lists) {
      this.lists = lists;
      this.render(lists, activeListId);
    }

    this.selectOption(activeListId);
  }

  hasListsChanged(newLists = []) {
    if (!this.lists || (this.lists && this.lists.length != newLists.length)) {
      return true;
    } else {
      return !this.lists.every(l => {
        const match = newLists.find(_ => _.id == l.id);
        return match ? match.name === l.name : false;
      })
    }
  }

  #isAddOptionButton(e) { return e.composedPath().some(el => el instanceof Element && el === this.addOptionButton) }
  #isNewOption(opt) { return opt.dataset.listId.includes('temp') }

  #isOption(e) {
    return e.composedPath().some(el => el instanceof Element && el.classList.contains('option'));
  }

  get optionsContainer() { return this.self.querySelector('#options-container') }

  get options() { return [...this.self.querySelectorAll('.option')]; }

  get addOptionButton() { return this.self.querySelector('#add-option-button'); }

  get activeOption() { return this.self.querySelector('.option[data-active=true]'); }

  set activeOption(el) {
    if (el.classList.contains('option')) {
      if (this.activeOption) {
        this.activeOption.classList.remove('active-option');
        this.activeOption.dataset.active = false;
      }

      el.classList.add('active-option');
      el.dataset.active = true;
    }
  }
}