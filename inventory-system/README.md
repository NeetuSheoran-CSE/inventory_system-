# Inventory and Data Management System

Web Dev III - Assignment 3 (Node.js + Express + MongoDB + Mongoose + dotenv)

## Setup
1. Make sure MongoDB is running locally (or put an Atlas URI in `.env`).
2. `npm install`
3. Copy `.env.example` to `.env` and edit if needed.
4. (Optional) `npm run seed` - inserts 12 sample products.
5. `npm start` (or `npm run dev` for auto-restart) - server on http://localhost:5000

## Endpoints
| Method | URL | Description |
|---|---|---|
| POST | /api/products | Create product |
| GET | /api/products | List with filter, sort, pagination |
| GET | /api/products/:id | Get one product |
| PUT | /api/products/:id | Update product details |
| PATCH | /api/products/:id/stock | Restock / sale, body `{ "change": 10 }` or `{ "change": -3 }` |
| DELETE | /api/products/:id | Delete product |
| GET | /api/products/low-stock | Products with quantity <= reorderLevel |
| GET | /api/products/summary | Category-wise aggregation report |

### Query parameters for GET /api/products
`category`, `supplier`, `search` (name), `minPrice`, `maxPrice`, `inStock=true|false`,
`sort` (e.g. `price`, `-price`, `category,-quantity`), `page`, `limit`

Example: `/api/products?category=Electronics&minPrice=500&sort=-price&page=1&limit=5`

### Sample create body
```json
{ "name": "Gel Pen Pack of 15", "sku": "STNY-PN-713", "category": "Stationery",
  "price": 120, "quantity": 40, "reorderLevel": 20, "supplier": "Cello Pens" }
```

## Project structure
```
config/db.js                  MongoDB connection
models/Product.js             Schema + validation + stockValue virtual
controllers/productController.js
routes/productRoutes.js
middleware/                   validateObjectId, validateBody, errorHandler
utils/                        asyncHandler, AppError
server.js, seed.js
```
