import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
const { template, utils, rxjs } = ham;

const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of, fromEvent, merge, empty, delay, from } = rxjs;
const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;



let isSwiping = false;

let start = {
  x: 0,
  y: 0,
}

let curr = {
  x: 0,
  y: 0,
}

let end = {
  x: 0,
  y: 0,
}

let delta = {
  x: 0,
  y: 0,
}

export let swipe$ = null

setTimeout(() => {
  const viewContainer = document.querySelector('#view-container')
  const app = document.querySelector('#app')

  const pointerDown$ = fromEvent(viewContainer, 'pointerdown');
  const pointerMove$ = fromEvent(viewContainer, 'pointermove');
  const pointerUp$ = fromEvent(viewContainer, 'pointerup');

  swipe$ = pointerDown$
    .pipe(
      map(({ clientX, clientY }) => ({ x: clientX, y: clientY })),
      tap(startPoint => start = startPoint),
      tap(() => isSwiping = true),
      switchMap(startPoint => pointerMove$
        .pipe(
          map(({ clientX, clientY }) => ({ x: clientX, y: clientY })),
          map(pt => pt.x - start.x),
          filter(delta => Math.abs(delta) > 200),
          map(delta => delta > 0 ? -1 : 1),
          switchMap(delta => pointerUp$
            .pipe(
              tap(() => start.x = 0),
              tap(() => isSwiping = false),
              tap(() => viewContainer.dispatchEvent(new CustomEvent('swipe', { bubbles: true, detail: { offset: delta } }))),
              map(() => delta),
            )
          )
        )
      )
    );
}, 0);