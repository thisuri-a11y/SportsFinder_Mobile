const listeners = new Set();

export function subscribeToDatabaseRefresh(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function refreshDatabaseQueries() {
  for (const listener of listeners) {
    listener();
  }
}
