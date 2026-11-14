import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { DatabaseSync } from 'node:sqlite';

async function importSourceExports(filename, exports) {
  const source = fs.readFileSync(filename, 'utf8')
    .replaceAll('export async function ', 'async function ')
    .replaceAll('export function ', 'function ');
  const moduleSource = `${source}\nexport { ${exports.join(', ')} };`;
  return import(`data:text/javascript;base64,${Buffer.from(moduleSource).toString('base64')}`);
}

const [{ migrateDatabase }, repository, validation] = await Promise.all([
  importSourceExports('src/db/migrations.js', ['migrateDatabase']),
  importSourceExports('src/db/repository.js', [
    'createShop',
    'updateShop',
    'deleteShop',
    'createProduct',
    'updateProduct',
    'deleteProduct',
    'getPersistedAdminSession',
    'listDistricts',
    'listProducts',
    'listShops',
  ]),
  importSourceExports('src/utils/managementValidation.js', [
    'validateShopForm',
    'validateProductForm',
    'parseLkrToCents',
  ]),
]);

async function openFixture() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'sportfinder-js-tests-'));
  const databasePath = path.join(directory, 'sportfinder.db');
  const raw = new DatabaseSync(databasePath);
  const db = wrapDatabase(raw);
  await migrateDatabase(db);

  return {
    databasePath,
    directory,
    db,
    raw,
    close() {
      raw.close();
      fs.rmSync(directory, { recursive: true, force: true });
    },
  };
}

function wrapDatabase(raw) {
  return {
    execAsync: async (sql) => raw.exec(sql),
    getFirstAsync: async (sql, ...params) => raw.prepare(sql).get(...params),
    getAllAsync: async (sql, params = []) => raw.prepare(sql).all(...params),
    runAsync: async (sql, ...params) => {
      const result = raw.prepare(sql).run(...params);
      return {
        changes: Number(result.changes),
        lastInsertRowId: Number(result.lastInsertRowid),
      };
    },
    withTransactionAsync: async (callback) => {
      raw.exec('BEGIN');
      try {
        await callback();
        raw.exec('COMMIT');
      } catch (error) {
        raw.exec('ROLLBACK');
        throw error;
      }
    },
  };
}

async function addAccount(raw, username, role) {
  const result = raw.prepare(
    `INSERT INTO accounts
      (username, username_key, password_hash, password_salt, role)
     VALUES (?, ?, ?, ?, ?)`,
  ).run(username, username.toLowerCase(), 'a'.repeat(64), 'b'.repeat(32), role);
  return Number(result.lastInsertRowid);
}

async function setSession(raw, accountId) {
  raw.prepare(
    `INSERT INTO local_session (singleton_id, account_id)
     VALUES (1, ?)
     ON CONFLICT(singleton_id) DO UPDATE SET account_id = excluded.account_id`,
  ).run(accountId);
}

test('migration creates and seeds a stable local catalogue', async (t) => {
  const fixture = await openFixture();
  t.after(() => fixture.close());

  assert.equal(fixture.raw.prepare('PRAGMA user_version').get().user_version, 3);
  assert.equal((await repository.listDistricts(fixture.db)).length, 25);
  assert.equal((await repository.listShops(fixture.db)).length, 8);
  assert.equal((await repository.listProducts(fixture.db)).length, 25);

  await migrateDatabase(fixture.db);
  assert.equal((await repository.listProducts(fixture.db)).length, 25, 'rerunning migrations must not duplicate seed data');
});

test('district and keyword filters use the app product queries', async (t) => {
  const fixture = await openFixture();
  t.after(() => fixture.close());

  const galleProducts = await repository.listProducts(fixture.db, { districtName: 'Galle' });
  assert.equal(galleProducts.length, 3);
  assert.ok(galleProducts.every((product) => product.district_name === 'Galle'));

  const yonexProducts = await repository.listProducts(fixture.db, { search: 'yOnEx' });
  assert.equal(yonexProducts.length, 2);
  assert.ok(yonexProducts.every((product) => product.brand.toLowerCase() === 'yonex'));

  const noMatches = await repository.listProducts(fixture.db, { search: 'no-such-local-product-8713' });
  assert.deepEqual(noMatches, []);
});

test('shop and equipment form validation trims text and converts rupees to cents', async (t) => {
  const fixture = await openFixture();
  t.after(() => fixture.close());
  const districts = await repository.listDistricts(fixture.db);
  const shops = await repository.listShops(fixture.db);

  const shopForm = validation.validateShopForm({
    name: '  Test Sports  ',
    district: '  Kandy ',
    address: '  9 Example Lane  ',
    phone: ' +94 (81) 222-7811 ',
  }, districts);
  assert.deepEqual(shopForm.errors, {});
  assert.equal(shopForm.values.name, 'Test Sports');
  assert.equal(shopForm.values.address, '9 Example Lane');
  assert.equal(shopForm.values.phone, '+94 (81) 222-7811');

  const invalidPhone = validation.validateShopForm({
    name: 'Test Sports', district: 'Kandy', address: '9 Example Lane', phone: 'not a number',
  }, districts);
  assert.ok(invalidPhone.errors.phone);

  assert.equal(validation.parseLkrToCents('1299.50'), 129950);
  assert.equal(validation.parseLkrToCents('1299'), 129900);
  assert.equal(validation.parseLkrToCents('1299.999'), null);

  const productForm = validation.validateProductForm({
    shopId: String(shops[0].shop_id),
    name: '  Practice Ball ',
    brand: ' Example ',
    category: ' Football ',
    price: '1299.50',
    available: true,
  }, shops);
  assert.deepEqual(productForm.errors, {});
  assert.equal(productForm.values.name, 'Practice Ball');
  assert.equal(productForm.values.priceLkrCents, 129950);
  assert.equal(productForm.values.available, 1);
});

test('browsing accounts cannot execute management writes', async (t) => {
  const fixture = await openFixture();
  t.after(() => fixture.close());
  const browsingId = await addAccount(fixture.raw, 'browse-test', 'browsing');
  await setSession(fixture.raw, browsingId);
  const initialShopCount = (await repository.listShops(fixture.db)).length;
  const initialProductCount = (await repository.listProducts(fixture.db)).length;

  await assert.rejects(
    () => repository.createShop(fixture.db, { name: 'Blocked', districtId: 1, address: 'Road', phone: '+94112223333' }),
    /Only the signed-in admin/,
  );
  await assert.rejects(
    () => repository.createProduct(fixture.db, { shopId: 1, name: 'Blocked', brand: 'Demo', category: 'Football', priceLkrCents: 1000, available: 1 }),
    /Only the signed-in admin/,
  );
  await assert.rejects(
    () => repository.updateShop(fixture.db, 1, { name: 'Blocked', districtId: 1, address: 'Road', phone: '+94112223333' }),
    /Only the signed-in admin/,
  );
  await assert.rejects(() => repository.deleteProduct(fixture.db, 1), /Only the signed-in admin/);
  assert.equal((await repository.listShops(fixture.db)).length, initialShopCount);
  assert.equal((await repository.listProducts(fixture.db)).length, initialProductCount);
});

test('deleting a shop cascades its equipment out of shop and product queries', async (t) => {
  const fixture = await openFixture();
  t.after(() => fixture.close());
  const adminId = await addAccount(fixture.raw, 'admin-test', 'admin');
  await setSession(fixture.raw, adminId);
  const districts = await repository.listDistricts(fixture.db);
  const shopId = await repository.createShop(fixture.db, {
    name: 'Cascade Test Shop',
    districtId: districts.find((district) => district.name === 'Kandy').id,
    address: '1 Test Road',
    phone: '+94 81 234 5678',
  });
  const productId = await repository.createProduct(fixture.db, {
    shopId,
    name: 'Cascade Test Football',
    brand: 'Demo',
    category: 'Football',
    priceLkrCents: validation.parseLkrToCents('1299.50'),
    available: 1,
  });
  assert.equal((await repository.listProducts(fixture.db, { search: 'Cascade Test Football' })).length, 1);

  await repository.deleteShop(fixture.db, shopId);
  assert.equal((await repository.listShops(fixture.db, { search: 'Cascade Test Shop' })).length, 0);
  assert.equal((await repository.listProducts(fixture.db, { search: 'Cascade Test Football' })).length, 0);
  assert.equal(fixture.raw.prepare('SELECT COUNT(*) AS count FROM products WHERE id = ?').get(productId).count, 0);
});

test('edits, deletions, and local session persist after reopening SQLite', async (t) => {
  const fixture = await openFixture();
  t.after(() => {
    try { fixture.raw.close(); } catch {}
    fs.rmSync(fixture.directory, { recursive: true, force: true });
  });

  const adminId = await addAccount(fixture.raw, 'persistent-admin', 'admin');
  await setSession(fixture.raw, adminId);
  const allProducts = await repository.listProducts(fixture.db);
  const productToEdit = allProducts.find((product) => product.product_name === 'Trail Running Shoes');
  const productToDelete = allProducts.find((product) => product.product_name === 'Hiking Backpack 35L');
  assert.ok(productToEdit && productToDelete);

  await repository.updateProduct(fixture.db, productToEdit.product_id, {
    shopId: productToEdit.shop_id,
    name: productToEdit.product_name,
    brand: productToEdit.brand,
    category: productToEdit.category,
    priceLkrCents: 199900,
    available: 0,
  });
  await repository.deleteProduct(fixture.db, productToDelete.product_id);
  fixture.raw.close();

  const reopenedRaw = new DatabaseSync(fixture.databasePath);
  const reopenedDb = wrapDatabase(reopenedRaw);
  await migrateDatabase(reopenedDb);
  assert.equal((await repository.getPersistedAdminSession(reopenedDb)).id, adminId);
  const persistedEdit = (await repository.listProducts(reopenedDb, { search: 'Trail Running Shoes' }))[0];
  assert.equal(persistedEdit.price_lkr_cents, 199900);
  assert.equal(persistedEdit.available, 0);
  assert.deepEqual(await repository.listProducts(reopenedDb, { search: 'Hiking Backpack 35L' }), []);
  reopenedRaw.close();
});
