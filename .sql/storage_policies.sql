-- ============================================
-- Supabase Storage Policies für storyboard-assets
-- ============================================
-- Diese Policies müssen im Supabase SQL Editor ausgeführt werden

-- 1. Upload erlauben (für authentifizierte User)
CREATE POLICY "Authenticated users can upload storyboard assets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'storyboard-assets');

-- 2. Lesen erlauben (öffentlich, da Bucket public ist)
CREATE POLICY "Public read access for storyboard assets"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'storyboard-assets');

-- 3. Update erlauben (für eigene Dateien)
CREATE POLICY "Users can update own storyboard assets"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'storyboard-assets' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. Delete erlauben (für eigene Dateien)
CREATE POLICY "Users can delete own storyboard assets"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'storyboard-assets' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- Verifikation
-- ============================================
-- Nach dem Ausführen dieser Policies sollten Uploads funktionieren!
-- Testen Sie durch Upload eines Bildes in der App.
