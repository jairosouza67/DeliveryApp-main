-- Bring remote products table in sync with the enriched catalog schema.

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category_slug TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS currency_code TEXT DEFAULT 'EUR';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price_source TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price_reference_label TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS brand TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS volume_label TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS package_type TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS alcoholic BOOLEAN;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS abv TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS source_dataset TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS source_product_name TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS source_section TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS source_description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS source_country_code TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS source_city_code TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS source_store_name TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS source_image_path TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';

ALTER TABLE public.products ALTER COLUMN currency_code SET DEFAULT 'EUR';
ALTER TABLE public.products ALTER COLUMN status SET DEFAULT 'draft';

UPDATE public.products
SET currency_code = COALESCE(currency_code, 'EUR'),
    status = COALESCE(status, 'published')
WHERE currency_code IS NULL OR status IS NULL;