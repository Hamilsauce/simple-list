import { View } from '../view.js';

export class Nav extends View {
  constructor(name,template) {
    super('nav')
    
    console.warn('nav');
  
  // constructor(template) {
    // super('nav',template)
  }
  
  handleLinkClick(e){
    this.dispatchEvent(
      
      new CustomEvent('nav:peek-state', {bubbles: true, detail: {route: 'peek-state1'}})  
    )
  }
  
  get links(){
    return [...this.self.querySelectorAll('.nav-link')]
  }
}
