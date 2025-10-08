-- Add last_retainer_generation column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projects' 
    AND column_name = 'last_retainer_generation'
  ) THEN
    ALTER TABLE public.projects ADD COLUMN last_retainer_generation timestamp with time zone;
  END IF;
END $$;

-- Create function to duplicate retainer projects monthly
CREATE OR REPLACE FUNCTION public.generate_monthly_retainers()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert new project instances for retainer projects that need generation
  INSERT INTO public.projects (
    user_id,
    name,
    client_name,
    description,
    price,
    deadline,
    work_status,
    payment_status,
    priority,
    is_retainer,
    last_retainer_generation,
    is_archived
  )
  SELECT
    user_id,
    name,
    client_name,
    description,
    price,
    NULL, -- No deadline for retainer instances
    'in_progress',
    'unpaid',
    priority,
    false, -- The generated instance is not a retainer template
    NULL,
    false
  FROM public.projects
  WHERE is_retainer = true
    AND is_archived = false
    AND (
      last_retainer_generation IS NULL
      OR last_retainer_generation < date_trunc('month', CURRENT_DATE)
    );

  -- Update last_retainer_generation for processed retainers
  UPDATE public.projects
  SET last_retainer_generation = CURRENT_TIMESTAMP
  WHERE is_retainer = true
    AND is_archived = false
    AND (
      last_retainer_generation IS NULL
      OR last_retainer_generation < date_trunc('month', CURRENT_DATE)
    );
END;
$$;