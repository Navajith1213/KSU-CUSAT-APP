-- Split ALL policies into separate INSERT, UPDATE, DELETE policies to resolve SELECT multiple permissive policies linter warnings

-- 1. DROP ALL PLANNED POLICIES TO AVOID DUPLICATES OR ERRORING
DROP POLICY IF EXISTS "Modify announcements" ON public.announcements;
DROP POLICY IF EXISTS "Manage master_admins" ON public.master_admins;
DROP POLICY IF EXISTS "Manage department_admins" ON public.department_admins;

DROP POLICY IF EXISTS "Modify events" ON public.events;
DROP POLICY IF EXISTS "Modify boys_pgs" ON public.boys_pgs;
DROP POLICY IF EXISTS "Modify girls_pgs" ON public.girls_pgs;
DROP POLICY IF EXISTS "Modify hostels" ON public.hostels;
DROP POLICY IF EXISTS "Modify food_spots" ON public.food_spots;
DROP POLICY IF EXISTS "Modify restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Modify amenities" ON public.amenities;
DROP POLICY IF EXISTS "Modify clubs" ON public.clubs;
DROP POLICY IF EXISTS "Modify contacts" ON public.contacts;
DROP POLICY IF EXISTS "Modify helpdesk_contacts" ON public.helpdesk_contacts;
DROP POLICY IF EXISTS "Modify turfs" ON public.turfs;

-- 2. CREATE SEPARATE INSERT, UPDATE, DELETE POLICIES

-- announcements
CREATE POLICY "Insert announcements" ON public.announcements FOR INSERT TO authenticated 
  WITH CHECK (((select auth.jwt()) ->> 'email'::text) = ANY (ARRAY['navajith1122@gmail.com'::text, 'mhdrashidkp3@gmail.com'::text, 'mohamedfamjas@gmail.com'::text]));
CREATE POLICY "Update announcements" ON public.announcements FOR UPDATE TO authenticated 
  USING (((select auth.jwt()) ->> 'email'::text) = ANY (ARRAY['navajith1122@gmail.com'::text, 'mhdrashidkp3@gmail.com'::text, 'mohamedfamjas@gmail.com'::text]))
  WITH CHECK (((select auth.jwt()) ->> 'email'::text) = ANY (ARRAY['navajith1122@gmail.com'::text, 'mhdrashidkp3@gmail.com'::text, 'mohamedfamjas@gmail.com'::text]));
CREATE POLICY "Delete announcements" ON public.announcements FOR DELETE TO authenticated 
  USING (((select auth.jwt()) ->> 'email'::text) = ANY (ARRAY['navajith1122@gmail.com'::text, 'mhdrashidkp3@gmail.com'::text, 'mohamedfamjas@gmail.com'::text]));

-- master_admins
CREATE POLICY "Insert master_admins" ON public.master_admins FOR INSERT TO authenticated 
  WITH CHECK (((select auth.jwt()) ->> 'email'::text) = 'navajith1122@gmail.com'::text);
CREATE POLICY "Update master_admins" ON public.master_admins FOR UPDATE TO authenticated 
  USING (((select auth.jwt()) ->> 'email'::text) = 'navajith1122@gmail.com'::text)
  WITH CHECK (((select auth.jwt()) ->> 'email'::text) = 'navajith1122@gmail.com'::text);
CREATE POLICY "Delete master_admins" ON public.master_admins FOR DELETE TO authenticated 
  USING (((select auth.jwt()) ->> 'email'::text) = 'navajith1122@gmail.com'::text);

-- department_admins
CREATE POLICY "Insert department_admins" ON public.department_admins FOR INSERT TO authenticated 
  WITH CHECK ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)));
CREATE POLICY "Update department_admins" ON public.department_admins FOR UPDATE TO authenticated 
  USING ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)))
  WITH CHECK ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)));
CREATE POLICY "Delete department_admins" ON public.department_admins FOR DELETE TO authenticated 
  USING ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)));

-- events
CREATE POLICY "Insert events" ON public.events FOR INSERT TO authenticated 
  WITH CHECK ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)));
CREATE POLICY "Update events" ON public.events FOR UPDATE TO authenticated 
  USING ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)))
  WITH CHECK ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)));
CREATE POLICY "Delete events" ON public.events FOR DELETE TO authenticated 
  USING ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)));

-- boys_pgs
CREATE POLICY "Insert boys_pgs" ON public.boys_pgs FOR INSERT TO authenticated 
  WITH CHECK ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)));
CREATE POLICY "Update boys_pgs" ON public.boys_pgs FOR UPDATE TO authenticated 
  USING ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)))
  WITH CHECK ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)));
CREATE POLICY "Delete boys_pgs" ON public.boys_pgs FOR DELETE TO authenticated 
  USING ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)));

-- girls_pgs
CREATE POLICY "Insert girls_pgs" ON public.girls_pgs FOR INSERT TO authenticated 
  WITH CHECK ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)));
CREATE POLICY "Update girls_pgs" ON public.girls_pgs FOR UPDATE TO authenticated 
  USING ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)))
  WITH CHECK ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)));
CREATE POLICY "Delete girls_pgs" ON public.girls_pgs FOR DELETE TO authenticated 
  USING ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)));

-- hostels
CREATE POLICY "Insert hostels" ON public.hostels FOR INSERT TO authenticated 
  WITH CHECK ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)));
CREATE POLICY "Update hostels" ON public.hostels FOR UPDATE TO authenticated 
  USING ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)))
  WITH CHECK ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)));
CREATE POLICY "Delete hostels" ON public.hostels FOR DELETE TO authenticated 
  USING ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)));

-- food_spots
CREATE POLICY "Insert food_spots" ON public.food_spots FOR INSERT TO authenticated 
  WITH CHECK ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)));
CREATE POLICY "Update food_spots" ON public.food_spots FOR UPDATE TO authenticated 
  USING ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)))
  WITH CHECK ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)));
CREATE POLICY "Delete food_spots" ON public.food_spots FOR DELETE TO authenticated 
  USING ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)));

-- restaurants
CREATE POLICY "Insert restaurants" ON public.restaurants FOR INSERT TO authenticated 
  WITH CHECK ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)));
CREATE POLICY "Update restaurants" ON public.restaurants FOR UPDATE TO authenticated 
  USING ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)))
  WITH CHECK ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)));
CREATE POLICY "Delete restaurants" ON public.restaurants FOR DELETE TO authenticated 
  USING ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)));

-- amenities
CREATE POLICY "Insert amenities" ON public.amenities FOR INSERT TO authenticated 
  WITH CHECK ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)));
CREATE POLICY "Update amenities" ON public.amenities FOR UPDATE TO authenticated 
  USING ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)))
  WITH CHECK ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)));
CREATE POLICY "Delete amenities" ON public.amenities FOR DELETE TO authenticated 
  USING ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)));

-- clubs
CREATE POLICY "Insert clubs" ON public.clubs FOR INSERT TO authenticated 
  WITH CHECK ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)));
CREATE POLICY "Update clubs" ON public.clubs FOR UPDATE TO authenticated 
  USING ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)))
  WITH CHECK ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)));
CREATE POLICY "Delete clubs" ON public.clubs FOR DELETE TO authenticated 
  USING ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)));

-- contacts
CREATE POLICY "Insert contacts" ON public.contacts FOR INSERT TO authenticated 
  WITH CHECK ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)));
CREATE POLICY "Update contacts" ON public.contacts FOR UPDATE TO authenticated 
  USING ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)))
  WITH CHECK ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)));
CREATE POLICY "Delete contacts" ON public.contacts FOR DELETE TO authenticated 
  USING ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)));

-- helpdesk_contacts
CREATE POLICY "Insert helpdesk_contacts" ON public.helpdesk_contacts FOR INSERT TO authenticated 
  WITH CHECK ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)));
CREATE POLICY "Update helpdesk_contacts" ON public.helpdesk_contacts FOR UPDATE TO authenticated 
  USING ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)))
  WITH CHECK ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)));
CREATE POLICY "Delete helpdesk_contacts" ON public.helpdesk_contacts FOR DELETE TO authenticated 
  USING ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)));

-- turfs
CREATE POLICY "Insert turfs" ON public.turfs FOR INSERT TO authenticated 
  WITH CHECK ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)));
CREATE POLICY "Update turfs" ON public.turfs FOR UPDATE TO authenticated 
  USING ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)))
  WITH CHECK ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)));
CREATE POLICY "Delete turfs" ON public.turfs FOR DELETE TO authenticated 
  USING ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)));
