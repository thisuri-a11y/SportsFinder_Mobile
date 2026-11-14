function escapeLikeValue(value) {
  return `%${String(value).replace(/[\\%_]/g, '\\$&')}%`;
}

function addSearchFilter(conditions, parameters, term, columns) {
  if (typeof term !== 'string' || term.trim() === '') {
    return;
  }

  const pattern = escapeLikeValue(term.trim());
  conditions.push(
    `(${columns.map((column) => `LOWER(${column}) LIKE LOWER(?) ESCAPE '\\'`).join(' OR ')})`,
  );
  parameters.push(...columns.map(() => pattern));
}

function addDistrictFilter(conditions, parameters, districtId, districtName) {
  if (districtId !== undefined && districtId !== null) {
    conditions.push('s.district_id = ?');
    parameters.push(districtId);
  } else if (typeof districtName === 'string' && districtName.trim() !== '') {
    conditions.push('d.name = ? COLLATE NOCASE');
    parameters.push(districtName.trim());
  }
}

function buildWhereClause(conditions) {
  return conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
}

const SHOP_COLUMNS = `
  s.id AS shop_id,
  s.name AS shop_name,
  s.district_id,
  d.name AS district_name,
  s.address,
  s.phone`;

const PRODUCT_COLUMNS = `
  p.id AS product_id,
  p.shop_id,
  p.name AS product_name,
  p.brand,
  p.category,
  p.price_lkr_cents,
  p.available,
  s.name AS shop_name,
  s.district_id,
  d.name AS district_name,
  s.address AS shop_address,
  s.phone AS shop_phone`;

async function withManagementSession(db, mutation) {
  let result;
  await db.withTransactionAsync(async () => {
    const account = await getManagementSession(db);
    if (!account) {
      throw new Error('Only signed-in shop owners and admins can manage shops and equipment.');
    }
    result = await mutation(account);
  });
  return result;
}

export async function getManagementSession(db) {
  return db.getFirstAsync(
    `SELECT a.id, a.username, a.role
     FROM local_session ls
     JOIN accounts a ON a.id = ls.account_id
     WHERE ls.singleton_id = 1 AND a.role IN ('admin', 'shop_owner')`,
  );
}

async function assertCanManageShop(db, account, shopId) {
  if (account.role === 'shop_owner' && !await db.getFirstAsync(
    'SELECT id FROM shops WHERE id = ? AND owner_account_id = ?', shopId, account.id,
  )) {
    throw new Error('Shop owners can only manage their own shops and equipment.');
  }
}

async function assertCanManageProduct(db, account, productId) {
  if (account.role === 'shop_owner' && !await db.getFirstAsync(
    `SELECT p.id FROM products p JOIN shops s ON s.id = p.shop_id
     WHERE p.id = ? AND s.owner_account_id = ?`, productId, account.id,
  )) {
    throw new Error('Shop owners can only manage their own shops and equipment.');
  }
}

function addOwnerFilter(conditions, parameters, ownerAccountId) {
  if (ownerAccountId != null) {
    conditions.push('s.owner_account_id = ?');
    parameters.push(ownerAccountId);
  }
}

export async function listShops(db, filters = {}) {
  const conditions = [];
  const parameters = [];

  addOwnerFilter(conditions, parameters, filters.ownerAccountId);
  addDistrictFilter(conditions, parameters, filters.districtId, filters.districtName);
  addSearchFilter(conditions, parameters, filters.search, [
    's.name',
    's.address',
    'd.name',
  ]);

  return db.getAllAsync(
    `SELECT ${SHOP_COLUMNS}
     FROM shops s
     JOIN districts d ON d.id = s.district_id
     ${buildWhereClause(conditions)}
     ORDER BY s.name COLLATE NOCASE`,
    parameters,
  );
}

export async function getShopById(db, shopId) {
  return db.getFirstAsync(
    `SELECT ${SHOP_COLUMNS}
     FROM shops s
     JOIN districts d ON d.id = s.district_id
     WHERE s.id = ?`,
    shopId,
  );
}

export function searchShops(db, searchTerm, filters = {}) {
  return listShops(db, { ...filters, search: searchTerm });
}

export async function createShop(db, shop) {
  return withManagementSession(db, async (account) => {
    const result = await db.runAsync(
      `INSERT INTO shops (name, district_id, address, phone, owner_account_id)
       VALUES (?, ?, ?, ?, ?)`,
      shop.name,
      shop.districtId,
      shop.address,
      shop.phone,
      account.role === 'shop_owner' ? account.id : null,
    );
    return result.lastInsertRowId;
  });
}

export async function updateShop(db, shopId, shop) {
  return withManagementSession(db, async (account) => {
    await assertCanManageShop(db, account, shopId);
    const result = await db.runAsync(
      `UPDATE shops
       SET name = ?, district_id = ?, address = ?, phone = ?
       WHERE id = ?`,
      shop.name,
      shop.districtId,
      shop.address,
      shop.phone,
      shopId,
    );
    return result.changes;
  });
}

export async function deleteShop(db, shopId) {
  return withManagementSession(db, async (account) => {
    await assertCanManageShop(db, account, shopId);
    const result = await db.runAsync('DELETE FROM shops WHERE id = ?', shopId);
    return result.changes;
  });
}

export async function listProducts(db, filters = {}) {
  const conditions = [];
  const parameters = [];

  if (filters.shopId !== undefined && filters.shopId !== null) {
    conditions.push('p.shop_id = ?');
    parameters.push(filters.shopId);
  }

  addOwnerFilter(conditions, parameters, filters.ownerAccountId);
  addDistrictFilter(conditions, parameters, filters.districtId, filters.districtName);

  if (typeof filters.category === 'string' && filters.category.trim() !== '') {
    conditions.push('p.category = ? COLLATE NOCASE');
    parameters.push(filters.category.trim());
  }

  if (filters.available !== undefined && filters.available !== null) {
    conditions.push('p.available = ?');
    parameters.push(filters.available);
  }

  addSearchFilter(conditions, parameters, filters.search, [
    'p.name',
    'p.brand',
    'p.category',
    's.name',
    'd.name',
  ]);

  return db.getAllAsync(
    `SELECT ${PRODUCT_COLUMNS}
     FROM products p
     JOIN shops s ON s.id = p.shop_id
     JOIN districts d ON d.id = s.district_id
     ${buildWhereClause(conditions)}
     ORDER BY p.name COLLATE NOCASE`,
    parameters,
  );
}

export function searchProducts(db, searchTerm, filters = {}) {
  return listProducts(db, { ...filters, search: searchTerm });
}

export async function createProduct(db, product) {
  return withManagementSession(db, async (account) => {
    await assertCanManageShop(db, account, product.shopId);
    const result = await db.runAsync(
      `INSERT INTO products
        (shop_id, name, brand, category, price_lkr_cents, available)
       VALUES (?, ?, ?, ?, ?, ?)`,
      product.shopId,
      product.name,
      product.brand,
      product.category,
      product.priceLkrCents,
      product.available,
    );
    return result.lastInsertRowId;
  });
}

export async function updateProduct(db, productId, product) {
  return withManagementSession(db, async (account) => {
    await assertCanManageProduct(db, account, productId);
    await assertCanManageShop(db, account, product.shopId);
    const result = await db.runAsync(
      `UPDATE products
       SET shop_id = ?, name = ?, brand = ?, category = ?,
           price_lkr_cents = ?, available = ?
       WHERE id = ?`,
      product.shopId,
      product.name,
      product.brand,
      product.category,
      product.priceLkrCents,
      product.available,
      productId,
    );
    return result.changes;
  });
}

export async function deleteProduct(db, productId) {
  return withManagementSession(db, async (account) => {
    await assertCanManageProduct(db, account, productId);
    const result = await db.runAsync('DELETE FROM products WHERE id = ?', productId);
    return result.changes;
  });
}

export async function listCategories(db) {
  const rows = await db.getAllAsync(
    `SELECT DISTINCT category
     FROM products
     ORDER BY category COLLATE NOCASE`,
  );
  return rows.map((row) => row.category);
}

export async function listDistricts(db) {
  return db.getAllAsync('SELECT id, name FROM districts ORDER BY name COLLATE NOCASE');
}

export function getShopInventory(db, shopId) {
  return listProducts(db, { shopId });
}
