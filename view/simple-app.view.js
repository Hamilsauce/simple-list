import { simpleStore } from '../store/simple-store.js';
import { ListView } from './components/list.view.js';
import { EditPanelView } from './components/edit-panel.view.js';
import { ViewContainer } from './components/view-container.view.js';
import { Nav } from './components/nav.view.js';
import { Options } from './components/options.view.js';
import { Toolbar } from './components/toolbar.view.js';
import { Topbar } from './components/topbar.view.js';
import { templater } from './templater.js';
import { View } from './view.js';
import { appThemes } from './lib/app-themes.js';

const Components = {
  nav: Nav,
  topbar: Topbar,
  options: Options,
  'view-container': ViewContainer,
  toolbar: Toolbar,
}

const Views = {
  list: ListView,
  'edit-panel': EditPanelView
}

const ViewEvents = {
  loaded: 'view:loaded',
  view: {
    loaded: 'view:loaded',
  },
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

    this.previousState;
    this.isLoaded = false;

    this.loadComponents(components);

    this.viewContainer.addEventListener('view-loaded', ({ detail }) => {
      console.log('HEARD  VIEW LOAD IN APP VIEW', { detail });

      this.dispatchEvent(
        new CustomEvent(ViewEvents.view.loaded, { bubbles: true, detail })
      );
    });

    this.changeActiveView('list')

    this.listLoadedHandler = this.onModelChange.bind(this);

    this.addEventListener('state:loaded', this.listLoadedHandler)

    this.addEventListener('item:insert', this.itemInsertHandler);

    this.addEventListener('item:removed', this.itemRemovedHandler);

    this.addEventListener('item:updated', this.itemUpdatedHandler);

    this.addEventListener('edit-list', e => {
      this.getComponent('options').dispatch('edit-list-start');
    });

    this.self.addEventListener('item:action', ({ detail }) => {
      const { item, action } = detail;

      if (action === 'delete') {
        this.dispatch(this, 'item:remove', { id: detail.item.id });
      }

      if (action === 'edit') {
        this.dispatch(this, 'item:edit', item);
      }
    });

    this.store = simpleStore;
  }

  init() {
    const appPlaceholder = document.querySelector('#app');

    appPlaceholder.innerHTML = '';

    document.body.insertBefore(this.self, appPlaceholder.remove());

    this.getComponent('toolbar').addEventListener('add-item-clicked', e => {
      this.dispatchEvent(
        new CustomEvent(ViewEvents.item.add, { bubbles: true })
      )
    });

    this.activeView.addEventListener('add-item-clicked', ({ detail }) => {
      this.dispatchEvent(
        new CustomEvent(ViewEvents.item.add, { bubbles: true, detail })
      )
    });

    this.getComponent('toolbar').addEventListener('delete-list-clicked', e => {
      this.dispatchEvent(
        new CustomEvent(ViewEvents.list.remove, { bubbles: true })
      )
    });

    this.getComponent('toolbar').addEventListener('edit-list-clicked', e => {
      this.dispatch(this.getComponent('options'), 'edit-list-start');
    });

    this.getComponent('options').on('option:select', ({ optionId }) => {
      if (this.viewContainer.currentView.name !== 'list') {
        this.changeActiveView('list');
      }

      this.dispatch(this, 'list:select', { listId: optionId });
    });

    this.getComponent('options').on('option:add', ({ name }) => {
      name = name ? name : 'Unnamed'

      this.dispatch(this, ViewEvents.list.add, { name });
    });

    this.getComponent('options').on('option:edit', ({ id, name }) => {
      this.dispatch(this, ViewEvents.list.edit, { id, name });
    });

    this.addEventListener('edit-list', ({ id, name }) => {
      this.dispatch(this.getComponent('options'), 'edit-list-start', { id, name });
    });

    this.isLoaded = true;

    this.dispatch(this, ViewEvents.loaded, { isLoaded: this.isLoaded });
  }

  #on(domEvent, handler) { this.self.addEventListener(domEvent, handler); }

  getComponent(name) { return this.#components.get(name); }


  changeActiveView(viewName) {
    if (!Views[viewName]) return;
    this.viewContainer.loadView(...Object.entries(Views).find(_ => _[0] === viewName))
  }

  loadComponents(componentConfig) {
    Object.entries(componentConfig).forEach(
      ([name, component]) => {
        this.addComponent(name, component);
      });
  }

  addComponent(name, ComponentClass) {
    /*  Searches App Template for element with matching `data-component-name` then replaces with component template */

    this.self.insertBefore(
      this.#components.set(name, new ComponentClass(name, templater.get(name))).get(name).self,
      this.self.querySelector(`[data-component-name="${name}"]`).remove()
    );

    return this.getComponent(name);
  }


  onModelChange(e) {
    e.stopPropagation()
    e.preventDefault()

    if (this.previousState === e.detail) return;
    const { detail } = e;

    console.groupCollapsed('appview state load');
    console.warn('AppView.onModelChange, Event >>> ', e.type)
    console.groupEnd('appview state load');

    this.previousState = detail

    if (e.type === 'state:loaded') {
      this.removeEventListener('state:loaded', this.listLoadedHandler)
      this.addEventListener('state:changed', this.listLoadedHandler)
    }

    this.theme = detail.appTheme || 0;

    if (detail.appTheme) this.theme = detail.appTheme;

    const author = { name: simpleStore.user.name || 'unknown', id: simpleStore.user.id, defaultListId: simpleStore.user.defaultListId }

    const items = detail.items.map((item, i) => ({ ...item, author: author.name }));

    if (this.activeView && this.activeView.name === 'list') {
      this.dispatch(this.activeView, 'list:loaded', { items })
    }

    this.dispatch(this.getComponent('options'), 'state:loaded', { lists: detail.lists, activeListId: detail.activeListId }, false);
  }

  dispatch(target, event, detail, bubbles = true) {
    target.dispatchEvent(
      new CustomEvent(event, { bubbles, detail })
    )
  }


  get viewContainer() { return this.getComponent('view-container') }

  get activeView() { return this.getComponent('view-container').currentView }

  get components() { return [...this.#components.values()] }

  set theme(v) {
    document.querySelector('#app').style.background = v;
  }
}
