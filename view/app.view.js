//
import { ListView } from './components/list.view.js'
import { Nav } from './components/nav.view.js'
import { Options } from './components/options.view.js'
import { Toolbar } from './components/toolbar.view.js'
import { simpleStore } from '../store/simple-store.js'
import { View } from './base.view.js';
// import { components } from './components/index.js'

const Components = {
  list: new ListView(),
  nav: new Nav(),
  options: new Options(),
  toolbar: new Toolbar(),
}

const ViewEvents = {
  loaded: 'state:loaded',
  list: {
    loaded: 'list:loaded',
  },
  list: {
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

  constructor(name = 'app', components = Components) {
    // if (!(name && components)) throw new Error('Appview needs')
    super(name);

    this.components = Object.entries(components)
      .reduce((acc, [name, c], i) => acc.set(name, new c()), new Map());

    // this.componentEls.forEach((el, i) => {
    //   if (el.dataset.componentName) {
    //     this.loadComponent(el.dataset.componentName);
    //   }
    // });

    this.storeLoadHandler = this.handleStoreLoaded.bind(this);

    this.store = simpleStore;

    // this.store.subscribe(this.store.eventMap.list.loaded, this.list);

    this.addEventListener('list:loaded', this.storeLoadHandler);
  }

  loadComponent(name, ComponentClass) {
    this.components.set(name, new ComponentClass())

    c.append(this[name].dom);
  }

  #on(domEvent, handler) {
    this.self.addEventListener(domEvent, handler);
  }

  findElement() {}
  findElementsBySelector(selector) { return }

  findComponent(queryFn) {}

  render(list = []) {
    this.clearList();

    list.forEach((item, i) => {
      item = this.createItem(item);
      this.appendItem(item)
    });
  }

  clearList() {
    this.itemEls.forEach((el, i) => { el.remove() });

    return this
  }

  appendItem(item) {
    item.self[item.id] = item;
    this.self.append(item.self);

    return this.self;
  }

  // createItem(data) {
  //   // const item = new ListItem('#list-item-template')

  //   item.setData(data);
  //   return item;
  // }

  handleStoreLoaded(e) {
    console.log('app handleStoreLoaded', e);
    // this.render(e.detail.items)
  }

  get itemEls() { return [...this.self.querySelectorAll('.list-item')] }
  get componentEls() { return [...this.self.querySelectorAll('[data-component="true"]')] }

  get listEl() { return this.self };
}
