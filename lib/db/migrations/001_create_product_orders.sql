-- Create product_orders table (separate from restaurant orders)
CREATE TABLE IF NOT EXISTS product_orders (
  id TEXT PRIMARY KEY,
  "customerId" TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  subtotal NUMERIC(10,2) NOT NULL,
  "deliveryFee" NUMERIC(10,2) NOT NULL DEFAULT 5.00,
  tax NUMERIC(10,2) NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  "createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("customerId") REFERENCES "user"(id)
);

-- Create product_order_items table (separate from restaurant order_items)
CREATE TABLE IF NOT EXISTS product_order_items (
  id TEXT PRIMARY KEY,
  "orderId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  "unitPrice" NUMERIC(10,2) NOT NULL,
  "createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("orderId") REFERENCES product_orders(id) ON DELETE CASCADE,
  FOREIGN KEY ("productId") REFERENCES products(id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_product_orders_customer ON product_orders("customerId");
CREATE INDEX IF NOT EXISTS idx_product_order_items_order ON product_order_items("orderId");
