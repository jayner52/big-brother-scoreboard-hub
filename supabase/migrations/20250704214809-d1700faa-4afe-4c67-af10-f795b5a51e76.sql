-- Add buy-in option to pools table
ALTER TABLE public.pools ADD COLUMN has_buy_in boolean NOT NULL DEFAULT true;
ALTER TABLE public.pools ADD COLUMN buy_in_description text;

-- Update pool_settings table as well for consistency
ALTER TABLE public.pool_settings ADD COLUMN has_buy_in boolean NOT NULL DEFAULT true;
ALTER TABLE public.pool_settings ADD COLUMN buy_in_description text;