const Product = require('../models/Product');
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;

  const R = 6371; // Radius of Earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

/**
 * Calculate order summary for a cart or single product
 * @param {Object} params
 *   - cart: [{ product, quantity }]
 *   - productId: string
 *   - quantity: number
 *   - customerLat: number
 *   - customerLon: number
 * @returns {Array} orderSummary
 */
async function calculateOrderSummary({ cart, productId, quantity, customerLat, customerLon }) {
  if ((!cart || cart.length === 0) && !productId) {
    throw new Error('No products provided');
  }
  if (typeof customerLat !== 'number' || typeof customerLon !== 'number') {
    throw new Error('Customer coordinates required');
  }

  let items = [];
  if (cart && cart.length > 0) {
    const productIds = cart.map(i => i.product);
    const products = await Product.find({ _id: { $in: productIds } }).populate('shop');
    const productMap = new Map(products.map(p => [p._id.toString(), p]));
    for (const i of cart) {
      const product = productMap.get(i.product);
      if (product) items.push({ product, quantity: i.quantity });
    }
  } else {
    const product = await Product.findById(productId).populate('shop');
    if (!product) throw new Error('Product not found');
    items.push({ product, quantity });
  }

  const shopGroups = {};
  for (const item of items) {
    const shopId = item.product.shop._id.toString();
    if (!shopGroups[shopId]) shopGroups[shopId] = { shop: item.product.shop, items: [] };
    shopGroups[shopId].items.push(item);
  }

  const orderSummary = [];
  for (const shopId in shopGroups) {
    const { shop, items } = shopGroups[shopId];

    const dist = haversineDistance(customerLat, customerLon, shop.latitude, shop.longitude);

    if (dist > 15) {
      throw new Error(`Distance from shop ${shop.name} is ${dist.toFixed(2)} km, beyond delivery range.`);
    }

    const itemsTotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
    const deliveryCharge = dist * 10; // ₹10 per km
    const subTotal = itemsTotal + deliveryCharge;
    const platformFee = subTotal * 0.05; // 5%
    const totalAmount = itemsTotal + deliveryCharge + platformFee;

    orderSummary.push({
      shopId,
      shopName: shop.name,
      items: items.map(i => ({
        productId: i.product._id,
        name: i.product.name,
        price: i.product.price,
        quantity: i.quantity,
        subtotal: i.product.price * i.quantity,
      })),
      distance: dist,
      deliveryCharge,
      platformFee,
      totalAmount,
    });
  }

  return orderSummary;
}

module.exports = { calculateOrderSummary, haversineDistance };
