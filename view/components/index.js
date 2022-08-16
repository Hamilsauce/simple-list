//

import { ListView } from './list.view.js'
import { ListItem } from './item.view.js'
import { Nav } from './nav.view.js'
import { Options } from './options.view.js'
import { Toolbar } from './toolbar.view.js'

export const components = {
  list: () => new ListView(),
  listItem: () => new ListItem(),
  nav: () => new Nav(),
  options: () => new Options(),
  toolbar: () => new Toolbar(),
}
