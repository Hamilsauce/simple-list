import { View } from '../view.js';


export class Toolbar extends View {
  constructor(name, template) {
    super(name, template)

    this.self.addEventListener('click', e => {
      const t = e.target

      if (!this.buttons.includes(t)) return;

      const event = {
        name: '',
        detail: {},
      }

      if (t === this.buttons.addItem) {
        event.name = 'add-item-clicked'
        this.dispatchEvent(
          new CustomEvent('add-item-clicked', { bubbles: true, detail: { action: 'add-item-clicked' } })
        );
        
      } else if (t === this.buttons.editList) {
     
        event.name = 'edit-list-clicked'
     
        this.dispatchEvent(
          new CustomEvent('edit-list-clicked', { bubbles: true, detail: { action: 'edit-list-clicked' } })
        );
        
        this.emit(
          new CustomEvent('edit-list-clicked', { bubbles: true, detail: { action: 'edit-list-clicked' } })
        );

      } else if (t === this.buttons.deleteList) {
        event.name = 'delete-list-clicked'
        this.dispatchEvent(
          new CustomEvent('delete-list-clicked', { bubbles: true, detail: { action: 'delete-list-clicked' } })
        );
      }


    });

    // constructor(template) {
    // super('toolbar',template)
  };



  get buttons() {
    return {
      addItem: this.self.querySelector('#toolbar-add-item'),
      deleteList: this.self.querySelector('#toolbar-delete-list'),
      editList: this.self.querySelector('#toolbar-edit-list'),
      values() { return Object.values(this) },
      includes(el) { return this.values().includes(el) },
      equals(buttonName, el) { return this[buttonName] === el },
    }
  }
}
