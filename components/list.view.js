import { View } from './view.js'
export class ListView extends View{
  constructor() {
    super();
    this.root;
  }
  
  get prop() { return this._prop };
  set prop(newValue) { this._prop = newValue };
}
