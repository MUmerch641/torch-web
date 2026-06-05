
-- Fix mutable search_path
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Restrict EXECUTE on SECURITY DEFINER functions to internal use
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Restrict storage public listing: only allow individual-object reads, not bucket listing
DROP POLICY IF EXISTS "Public read blog covers" ON storage.objects;
CREATE POLICY "Public read blog cover objects"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-covers');
