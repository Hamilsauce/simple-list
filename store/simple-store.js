import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
const { help, pipeline, download, date, array, utils, text } = ham;
// console.log('pipeline', pipeline)
// help('pipeline')
import { Store } from './store.model.js';

const InitialState = {
  lists: [
    {
      name: '',
      id: null,
      author: '',
      createdDate: null,
      modifiedDate: null,
      items: {},
    }
  ],
  selectedItemIds: [],
  name: '',
}

const ListActionMap = {
  description: 'Map of valid/possible state mutations',
  insert: (item) => {},
  update: (item) => {},
  remove: (item) => {},
};

const EventMap = {
  loaded: 'state:loaded',
  changed: 'state:changed',
  list: {
    loaded: 'list:loaded',
    select: 'list:select'
  },
  appTheme: {
    change: 'appTheme:changed',
    select: 'list:select'
  },
  item: {
    insert: 'item:insert',
    updated: 'item:updated',
    removed: 'item:removed',
  },
}

export class ListItemAdapter {
  #id;
  #author;
  #title;
  #date;
  #content = [];
  #item;

  constructor(item = {}) {
    this.#item = item;
    this.id = item.id;
    this.author = item.author;
    this.title = item.title;
    this.date = item.date;
    this.content = item.content;
  };

  setData(item = {}) {
    return Object.assign(this || {}, item);
  }

  get author() {
    if (this.#author) return this.#author;
  };

  set author(newValue) { this.#author = newValue };

  set date(newValue) { this.#date = newValue instanceof Date ? newValue : new Date(Date.parse(newValue)) };

  get date() { return this.#date instanceof Date ? this.#date : new Date(Date.parse(this.#date)) };

  set content(newValue) { this.#content = newValue || [] }

  get content() { return this.#content }

  set title(newValue) { this.#title = newValue || [] }

  get title() { return this.#title }

  set id(newValue) { this.#id = newValue || [] }

  get id() { return this.#id }

  toJson() {
    return {
      id: this.id,
      author: this.author,
      tile: this.tile,
      content: this.content,
      date: this.date,
    }
  }
}

export class SimpleListStore extends Store {
  #state = {};
  #observers = [];

  constructor(initialState, actions, eventMap) {
    super('SIMPLE_LIST');

    this.eventMap = EventMap;

    this.actionMap = () => ListActionMap;

    this.init.bind(this)();


    this.arrayPipe = pipeline(
      (...arr) => `arrber ${arr} is big time!`,
      (arr) => {
        console.log('IN LOGGER', arr)
        return arr
      },
    );
    
    
    console.log('arrayPipe', this.arrayPipe([0, 10, 3]))
    
    
    this.numToTextPipe = pipeline(
      (num) => num + 50,
      (num) => num * 2,
      (num) => `Number ${num} is big time!`,
      (num) => {
        console.log('IN LOGGER', num)
        return num
      },
    );

    // console.log('am', this.numToTextPipe(0))
    // => 'Number 100 is big time!'

  }

  async init() {
    await this.loadFromStorage();
    this.#emitState(this.eventMap.loaded);
  }

  #emitState(eventName) {
    eventName = eventName || this.eventMap.changed;

    window.listState = this.#state;

    // console.warn('Store emitting State, event: ', eventName);

    this.emit(eventName, {
      appTheme: this.#state.appTheme || '#FF00FF',
      lists: [...Object.values(this.#state.lists).map(_=>({..._}))],
      items: this.#items.map(_ => ({ ..._, date: new Date(Date.parse(_.date)) })),
      activeListId: this.#activeListId,
    });
  }

  actions() { return this.actionMap.bind(this)() }

  /* 
    _select(query = {}, callback) {
      let k;

      return query ? this.#items
        .filter(item => {
          for (k in query) {
            if (query[k] !== item[k]) { return false; }
          }

          return true;
        }) : this.#items
    }
  */

  select(queryPath = [] || '', callback) {
    if (!(queryPath != undefined && (Array.isArray(queryPath) || typeof queryPath === 'string'))) return null;

    let location;
    let location2;

    if (queryPath === null) location = this.#state;

    else if (queryPath || queryPath.length == 0) {
      queryPath = typeof queryPath === 'string' ? queryPath.trim().split('/') : queryPath;

      location = queryPath.reduce((loc, segment, i) => {
        return loc && loc[segment] ? loc[segment] : null;
      }, this.#state) || null;

      location2 = {
        ...queryPath.reduce((loc, segment, i) => {
          return loc && loc[segment] ? loc[segment] : null;
        }, this.#state)
      } || null;
    }

    if (callback && location) callback(location);

    return location;
  }

  setActiveList(listId) {
    const prev = this.#activeListId;
    if (!listId || prev == listId) return;

    this.#commit([], { activeListId: listId })

    this.#emitState();
  }

  setAppTheme(theme = '') {
    this.#commit([], { appTheme: theme });

    this.#emitState();
  }

  #commit(queryPath = [] || '', changes) {
    const location = this.select(queryPath, loc => {
      if (changes) {
        Object.assign(loc, changes);
      }

      else {
        delete this.#state.lists[this.#activeListId];
      }
    });

    this.saveToStorage();

    return location ? location : null;
  }

  insert(item) {
    const id = utils.uuid();

    this.#commit(['lists', this.#activeListId, 'items'], {
      [id]: { ...item, id, date: new Date(Date.now()) }
    });

    this.#emitState();
  }

  addList({ name }) {
    const id = utils.uuid();
    const created = new Date(Date.now())

    console.warn('Store.addList called', { name, id, created })

    this.#commit(['lists'], {
      [id]: {
        name,
        id,
        items: {},
        createdDate: created.toJSON(),
        modifiedDate: created.toJSON(),
        author: this.user.id,
      }
    });

    this.#activeListId = id;

    this.#emitState();
  }

  removeList(id) {
    id = id || this.#activeListId;

    this.#commit(['lists', id], null);

    this.#activeListId = this.lists[this.lists.length - 1].id;

    this.#emitState();
  }

  updateItem(id, updates) {
    if (!this.exists(id)) throw new Error('Id not found in store.updateItem');
    updates.date = new Date(Date.now())
    this.#commit(['lists', this.#activeListId, 'items', id], updates);

    this.#emitState();
  }

  updateList(id, updates) {
    if (!this.hasList(id)) throw new Error('Id not found in store.updateItem');

    this.#commit(['lists', id], updates);

    this.#emitState();
  }

  remove(id) {
    if (!this.exists(id)) return;

    const removedItem = { ...this.activeList.items[id] };

    delete this.activeList.items[id];

    this.saveToStorage();

    this.#emitState();
  }

  exists(id) { return this.keys.includes(id) ? true : false }

  hasList(id) { return Object.keys(this.#state.lists).includes(id) ? true : false }

  saveToStorage() {
    /*  Saves state and fires load(), which syncs and calls Set State */
    const state = {
      ...this.#state || initialState,
      activeListId: this.#activeListId,
    }

    // console.warn('Saving to LocalStorage');

    window.localStorage.setItem(this.name, JSON.stringify(state));

    this.loadFromStorage();
  }

  async loadFromStorage() {
    /*  Gets state and passes it to setstate, which fires events  */
    this.#state = {
      ...this.#state,
      ...JSON.parse(window.localStorage.getItem(this.name))
    }
  }

  get #items() { return Object.values(this.activeList.items || {}) }

  get lists() { return Object.values(this.#state.lists) }

  get state() { return this.#state || {} }

  get user() { return this.#state.user || {} }

  get appTheme() { return this.#state.appTheme || '' }

  get activeList() { return this.select(['lists', this.#activeListId]) }

  get #activeListId() { return this.#state.activeListId || this.#items[0].id }

  set #activeListId(v) { this.#commit([], { activeListId: v }) }

  get keys() { return Object.keys(this.activeList.items) || [] }
}

export const simpleStore = new SimpleListStore(InitialState, ListActionMap, EventMap);
