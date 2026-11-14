const DISTRICTS = [
  'Ampara',
  'Anuradhapura',
  'Badulla',
  'Batticaloa',
  'Colombo',
  'Galle',
  'Gampaha',
  'Hambantota',
  'Jaffna',
  'Kalutara',
  'Kandy',
  'Kegalle',
  'Kilinochchi',
  'Kurunegala',
  'Mannar',
  'Matale',
  'Matara',
  'Monaragala',
  'Mullaitivu',
  'Nuwara Eliya',
  'Polonnaruwa',
  'Puttalam',
  'Ratnapura',
  'Trincomalee',
  'Vavuniya',
];

const SHOPS = [
  {
    name: 'Lion City Sports',
    district: 'Colombo',
    address: '128 Galle Road, Colombo 03',
    phone: '+94 11 234 5678',
  },
  {
    name: 'Metro Matchpoint',
    district: 'Colombo',
    address: '42 Duplication Road, Colombo 04',
    phone: '+94 11 234 5680',
  },
  {
    name: 'Gampaha Active',
    district: 'Gampaha',
    address: '16 Queens Road, Gampaha',
    phone: '+94 33 222 1050',
  },
  {
    name: 'Southern Strikers',
    district: 'Galle',
    address: '75 Wakwella Road, Galle',
    phone: '+94 91 223 4120',
  },
  {
    name: 'Kandy Peak Sports',
    district: 'Kandy',
    address: '31 Peradeniya Road, Kandy',
    phone: '+94 81 222 7810',
  },
  {
    name: 'Uva Outdoor Co.',
    district: 'Badulla',
    address: '9 Station Road, Badulla',
    phone: '+94 55 222 4300',
  },
  {
    name: 'Jaffna North Sports',
    district: 'Jaffna',
    address: '54 Hospital Road, Jaffna',
    phone: '+94 21 222 6700',
  },
  {
    name: 'East Coast Sports',
    district: 'Trincomalee',
    address: '22 Dockyard Road, Trincomalee',
    phone: '+94 26 222 3950',
  },
];

const PRODUCTS = [
  {
    shop: 'Lion City Sports',
    name: 'Club Match Football',
    brand: 'Nivia',
    category: 'Football',
    priceLkrCents: 125000,
    available: 1,
  },
  {
    shop: 'Lion City Sports',
    name: 'Classic Cricket Bat',
    brand: 'SS',
    category: 'Cricket',
    priceLkrCents: 1850000,
    available: 1,
  },
  {
    shop: 'Lion City Sports',
    name: 'Indoor Court Shoes',
    brand: 'Nivia',
    category: 'Footwear',
    priceLkrCents: 975000,
    available: 0,
  },
  {
    shop: 'Metro Matchpoint',
    name: 'Carbon Badminton Racket',
    brand: 'Yonex',
    category: 'Badminton',
    priceLkrCents: 780000,
    available: 1,
  },
  {
    shop: 'Metro Matchpoint',
    name: 'Tournament Shuttlecocks (6)',
    brand: 'Yonex',
    category: 'Badminton',
    priceLkrCents: 220000,
    available: 1,
  },
  {
    shop: 'Metro Matchpoint',
    name: 'Pro Table Tennis Bat',
    brand: 'Butterfly',
    category: 'Table Tennis',
    priceLkrCents: 540000,
    available: 0,
  },
  {
    shop: 'Gampaha Active',
    name: 'Training Basketball',
    brand: 'Spalding',
    category: 'Basketball',
    priceLkrCents: 395000,
    available: 1,
  },
  {
    shop: 'Gampaha Active',
    name: 'Grip Training Gloves',
    brand: 'Everlast',
    category: 'Fitness',
    priceLkrCents: 265000,
    available: 0,
  },
  {
    shop: 'Gampaha Active',
    name: 'Match Volleyball',
    brand: 'Mikasa',
    category: 'Volleyball',
    priceLkrCents: 650000,
    available: 1,
  },
  {
    shop: 'Southern Strikers',
    name: 'County Cricket Ball',
    brand: 'Kookaburra',
    category: 'Cricket',
    priceLkrCents: 425000,
    available: 1,
  },
  {
    shop: 'Southern Strikers',
    name: 'Swim Training Goggles',
    brand: 'Speedo',
    category: 'Swimming',
    priceLkrCents: 315000,
    available: 0,
  },
  {
    shop: 'Southern Strikers',
    name: 'Beach Volleyball',
    brand: 'Mikasa',
    category: 'Volleyball',
    priceLkrCents: 590000,
    available: 1,
  },
  {
    shop: 'Kandy Peak Sports',
    name: 'English Willow Bat',
    brand: 'GM',
    category: 'Cricket',
    priceLkrCents: 2450000,
    available: 1,
  },
  {
    shop: 'Kandy Peak Sports',
    name: 'Cricket Helmet',
    brand: 'Masuri',
    category: 'Cricket',
    priceLkrCents: 1150000,
    available: 1,
  },
  {
    shop: 'Kandy Peak Sports',
    name: 'Wicket Keeping Gloves',
    brand: 'SG',
    category: 'Cricket',
    priceLkrCents: 835000,
    available: 0,
  },
  {
    shop: 'Uva Outdoor Co.',
    name: 'Trail Running Shoes',
    brand: 'Asics',
    category: 'Footwear',
    priceLkrCents: 1890000,
    available: 1,
  },
  {
    shop: 'Uva Outdoor Co.',
    name: 'Hiking Backpack 35L',
    brand: 'Quechua',
    category: 'Outdoor',
    priceLkrCents: 625000,
    available: 1,
  },
  {
    shop: 'Uva Outdoor Co.',
    name: 'Trekking Poles',
    brand: 'Quechua',
    category: 'Outdoor',
    priceLkrCents: 450000,
    available: 0,
  },
  {
    shop: 'Jaffna North Sports',
    name: 'Futsal Match Ball',
    brand: 'Select',
    category: 'Football',
    priceLkrCents: 680000,
    available: 1,
  },
  {
    shop: 'Jaffna North Sports',
    name: 'Agility Training Cones (10)',
    brand: 'Mitre',
    category: 'Training',
    priceLkrCents: 195000,
    available: 0,
  },
  {
    shop: 'Jaffna North Sports',
    name: 'Goalkeeper Gloves',
    brand: 'Uhlsport',
    category: 'Football',
    priceLkrCents: 720000,
    available: 1,
  },
  {
    shop: 'East Coast Sports',
    name: 'Open Water Swim Fins',
    brand: 'Speedo',
    category: 'Swimming',
    priceLkrCents: 680000,
    available: 0,
  },
  {
    shop: 'East Coast Sports',
    name: 'Adjustable Dumbbell Pair',
    brand: 'LiveUp',
    category: 'Fitness',
    priceLkrCents: 3250000,
    available: 1,
  },
  {
    shop: 'East Coast Sports',
    name: 'Resistance Band Set',
    brand: 'LiveUp',
    category: 'Fitness',
    priceLkrCents: 485000,
    available: 1,
  },
];

async function createInitialSchema(db) {
  await db.execAsync(`
    CREATE TABLE districts (
      id INTEGER PRIMARY KEY NOT NULL,
      name TEXT NOT NULL COLLATE NOCASE UNIQUE CHECK (length(trim(name)) > 0)
    );

    CREATE TABLE shops (
      id INTEGER PRIMARY KEY NOT NULL,
      name TEXT NOT NULL CHECK (length(trim(name)) > 0),
      district_id INTEGER NOT NULL,
      address TEXT NOT NULL CHECK (length(trim(address)) > 0),
      phone TEXT NOT NULL CHECK (length(trim(phone)) > 0),
      FOREIGN KEY (district_id) REFERENCES districts(id)
        ON UPDATE CASCADE ON DELETE RESTRICT
    );

    CREATE TABLE products (
      id INTEGER PRIMARY KEY NOT NULL,
      shop_id INTEGER NOT NULL,
      name TEXT NOT NULL CHECK (length(trim(name)) > 0),
      brand TEXT NOT NULL CHECK (length(trim(brand)) > 0),
      category TEXT NOT NULL CHECK (length(trim(category)) > 0),
      price_lkr_cents INTEGER NOT NULL
        CHECK (typeof(price_lkr_cents) = 'integer' AND price_lkr_cents > 0),
      available INTEGER NOT NULL DEFAULT 1
        CHECK (typeof(available) = 'integer' AND available IN (0, 1)),
      FOREIGN KEY (shop_id) REFERENCES shops(id)
        ON UPDATE CASCADE ON DELETE CASCADE
    );

    CREATE INDEX shops_district_id_idx ON shops(district_id);
    CREATE INDEX products_shop_id_idx ON products(shop_id);
    CREATE INDEX products_category_idx ON products(category COLLATE NOCASE);
  `);

  for (const name of DISTRICTS) {
    await db.runAsync('INSERT INTO districts (name) VALUES (?)', name);
  }

  const shopIds = new Map();
  for (const shop of SHOPS) {
    const result = await db.runAsync(
      `INSERT INTO shops (name, district_id, address, phone)
       SELECT ?, id, ?, ? FROM districts WHERE name = ?`,
      shop.name,
      shop.address,
      shop.phone,
      shop.district,
    );
    shopIds.set(shop.name, result.lastInsertRowId);
  }

  for (const product of PRODUCTS) {
    await db.runAsync(
      `INSERT INTO products
        (shop_id, name, brand, category, price_lkr_cents, available)
       VALUES (?, ?, ?, ?, ?, ?)`,
      shopIds.get(product.shop),
      product.name,
      product.brand,
      product.category,
      product.priceLkrCents,
      product.available,
    );
  }
}

async function createAuthSchema(db) {
  await db.execAsync(`
    CREATE TABLE accounts (
      id INTEGER PRIMARY KEY NOT NULL,
      username TEXT NOT NULL COLLATE NOCASE UNIQUE
        CHECK (length(username) BETWEEN 3 AND 32 AND username = trim(username)),
      username_key TEXT NOT NULL COLLATE NOCASE UNIQUE,
      password_hash TEXT NOT NULL
        CHECK (length(password_hash) = 64 AND password_hash NOT GLOB '*[^0-9a-f]*'),
      password_salt TEXT NOT NULL
        CHECK (length(password_salt) = 32 AND password_salt NOT GLOB '*[^0-9a-f]*'),
      role TEXT NOT NULL CHECK (role IN ('admin', 'browsing')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE UNIQUE INDEX accounts_single_admin_idx
      ON accounts(role) WHERE role = 'admin';

    CREATE TABLE local_session (
      singleton_id INTEGER PRIMARY KEY NOT NULL CHECK (singleton_id = 1),
      account_id INTEGER NOT NULL UNIQUE,
      FOREIGN KEY (account_id) REFERENCES accounts(id)
        ON UPDATE CASCADE ON DELETE CASCADE
    );
  `);
}

async function addOutOfStockFootballSample(db) {
  await db.runAsync(
    `INSERT INTO products
      (shop_id, name, brand, category, price_lkr_cents, available)
     SELECT s.id, ?, ?, ?, ?, 0
     FROM shops s
     WHERE s.name = ? COLLATE NOCASE
       AND NOT EXISTS (
         SELECT 1 FROM products p
         WHERE p.shop_id = s.id AND p.name = ? COLLATE NOCASE
       )`,
    'Training Football',
    'Nivia',
    'Football',
    89500,
    'Lion City Sports',
    'Training Football',
  );
}

// Salted scrypt hashes for the documented, local demo password.
const DEMO_ACCOUNTS = [
  ['demo-admin', 'admin', '3981e2853e907a2c4e77e54f8236a0c8', 'bd1d151837514d4a5b3c0f9b6c269e515504d0f7e86e8741319af68acb4d2b47'],
  ['demo-buyer', 'buyer', 'b4c3827893073b24f9ab9a65cbcb6d71', '877c0f37b0346d8a2e30d36836d45ecb9ec7e30cf4003201d1a99b8163a09bd0'],
  ['demo-owner', 'shop_owner', 'd78fd0a92a95639f20eece1fe231988c', '8e62291ad21868bce1256bd2cdf8b4f09163c509cd9d656186f9651c08895dd4'],
];

async function addRolesAndOwnership(db, isFreshDatabase) {
  // Rebuild the tables to update the role constraint without losing account IDs or sessions.
  await db.execAsync(`
    ALTER TABLE local_session RENAME TO old_local_session;
    ALTER TABLE accounts RENAME TO old_accounts;

    CREATE TABLE accounts (
      id INTEGER PRIMARY KEY NOT NULL,
      username TEXT NOT NULL COLLATE NOCASE UNIQUE
        CHECK (length(username) BETWEEN 3 AND 32 AND username = trim(username)),
      username_key TEXT NOT NULL COLLATE NOCASE UNIQUE,
      password_hash TEXT NOT NULL
        CHECK (length(password_hash) = 64 AND password_hash NOT GLOB '*[^0-9a-f]*'),
      password_salt TEXT NOT NULL
        CHECK (length(password_salt) = 32 AND password_salt NOT GLOB '*[^0-9a-f]*'),
      role TEXT NOT NULL CHECK (role IN ('buyer', 'shop_owner', 'admin')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE local_session (
      singleton_id INTEGER PRIMARY KEY NOT NULL CHECK (singleton_id = 1),
      account_id INTEGER NOT NULL UNIQUE REFERENCES accounts(id)
        ON UPDATE CASCADE ON DELETE CASCADE
    );

    INSERT INTO accounts (id, username, username_key, password_hash, password_salt, role, created_at)
    SELECT id, username, username_key, password_hash, password_salt,
      CASE WHEN role = 'browsing' THEN 'buyer' ELSE role END, created_at
    FROM old_accounts;
    INSERT INTO local_session (singleton_id, account_id)
      SELECT singleton_id, account_id FROM old_local_session;

    DROP TABLE old_local_session;
    DROP TABLE old_accounts;

    ALTER TABLE shops ADD COLUMN owner_account_id INTEGER REFERENCES accounts(id)
      ON UPDATE CASCADE ON DELETE SET NULL;
    CREATE INDEX shops_owner_account_idx ON shops(owner_account_id);
  `);

  for (const [baseUsername, role, salt, hash] of DEMO_ACCOUNTS) {
    if (role === 'admin' && await db.getFirstAsync("SELECT id FROM accounts WHERE role = 'admin'")) {
      continue;
    }

    let username = baseUsername;
    for (let suffix = 2; await db.getFirstAsync(
      'SELECT id FROM accounts WHERE username_key = ? OR username = ?', username, username,
    ); suffix += 1) {
      username = `${baseUsername}-${suffix}`;
    }

    const { lastInsertRowId } = await db.runAsync(
      `INSERT INTO accounts (username, username_key, password_hash, password_salt, role)
       VALUES (?, ?, ?, ?, ?)`,
      username, username, hash, salt, role,
    );

    if (isFreshDatabase && role === 'shop_owner') {
      await db.runAsync('UPDATE shops SET owner_account_id = ? WHERE name = ?', lastInsertRowId, 'Lion City Sports');
    }
  }
}

export async function migrateDatabase(db) {
  const versionResult = await db.getFirstAsync('PRAGMA user_version');
  const currentVersion = versionResult?.user_version ?? 0;
  const latestVersion = 4;

  if (currentVersion > latestVersion) {
    throw new Error('This database was created by a newer version of SportFinder.');
  }

  if (currentVersion === latestVersion) {
    return;
  }

  await db.withTransactionAsync(async () => {
    if (currentVersion < 1) {
      await createInitialSchema(db);
      await db.execAsync('PRAGMA user_version = 1');
    }

    if (currentVersion < 2) {
      await createAuthSchema(db);
      await db.execAsync('PRAGMA user_version = 2');
    }

    if (currentVersion < 3) {
      await addOutOfStockFootballSample(db);
      await db.execAsync('PRAGMA user_version = 3');
    }

    if (currentVersion < 4) {
      await addRolesAndOwnership(db, currentVersion === 0);
      await db.execAsync('PRAGMA user_version = 4');
    }
  });
}
