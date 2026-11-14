export async function loadLocalSessionAccountId(db) {
  const row = await db.getFirstAsync(
    'SELECT account_id FROM local_session WHERE singleton_id = 1',
  );
  return row?.account_id ?? null;
}

export async function saveLocalSession(db, accountId) {
  await db.runAsync(
    `INSERT INTO local_session (singleton_id, account_id)
     VALUES (1, ?)
     ON CONFLICT(singleton_id) DO UPDATE SET account_id = excluded.account_id`,
    accountId,
  );
}

export async function clearLocalSession(db) {
  await db.runAsync('DELETE FROM local_session WHERE singleton_id = 1');
}
