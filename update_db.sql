-- 1. Create service_categories table
CREATE TABLE IF NOT EXISTS public.service_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_ru TEXT NOT NULL,
  name_uz TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

-- Policies for service_categories
CREATE POLICY "Categories are viewable by everyone." ON public.service_categories FOR SELECT USING (true);
CREATE POLICY "Categories are insertable by everyone." ON public.service_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Categories are updateable by everyone." ON public.service_categories FOR UPDATE USING (true);
CREATE POLICY "Categories are deleteable by everyone." ON public.service_categories FOR DELETE USING (true);


-- 2. Insert default categories to avoid empty state
INSERT INTO public.service_categories (id, name_ru, name_uz) VALUES
('11111111-1111-1111-1111-111111111111', 'Стрижки и укладка', 'Soch qirqtirish va turmaklash'),
('22222222-2222-2222-2222-222222222222', 'Маникюр', 'Manikyur'),
('33333333-3333-3333-3333-333333333333', 'Педикюр', 'Pedikyur'),
('44444444-4444-4444-4444-444444444444', 'Массаж', 'Massaj'),
('55555555-5555-5555-5555-555555555555', 'Прочее', 'Boshqa')
ON CONFLICT DO NOTHING;

-- 3. Modify services table to use category_id instead of string category
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.service_categories(id);

-- Update existing rows based on the text column (if any)
UPDATE public.services SET category_id = '11111111-1111-1111-1111-111111111111' WHERE category = 'hair';
UPDATE public.services SET category_id = '22222222-2222-2222-2222-222222222222' WHERE category = 'manicure';
UPDATE public.services SET category_id = '33333333-3333-3333-3333-333333333333' WHERE category = 'pedicure';
UPDATE public.services SET category_id = '44444444-4444-4444-4444-444444444444' WHERE category = 'massage';
UPDATE public.services SET category_id = '55555555-5555-5555-5555-555555555555' WHERE category = 'other';

-- Set a default category for any nulls
UPDATE public.services SET category_id = '55555555-5555-5555-5555-555555555555' WHERE category_id IS NULL;

-- Now drop the old column
ALTER TABLE public.services DROP COLUMN IF EXISTS category;

-- Ensure RLS allows full CRUD for these tables so admin panel works smoothly
DROP POLICY IF EXISTS "Masters are insertable by everyone." ON public.masters;
DROP POLICY IF EXISTS "Masters are updateable by everyone." ON public.masters;
DROP POLICY IF EXISTS "Masters are deleteable by everyone." ON public.masters;
CREATE POLICY "Masters are insertable by everyone." ON public.masters FOR INSERT WITH CHECK (true);
CREATE POLICY "Masters are updateable by everyone." ON public.masters FOR UPDATE USING (true);
CREATE POLICY "Masters are deleteable by everyone." ON public.masters FOR DELETE USING (true);

DROP POLICY IF EXISTS "Services are insertable by everyone." ON public.services;
DROP POLICY IF EXISTS "Services are updateable by everyone." ON public.services;
DROP POLICY IF EXISTS "Services are deleteable by everyone." ON public.services;
CREATE POLICY "Services are insertable by everyone." ON public.services FOR INSERT WITH CHECK (true);
CREATE POLICY "Services are updateable by everyone." ON public.services FOR UPDATE USING (true);
CREATE POLICY "Services are deleteable by everyone." ON public.services FOR DELETE USING (true);

DROP POLICY IF EXISTS "Master services are insertable by everyone." ON public.master_services;
DROP POLICY IF EXISTS "Master services are deleteable by everyone." ON public.master_services;
CREATE POLICY "Master services are insertable by everyone." ON public.master_services FOR INSERT WITH CHECK (true);
CREATE POLICY "Master services are deleteable by everyone." ON public.master_services FOR DELETE USING (true);

DROP POLICY IF EXISTS "Admin chats are viewable by everyone." ON public.admin_chats;
DROP POLICY IF EXISTS "Admin chats are insertable by everyone." ON public.admin_chats;
DROP POLICY IF EXISTS "Admin chats are deleteable by everyone." ON public.admin_chats;
CREATE POLICY "Admin chats are viewable by everyone." ON public.admin_chats FOR SELECT USING (true);
CREATE POLICY "Admin chats are insertable by everyone." ON public.admin_chats FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin chats are deleteable by everyone." ON public.admin_chats FOR DELETE USING (true);
