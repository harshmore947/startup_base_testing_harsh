-- CCAvenue Payment Integration
-- Create orders table to track all payment transactions

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Order details
  order_id text UNIQUE NOT NULL,  -- Our internal order ID
  tracking_id text UNIQUE,        -- CCAvenue tracking ID
  bank_ref_no text,               -- Bank reference number

  -- Amount details
  amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'INR' NOT NULL,
  actual_amount_paid decimal(10,2),  -- Actual amount after discount (from CCAvenue)

  -- Plan details
  plan_type text NOT NULL,  -- 'premium_annual', 'research_single', etc.

  -- Status
  status text NOT NULL DEFAULT 'pending',  -- 'pending', 'success', 'failed', 'cancelled'
  order_status text,           -- CCAvenue order status
  failure_message text,        -- Error message if failed

  -- Payment details from CCAvenue
  payment_mode text,           -- Credit Card, Debit Card, Net Banking, etc.
  card_name text,              -- Card type if applicable
  status_code text,            -- CCAvenue status code
  status_message text,         -- CCAvenue status message

  -- Billing details (optional, for records)
  billing_name text,
  billing_email text,
  billing_tel text,

  -- Metadata
  ccavenue_response jsonb,     -- Full CCAvenue response for reference

  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  completed_at timestamptz     -- When payment was completed
);

-- Update users table for CCAvenue
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS ccavenue_customer_id text,
  ADD COLUMN IF NOT EXISTS subscription_plan text DEFAULT 'free';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON public.orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_tracking_id ON public.orders(tracking_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- RLS Policies for orders table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Users can view their own orders
CREATE POLICY "Users can view own orders"
  ON public.orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users cannot insert orders directly (only through Edge Functions with service role)
CREATE POLICY "Service role can insert orders"
  ON public.orders
  FOR INSERT
  WITH CHECK (false);  -- Blocked for users, only service role can insert

-- Users cannot update orders (only Edge Functions can)
CREATE POLICY "Service role can update orders"
  ON public.orders
  FOR UPDATE
  USING (false);  -- Blocked for users

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_orders_updated_at_trigger ON public.orders;
CREATE TRIGGER update_orders_updated_at_trigger
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_orders_updated_at();

-- Add comment for documentation
COMMENT ON TABLE public.orders IS 'Stores all payment transactions from CCAvenue payment gateway';
COMMENT ON COLUMN public.orders.order_id IS 'Our internal unique order identifier';
COMMENT ON COLUMN public.orders.tracking_id IS 'CCAvenue tracking ID returned after payment';
COMMENT ON COLUMN public.orders.status IS 'Order status: pending, success, failed, cancelled';
