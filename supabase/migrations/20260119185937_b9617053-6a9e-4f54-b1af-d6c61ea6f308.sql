-- Drop existing permissive policies
DROP POLICY IF EXISTS "Allow all access to clients" ON public.clients;
DROP POLICY IF EXISTS "Allow all access to simulations" ON public.simulations;
DROP POLICY IF EXISTS "Allow all access to timeline_notes" ON public.timeline_notes;
DROP POLICY IF EXISTS "Allow all access to app_settings" ON public.app_settings;

-- Create secure RLS policies requiring authentication for clients
CREATE POLICY "Authenticated users can view clients"
ON public.clients FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert clients"
ON public.clients FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update clients"
ON public.clients FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete clients"
ON public.clients FOR DELETE
TO authenticated
USING (true);

-- Create secure RLS policies requiring authentication for simulations
CREATE POLICY "Authenticated users can view simulations"
ON public.simulations FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert simulations"
ON public.simulations FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update simulations"
ON public.simulations FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete simulations"
ON public.simulations FOR DELETE
TO authenticated
USING (true);

-- Create secure RLS policies requiring authentication for timeline_notes
CREATE POLICY "Authenticated users can view timeline_notes"
ON public.timeline_notes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert timeline_notes"
ON public.timeline_notes FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update timeline_notes"
ON public.timeline_notes FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete timeline_notes"
ON public.timeline_notes FOR DELETE
TO authenticated
USING (true);

-- Create secure RLS policies requiring authentication for app_settings
CREATE POLICY "Authenticated users can view app_settings"
ON public.app_settings FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert app_settings"
ON public.app_settings FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update app_settings"
ON public.app_settings FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete app_settings"
ON public.app_settings FOR DELETE
TO authenticated
USING (true);