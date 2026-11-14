export const DATABASE_IN_USE = 'DATABASE_IN_USE';
export const BROWSER_STORAGE_UNAVAILABLE = 'BROWSER_STORAGE_UNAVAILABLE';

let accessPromise;

export function acquireBrowserDatabaseAccess() {
  const browser = globalThis.navigator;
  if (!browser?.locks || !browser.storage?.getDirectory) {
    return Promise.reject(Object.assign(
      new Error('This browser context does not support local SQLite storage.'),
      { code: BROWSER_STORAGE_UNAVAILABLE },
    ));
  }

  if (!accessPromise) {
    accessPromise = new Promise((resolve, reject) => {
      browser.locks.request('sportfinder-sqlite', { ifAvailable: true }, (lock) => {
        if (!lock) {
          throw Object.assign(new Error('SportFinder is open in another tab.'), { code: DATABASE_IN_USE });
        }
        resolve();
        // The SQLite worker holds its file handles until the page is destroyed.
        // Keep other tabs out for the same lifetime.
        return new Promise(() => {});
      }).catch(reject);
    }).catch((error) => {
      accessPromise = undefined;
      throw error;
    });
  }

  return accessPromise;
}
