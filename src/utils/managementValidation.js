export function validateShopForm(form, districts) {
  const values = {
    name: form.name.trim(),
    district: form.district.trim(),
    address: form.address.trim(),
    phone: form.phone.trim(),
  };
  const errors = {};

  if (!values.name) errors.name = 'Enter the shop name.';
  if (!districts.some((district) => district.name === values.district)) {
    errors.district = 'Choose a district from the list.';
  }
  if (!values.address) errors.address = 'Enter the shop address.';

  const digits = values.phone.replace(/\D/g, '');
  if (!/^\+?[0-9][0-9\s().-]*$/.test(values.phone) || digits.length < 7 || digits.length > 15) {
    errors.phone = 'Enter a valid phone number with 7 to 15 digits.';
  }

  return { values, errors };
}

export function parseLkrToCents(value) {
  const amount = value.trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(amount)) return null;
  const [whole, fraction = ''] = amount.split('.');
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  return Number.isSafeInteger(cents) && cents > 0 ? cents : null;
}

export function validateProductForm(form, shops) {
  const values = {
    shopId: Number(form.shopId),
    name: form.name.trim(),
    brand: form.brand.trim(),
    category: form.category.trim(),
    priceLkrCents: parseLkrToCents(form.price),
    available: form.available ? 1 : 0,
  };
  const errors = {};

  if (!shops.some((shop) => shop.shop_id === values.shopId)) {
    errors.shopId = 'Choose a saved shop.';
  }
  if (!values.name) errors.name = 'Enter the equipment name.';
  if (!values.brand) errors.brand = 'Enter the brand.';
  if (!values.category) errors.category = 'Enter a sport or category.';
  if (values.priceLkrCents === null) {
    errors.price = 'Enter a price greater than zero, with up to two decimal places.';
  }

  return { values, errors };
}
