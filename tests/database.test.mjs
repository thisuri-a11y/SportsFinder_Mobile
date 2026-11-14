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

const [migrations, repository, validation] = await Promise.all([
  importSourceExports('src/db/migrations.js', [
    'createInitialSchema', 'createAuthSchema', 'addOutOfStockFootballSample', 'migrateDatabase',
  ]),
  importSourceExports('src/db/repository.js', [
    'createShop',
    'updateShop',
    'deleteShop',
    'createProduct',
    'updateProduct',
    'deleteProduct',
    'getManagementSession',
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
const { migrateDatabase } = migrations;

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

  assert.equal(fixture.raw.prepare('PRAGMA user_version').get().user_version, 4);
  assert.equal((await repository.listDistricts(fixture.db)).length, 25);
  assert.equal((await repository.listShops(fixture.db)).length, 8);
  assert.equal((await repository.listProducts(fixture.db)).length, 25);
  assert.deepEqual(
    fixture.raw.prepare('SELECT username, role FROM accounts ORDER BY username').all().map((row) => ({ ...row })),
    [
      { username: 'demo-admin', role: 'admin' },
      { username: 'demo-buyer', role: 'buyer' },
      { username: 'demo-owner', role: 'shop_owner' },
    ],
  );

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

test('buyers can browse but cannot execute management writes', async (t) => {
  const fixture = await openFixture();
  t.after(() => fixture.close());
  const buyerId = await addAccount(fixture.raw, 'buyer-test', 'buyer');
  await setSession(fixture.raw, buyerId);
  const initialShopCount = (await repository.listShops(fixture.db)).length;
  const initialProductCount = (await repository.listProducts(fixture.db)).length;

  await assert.rejects(
    () => repository.createShop(fixture.db, { name: 'Blocked', districtId: 1, address: 'Road', phone: '+94112223333' }),
    /Only signed-in shop owners and admins/,
  );
  await assert.rejects(
    () => repository.createProduct(fixture.db, { shopId: 1, name: 'Blocked', brand: 'Demo', category: 'Football', priceLkrCents: 1000, available: 1 }),
    /Only signed-in shop owners and admins/,
  );
  await assert.rejects(
    () => repository.updateShop(fixture.db, 1, { name: 'Blocked', districtId: 1, address: 'Road', phone: '+94112223333' }),
    /Only signed-in shop owners and admins/,
  );
  await assert.rejects(() => repository.deleteProduct(fixture.db, 1), /Only signed-in shop owners and admins/);
  assert.equal((await repository.listShops(fixture.db)).length, initialShopCount);
  assert.equal((await repository.listProducts(fixture.db)).length, initialProductCount);
});

test('shop owners can manage only their shops and equipment while buyers can see all listings', async (t) => {
  const { db, raw, close } = await openFixture();
  t.after(close);
  const owner = await addAccount(raw, 'owner-one', 'shop_owner');
  const otherOwner = await addAccount(raw, 'owner-two', 'shop_owner');
  const buyer = await addAccount(raw, 'catalogue-buyer', 'buyer');
  const admin = await addAccount(raw, 'catalogue-admin', 'admin');
  const shop = { name: 'Owner One Sports', districtId: 1, address: 'Test Lane', phone: '+94112223333' };
  const product = { name: 'Owner One Ball', brand: 'Demo', category: 'Football', priceLkrCents: 1000, available: 1 };
  const denied = /only manage their own/;

  await setSession(raw, owner);
  const shopId = await repository.createShop(db, { ...shop, ownerAccountId: otherOwner });
  const productId = await repository.createProduct(db, { ...product, shopId });
  assert.equal(await repository.updateShop(db, shopId, shop), 1);
  assert.equal(await repository.updateProduct(db, productId, { ...product, shopId }), 1);
  assert.equal((await repository.listShops(db, { ownerAccountId: owner })).length, 1);
  assert.equal((await repository.listProducts(db, { ownerAccountId: owner })).length, 1);

  await setSession(raw, otherOwner);
  const otherShopId = await repository.createShop(db, { ...shop, name: 'Owner Two Sports' });
  await assert.rejects(() => repository.updateShop(db, shopId, shop), denied);
  await assert.rejects(() => repository.deleteShop(db, shopId), denied);
  await assert.rejects(() => repository.createProduct(db, { ...product, shopId }), denied);
  await assert.rejects(() => repository.updateProduct(db, productId, { ...product, shopId: otherShopId }), denied);
  await assert.rejects(() => repository.deleteProduct(db, productId), denied);

  await setSession(raw, owner);
  await assert.rejects(() => repository.updateProduct(db, productId, { ...product, shopId: otherShopId }), denied);
  const spareProductId = await repository.createProduct(db, { ...product, shopId, name: 'Spare Ball' });
  assert.equal(await repository.deleteProduct(db, spareProductId), 1);
  const spareShopId = await repository.createShop(db, { ...shop, name: 'Spare Shop' });
  assert.equal(await repository.deleteShop(db, spareShopId), 1);

  await setSession(raw, buyer);
  assert.equal((await repository.listShops(db, { search: shop.name }))[0].shop_id, shopId);
  assert.equal((await repository.listProducts(db, { search: product.name }))[0].product_id, productId);

  await setSession(raw, admin);
  assert.equal(await repository.updateProduct(db, productId, { ...product, shopId: otherShopId }), 1);
  assert.equal(await repository.deleteShop(db, otherShopId), 1);
  assert.equal((await repository.listProducts(db, { search: product.name })).length, 0);
});

test('version 3 databases keep accounts, sessions and custom inventory when roles are upgraded', async (t) => {
  const raw = new DatabaseSync(':memory:');
  t.after(() => raw.close());
  const db = wrapDatabase(raw);
  await migrations.createInitialSchema(db);
  await migrations.createAuthSchema(db);
  await migrations.addOutOfStockFootballSample(db);
  await db.execAsync('PRAGMA user_version = 3');
  const admin = await addAccount(raw, 'existing-admin', 'admin');
  const buyer = await addAccount(raw, 'demo-buyer', 'browsing');
  await setSession(raw, buyer);
  raw.prepare('UPDATE shops SET address = ? WHERE id = 1').run('Custom Address');
  raw.prepare('DELETE FROM products WHERE id = 1').run();

  await migrateDatabase(db);
  assert.equal(raw.prepare('SELECT account_id FROM local_session').get().account_id, buyer);
  assert.equal(raw.prepare('SELECT role FROM accounts WHERE id = ?').get(buyer).role, 'buyer');
  assert.equal(raw.prepare('SELECT username FROM accounts WHERE role = ?').get('admin').username, 'existing-admin');
  assert.equal(raw.prepare('SELECT COUNT(*) AS count FROM accounts WHERE role = ?').get('admin').count, 1);
  assert.equal(raw.prepare('SELECT role FROM accounts WHERE username = ?').get('demo-buyer-2').role, 'buyer');
  assert.equal(raw.prepare('SELECT address FROM shops WHERE id = 1').get().address, 'Custom Address');
  assert.equal(raw.prepare('SELECT owner_account_id FROM shops WHERE id = 1').get().owner_account_id, null);
  assert.equal(raw.prepare('SELECT id FROM products WHERE id = 1').get(), undefined);
  assert.deepEqual(raw.prepare('PRAGMA foreign_key_check').all(), []);
  await setSession(raw, admin);
  assert.equal((await repository.getManagementSession(db)).id, admin);
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
  assert.equal((await repository.getManagementSession(reopenedDb)).id, adminId);
  const persistedEdit = (await repository.listProducts(reopenedDb, { search: 'Trail Running Shoes' }))[0];
  assert.equal(persistedEdit.price_lkr_cents, 199900);
  assert.equal(persistedEdit.available, 0);
  assert.deepEqual(await repository.listProducts(reopenedDb, { search: 'Hiking Backpack 35L' }), []);
  reopenedRaw.close();
});
