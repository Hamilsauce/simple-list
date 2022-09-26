const contentEl = document.querySelector('.view-container');
const optionButtons = document.querySelectorAll('.option');
const menuButton = document.querySelector('#header-menu-button');
const nav = document.querySelector('.app-nav');
const navClose = document.querySelector('.close-nav');

const activeOption = null;

const toggleCardContent = (cardEl) => {
  cardEl.dataset.displayState =
    cardEl.dataset.displayState === 'hide' ?
    'show' : 'hide'
  return cardEl.dataset.displayState
};


menuButton.addEventListener('click', ({ target }) => {
  console.log('click');
  nav.classList.add('navExpand')
});

navClose.addEventListener('click', ({ target }) => {
  nav.classList.remove('navExpand')
});

optionButtons.forEach(b => {
  b.addEventListener('click', ({ target }) => {
    console.log(target);
		[...optionButtons].forEach(_ => _.classList.remove('active-option'))
    target.classList.add('active-option')

    // const option = target.dataset.contentName
    // const contentName = target.dataset.contentName
    // console.log(contentName);

    // [...contentViews].forEach(v => { v.classList.remove('show') })

    // const view = [...contentViews].find(v => {
    // 	return v.dataset.contentName === contentName
    // })
    // console.log(view);

  })
})

const cards = [...document.querySelectorAll('.card')]
// const chartContainer = document.querySelector('.chart-container')
// const chartEl = document.querySelector('.chart')
cards.forEach((x, i) => {


});


contentEl.addEventListener('click', e => {
  const item = e.target.closest('.card');
  if (item) {
    toggleCardContent(item)
    // item.classList.toggle('hide')
  }
  // chartContainer.classList.toggle('hide')
})

// chartContainer.addEventListener('click', e => {
//   console.log('container click');
//   // chartContainer.classList.toggle('hide')
// })
