export class LocalStorage {
  static setCache(key: string, value: string) {
    localStorage.setItem(key, value);
  }

  static getCache(key: string) {
    return localStorage.getItem(key);
  }

  static removeCache(key: string) {
    localStorage.removeItem(key);
  }
}
