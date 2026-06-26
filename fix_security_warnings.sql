-- 1. FIX ANNOUNCEMENTS RLS POLICIES
-- Drop existing insecure admin policies on announcements
DROP POLICY IF EXISTS "Allow admin delete access" ON public.announcements;
DROP POLICY IF EXISTS "Allow admin insert access" ON public.announcements;
DROP POLICY IF EXISTS "Allow admin update access" ON public.announcements;

-- Re-create policies with secure admin email checks
CREATE POLICY "Allow admin insert access" 
    ON public.announcements
    FOR INSERT 
    TO authenticated
    WITH CHECK ( (auth.jwt() ->> 'email') IN ('navajith1122@gmail.com', 'mhdrashidkp3@gmail.com', 'mohamedfamjas@gmail.com') );

CREATE POLICY "Allow admin update access" 
    ON public.announcements
    FOR UPDATE 
    TO authenticated
    USING ( (auth.jwt() ->> 'email') IN ('navajith1122@gmail.com', 'mhdrashidkp3@gmail.com', 'mohamedfamjas@gmail.com') )
    WITH CHECK ( (auth.jwt() ->> 'email') IN ('navajith1122@gmail.com', 'mhdrashidkp3@gmail.com', 'mohamedfamjas@gmail.com') );

CREATE POLICY "Allow admin delete access" 
    ON public.announcements
    FOR DELETE 
    TO authenticated
    USING ( (auth.jwt() ->> 'email') IN ('navajith1122@gmail.com', 'mhdrashidkp3@gmail.com', 'mohamedfamjas@gmail.com') );


-- 2. FIX COMPLAINTS RLS POLICIES
-- Drop the insecure "Students can insert complaints" (WITH CHECK (true)) policy.
-- Note: The secure policy "Students can insert their own complaints" which checks the auth.jwt email will remain active.
DROP POLICY IF EXISTS "Students can insert complaints" ON public.complaints;


-- 3. FIX JOIN REQUESTS RLS POLICIES
-- Drop the permissive public insert policy
DROP POLICY IF EXISTS "Allow public inserts into join_requests" ON public.join_requests;

-- Re-create the public insert policy with a secure validation check instead of WITH CHECK (true)
CREATE POLICY "Allow public inserts into join_requests"
    ON public.join_requests
    FOR INSERT
    TO public
    WITH CHECK ( name IS NOT NULL AND phone IS NOT NULL AND blood_group IS NOT NULL );
