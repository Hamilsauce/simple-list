import { simpleStore } from './store/simple-store.js';
import { AppView } from './view/simple-app.view.js';
import { DetailPanelView } from './view/components/detail-panel.view.js';
import { appThemes } from './view/lib/app-themes.js';
import { seedLocalStorage } from './lib/seed-localstorage.js';
import { LIST_SEED } from './simple-list-data1.js';

const setAppTheme = () => {};

const LIST_KEY = 'SIMPLE_LIST'

if (!localStorage.getItem(LIST_KEY)) {
  seedLocalStorage(LIST_KEY, LIST_SEED);
}

const appView = new AppView();

const detailPanel = new DetailPanelView();


simpleStore.subscribe('state:loaded', appView);

simpleStore.subscribe('state:changed', appView);

appView.addEventListener('item:add', e => {
  simpleStore.insert({
    content: ['...'],
    title: 'Untitled',
    date: new Date(Date.now()),
    author: 'Unknown'
  });
});

appView.addEventListener('item:remove', ({ detail }) => {
  simpleStore.remove(detail.id);
});

appView.addEventListener('list:add', ({ detail }) => {
  simpleStore.addList(detail);
});

appView.addEventListener('list:remove', ({ detail }) => {
  simpleStore.removeList();
});

appView.addEventListener('list:edit', ({ detail }) => {
  simpleStore.updateList(detail.id, detail);
});



appView.addEventListener('view:loaded', e => {
  const loadedState = e.detail.isLoaded;
  console.log('View LOADED', e);

  if (loadedState) {
    const navClose = document.querySelector('.close-nav');

    const menuButton = document.querySelector('#topbar-menu-button');

    menuButton.addEventListener('click', ({ target }) => {
      nav.classList.add('navExpand');
    });

    navClose.addEventListener('click', ({ target }) => {
      nav.classList.remove('navExpand');
    });

    appView.addEventListener('list:select', ({ detail }) => {
      console.warn('list:select detail', detail);
      simpleStore.setActiveList(detail.listId);
    });

    appView.addEventListener('item:edit', ({ detail }) => {
      const [id, item] = Object.entries(detail)[0];

      simpleStore.updateItem(id, item);
    });


    const appTitleEl = document.querySelector('#topbar-title');

    appTitleEl.addEventListener('click', e => {
      const theme = appThemes.next();

      simpleStore.setAppTheme(theme);

      e.target.closest('#app').style.background = theme;
    });
  }
});

appView.init();
