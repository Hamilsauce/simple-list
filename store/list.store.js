import { Store } from './store.model.js';

const ListState = {
  items: {},
  selectedItemIds: [],
  name: '',
}

export class ListStore extends Store {
  constructor(initialState) {
    super('listDB');

    this.state = this.loadFromStorage() || ListState
    // || {
    //   ...initialState,
    //   items: {},
    //   selectedItemIds: [],
    //   name: this.name,
    // }
  }

  initializeStorage(key, initialState) {
    this.state = {
      ...this.state,
      ...initialState
    }
    this.saveToStorage();
    console.log('stote.initializeState GET STORAGE', this.saveToStorage())
    if (this.exists()) {
      this.emit('state:loaded', { ...this.state })

    }
    // this.emit('state:loaded', { get: () => this.state })
  }

  saveToStorage() {
    this.storage.setItem(this.name, JSON.stringify({ ...this.state || {} }));
    this.state = this.loadFromStorage();
  }

  loadFromStorage() {
    return JSON.parse(this.storage.getItem(this.name))
  }

  get listItems() { return this.loadFromStorage() }
  set listItems(newValue) {
    this.saveToStorage()
    this.storage.setItem(this.name, JSON.stringify({ ...this.listItems || {}, ...newValue }))


  };
  set state(newValue) {
    if (!this.storage) this.storage = window.localStorage;

    this.storage.setItem(this.name, JSON.stringify({ ...this.state, ...newValue }))


  };
}

export const listStore = new ListStore();
