
-- Create admin user Johnson
DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'monteguedes65@gmail.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', new_user_id, 'authenticated', 'authenticated',
      'monteguedes65@gmail.com', crypt('App2026!', gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}'::jsonb,
      '{"name":"Johnson","role":"advogado"}'::jsonb,
      now(), now(), '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), new_user_id,
      jsonb_build_object('sub', new_user_id::text, 'email', 'monteguedes65@gmail.com', 'email_verified', true),
      'email', new_user_id::text, now(), now(), now());
    INSERT INTO public.profiles (id, name, email, avatar_label)
      VALUES (new_user_id, 'Johnson', 'monteguedes65@gmail.com', 'JO')
      ON CONFLICT (id) DO NOTHING;
    INSERT INTO public.user_roles (user_id, role) VALUES (new_user_id, 'advogado')
      ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;
