
-- Roles enum and table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Brand enum
CREATE TYPE public.phone_brand AS ENUM ('iphone', 'samsung', 'google-pixel');

-- Blogs table
CREATE TABLE public.blogs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  brand phone_brand NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  cover_image_url TEXT,
  published BOOLEAN NOT NULL DEFAULT true,
  title_ru TEXT,
  excerpt_ru TEXT,
  body_ru TEXT,
  title_es TEXT,
  excerpt_es TEXT,
  body_es TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published blogs"
  ON public.blogs FOR SELECT
  USING (published = true);

CREATE POLICY "Admins can view all blogs"
  ON public.blogs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage blogs"
  ON public.blogs FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_blogs_brand ON public.blogs(brand);
CREATE INDEX idx_blogs_created_at ON public.blogs(created_at DESC);

-- Phones table
CREATE TABLE public.phones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand phone_brand NOT NULL,
  model TEXT NOT NULL,
  display TEXT,
  chipset TEXT,
  camera TEXT,
  battery TEXT,
  ram TEXT,
  storage TEXT,
  price TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.phones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view phones"
  ON public.phones FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage phones"
  ON public.phones FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trending table
CREATE TABLE public.trending (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_id UUID REFERENCES public.phones(id) ON DELETE CASCADE NOT NULL,
  rank INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.trending ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view trending"
  ON public.trending FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage trending"
  ON public.trending FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Newsletter
CREATE TABLE public.newsletter_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe"
  ON public.newsletter_subscribers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view subscribers"
  ON public.newsletter_subscribers FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER blogs_set_updated_at
  BEFORE UPDATE ON public.blogs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Storage bucket for blog covers
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-covers', 'blog-covers', true);

CREATE POLICY "Public read blog covers"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-covers');

CREATE POLICY "Admins can upload blog covers"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'blog-covers' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update blog covers"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'blog-covers' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete blog covers"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'blog-covers' AND public.has_role(auth.uid(), 'admin'));

-- Auto-grant first user admin role + default user role for everyone
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count INT;
BEGIN
  SELECT COUNT(*) INTO user_count FROM auth.users;
  -- First user becomes admin
  IF user_count = 1 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  -- Everyone gets the user role
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
