export const extendComponent = (component, extension = {}) => {
  if (!(component && extension)) return console.error('No comp or no extension provided in extendComponent')
  Object.assign(component, extension);

  return true;
};
