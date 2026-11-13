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

export async function migrateDatabase(db) {
  const versionResult = await db.getFirstAsync('PRAGMA user_version');
  const currentVersion = versionResult?.user_version ?? 0;
  const latestVersion = 1;

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
  });
}
