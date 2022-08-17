import { View } from '../view.js';
import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';

const { event, array, utils, text } = ham;

export class ListItem extends View {
  #date;
  #cache = {
    item: this,
    init(item) { this.item = item },
    push() {
      this.history.push({
        title: this.item.title,
        content: this.item.content,
        date: this.item.date,
      });

      return this;
    },
    pop() {
      return this.history.length > 0 ?
        this.history.pop() :
        null;
    },
    clear() {
      this.history.length = 0;

      return this;
    },
    peek() {
      return this.history.length > 0 ?
        this.history[this.history.length - 1] :
        null;
    },
    history: [],
  };

  constructor(name, template, updateFn) {
    super('list-item');

    this.instance = this;

    this.clickHandler = this.handleClick.bind(this);

    this.headerEl.addEventListener('click', this.clickHandler);

    this.handleEdit = this.editModeHandler.bind(this);
  }

  setData(item) {
    Object.assign(this, item);

    this.#setCache();
  }

  editModeHandler(e) {
    this.updateEditButton();

    this.self.dataset.modified = this.editing === true && this.isModified ? true : false;

    if (e.key && e.key === 'Backspace') {
      if (this.contentBlockEls.length === 1 && !this.contentBlockEls[0].textContent.trim()) {
        e.stopPropagation();
        e.preventDefault();

        console.log('inner backspace, sgould prevent default', { e });
      }
    }
  }

  updateEditButton() {
    const editButton = this.actions
      .find(_ => _.dataset.actionType === 'edit')

    editButton.textContent = this.editing === true && this.isModified ? 'Save' : this.editing === true ? 'Done' : 'Edit';
  }

  #setCache() { this.#cache.push(); }

  editMode(state = false) {
    this.editing = state;

    if (state === true) {
      this.select();

      this.titleEl.contentEditable = true;
      this.detailEl.contentEditable = true;

      this.titleEl.focus();
      event.selectAllContent(this.titleEl);
      this.titleEl.click();

      this.detailEl.addEventListener('keyup', this.handleEdit);
      this.titleEl.addEventListener('keyup', this.handleEdit);
    }

    else if (state === false) {
      this.titleEl.contentEditable = false;
      this.detailEl.contentEditable = false;
      this.date = new Date(Date.now()).toISOString();
      this.#cache.push();

      this.detailEl.removeEventListener('keyup', this.handleEdit);
      this.titleEl.removeEventListener('keyup', this.handleEdit);
    }

    this.editing = state;
  }

  get isModified() {
    const prev = this.#cache.peek();
    const modified = prev !== null && (prev.title !== this.title || prev.content.join('') != this.content.join(''))
  
    this.self.dataset.modified = this.editing === true && modified ? true : false;
  
    return modified;
  }

  select() {
    this.selected = true;
  
    return this;
  }

  deselect() {
    this.selected = false;
   
    return this;
  }

  setDisplayState(state) {
    this.displayState = state;
   
    return this;
  }

  toggleContentDisplay() {
    this.setDisplayState(this.displayState === 'hide' ? 'show' : 'hide');
    
    return this.displayState;
  };

  insertContentBlock(content, position = -1) {
    const b = document.createElement('div')

    b.classList.add('content-block');

    b.textContent = content;

    if (position > -1) {
      this.detailEl.insertAdjacentElement(position, b);
    } else {
      this.detailEl.append(b);
    }
  }

  removeDom(position) {
    this.headerEl.removeEventListener('click', this.clickHandler);
    this.contentBlockEls.forEach(el => el.remove());

    this.self.remove();
  }

  remove(cb) {
    const itemData = {
      author: this.author,
      id: this.self.id,
      title: this.title,
      date: this.date,
      content: this.content
    }
    
    this.removeDom();
    
    this.instance = null;
    
    return itemData;
  }

  findEl(selector) {
    return this.self.querySelector(selector);
  }

  findEls(selector, el = this.self) {
    return [...this.self.querySelectorAll(selector)];
  }

  handleClick = e => {
    const targ = e.target;

    if (this.actions.includes(targ) && this.selected) {

      if (targ.dataset.actionType === 'edit') {
        if (this.editing === false) return this.editMode(true);

        else {
          if (this.isModified) {
            this.self.dispatchEvent(
              new CustomEvent('item:action', {
                bubbles: true,
                detail: {
                  action: 'edit',
                  item: {
                    [this.id]: {
                      content: this.content.length ? this.content : this.#cache.peek().content,
                      title: this.title.length ? this.title : this.#cache.peek().title,
                      date: this.date,
                      author: this.author,
                    }
                  }
                }
              }));
          }

          this.editMode(false)
          
          return;
        }
      }

      this.self.dispatchEvent(
        new CustomEvent('item:action', {
          bubbles: true,
          detail: { item: this, action: targ.dataset.actionType }
        })
      );
    }

    else if (!this.editing) {
      this.self.dispatchEvent(
        new CustomEvent('item:click', {
          bubbles: true,
          detail: { item: this }
        })
      );
    }
  }

  get title() { return this.titleEl.textContent.trim() };

  set title(v) { this.titleEl.textContent = v.trim() };

  set id(v) { this.self.id = v };

  get id() { return this.self.id };

  get content() {
    return this.contentBlockEls.reduce((acc, block, i) => [...acc, block.textContent.trim()], [])
  };

  set content(v = []) {
    this.contentBlockEls.forEach((blockel) => { blockel.remove() });
    v.forEach((block) => { this.insertContentBlock(block) });
  };

  get author() { return this.authorEl.textContent }
  
  set author(newValue) {
    this.authorEl.textContent = newValue
  };

  get date() { return this.#date.toLocaleString() }

  set date(dateValue) {
    this.#date = new Date(Date.parse(dateValue));
    this.dateEl.textContent = this.date //.toDateString()
  };

  get dataset() {
    return this.self.dataset
  }

  get selected() {
    return this.dataset.selected === 'true' ? true : false;
  }

  set selected(v) {
    this.dataset.selected = v;
  
    this.setDisplayState(this.selected ? 'show' : 'hide');
  }

  get editing() {
    return this.dataset.editing === 'true' ? true : false;
  }

  set editing(v) {
    this.dataset.editing = v;
  }

  get displayState() {
    return this.dataset.displayState;
  }

  set displayState(v) {
    return this.dataset.displayState = v;
  }

  get titleEl() {
    return this.findEl('.list-item__header--title');
  }

  get footerEl() {
    return this.findEl('.list-item__footer');
  }
  
  get headerEl() {
    return this.findEl('.list-item__header');
  }

  get authorEl() {
    return this.footerEl.querySelector('.list-item__footer--author');
  }

  get dateEl() {
    return this.footerEl.querySelector('.list-item__footer--date');
  }

  get detailEl() {
    return this.findEl('.list-item__detail');
  }

  get actionGroup() {
    return this.findEl('.list-item__header__actions', this.headerEl)
  }

  get actions() {
    return this.findEls('.list-item-action ', this.headerEl)
  }

  get contentBlockEls() {
    return this.findEls('.content-block', this.detailEl)
  }
}