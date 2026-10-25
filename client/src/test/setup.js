// Test setup polyfills for Node test environment

if (typeof globalThis.localStorage === 'undefined') {
  let store = {};
  globalThis.localStorage = {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (i) => Object.keys(store)[i] || null,
  };
}

if (typeof globalThis.FileReader === 'undefined') {
  globalThis.FileReader = class {
    readAsDataURL(file) {
      setTimeout(() => {
        this.result = `data:${file?.type || 'application/octet-stream'};base64,bW9ja2RhdGE=`;
        if (this.onload) this.onload();
      }, 0);
    }
  };
}
