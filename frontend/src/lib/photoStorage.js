// Local test storage for photos, using the browser's IndexedDB.
// Browser-only: nothing is sent to a server or GitHub, and there is no backup.
const DATABASE_NAME = 'photography-portfolio-local'
const STORE_NAME = 'photos'

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB is not available'))
      return
    }
    const request = indexedDB.open(DATABASE_NAME, 1)
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// Runs one action on the photo store and resolves with its result after the transaction is saved.
async function runInStore(mode, action) {
  const database = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode)
    const request = action(transaction.objectStore(STORE_NAME))
    transaction.oncomplete = () => {
      database.close()
      resolve(request.result)
    }
    transaction.onerror = () => {
      database.close()
      reject(transaction.error)
    }
    transaction.onabort = transaction.onerror
  })
}

// Records are { id, name, alt, ratio, blob }. Ids grow, so the list keeps the upload order.
export function getAllPhotoRecords() {
  return runInStore('readonly', (store) => store.getAll())
}

export function addPhotoRecord(record) {
  return runInStore('readwrite', (store) => store.add(record))
}

export function savePhotoRecord(record) {
  return runInStore('readwrite', (store) => store.put(record))
}

export function deletePhotoRecord(id) {
  return runInStore('readwrite', (store) => store.delete(id))
}
