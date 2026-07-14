-- Consolidate and compile-optimize RLS policies to fix Supabase database linter warnings

-- 1. DROP OLD POLICIES
-- complaints
DROP POLICY IF EXISTS "Students can view own complaints" ON public.complaints;
DROP POLICY IF EXISTS "Students can delete their own queries within 1 hour" ON public.complaints;
DROP POLICY IF EXISTS "Students can insert their own complaints" ON public.complaints;
DROP POLICY IF EXISTS "Users can view their own complaints or Admin can view all" ON public.complaints;
DROP POLICY IF EXISTS "Admin can update complaints" ON public.complaints;
DROP POLICY IF EXISTS "Admin can delete complaints" ON public.complaints;
DROP POLICY IF EXISTS "Admin can view all complaints" ON public.complaints;
DROP POLICY IF EXISTS "Master Admin can view and edit all complaints" ON public.complaints;

-- academic_resources
DROP POLICY IF EXISTS "Allow department admins to insert" ON public.academic_resources;
DROP POLICY IF EXISTS "Allow department admins to delete" ON public.academic_resources;
DROP POLICY IF EXISTS "Master admin can delete any resource" ON public.academic_resources;
DROP POLICY IF EXISTS "Master admin delete override" ON public.academic_resources;
DROP POLICY IF EXISTS "Allow public read on academic_resources" ON public.academic_resources;

-- department_admins
DROP POLICY IF EXISTS "Anyone can view department admins" ON public.department_admins;
DROP POLICY IF EXISTS "Only Master Admin can insert department admins" ON public.department_admins;
DROP POLICY IF EXISTS "Only Master Admin can update department admins" ON public.department_admins;
DROP POLICY IF EXISTS "Only Master Admin can delete department admins" ON public.department_admins;
DROP POLICY IF EXISTS "Master Admin can manage department admins" ON public.department_admins;

-- join_requests
DROP POLICY IF EXISTS "Allow public inserts into join_requests" ON public.join_requests;
DROP POLICY IF EXISTS "Allow Master Admin to read join_requests" ON public.join_requests;

-- master_admins
DROP POLICY IF EXISTS "Authenticated users can read master_admins" ON public.master_admins;
DROP POLICY IF EXISTS "Super Admin can manage master_admins" ON public.master_admins;

-- announcements
DROP POLICY IF EXISTS "Allow public read access" ON public.announcements;
DROP POLICY IF EXISTS "Allow admin insert access" ON public.announcements;
DROP POLICY IF EXISTS "Allow admin update access" ON public.announcements;
DROP POLICY IF EXISTS "Allow admin delete access" ON public.announcements;

-- public tables (read-only for public, write for master admin)
DROP POLICY IF EXISTS "Public can read" ON public.events;
DROP POLICY IF EXISTS "Master Admin can modify" ON public.events;

DROP POLICY IF EXISTS "Public can read" ON public.boys_pgs;
DROP POLICY IF EXISTS "Master Admin can modify" ON public.boys_pgs;

DROP POLICY IF EXISTS "Public can read" ON public.girls_pgs;
DROP POLICY IF EXISTS "Master Admin can modify" ON public.girls_pgs;

DROP POLICY IF EXISTS "Public can read" ON public.hostels;
DROP POLICY IF EXISTS "Master Admin can modify" ON public.hostels;

DROP POLICY IF EXISTS "Public can read" ON public.food_spots;
DROP POLICY IF EXISTS "Master Admin can modify" ON public.food_spots;

DROP POLICY IF EXISTS "Public can read" ON public.restaurants;
DROP POLICY IF EXISTS "Master Admin can modify" ON public.restaurants;

DROP POLICY IF EXISTS "Public can read" ON public.amenities;
DROP POLICY IF EXISTS "Master Admin can modify" ON public.amenities;

DROP POLICY IF EXISTS "Public can read" ON public.clubs;
DROP POLICY IF EXISTS "Master Admin can modify" ON public.clubs;

DROP POLICY IF EXISTS "Public can read" ON public.contacts;
DROP POLICY IF EXISTS "Master Admin can modify" ON public.contacts;

DROP POLICY IF EXISTS "Public can read" ON public.helpdesk_contacts;
DROP POLICY IF EXISTS "Master Admin can modify" ON public.helpdesk_contacts;

DROP POLICY IF EXISTS "Public can read" ON public.turfs;
DROP POLICY IF EXISTS "Master Admin can modify" ON public.turfs;


-- 2. CREATE CONSOLIDATED AND OPTIMIZED POLICIES WITH (SELECT auth.jwt()) or (SELECT auth.uid()) or (SELECT auth.email())

-- announcements
CREATE POLICY "Public read announcements" ON public.announcements FOR SELECT TO public USING (true);
CREATE POLICY "Modify announcements" ON public.announcements FOR ALL TO authenticated 
  USING (((select auth.jwt()) ->> 'email'::text) = ANY (ARRAY['navajith1122@gmail.com'::text, 'mhdrashidkp3@gmail.com'::text, 'mohamedfamjas@gmail.com'::text]))
  WITH CHECK (((select auth.jwt()) ->> 'email'::text) = ANY (ARRAY['navajith1122@gmail.com'::text, 'mhdrashidkp3@gmail.com'::text, 'mohamedfamjas@gmail.com'::text]));

-- master_admins
CREATE POLICY "Read master_admins" ON public.master_admins FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage master_admins" ON public.master_admins FOR ALL TO authenticated 
  USING (((select auth.jwt()) ->> 'email'::text) = 'navajith1122@gmail.com'::text)
  WITH CHECK (((select auth.jwt()) ->> 'email'::text) = 'navajith1122@gmail.com'::text);

-- department_admins
CREATE POLICY "Read department_admins" ON public.department_admins FOR SELECT TO public USING (true);
CREATE POLICY "Manage department_admins" ON public.department_admins FOR ALL TO authenticated 
  USING ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)))
  WITH CHECK ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)));

-- join_requests
CREATE POLICY "Insert join_requests" ON public.join_requests FOR INSERT TO public 
  WITH CHECK ((name IS NOT NULL) AND (phone IS NOT NULL) AND (blood_group IS NOT NULL));
CREATE POLICY "Read join_requests" ON public.join_requests FOR SELECT TO authenticated 
  USING ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)));

-- academic_resources
CREATE POLICY "Read academic_resources" ON public.academic_resources FOR SELECT TO public USING (true);
CREATE POLICY "Insert academic_resources" ON public.academic_resources FOR INSERT TO authenticated 
  WITH CHECK (
    ((select auth.email()) = added_by) OR 
    (((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins))
  );
CREATE POLICY "Delete academic_resources" ON public.academic_resources FOR DELETE TO authenticated 
  USING (
    ((select auth.email()) = added_by) OR 
    (((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins))
  );

-- complaints
CREATE POLICY "Select complaints" ON public.complaints FOR SELECT TO authenticated 
  USING (
    (((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)) OR 
    (((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM department_admins)) OR 
    (((select auth.jwt()) ->> 'email'::text) = student_email) OR 
    ((select auth.uid()) = user_id)
  );
CREATE POLICY "Insert complaints" ON public.complaints FOR INSERT TO authenticated 
  WITH CHECK (
    (((select auth.jwt()) ->> 'email'::text) = student_email) OR 
    (((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins))
  );
CREATE POLICY "Update complaints" ON public.complaints FOR UPDATE TO authenticated 
  USING (
    (((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)) OR 
    (((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM department_admins))
  )
  WITH CHECK (
    (((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)) OR 
    (((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM department_admins))
  );
CREATE POLICY "Delete complaints" ON public.complaints FOR DELETE TO authenticated 
  USING (
    (((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)) OR 
    ((student_email = ((select auth.jwt()) ->> 'email'::text)) AND (created_at > (now() - '01:00:00'::interval)))
  );

-- Standard tables (events, boys_pgs, girls_pgs, hostels, food_spots, restaurants, amenities, clubs, contacts, helpdesk_contacts, turfs)
CREATE POLICY "Read events" ON public.events FOR SELECT TO public USING (true);
CREATE POLICY "Modify events" ON public.events FOR ALL TO authenticated 
  USING ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)))
  WITH CHECK ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)));

CREATE POLICY "Read boys_pgs" ON public.boys_pgs FOR SELECT TO public USING (true);
CREATE POLICY "Modify boys_pgs" ON public.boys_pgs FOR ALL TO authenticated 
  USING ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)))
  WITH CHECK ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)));

CREATE POLICY "Read girls_pgs" ON public.girls_pgs FOR SELECT TO public USING (true);
CREATE POLICY "Modify girls_pgs" ON public.girls_pgs FOR ALL TO authenticated 
  USING ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)))
  WITH CHECK ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)));

CREATE POLICY "Read hostels" ON public.hostels FOR SELECT TO public USING (true);
CREATE POLICY "Modify hostels" ON public.hostels FOR ALL TO authenticated 
  USING ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)))
  WITH CHECK ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)));

CREATE POLICY "Read food_spots" ON public.food_spots FOR SELECT TO public USING (true);
CREATE POLICY "Modify food_spots" ON public.food_spots FOR ALL TO authenticated 
  USING ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)))
  WITH CHECK ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)));

CREATE POLICY "Read restaurants" ON public.restaurants FOR SELECT TO public USING (true);
CREATE POLICY "Modify restaurants" ON public.restaurants FOR ALL TO authenticated 
  USING ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)))
  WITH CHECK ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)));

CREATE POLICY "Read amenities" ON public.amenities FOR SELECT TO public USING (true);
CREATE POLICY "Modify amenities" ON public.amenities FOR ALL TO authenticated 
  USING ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)))
  WITH CHECK ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)));

CREATE POLICY "Read clubs" ON public.clubs FOR SELECT TO public USING (true);
CREATE POLICY "Modify clubs" ON public.clubs FOR ALL TO authenticated 
  USING ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)))
  WITH CHECK ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)));

CREATE POLICY "Read contacts" ON public.contacts FOR SELECT TO public USING (true);
CREATE POLICY "Modify contacts" ON public.contacts FOR ALL TO authenticated 
  USING ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)))
  WITH CHECK ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)));

CREATE POLICY "Read helpdesk_contacts" ON public.helpdesk_contacts FOR SELECT TO public USING (true);
CREATE POLICY "Modify helpdesk_contacts" ON public.helpdesk_contacts FOR ALL TO authenticated 
  USING ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)))
  WITH CHECK ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)));

CREATE POLICY "Read turfs" ON public.turfs FOR SELECT TO public USING (true);
CREATE POLICY "Modify turfs" ON public.turfs FOR ALL TO authenticated 
  USING ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)))
  WITH CHECK ((((select auth.jwt()) ->> 'email'::text) IN (SELECT email FROM master_admins)));
