-- 1. Исправление ошибки генерации ID (добавление DEFAULT gen_random_uuid())
ALTER TABLE public.masters ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.services ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.service_categories ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.admin_chats ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 2. Создание публичного хранилища для загрузки фотографий мастеров
INSERT INTO storage.buckets (id, name, public) 
VALUES ('master_photos', 'master_photos', true) 
ON CONFLICT DO NOTHING;

-- 3. Настройка прав доступа (RLS) для хранилища, чтобы фото могли загружаться и читаться
DROP POLICY IF EXISTS "Public access to master_photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow insert to master_photos" ON storage.objects;

CREATE POLICY "Public access to master_photos" ON storage.objects FOR SELECT USING (bucket_id = 'master_photos');
CREATE POLICY "Allow insert to master_photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'master_photos');

-- 4. Добавление колонок для сортировки и фото категорий
ALTER TABLE public.masters ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;
ALTER TABLE public.service_categories ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;
ALTER TABLE public.service_categories ADD COLUMN IF NOT EXISTS image TEXT;

-- 5. Создание таблицы для Контактов
CREATE TABLE IF NOT EXISTS public.salon_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    address_ru TEXT NOT NULL,
    address_uz TEXT NOT NULL,
    phone TEXT NOT NULL,
    working_hours_ru TEXT NOT NULL,
    working_hours_uz TEXT NOT NULL,
    instagram TEXT,
    telegram TEXT,
    map_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.salon_contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view contacts" ON public.salon_contacts;
DROP POLICY IF EXISTS "Admins can manage contacts" ON public.salon_contacts;

CREATE POLICY "Public can view contacts" ON public.salon_contacts FOR SELECT USING (true);
CREATE POLICY "Admins can manage contacts" ON public.salon_contacts USING (true) WITH CHECK (true);

ALTER TABLE public.salon_contacts ADD COLUMN IF NOT EXISTS map_url TEXT;

-- Вставляем дефолтную запись если её нет
INSERT INTO public.salon_contacts (id, address_ru, address_uz, phone, working_hours_ru, working_hours_uz, map_url) 
VALUES (
    '00000000-0000-0000-0000-000000000001', 
    'г. Ташкент, ул. Амира Темура, 55', 
    'Toshkent sh., Amir Temur ko''chasi, 55', 
    '+998 90 123 45 67', 
    'Ежедневно с 9:00 до 21:00', 
    'Har kuni 9:00 dan 21:00 gacha',
    'https://www.openstreetmap.org/export/embed.html?bbox=69.24%2C41.29%2C69.32%2C41.33&layer=mapnik&marker=41.311%2C69.279'
) ON CONFLICT DO NOTHING;
