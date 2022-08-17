import { View } from '../view.js';


export class ViewContainer extends View {
  #previousView = null;

  #currentView = null;

  constructor() {
    super('view-container');
  }

  loadPreviousView() {
    this.currentView = this.#previousView;
    this.dispatchEvent(new CustomEvent('view-loaded', { bubbles: true, detail: { view: this.currentView } }));
  }
  
  loadView(viewName, componentClass) {
    if (this.#previousView&&this.#previousView.name === viewName) {
      this.loadPreviousView();
      return;
    }
    
    this.currentView = new componentClass();
    this.dispatchEvent(new CustomEvent('view-loaded', { bubbles: true, detail: { view: this.currentView } }));
  }

  set currentView(v) {
    let temp;

    if (this.#previousView === v) {
      temp = this.#previousView;
    }
    
    if (this.#currentView) {
      this.#currentView.dom.remove();
      this.#previousView = this.#currentView;
    }
    
    this.#currentView = temp || v;
    this.self.append(this.#currentView.dom)
  }

  get currentView() { return this.#currentView }
  get currentViewDom() { return this.currentView.dom }
  get currentViewName() { return this.currentView.name }
}
