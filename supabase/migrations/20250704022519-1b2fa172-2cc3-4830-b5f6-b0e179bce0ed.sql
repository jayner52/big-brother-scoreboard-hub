-- Fix current_game_week table - ensure there's always exactly one row
INSERT INTO public.current_game_week (week_number) 
SELECT 1 
WHERE NOT EXISTS (SELECT 1 FROM public.current_game_week);

-- Update the function to use proper WHERE clause
CREATE OR REPLACE FUNCTION public.update_current_game_week(new_week_number integer)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Update the single row if it exists
  UPDATE public.current_game_week 
  SET week_number = new_week_number, updated_at = now();
  
  -- If no row exists, insert one
  IF NOT FOUND THEN
    INSERT INTO public.current_game_week (week_number) VALUES (new_week_number);
  END IF;
END;
$function$