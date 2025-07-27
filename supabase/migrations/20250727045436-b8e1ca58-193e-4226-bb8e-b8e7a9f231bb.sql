-- Create a function to automatically send welcome emails when users sign up
CREATE OR REPLACE FUNCTION public.send_welcome_email()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  function_url text;
BEGIN
  -- Get the function URL - replace with your actual project URL
  function_url := 'https://uqrvfaapujzrkkpjncml.supabase.co/functions/v1/send-welcome-email';
  
  -- Make async HTTP request to send welcome email
  PERFORM net.http_post(
    url := function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.jwt_secret', true)
    ),
    body := jsonb_build_object(
      'email', NEW.email,
      'name', COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    )::text
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't prevent user registration
    RAISE LOG 'Failed to send welcome email for user %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger to automatically send welcome email on user registration
CREATE TRIGGER on_auth_user_created_send_welcome_email
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.send_welcome_email();