const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// POST /api/products
exports.createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
});

// GET /api/products?category=&supplier=&search=&minPrice=&maxPrice=&inStock=&sort=&page=&limit=
exports.getProducts = asyncHandler(async (req, res) => {
  const { category, supplier, search, minPrice, maxPrice, inStock, sort, page, limit } = req.query;

  // ---- Filtering ----
  const filter = {};
  if (category) filter.category = new RegExp(`^${escapeRegex(category)}$`, 'i');
  if (supplier) filter.supplier = new RegExp(`^${escapeRegex(supplier)}$`, 'i');
  if (search) filter.name = new RegExp(escapeRegex(search), 'i');
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) {
      if (isNaN(minPrice)) throw new AppError('minPrice must be a number', 400);
      filter.price.$gte = Number(minPrice);
    }
    if (maxPrice !== undefined) {
      if (isNaN(maxPrice)) throw new AppError('maxPrice must be a number', 400);
      filter.price.$lte = Number(maxPrice);
    }
  }
  if (inStock === 'true') filter.quantity = { $gt: 0 };
  if (inStock === 'false') filter.quantity = 0;

  // ---- Sorting: sort=price,-quantity  (prefix "-" for descending) ----
  const sortBy = sort ? sort.split(',').join(' ') : '-createdAt';

  // ---- Pagination ----
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  const [total, products] = await Promise.all([
    Product.countDocuments(filter),
    Product.find(filter).sort(sortBy).skip(skip).limit(limitNum),
  ]);

  res.status(200).json({
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
    count: products.length,
    products,
  });
});

// GET /api/products/:id
exports.getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError('Product not found', 404);
  res.status(200).json(product);
});

// PUT /api/products/:id  (update product details)
exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) throw new AppError('Product not found', 404);
  res.status(200).json(product);
});

// PATCH /api/products/:id/stock  body: { "change": 10 } (restock) or { "change": -3 } (sale)
exports.adjustStock = asyncHandler(async (req, res) => {
  const { change } = req.body;

  // Atomic update: for a sale, only match if enough stock exists (never goes negative)
  const filter = { _id: req.params.id };
  if (change < 0) filter.quantity = { $gte: Math.abs(change) };

  const product = await Product.findOneAndUpdate(filter, { $inc: { quantity: change } }, { new: true });

  if (!product) {
    const exists = await Product.findById(req.params.id).select('quantity');
    if (!exists) throw new AppError('Product not found', 404);
    throw new AppError(`Insufficient stock: available ${exists.quantity}, requested ${Math.abs(change)}`, 400);
  }

  res.status(200).json({ message: 'Stock updated', product });
});

// DELETE /api/products/:id
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new AppError('Product not found', 404);
  res.status(200).json({ message: 'Product deleted', id: product.id });
});

// GET /api/products/low-stock  -> quantity <= reorderLevel
exports.getLowStock = asyncHandler(async (req, res) => {
  const items = await Product.aggregate([
    { $match: { $expr: { $lte: ['$quantity', '$reorderLevel'] } } },
    { $sort: { quantity: 1 } },
  ]);

  // Aggregate returns plain objects; add id & stockValue to match other responses
  const lowStockItems = items.map((p) => ({
    ...p,
    stockValue: p.price * p.quantity,
    id: p._id,
  }));

  res.status(200).json({ count: lowStockItems.length, lowStockItems });
});

// GET /api/products/summary  -> category-wise report
exports.getSummary = asyncHandler(async (req, res) => {
  const summary = await Product.aggregate([
    {
      $group: {
        _id: '$category',
        totalItems: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' },
        totalStockValue: { $sum: { $multiply: ['$price', '$quantity'] } },
        avgPrice: { $avg: '$price' },
      },
    },
    { $sort: { totalStockValue: -1 } },
  ]);

  res.status(200).json({ categories: summary.length, summary });
});
