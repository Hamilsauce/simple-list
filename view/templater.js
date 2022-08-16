//

const listItem = (templateSelector) => {
  const node = document.querySelector(templateSelector).content.firstElementChild.cloneNode(true)

  return node;
};

const list = (templateSelector) => {
  const node = document.querySelector(templateSelector)
    .content.firstElementChild.cloneNode(true)

  return node;
};


export const templater = {
  appRoot: document,
  setAppRoot(el) { this.appRoot = el },
  get(name) {
    return document.querySelector(`#${name}-template`)
      .content.firstElementChild
      .cloneNode(true);
  }
};

export const template = (name) => {
  return document.querySelector(`#${name}-template`)
    .content.firstElementChild
    .cloneNode(true);
};
