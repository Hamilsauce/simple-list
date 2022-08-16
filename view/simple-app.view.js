import { simpleStore } from '../store/simple-store.js'
import { ListView } from './components/list.view.js'
import { Nav } from './components/nav.view.js'
import { Options } from './components/options.view.js'
import { Toolbar } from './components/toolbar.view.js'
import { Topbar } from './components/topbar.view.js'
import { templater } from './templater.js';
import { View } from './view.js';

import { appThemes } from './lib/app-themes.js';
const Components = {
  nav: Nav,
  topbar: Topbar,
  options: Options,
  list: ListView,
  toolbar: Toolbar,
}

const ViewEvents = {
  loaded: 'view:loaded',
  list: {
    loaded: 'list:loaded',
    remove: 'list:remove',
    edit: 'list:edit',
    add: 'list:add',
  },
  item: {
    add: 'item:add',
    update: 'item:update',
    remove: 'item:remove',
  },
  option: {
    select: 'option:select',
  },
  nav: {
    change: 'nav:change',
  },
  toolbar: {
    select: 'toolbar:select',
  },
}

//@ PARAM components: object map of <mame, ComponentClassDefinition> 
export class AppView extends View {
  #components = new Map();

  constructor(components = Components) {
    super('app');

    this.isLoaded = false;

    this.loadComponents(components);

    this.listLoadedHandler = this.onModelChange.bind(this);
    // this.itemInsertHandler = this.onModelChange.bind(this);
    // this.itemRemovedHandler = this.onModelChange.bind(this);
    // this.itemUpdatedHandler = this.onModelChange.bind(this);


    // this.addEventListener('state:loaded', (e) => {
    // le.log('State LOADED', e);
    //   this.theme = e.detail.appTheme
    // });

    this.addEventListener('state:loaded', this.listLoadedHandler)

    this.addEventListener('state:changed', this.listLoadedHandler)

    this.addEventListener('appTheme:changed', (e) => {});

    // this.addEventListener('list:loaded', this.listLoadedHandler);

    this.addEventListener('item:insert', this.itemInsertHandler);

    this.addEventListener('item:removed', this.itemRemovedHandler);

    this.addEventListener('item:updated', this.itemUpdatedHandler);

    this.addEventListener('edit-list', e => {
      this.#components.get('options').dispatch('edit-list-start')
    })

    // this.self.addEventListener('edit-list', e => {
    //   this.#components.get('options').dispatch('edit-list-start')
    // })

    this.self.addEventListener('item:action', ({ detail }) => {
      const { item, action } = detail;
      if (action === 'delete') {
        this.dispatch(this, 'item:remove', { id: detail.item.id })
      }
      if (action === 'edit') {
        this.dispatch(this, 'item:edit', item)
      }
    })

    this.store = simpleStore;
  }

  init() {
    const appPlaceholder = document.querySelector('#app')

    appPlaceholder.innerHTML = ''

    document.body.insertBefore(this.self, appPlaceholder.remove())

    this.#components.get('toolbar').addEventListener('add-item-clicked', e => {
      this.dispatchEvent(
        new CustomEvent(ViewEvents.item.add, { bubbles: true })
      )
    });
    this.#components.get('list').addEventListener('add-item-clicked', e => {
      this.dispatchEvent(
        new CustomEvent(ViewEvents.item.add, { bubbles: true })
      )
    });
  
    this.self.addEventListener('add-item-clicked', e => {
      this.dispatchEvent(
        new CustomEvent(ViewEvents.item.add, { bubbles: true })
      )
    });

    this.#components.get('toolbar').addEventListener('delete-list-clicked', e => {
      this.dispatchEvent(
        new CustomEvent(ViewEvents.list.remove, { bubbles: true })
      )
    });

    this.#components.get('toolbar').addEventListener('edit-list-clicked', e => {

      this.dispatch(this.#components.get('options'), 'edit-list-start');
      // this.#components.get('options').dispatchEvent(
      //   new CustomEvent(ViewEvents.list.edit, { bubbles: true })
      // )
    });

    this.#components.get('options').on('option:select', ({ optionId }) => {
      this.dispatch(this, 'list:select', { listId: optionId });
    });

    this.#components.get('options').on('option:add', (e) => {
      const name = e && e.detail ? e.detail.listName : 'Unnamed'
      this.dispatch(this, ViewEvents.list.add, { name });
    });

    this.#components.get('options').on('option:edit', ({ id, name }) => {
      // console.log('option:edit', id, name)
      this.dispatch(this, ViewEvents.list.edit, { id, name });
    });
    this.addEventListener('edit-list', ({ id, name }) => {
      this.dispatch(this.#components.get('options'), 'edit-list-start', { id, name });
    });

    this.isLoaded = true;

    this.dispatch(this, ViewEvents.loaded, { isLoaded: this.isLoaded });
  }

  #on(domEvent, handler) {
    this.self.addEventListener(domEvent, handler);
  }


  findElement() {}

  findElementsBySelector(selector) { return }

  getComponent(name) {
    return this.#components.get(name)
  }

  loadComponents(componentConfig) {
    Object.entries(componentConfig).forEach(
      ([name, component]) => {
        this.addComponent(name, component)
      });
  }

  addComponent(name, ComponentClass) {
    this.self.insertBefore(
      this.#components.set(name, new ComponentClass(name, templater.get(name))).get(name).self,
      this.self.querySelector(`[data-component-name="${name}"]`).remove()
    );

    return this.#components.get(name);
  }

  clearList() {
    this.itemEls.forEach((el, i) => { el.remove() });

    return this;
  }

  appendItem(item) {
    item.self[item.id] = item;
    this.self.append(item.self);

    return this.self;
  }


  onModelChange(e) {
    const { detail } = e
    // console.log('In onModelChange e ', e.type)
    this.theme = detail.appTheme || 0
    if (detail.appTheme) {
      this.theme = detail.appTheme

    }

    const author = { name: simpleStore.user.name || 'unknown', id: simpleStore.user.id, defaultListId: simpleStore.user.defaultListId }
    const items = detail.items.map((item, i) => ({ ...item, author: author.name }));
    this.dispatch(this.#components.get('list'), 'list:loaded', { items });
    // this.dispatch(this.#components.get('options'), 'state:loaded', { lists: detail.lists });
    this.dispatch(this.#components.get('options'), 'state:loaded', { lists: detail.lists, activeListId: detail.activeListId });
    // this.dispatch(this.#components.get('options'), 'list:loaded', { lists: detail.lists, activeListId:detail.activeListId });
  }

  dispatch(target, event, detail) {
    target.dispatchEvent(
      new CustomEvent(event, { bubbles: true, detail })
    )
  }

  get itemEls() { return [...this.self.querySelectorAll('.list-item')] }

  get componentEls() { return [...this.self.querySelectorAll('[data-component="true"]')] }

  get components() { return [...this.#components.values()] }

  set theme(v) {
    document.querySelector('#app').style.background = v;
  };

  // get listEl() { return this.self };
}
