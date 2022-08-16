import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
const { date, array, utils, text } = ham;

import { getDummyItems } from './dummy-list.js';

const itemArray = getDummyItems().items
console.log('getDummyItems', getDummyItems)
const seed = {
  selectedItemIds: [],
  name: 'listDb',
  items: itemArray.reduce((acc, curr, i) => ({...acc,[curr.id]: curr}), {}),
}
console.log('seed', {seed})

localStorage.setItem(seed.name, JSON.stringify(seed))
console.log('localStorage.getItem SEED', localStorage.getItem(seed.name));
