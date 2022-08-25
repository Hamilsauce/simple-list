export const appThemes = {
  pointer: -1,
  get colors() {
    return {
      main: '#3D4245',
      red: '#613131',
      blue: '#25335C',
      green: '#415032',
      gray: '#1D1F20',
      orange: '#7E5B25',
      electricBlue: '#3D1EE0',
    }
  },
  get colorNames() {
    return Object.keys(this.colors);
    // ['main', 'red', 'blue', 'green', 'gray', 'orange', 'electricBlue']
  },
  get colorValues() {
    return Object.values(this.colors);
    // ['main', 'red', 'blue', 'green', 'gray', 'orange', 'electricBlue']
  },
  get size() {
    return this.colorNames.length
  },

  set(v = 0) {
    const index = this.colorValues.indexOf(v) === -1 ? 0 : this.colorValues.indexOf(v)
    this.pointer = index
    console.log('this.colors[this.colorNames[this.pointer]]', this.colors[this.colorNames[this.pointer]])
    return this.colors[this.colorNames[this.pointer]];
  },
  atIndex(i = 0) {
    this.pointer = i >= this.size ? i - this.size : i;
    console.log('this.colors[this.colorNames[this.pointer]]', this.colors[this.colorNames[this.pointer]])
    return this.colors[this.colorNames[this.pointer]];
  },
  next() {
    // if (i) {
    //   this.pointer = i;
    //   return this.atIndex(i)
    // }
    console.warn('this.pointer before update', this.pointer)
    this.pointer = this.pointer >= this.colorNames.length - 1 ? 0 : this.pointer + 1;
    console.warn('this.pointer aftr update', this.pointer)

    return this.colors[this.colorNames[this.pointer]];
  }
};
