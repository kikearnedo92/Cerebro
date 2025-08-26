-- Calendar events and participants tables
-- 1) Create calendar_events table
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) Create calendar_event_participants table
CREATE TABLE IF NOT EXISTS public.calendar_event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.calendar_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'invited', -- invited | accepted | declined | tentative
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3) Enable Row Level Security
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_event_participants ENABLE ROW LEVEL SECURITY;

-- 4) Policies for calendar_events
-- View: organizer or participant can view
CREATE POLICY IF NOT EXISTS "events_view_organizer_or_participant"
ON public.calendar_events
FOR SELECT
TO authenticated
USING (
  organizer_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.calendar_event_participants p
    WHERE p.event_id = calendar_events.id AND p.user_id = auth.uid()
  )
);

-- Insert: only as organizer (self)
CREATE POLICY IF NOT EXISTS "events_insert_as_organizer"
ON public.calendar_events
FOR INSERT
TO authenticated
WITH CHECK ( organizer_id = auth.uid() );

-- Update/Delete: only organizer
CREATE POLICY IF NOT EXISTS "events_update_delete_organizer"
ON public.calendar_events
FOR UPDATE
TO authenticated
USING ( organizer_id = auth.uid() )
WITH CHECK ( organizer_id = auth.uid() );

CREATE POLICY IF NOT EXISTS "events_delete_organizer"
ON public.calendar_events
FOR DELETE
TO authenticated
USING ( organizer_id = auth.uid() );

-- 5) Policies for calendar_event_participants
-- View: participant, organizer of event
CREATE POLICY IF NOT EXISTS "participants_view_participant_or_organizer"
ON public.calendar_event_participants
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.calendar_events e
    WHERE e.id = calendar_event_participants.event_id AND e.organizer_id = auth.uid()
  )
);

-- Insert: only organizer of the event can add participants
CREATE POLICY IF NOT EXISTS "participants_insert_by_organizer"
ON public.calendar_event_participants
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.calendar_events e
    WHERE e.id = calendar_event_participants.event_id AND e.organizer_id = auth.uid()
  )
);

-- Update/Delete: only organizer can modify participants
CREATE POLICY IF NOT EXISTS "participants_update_by_organizer"
ON public.calendar_event_participants
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.calendar_events e
    WHERE e.id = calendar_event_participants.event_id AND e.organizer_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.calendar_events e
    WHERE e.id = calendar_event_participants.event_id AND e.organizer_id = auth.uid()
  )
);

CREATE POLICY IF NOT EXISTS "participants_delete_by_organizer"
ON public.calendar_event_participants
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.calendar_events e
    WHERE e.id = calendar_event_participants.event_id AND e.organizer_id = auth.uid()
  )
);

-- 6) Trigger to auto-update updated_at on events
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_calendar_events_updated_at ON public.calendar_events;
CREATE TRIGGER trg_update_calendar_events_updated_at
BEFORE UPDATE ON public.calendar_events
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7) Helpful indexes
CREATE INDEX IF NOT EXISTS idx_calendar_events_organizer_start ON public.calendar_events (organizer_id, start_at);
CREATE INDEX IF NOT EXISTS idx_calendar_event_participants_user ON public.calendar_event_participants (user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_event_participants_event ON public.calendar_event_participants (event_id);