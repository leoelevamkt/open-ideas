-- Create test admin (advogado) and test client (cliente) users
DO $$
DECLARE
  admin_id uuid := gen_random_uuid();
  client_id uuid := gen_random_uuid();
  encrypted_pw text := crypt('Teste@123', gen_salt('bf'));
BEGIN
  -- Admin user
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', admin_id, 'authenticated', 'authenticated',
    'admin@teste.com', encrypted_pw, now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('name','Admin Teste','role','advogado'),
    now(), now(), '', '', '', ''
  );
  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (gen_random_uuid(), admin_id, jsonb_build_object('sub', admin_id::text, 'email','admin@teste.com'), 'email', admin_id::text, now(), now(), now());

  -- Client user
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', client_id, 'authenticated', 'authenticated',
    'cliente@teste.com', encrypted_pw, now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('name','Cliente Teste','role','cliente'),
    now(), now(), '', '', '', ''
  );
  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (gen_random_uuid(), client_id, jsonb_build_object('sub', client_id::text, 'email','cliente@teste.com'), 'email', client_id::text, now(), now(), now());
END $$;