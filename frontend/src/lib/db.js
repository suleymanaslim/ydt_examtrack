// frontend/src/lib/db.js
// IndexedDB via Dexie.js — stores teacher's exam records

import Dexie from 'dexie';

const db = new Dexie('YDTTakipDB');

db.version(1).stores({
  exams: '++id, date, totalNet, student, createdAt',
});

export default db;
