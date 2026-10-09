const express = require('express');
const ctrl = require('../controllers/productController');
const validateObjectId = require('../middleware/validateObjectId');
const { validateProductBody, validateStockBody } = require('../middleware/validateBody');

const router = express.Router();

// NOTE: static routes must be declared BEFORE "/:id" or they'd be treated as ids
router.get('/low-stock', ctrl.getLowStock);
router.get('/summary', ctrl.getSummary);

router.route('/')
  .get(ctrl.getProducts)
  .post(validateProductBody, ctrl.createProduct);

router.patch('/:id/stock', validateObjectId, validateStockBody, ctrl.adjustStock);

router.route('/:id')
  .get(validateObjectId, ctrl.getProductById)
  .put(validateObjectId, validateProductBody, ctrl.updateProduct)
  .delete(validateObjectId, ctrl.deleteProduct);

module.exports = router;
