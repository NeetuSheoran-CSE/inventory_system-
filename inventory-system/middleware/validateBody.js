const AppError = require('../utils/AppError');

// Fields a client is allowed to set on a product
const ALLOWED_FIELDS = ['name', 'sku', 'category', 'price', 'quantity', 'reorderLevel', 'supplier'];

// Ensures a JSON body exists and keeps only whitelisted fields
const validateProductBody = (req, res, next) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body) || Object.keys(req.body).length === 0) {
    return next(new AppError('Request body is required and must be a JSON object', 400));
  }

  const cleaned = {};
  ALLOWED_FIELDS.forEach((field) => {
    if (req.body[field] !== undefined) cleaned[field] = req.body[field];
  });

  if (Object.keys(cleaned).length === 0) {
    return next(new AppError(`Provide at least one valid field: ${ALLOWED_FIELDS.join(', ')}`, 400));
  }

  req.body = cleaned;
  next();
};

// Validates the body of PATCH /:id/stock
const validateStockBody = (req, res, next) => {
  const change = req.body && req.body.change;
  if (typeof change !== 'number' || !Number.isInteger(change) || change === 0) {
    return next(new AppError('"change" must be a non-zero integer (positive = restock, negative = sale)', 400));
  }
  next();
};

module.exports = { validateProductBody, validateStockBody };
