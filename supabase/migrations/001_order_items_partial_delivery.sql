-- Migration: Order Items & Partial Delivery Reports
-- A&M Shipping — supports per-product partial receipt by couriers

-- ============================================================
-- 1. Shipment Order Items (line-level products in a shipment)
-- ============================================================
CREATE TABLE IF NOT EXISTS shipment_order_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id   TEXT NOT NULL,
  name          TEXT NOT NULL,
  sku           TEXT,
  quantity      INTEGER NOT NULL CHECK (quantity > 0),
  unit_price    NUMERIC(12, 2) NOT NULL DEFAULT 0,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shipment_order_items_shipment
  ON shipment_order_items (shipment_id);

-- ============================================================
-- 2. Partial Delivery Reports
-- ============================================================
CREATE TABLE IF NOT EXISTS partial_delivery_reports (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id             TEXT NOT NULL UNIQUE,
  shipment_id           TEXT NOT NULL,
  courier_id            TEXT NOT NULL,
  courier_name          TEXT NOT NULL,
  accepted_items_count  INTEGER NOT NULL DEFAULT 0,
  returned_items_count  INTEGER NOT NULL DEFAULT 0,
  partial_cod_amount    NUMERIC(12, 2) NOT NULL DEFAULT 0,
  remaining_cod_amount  NUMERIC(12, 2) NOT NULL DEFAULT 0,
  original_cod_amount   NUMERIC(12, 2) NOT NULL DEFAULT 0,
  notes                 TEXT,
  reported_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_partial_delivery_reports_shipment
  ON partial_delivery_reports (shipment_id);

-- ============================================================
-- 3. Partial Delivery Item Breakdown (per-product receipt)
-- ============================================================
CREATE TABLE IF NOT EXISTS partial_delivery_item_records (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id           TEXT NOT NULL REFERENCES partial_delivery_reports (report_id) ON DELETE CASCADE,
  item_id             TEXT NOT NULL,
  item_name           TEXT NOT NULL,
  ordered_quantity    INTEGER NOT NULL,
  accepted_quantity   INTEGER NOT NULL DEFAULT 0,
  returned_quantity   INTEGER NOT NULL DEFAULT 0,
  unit_price          NUMERIC(12, 2) NOT NULL DEFAULT 0,
  accepted_value      NUMERIC(12, 2) NOT NULL DEFAULT 0,
  returned_value      NUMERIC(12, 2) NOT NULL DEFAULT 0,
  return_reason       TEXT
);

CREATE INDEX IF NOT EXISTS idx_partial_delivery_items_report
  ON partial_delivery_item_records (report_id);

-- ============================================================
-- Note: Current app stores full state in bosta_app_state JSON blob.
-- These tables are ready for future relational migration.
-- The JSON schema mirrors:
--   Shipment.orderItems[]        → shipment_order_items
--   Shipment.partialDetails      → partial_delivery_reports + item_records
-- ============================================================
