export class Store extends EventTarget {

  constructor(name) {
    super();

    this.name = name;

    // this.state = {};

    this.subscribers = [];

    this.eventMap;

    this.actionMap;

    this.storage;
  }

  get storageConnected() { return this.storage }

  import(key, data) {}

  query() {
    if (!this.storage) throw new Error('store.Query: NO STORAGE SET IN STORE')

    return {
      select: (collectionKey) => ({
        where: () => {},
        orderBy: () => {},
        limit: () => {},
        groupBy: () => {},
        join: () => {}
      }),
      insert() {},
      update() {},
      delete() {},
    }
  }

  select(query = {}, callback) {}
  
  insert(item) {}
  
  updateItem(id, item) {}
  
  remove(id) {}

  subscribe(eventName, ...subscribers) {
    if (!(subscribers.every(_ => _ instanceof EventTarget))) throw new Error('Store subscribers must be of type EventTarget')

    subscribers.forEach((sub, i) => {
      sub.addEventListener(eventName, sub)
      this.subscribers.push(sub)
    });

    return () => {
      this.subscribers = this.subscribers
        .filter(s => {
          if (subscribers.includes(s)) {
            this.removeEventListener(eventName, s)
            return false;
          } else return true;
        });
    }
  }

  dispatch(eventName, detail = {}) {
    this.dispatchEvent(
      new CustomEvent(
        eventName, {
          bubbles: true,
          detail
        }
      )
    )
  }

  emit(eventName, detail = {}) {
    this.subscribers.forEach(
      (sub, i) => sub.dispatchEvent(
        new CustomEvent(
          eventName, {
            bubbles: true,
            detail
          }
        )
      ));
  }
}
