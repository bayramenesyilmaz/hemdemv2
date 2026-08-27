-- Demo/seed veri: mock modda görülen 13 profil, 8 uyum testi, cevaplar,
-- gönderiler, sohbetler ve bildirimleri gerçek Supabase projesine yazar.
-- apps/web/scripts/generate-seed-sql.mjs tarafından üretildi — elle
-- düzenleme yapma, script'i tekrar çalıştır.
--
-- ÖNEMLİ: auth.users / auth.identities'e doğrudan INSERT, Supabase'in
-- resmi desteklediği bir yol DEĞİL (community'de yaygın kullanılan bir
-- teknik). Eğer bu migration'ı çalıştırdıktan sonra demo hesaplarla
-- giriş yapamıyorsan ("Invalid login credentials" hatası), auth şeman
-- bu satırların varsaydığı kolonlardan farklı demektir — bu durumda
-- apps/web/scripts/seed-supabase-demo.mjs'i kullan (resmi Admin API,
-- her Supabase sürümünde çalışır).
--
-- Tekrar çalıştırılabilir (idempotent): var olan demo hesapları/
-- verileri siler, aynı sabit id'lerle yeniden oluşturur.

do $$
declare
  v_password_hash text;
begin

  -- 1) Demo kullanıcıları (auth.users + auth.identities) ------------------
  -- Önce varsa temizle (cascade ile profiles ve bağlı her şeyi de siler).
  delete from auth.users where id in ('965d3fd5-7508-4429-b5b2-bce645250be3', 'b316370e-f9a8-4800-8846-5f415d3312ad', '8d801ac3-1c86-405a-8046-8081f2c1e833', 'be5a9181-da89-4c3c-8a26-94ce79e9744d', '971eeed2-8cfa-42d8-b63e-fbf13b1dea88', '8f30f3b0-8d91-4b0d-8fb3-62ac25994d9f', 'c55b52c4-c42c-409d-b353-c0988e345962', 'e6165c0e-bf04-4315-850d-7408efbb75ce', 'e3fc19e5-cbd7-4988-b12e-70c8f19af19d', 'dfa7573e-5f47-408b-aab7-35b17ca6a2f6', '63bb3dd6-adbe-499f-b0a2-aa40184feee6', '6ab7be15-91b6-4190-b007-5860cd52520e', '94b449aa-de3b-4224-aa5f-503b6bb25d9c');

  v_password_hash := crypt('demo1234', gen_salt('bf'));
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
  ) values (
    '00000000-0000-0000-0000-000000000000', '965d3fd5-7508-4429-b5b2-bce645250be3', 'authenticated', 'authenticated',
    'demo@hemdem.test', v_password_hash,
    now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
    now(), now(), '', '', '', ''
  );
  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (
    gen_random_uuid(), '965d3fd5-7508-4429-b5b2-bce645250be3', '965d3fd5-7508-4429-b5b2-bce645250be3',
    format('{"sub":"%s","email":"%s"}', '965d3fd5-7508-4429-b5b2-bce645250be3', 'demo@hemdem.test')::jsonb,
    'email', now(), now(), now()
  );

  v_password_hash := crypt('Demo1234!', gen_salt('bf'));
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
  ) values (
    '00000000-0000-0000-0000-000000000000', 'b316370e-f9a8-4800-8846-5f415d3312ad', 'authenticated', 'authenticated',
    'mert-kaya@demo.hemdem.test', v_password_hash,
    now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
    now(), now(), '', '', '', ''
  );
  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (
    gen_random_uuid(), 'b316370e-f9a8-4800-8846-5f415d3312ad', 'b316370e-f9a8-4800-8846-5f415d3312ad',
    format('{"sub":"%s","email":"%s"}', 'b316370e-f9a8-4800-8846-5f415d3312ad', 'mert-kaya@demo.hemdem.test')::jsonb,
    'email', now(), now(), now()
  );

  v_password_hash := crypt('Demo1234!', gen_salt('bf'));
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
  ) values (
    '00000000-0000-0000-0000-000000000000', '8d801ac3-1c86-405a-8046-8081f2c1e833', 'authenticated', 'authenticated',
    'zeynep-demir@demo.hemdem.test', v_password_hash,
    now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
    now(), now(), '', '', '', ''
  );
  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (
    gen_random_uuid(), '8d801ac3-1c86-405a-8046-8081f2c1e833', '8d801ac3-1c86-405a-8046-8081f2c1e833',
    format('{"sub":"%s","email":"%s"}', '8d801ac3-1c86-405a-8046-8081f2c1e833', 'zeynep-demir@demo.hemdem.test')::jsonb,
    'email', now(), now(), now()
  );

  v_password_hash := crypt('Demo1234!', gen_salt('bf'));
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
  ) values (
    '00000000-0000-0000-0000-000000000000', 'be5a9181-da89-4c3c-8a26-94ce79e9744d', 'authenticated', 'authenticated',
    'can-ozturk@demo.hemdem.test', v_password_hash,
    now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
    now(), now(), '', '', '', ''
  );
  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (
    gen_random_uuid(), 'be5a9181-da89-4c3c-8a26-94ce79e9744d', 'be5a9181-da89-4c3c-8a26-94ce79e9744d',
    format('{"sub":"%s","email":"%s"}', 'be5a9181-da89-4c3c-8a26-94ce79e9744d', 'can-ozturk@demo.hemdem.test')::jsonb,
    'email', now(), now(), now()
  );

  v_password_hash := crypt('Demo1234!', gen_salt('bf'));
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
  ) values (
    '00000000-0000-0000-0000-000000000000', '971eeed2-8cfa-42d8-b63e-fbf13b1dea88', 'authenticated', 'authenticated',
    'elif-sahin@demo.hemdem.test', v_password_hash,
    now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
    now(), now(), '', '', '', ''
  );
  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (
    gen_random_uuid(), '971eeed2-8cfa-42d8-b63e-fbf13b1dea88', '971eeed2-8cfa-42d8-b63e-fbf13b1dea88',
    format('{"sub":"%s","email":"%s"}', '971eeed2-8cfa-42d8-b63e-fbf13b1dea88', 'elif-sahin@demo.hemdem.test')::jsonb,
    'email', now(), now(), now()
  );

  v_password_hash := crypt('Demo1234!', gen_salt('bf'));
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
  ) values (
    '00000000-0000-0000-0000-000000000000', '8f30f3b0-8d91-4b0d-8fb3-62ac25994d9f', 'authenticated', 'authenticated',
    'deniz-arslan@demo.hemdem.test', v_password_hash,
    now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
    now(), now(), '', '', '', ''
  );
  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (
    gen_random_uuid(), '8f30f3b0-8d91-4b0d-8fb3-62ac25994d9f', '8f30f3b0-8d91-4b0d-8fb3-62ac25994d9f',
    format('{"sub":"%s","email":"%s"}', '8f30f3b0-8d91-4b0d-8fb3-62ac25994d9f', 'deniz-arslan@demo.hemdem.test')::jsonb,
    'email', now(), now(), now()
  );

  v_password_hash := crypt('Demo1234!', gen_salt('bf'));
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
  ) values (
    '00000000-0000-0000-0000-000000000000', 'c55b52c4-c42c-409d-b353-c0988e345962', 'authenticated', 'authenticated',
    'ece-yilmaz@demo.hemdem.test', v_password_hash,
    now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
    now(), now(), '', '', '', ''
  );
  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (
    gen_random_uuid(), 'c55b52c4-c42c-409d-b353-c0988e345962', 'c55b52c4-c42c-409d-b353-c0988e345962',
    format('{"sub":"%s","email":"%s"}', 'c55b52c4-c42c-409d-b353-c0988e345962', 'ece-yilmaz@demo.hemdem.test')::jsonb,
    'email', now(), now(), now()
  );

  v_password_hash := crypt('Demo1234!', gen_salt('bf'));
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
  ) values (
    '00000000-0000-0000-0000-000000000000', 'e6165c0e-bf04-4315-850d-7408efbb75ce', 'authenticated', 'authenticated',
    'burak-dogan@demo.hemdem.test', v_password_hash,
    now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
    now(), now(), '', '', '', ''
  );
  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (
    gen_random_uuid(), 'e6165c0e-bf04-4315-850d-7408efbb75ce', 'e6165c0e-bf04-4315-850d-7408efbb75ce',
    format('{"sub":"%s","email":"%s"}', 'e6165c0e-bf04-4315-850d-7408efbb75ce', 'burak-dogan@demo.hemdem.test')::jsonb,
    'email', now(), now(), now()
  );

  v_password_hash := crypt('Demo1234!', gen_salt('bf'));
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
  ) values (
    '00000000-0000-0000-0000-000000000000', 'e3fc19e5-cbd7-4988-b12e-70c8f19af19d', 'authenticated', 'authenticated',
    'selin-aydin@demo.hemdem.test', v_password_hash,
    now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
    now(), now(), '', '', '', ''
  );
  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (
    gen_random_uuid(), 'e3fc19e5-cbd7-4988-b12e-70c8f19af19d', 'e3fc19e5-cbd7-4988-b12e-70c8f19af19d',
    format('{"sub":"%s","email":"%s"}', 'e3fc19e5-cbd7-4988-b12e-70c8f19af19d', 'selin-aydin@demo.hemdem.test')::jsonb,
    'email', now(), now(), now()
  );

  v_password_hash := crypt('Demo1234!', gen_salt('bf'));
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
  ) values (
    '00000000-0000-0000-0000-000000000000', 'dfa7573e-5f47-408b-aab7-35b17ca6a2f6', 'authenticated', 'authenticated',
    'kaan-erdem@demo.hemdem.test', v_password_hash,
    now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
    now(), now(), '', '', '', ''
  );
  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (
    gen_random_uuid(), 'dfa7573e-5f47-408b-aab7-35b17ca6a2f6', 'dfa7573e-5f47-408b-aab7-35b17ca6a2f6',
    format('{"sub":"%s","email":"%s"}', 'dfa7573e-5f47-408b-aab7-35b17ca6a2f6', 'kaan-erdem@demo.hemdem.test')::jsonb,
    'email', now(), now(), now()
  );

  v_password_hash := crypt('Demo1234!', gen_salt('bf'));
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
  ) values (
    '00000000-0000-0000-0000-000000000000', '63bb3dd6-adbe-499f-b0a2-aa40184feee6', 'authenticated', 'authenticated',
    'melis-koc@demo.hemdem.test', v_password_hash,
    now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
    now(), now(), '', '', '', ''
  );
  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (
    gen_random_uuid(), '63bb3dd6-adbe-499f-b0a2-aa40184feee6', '63bb3dd6-adbe-499f-b0a2-aa40184feee6',
    format('{"sub":"%s","email":"%s"}', '63bb3dd6-adbe-499f-b0a2-aa40184feee6', 'melis-koc@demo.hemdem.test')::jsonb,
    'email', now(), now(), now()
  );

  v_password_hash := crypt('Demo1234!', gen_salt('bf'));
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
  ) values (
    '00000000-0000-0000-0000-000000000000', '6ab7be15-91b6-4190-b007-5860cd52520e', 'authenticated', 'authenticated',
    'emre-tunc@demo.hemdem.test', v_password_hash,
    now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
    now(), now(), '', '', '', ''
  );
  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (
    gen_random_uuid(), '6ab7be15-91b6-4190-b007-5860cd52520e', '6ab7be15-91b6-4190-b007-5860cd52520e',
    format('{"sub":"%s","email":"%s"}', '6ab7be15-91b6-4190-b007-5860cd52520e', 'emre-tunc@demo.hemdem.test')::jsonb,
    'email', now(), now(), now()
  );

  v_password_hash := crypt('admin1234', gen_salt('bf'));
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
  ) values (
    '00000000-0000-0000-0000-000000000000', '94b449aa-de3b-4224-aa5f-503b6bb25d9c', 'authenticated', 'authenticated',
    'admin@hemdem.test', v_password_hash,
    now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
    now(), now(), '', '', '', ''
  );
  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (
    gen_random_uuid(), '94b449aa-de3b-4224-aa5f-503b6bb25d9c', '94b449aa-de3b-4224-aa5f-503b6bb25d9c',
    format('{"sub":"%s","email":"%s"}', '94b449aa-de3b-4224-aa5f-503b6bb25d9c', 'admin@hemdem.test')::jsonb,
    'email', now(), now(), now()
  );

end $$;

-- 2) Profiller ------------------------------------------------------------
insert into public.profiles (id, created_at, name, avatar_url, bio, gender, country, interested_in, birthdate, language, role, is_banned, gate_test_threshold, allow_guest_likes, social_links)
values
  ('965d3fd5-7508-4429-b5b2-bce645250be3', '2026-06-28T10:55:09.479Z', 'Aslı Yıldız', 'data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20128%20128%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%221%22%20y2%3D%221%22%3E%3Cstop%20offset%3D%220%22%20stop-color%3D%22%23e11d48%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%237c3aed%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22128%22%20height%3D%22128%22%20fill%3D%22url(%23g)%22%2F%3E%3Ctext%20x%3D%2264%22%20y%3D%2264%22%20font-family%3D%22system-ui%2Csans-serif%22%20font-size%3D%2250%22%20font-weight%3D%22700%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%3EAY%3C%2Ftext%3E%3C%2Fsvg%3E', 'Kitap okumayı, doğa yürüyüşlerini ve gece biten dizi maratonlarını severim.', 'female', 'TR', 'male', '1998-05-12', 'tr', 'user', false, 50, true, '{"instagram":"https://instagram.com/asliyildiz"}'::jsonb),
  ('b316370e-f9a8-4800-8846-5f415d3312ad', '2026-06-28T10:55:09.480Z', 'Mert Kaya', 'data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20128%20128%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%221%22%20y2%3D%221%22%3E%3Cstop%20offset%3D%220%22%20stop-color%3D%22%230ea5e9%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%231e293b%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22128%22%20height%3D%22128%22%20fill%3D%22url(%23g)%22%2F%3E%3Ctext%20x%3D%2264%22%20y%3D%2264%22%20font-family%3D%22system-ui%2Csans-serif%22%20font-size%3D%2250%22%20font-weight%3D%22700%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%3EMK%3C%2Ftext%3E%3C%2Fsvg%3E', 'Hafta sonları dağcılık, hafta içi yazılım. Bilim kurgu bağımlısı.', 'male', 'TR', 'female', '1996-02-20', 'tr', 'user', false, null, false, '{}'::jsonb),
  ('8d801ac3-1c86-405a-8046-8081f2c1e833', '2026-06-28T10:55:09.480Z', 'Zeynep Demir', 'data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20128%20128%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%221%22%20y2%3D%221%22%3E%3Cstop%20offset%3D%220%22%20stop-color%3D%22%23f59e0b%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23be123c%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22128%22%20height%3D%22128%22%20fill%3D%22url(%23g)%22%2F%3E%3Ctext%20x%3D%2264%22%20y%3D%2264%22%20font-family%3D%22system-ui%2Csans-serif%22%20font-size%3D%2250%22%20font-weight%3D%22700%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%3EZD%3C%2Ftext%3E%3C%2Fsvg%3E', 'Berlin''de yaşıyorum. Polisiye kitaplar ve uzun tren yolculukları.', 'female', 'DE', 'both', '1994-11-03', 'tr', 'user', false, null, true, '{}'::jsonb),
  ('be5a9181-da89-4c3c-8a26-94ce79e9744d', '2026-06-28T10:55:09.480Z', 'Can Öztürk', 'data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20128%20128%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%221%22%20y2%3D%221%22%3E%3Cstop%20offset%3D%220%22%20stop-color%3D%22%2310b981%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23065f46%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22128%22%20height%3D%22128%22%20fill%3D%22url(%23g)%22%2F%3E%3Ctext%20x%3D%2264%22%20y%3D%2264%22%20font-family%3D%22system-ui%2Csans-serif%22%20font-size%3D%2250%22%20font-weight%3D%22700%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%3EC%C3%96%3C%2Ftext%3E%3C%2Fsvg%3E', 'Kedi babası, amatör aşçı, sinema kulübü müdavimi.', 'male', 'TR', 'female', '1999-07-08', 'tr', 'user', false, null, false, '{}'::jsonb),
  ('971eeed2-8cfa-42d8-b63e-fbf13b1dea88', '2026-06-28T10:55:09.480Z', 'Elif Şahin', 'data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20128%20128%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%221%22%20y2%3D%221%22%3E%3Cstop%20offset%3D%220%22%20stop-color%3D%22%238b5cf6%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23312e81%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22128%22%20height%3D%22128%22%20fill%3D%22url(%23g)%22%2F%3E%3Ctext%20x%3D%2264%22%20y%3D%2264%22%20font-family%3D%22system-ui%2Csans-serif%22%20font-size%3D%2250%22%20font-weight%3D%22700%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%3EE%C5%9E%3C%2Ftext%3E%3C%2Fsvg%3E', 'Architecture student in New York. Coffee, jazz and long walks.', 'female', 'US', 'male', '1997-09-30', 'en', 'user', false, null, false, '{}'::jsonb),
  ('8f30f3b0-8d91-4b0d-8fb3-62ac25994d9f', '2026-06-28T10:55:09.480Z', 'Deniz Arslan', 'data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20128%20128%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%221%22%20y2%3D%221%22%3E%3Cstop%20offset%3D%220%22%20stop-color%3D%22%23ef4444%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%237f1d1d%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22128%22%20height%3D%22128%22%20fill%3D%22url(%23g)%22%2F%3E%3Ctext%20x%3D%2264%22%20y%3D%2264%22%20font-family%3D%22system-ui%2Csans-serif%22%20font-size%3D%2250%22%20font-weight%3D%22700%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%3EDA%3C%2Ftext%3E%3C%2Fsvg%3E', 'Fotoğraf çekerim, plak toplarım. En sevdiğim tür: belgesel.', 'male', 'TR', 'female', '1995-03-17', 'tr', 'user', false, null, false, '{}'::jsonb),
  ('c55b52c4-c42c-409d-b353-c0988e345962', '2026-06-28T10:55:09.480Z', 'Ece Yılmaz', 'data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20128%20128%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%221%22%20y2%3D%221%22%3E%3Cstop%20offset%3D%220%22%20stop-color%3D%22%23ec4899%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23831843%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22128%22%20height%3D%22128%22%20fill%3D%22url(%23g)%22%2F%3E%3Ctext%20x%3D%2264%22%20y%3D%2264%22%20font-family%3D%22system-ui%2Csans-serif%22%20font-size%3D%2250%22%20font-weight%3D%22700%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%3EEY%3C%2Ftext%3E%3C%2Fsvg%3E', 'Psikoloji öğrencisi. Distopya romanları ve uzun sohbetler.', 'female', 'TR', 'male', '2000-01-25', 'tr', 'user', false, null, true, '{}'::jsonb),
  ('e6165c0e-bf04-4315-850d-7408efbb75ce', '2026-06-28T10:55:09.480Z', 'Burak Doğan', 'data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20128%20128%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%221%22%20y2%3D%221%22%3E%3Cstop%20offset%3D%220%22%20stop-color%3D%22%2314b8a6%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23134e4a%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22128%22%20height%3D%22128%22%20fill%3D%22url(%23g)%22%2F%3E%3Ctext%20x%3D%2264%22%20y%3D%2264%22%20font-family%3D%22system-ui%2Csans-serif%22%20font-size%3D%2250%22%20font-weight%3D%22700%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%3EBD%3C%2Ftext%3E%3C%2Fsvg%3E', 'Koşu, kahve, tarih podcastleri. Sabah insanıyım.', 'male', 'TR', 'female', '1993-06-11', 'tr', 'user', false, null, false, '{}'::jsonb),
  ('e3fc19e5-cbd7-4988-b12e-70c8f19af19d', '2026-06-28T10:55:09.480Z', 'Selin Aydın', 'data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20128%20128%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%221%22%20y2%3D%221%22%3E%3Cstop%20offset%3D%220%22%20stop-color%3D%22%23f97316%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%237c2d12%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22128%22%20height%3D%22128%22%20fill%3D%22url(%23g)%22%2F%3E%3Ctext%20x%3D%2264%22%20y%3D%2264%22%20font-family%3D%22system-ui%2Csans-serif%22%20font-size%3D%2250%22%20font-weight%3D%22700%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%3ESA%3C%2Ftext%3E%3C%2Fsvg%3E', 'İllüstratör. Ghibli filmleri ve ikinci el kitapçılar.', 'female', 'TR', 'both', '1999-12-02', 'tr', 'user', false, null, false, '{}'::jsonb),
  ('dfa7573e-5f47-408b-aab7-35b17ca6a2f6', '2026-06-28T10:55:09.480Z', 'Kaan Erdem', 'data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20128%20128%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%221%22%20y2%3D%221%22%3E%3Cstop%20offset%3D%220%22%20stop-color%3D%22%233b82f6%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%231e3a8a%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22128%22%20height%3D%22128%22%20fill%3D%22url(%23g)%22%2F%3E%3Ctext%20x%3D%2264%22%20y%3D%2264%22%20font-family%3D%22system-ui%2Csans-serif%22%20font-size%3D%2250%22%20font-weight%3D%22700%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%3EKE%3C%2Ftext%3E%3C%2Fsvg%3E', 'Amsterdam''da veri analisti. Bisiklet ve satranç.', 'male', 'NL', 'female', '1997-04-19', 'tr', 'user', false, null, false, '{}'::jsonb),
  ('63bb3dd6-adbe-499f-b0a2-aa40184feee6', '2026-06-28T10:55:09.480Z', 'Melis Koç', 'data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20128%20128%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%221%22%20y2%3D%221%22%3E%3Cstop%20offset%3D%220%22%20stop-color%3D%22%23a855f7%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%234c1d95%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22128%22%20height%3D%22128%22%20fill%3D%22url(%23g)%22%2F%3E%3Ctext%20x%3D%2264%22%20y%3D%2264%22%20font-family%3D%22system-ui%2Csans-serif%22%20font-size%3D%2250%22%20font-weight%3D%22700%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%3EMKo%3C%2Ftext%3E%3C%2Fsvg%3E', 'Tiyatro oyuncusu. Klasik roman okumaktan ve tartışmaktan keyif alırım.', 'female', 'TR', 'male', '1998-08-23', 'tr', 'user', false, null, false, '{}'::jsonb),
  ('6ab7be15-91b6-4190-b007-5860cd52520e', '2026-06-28T10:55:09.480Z', 'Emre Tunç', 'data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20128%20128%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%221%22%20y2%3D%221%22%3E%3Cstop%20offset%3D%220%22%20stop-color%3D%22%2364748b%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%230f172a%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22128%22%20height%3D%22128%22%20fill%3D%22url(%23g)%22%2F%3E%3Ctext%20x%3D%2264%22%20y%3D%2264%22%20font-family%3D%22system-ui%2Csans-serif%22%20font-size%3D%2250%22%20font-weight%3D%22700%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%3EET%3C%2Ftext%3E%3C%2Fsvg%3E', 'Müzisyen. Gece kuşu, vinil koleksiyoncusu, kahve fanatiği.', 'male', 'TR', 'female', '1994-10-05', 'tr', 'user', false, null, false, '{}'::jsonb),
  ('94b449aa-de3b-4224-aa5f-503b6bb25d9c', '2026-06-28T10:55:09.480Z', 'Hemdem Admin', 'data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20128%20128%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%221%22%20y2%3D%221%22%3E%3Cstop%20offset%3D%220%22%20stop-color%3D%22%23e11d48%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%231a1a1f%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22128%22%20height%3D%22128%22%20fill%3D%22url(%23g)%22%2F%3E%3Ctext%20x%3D%2264%22%20y%3D%2264%22%20font-family%3D%22system-ui%2Csans-serif%22%20font-size%3D%2250%22%20font-weight%3D%22700%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22central%22%3EH%3C%2Ftext%3E%3C%2Fsvg%3E', null, null, 'TR', 'both', null, 'tr', 'admin', false, null, false, '{}'::jsonb);

-- 3) Testler ---------------------------------------------------------------
delete from public.tests where id in ('f04b5b2e-e25f-4f57-bc88-985cccc4c6f6', '1e69d674-2e13-478d-8d78-ae44a2fe63d9', '1c362ce6-a5f8-4662-a5b1-4dc7cbdad871', 'aca84a70-6541-4235-86f0-a555393f67f1', '0361a9b9-bba6-4323-b357-a49e190e9ec9', '934cf10d-7eb3-4494-8a91-20fb5f21c947', '99048ce6-efcb-455b-9594-640e99f56dcc', '0b5e0a2e-7291-450c-87c5-bbf30f5831a9');

insert into public.tests (id, created_at, created_by, title, category_id, language, questions, point, approved, is_deleted)
values ('f04b5b2e-e25f-4f57-bc88-985cccc4c6f6', '2026-07-18T10:55:09.480Z', '965d3fd5-7508-4429-b5b2-bce645250be3', 'Hangi Diziyi İzlersin?', 3, 'tr', '[{"id":"q1","text":"Bir dizi seçerken önceliğin ne?","options":[{"id":"o1","text":"Sürükleyici hikâye"},{"id":"o2","text":"Derin karakterler"},{"id":"o3","text":"Atmosfer ve görsellik"},{"id":"o4","text":"Beni güldürmesi"}]},{"id":"q2","text":"Hangi tür sana daha yakın?","options":[{"id":"o1","text":"Bilim kurgu"},{"id":"o2","text":"Polisiye / gerilim"},{"id":"o3","text":"Drama"},{"id":"o4","text":"Komedi"}]},{"id":"q3","text":"Bir diziyi nasıl izlersin?","options":[{"id":"o1","text":"Tek gecede bitiririm"},{"id":"o2","text":"Haftada bir bölüm"},{"id":"o3","text":"Ruh hâlime göre"}]},{"id":"q4","text":"Final bölümünden beklentin?","options":[{"id":"o1","text":"Her şey açıklansın"},{"id":"o2","text":"Biraz muamma kalsın"},{"id":"o3","text":"Karakterler huzur bulsun"}]},{"id":"q5","text":"Altyazı mı dublaj mı?","options":[{"id":"o1","text":"Altyazı"},{"id":"o2","text":"Dublaj"},{"id":"o3","text":"Fark etmez"}]}]'::jsonb, 50, true, false);
insert into public.tests (id, created_at, created_by, title, category_id, language, questions, point, approved, is_deleted)
values ('1e69d674-2e13-478d-8d78-ae44a2fe63d9', '2026-07-23T10:55:09.480Z', '8d801ac3-1c86-405a-8046-8081f2c1e833', 'Nasıl Bir Okursun?', 2, 'tr', '[{"id":"q1","text":"Kitabı nerede okursun?","options":[{"id":"o1","text":"Yatakta, gece"},{"id":"o2","text":"Kafede"},{"id":"o3","text":"Toplu taşımada"},{"id":"o4","text":"Sessiz bir odada"}]},{"id":"q2","text":"Hangisi rafında mutlaka vardır?","options":[{"id":"o1","text":"Klasik roman"},{"id":"o2","text":"Distopya"},{"id":"o3","text":"Polisiye"},{"id":"o4","text":"Deneme / felsefe"}]},{"id":"q3","text":"Sevmediğin kitabı ne yaparsın?","options":[{"id":"o1","text":"Yarıda bırakırım"},{"id":"o2","text":"İnat edip bitiririm"}]},{"id":"q4","text":"Kitabın altını çizer misin?","options":[{"id":"o1","text":"Evet, not alırım"},{"id":"o2","text":"Asla, tertemiz kalmalı"}]}]'::jsonb, 40, true, false);
insert into public.tests (id, created_at, created_by, title, category_id, language, questions, point, approved, is_deleted)
values ('1c362ce6-a5f8-4662-a5b1-4dc7cbdad871', '2026-07-28T10:55:09.480Z', 'c55b52c4-c42c-409d-b353-c0988e345962', 'İlişkide Ne Ararsın?', 1, 'tr', '[{"id":"q1","text":"Sence ilişkinin temeli nedir?","options":[{"id":"o1","text":"Güven"},{"id":"o2","text":"Aynı mizah anlayışı"},{"id":"o3","text":"Ortak hedefler"},{"id":"o4","text":"Tutku"}]},{"id":"q2","text":"Tartışma çıktığında?","options":[{"id":"o1","text":"Hemen konuşup çözerim"},{"id":"o2","text":"Sakinleşip sonra konuşurum"},{"id":"o3","text":"Yazarak anlatmayı severim"}]},{"id":"q3","text":"İdeal bir cumartesi akşamı?","options":[{"id":"o1","text":"Evde film ve battaniye"},{"id":"o2","text":"Kalabalık bir buluşma"},{"id":"o3","text":"Uzun bir yürüyüş ve sohbet"}]},{"id":"q4","text":"Sevgini nasıl gösterirsin?","options":[{"id":"o1","text":"Zaman ayırarak"},{"id":"o2","text":"Küçük sürprizlerle"},{"id":"o3","text":"Sözle, açıkça söyleyerek"}]},{"id":"q5","text":"Partnerinden en çok ne beklersin?","options":[{"id":"o1","text":"Beni olduğum gibi kabul etmesi"},{"id":"o2","text":"Beni geliştirmesi"},{"id":"o3","text":"Bana alan tanıması"}]}]'::jsonb, 60, true, false);
insert into public.tests (id, created_at, created_by, title, category_id, language, questions, point, approved, is_deleted)
values ('aca84a70-6541-4235-86f0-a555393f67f1', '2026-08-02T10:55:09.480Z', 'be5a9181-da89-4c3c-8a26-94ce79e9744d', 'Hafta Sonu Planın', 3, 'tr', '[{"id":"q1","text":"Cumartesi sabahı?","options":[{"id":"o1","text":"Erken kalkıp spor"},{"id":"o2","text":"Öğlene kadar uyku"}]},{"id":"q2","text":"Plan yapmayı sever misin?","options":[{"id":"o1","text":"Her şey planlı olmalı"},{"id":"o2","text":"Akışına bırakırım"}]},{"id":"q3","text":"Tercihin?","options":[{"id":"o1","text":"Doğa"},{"id":"o2","text":"Şehir"},{"id":"o3","text":"Ev"}]}]'::jsonb, 25, true, false);
insert into public.tests (id, created_at, created_by, title, category_id, language, questions, point, approved, is_deleted)
values ('0361a9b9-bba6-4323-b357-a49e190e9ec9', '2026-08-07T10:55:09.480Z', '6ab7be15-91b6-4190-b007-5860cd52520e', 'Müzik Zevkin Ne Anlatıyor?', 3, 'tr', '[{"id":"q1","text":"En çok ne dinlersin?","options":[{"id":"o1","text":"Rock"},{"id":"o2","text":"Elektronik"},{"id":"o3","text":"Caz / blues"},{"id":"o4","text":"Rap"}]},{"id":"q2","text":"Konser mi festival mi?","options":[{"id":"o1","text":"Konser"},{"id":"o2","text":"Festival"}]},{"id":"q3","text":"Çalışırken müzik?","options":[{"id":"o1","text":"Şart"},{"id":"o2","text":"Sessizlik isterim"}]},{"id":"q4","text":"Plak mı dijital mi?","options":[{"id":"o1","text":"Plak"},{"id":"o2","text":"Dijital"},{"id":"o3","text":"İkisi de"}]}]'::jsonb, 30, true, false);
insert into public.tests (id, created_at, created_by, title, category_id, language, questions, point, approved, is_deleted)
values ('934cf10d-7eb3-4494-8a91-20fb5f21c947', '2026-08-12T10:55:09.480Z', '63bb3dd6-adbe-499f-b0a2-aa40184feee6', 'Hayata Bakışın', 2, 'tr', '[{"id":"q1","text":"Karar verirken?","options":[{"id":"o1","text":"Mantık"},{"id":"o2","text":"Sezgi"}]},{"id":"q2","text":"Değişim senin için?","options":[{"id":"o1","text":"Heyecan verici"},{"id":"o2","text":"Biraz ürkütücü"}]},{"id":"q3","text":"Kalabalık bir ortamda?","options":[{"id":"o1","text":"Enerjim yükselir"},{"id":"o2","text":"Çabuk yorulurum"},{"id":"o3","text":"Duruma göre değişir"}]},{"id":"q4","text":"Gelecek planın?","options":[{"id":"o1","text":"Net bir hedefim var"},{"id":"o2","text":"Kapıları açık tutarım"}]}]'::jsonb, 45, true, false);
insert into public.tests (id, created_at, created_by, title, category_id, language, questions, point, approved, is_deleted)
values ('99048ce6-efcb-455b-9594-640e99f56dcc', '2026-08-17T10:55:09.480Z', 'dfa7573e-5f47-408b-aab7-35b17ca6a2f6', 'Seyahat Tarzın', 3, 'tr', '[{"id":"q1","text":"Valizin?","options":[{"id":"o1","text":"Minimal"},{"id":"o2","text":"Her ihtimale karşı dolu"}]},{"id":"q2","text":"Rota?","options":[{"id":"o1","text":"Gün gün planlı"},{"id":"o2","text":"Oraya gidince bakarız"}]},{"id":"q3","text":"Konaklama?","options":[{"id":"o1","text":"Otel"},{"id":"o2","text":"Hostel"},{"id":"o3","text":"Kiralık ev"}]}]'::jsonb, 25, true, false);
insert into public.tests (id, created_at, created_by, title, category_id, language, questions, point, approved, is_deleted)
values ('0b5e0a2e-7291-450c-87c5-bbf30f5831a9', '2026-08-22T10:55:09.480Z', '971eeed2-8cfa-42d8-b63e-fbf13b1dea88', 'Relationship Style Test', 1, 'en', '[{"id":"q1","text":"How do you handle conflict?","options":[{"id":"o1","text":"Talk it out immediately"},{"id":"o2","text":"Take space, then talk"}]},{"id":"q2","text":"Your love language?","options":[{"id":"o1","text":"Quality time"},{"id":"o2","text":"Words of affirmation"},{"id":"o3","text":"Acts of service"}]},{"id":"q3","text":"Weekend together?","options":[{"id":"o1","text":"Quiet at home"},{"id":"o2","text":"Out and about"}]}]'::jsonb, 40, true, false);

-- Kapı testi referansları (testler oluştuktan sonra bağlanır)
update public.profiles set gate_test_id = 'f04b5b2e-e25f-4f57-bc88-985cccc4c6f6' where id = '965d3fd5-7508-4429-b5b2-bce645250be3';

-- 4) Cevaplar ---------------------------------------------------------------
insert into public.answers (created_at, user_id, test_id, user_answers)
values
  ('2026-08-07T10:55:09.480Z', '965d3fd5-7508-4429-b5b2-bce645250be3', 'f04b5b2e-e25f-4f57-bc88-985cccc4c6f6', '[{"questionId":"q1","choiceId":"o1"},{"questionId":"q2","choiceId":"o2"},{"questionId":"q3","choiceId":"o1"},{"questionId":"q4","choiceId":"o1"},{"questionId":"q5","choiceId":"o1"}]'::jsonb),
  ('2026-08-08T10:55:09.480Z', 'c55b52c4-c42c-409d-b353-c0988e345962', 'f04b5b2e-e25f-4f57-bc88-985cccc4c6f6', '[{"questionId":"q1","choiceId":"o1"},{"questionId":"q2","choiceId":"o2"},{"questionId":"q3","choiceId":"o1"},{"questionId":"q4","choiceId":"o1"},{"questionId":"q5","choiceId":"o1"}]'::jsonb),
  ('2026-08-09T10:55:09.480Z', 'b316370e-f9a8-4800-8846-5f415d3312ad', 'f04b5b2e-e25f-4f57-bc88-985cccc4c6f6', '[{"questionId":"q1","choiceId":"o1"},{"questionId":"q2","choiceId":"o2"},{"questionId":"q3","choiceId":"o1"},{"questionId":"q4","choiceId":"o1"},{"questionId":"q5","choiceId":"o2"}]'::jsonb),
  ('2026-08-10T10:55:09.480Z', 'e3fc19e5-cbd7-4988-b12e-70c8f19af19d', 'f04b5b2e-e25f-4f57-bc88-985cccc4c6f6', '[{"questionId":"q1","choiceId":"o1"},{"questionId":"q2","choiceId":"o2"},{"questionId":"q3","choiceId":"o1"},{"questionId":"q4","choiceId":"o3"},{"questionId":"q5","choiceId":"o1"}]'::jsonb),
  ('2026-08-11T10:55:09.480Z', 'be5a9181-da89-4c3c-8a26-94ce79e9744d', 'f04b5b2e-e25f-4f57-bc88-985cccc4c6f6', '[{"questionId":"q1","choiceId":"o4"},{"questionId":"q2","choiceId":"o3"},{"questionId":"q3","choiceId":"o2"},{"questionId":"q4","choiceId":"o2"},{"questionId":"q5","choiceId":"o3"}]'::jsonb),
  ('2026-08-12T10:55:09.480Z', '8f30f3b0-8d91-4b0d-8fb3-62ac25994d9f', 'f04b5b2e-e25f-4f57-bc88-985cccc4c6f6', '[{"questionId":"q1","choiceId":"o3"},{"questionId":"q2","choiceId":"o1"},{"questionId":"q3","choiceId":"o2"},{"questionId":"q4","choiceId":"o1"},{"questionId":"q5","choiceId":"o2"}]'::jsonb),
  ('2026-08-13T10:55:09.480Z', '63bb3dd6-adbe-499f-b0a2-aa40184feee6', 'f04b5b2e-e25f-4f57-bc88-985cccc4c6f6', '[{"questionId":"q1","choiceId":"o2"},{"questionId":"q2","choiceId":"o2"},{"questionId":"q3","choiceId":"o1"},{"questionId":"q4","choiceId":"o3"},{"questionId":"q5","choiceId":"o3"}]'::jsonb),
  ('2026-08-14T10:55:09.480Z', '965d3fd5-7508-4429-b5b2-bce645250be3', '1e69d674-2e13-478d-8d78-ae44a2fe63d9', '[{"questionId":"q1","choiceId":"o1"},{"questionId":"q2","choiceId":"o2"},{"questionId":"q3","choiceId":"o1"},{"questionId":"q4","choiceId":"o1"}]'::jsonb),
  ('2026-08-15T10:55:09.480Z', '8d801ac3-1c86-405a-8046-8081f2c1e833', '1e69d674-2e13-478d-8d78-ae44a2fe63d9', '[{"questionId":"q1","choiceId":"o1"},{"questionId":"q2","choiceId":"o2"},{"questionId":"q3","choiceId":"o1"},{"questionId":"q4","choiceId":"o1"}]'::jsonb),
  ('2026-08-16T10:55:09.480Z', 'e3fc19e5-cbd7-4988-b12e-70c8f19af19d', '1e69d674-2e13-478d-8d78-ae44a2fe63d9', '[{"questionId":"q1","choiceId":"o1"},{"questionId":"q2","choiceId":"o2"},{"questionId":"q3","choiceId":"o1"},{"questionId":"q4","choiceId":"o2"}]'::jsonb),
  ('2026-08-17T10:55:09.480Z', '63bb3dd6-adbe-499f-b0a2-aa40184feee6', '1e69d674-2e13-478d-8d78-ae44a2fe63d9', '[{"questionId":"q1","choiceId":"o1"},{"questionId":"q2","choiceId":"o3"},{"questionId":"q3","choiceId":"o2"},{"questionId":"q4","choiceId":"o1"}]'::jsonb),
  ('2026-08-18T10:55:09.480Z', 'c55b52c4-c42c-409d-b353-c0988e345962', '1e69d674-2e13-478d-8d78-ae44a2fe63d9', '[{"questionId":"q1","choiceId":"o4"},{"questionId":"q2","choiceId":"o2"},{"questionId":"q3","choiceId":"o1"},{"questionId":"q4","choiceId":"o1"}]'::jsonb),
  ('2026-08-19T10:55:09.480Z', 'b316370e-f9a8-4800-8846-5f415d3312ad', '1c362ce6-a5f8-4662-a5b1-4dc7cbdad871', '[{"questionId":"q1","choiceId":"o1"},{"questionId":"q2","choiceId":"o1"},{"questionId":"q3","choiceId":"o3"},{"questionId":"q4","choiceId":"o1"},{"questionId":"q5","choiceId":"o1"}]'::jsonb),
  ('2026-08-20T10:55:09.480Z', 'c55b52c4-c42c-409d-b353-c0988e345962', '1c362ce6-a5f8-4662-a5b1-4dc7cbdad871', '[{"questionId":"q1","choiceId":"o1"},{"questionId":"q2","choiceId":"o1"},{"questionId":"q3","choiceId":"o3"},{"questionId":"q4","choiceId":"o1"},{"questionId":"q5","choiceId":"o1"}]'::jsonb),
  ('2026-08-21T10:55:09.480Z', '965d3fd5-7508-4429-b5b2-bce645250be3', '1c362ce6-a5f8-4662-a5b1-4dc7cbdad871', '[{"questionId":"q1","choiceId":"o1"},{"questionId":"q2","choiceId":"o2"},{"questionId":"q3","choiceId":"o1"},{"questionId":"q4","choiceId":"o3"},{"questionId":"q5","choiceId":"o2"}]'::jsonb),
  ('2026-08-22T10:55:09.480Z', 'be5a9181-da89-4c3c-8a26-94ce79e9744d', '1c362ce6-a5f8-4662-a5b1-4dc7cbdad871', '[{"questionId":"q1","choiceId":"o3"},{"questionId":"q2","choiceId":"o2"},{"questionId":"q3","choiceId":"o2"},{"questionId":"q4","choiceId":"o1"},{"questionId":"q5","choiceId":"o1"}]'::jsonb),
  ('2026-08-23T10:55:09.480Z', 'e6165c0e-bf04-4315-850d-7408efbb75ce', '1c362ce6-a5f8-4662-a5b1-4dc7cbdad871', '[{"questionId":"q1","choiceId":"o1"},{"questionId":"q2","choiceId":"o3"},{"questionId":"q3","choiceId":"o1"},{"questionId":"q4","choiceId":"o2"},{"questionId":"q5","choiceId":"o2"}]'::jsonb),
  ('2026-08-24T10:55:09.481Z', '63bb3dd6-adbe-499f-b0a2-aa40184feee6', '1c362ce6-a5f8-4662-a5b1-4dc7cbdad871', '[{"questionId":"q1","choiceId":"o1"},{"questionId":"q2","choiceId":"o2"},{"questionId":"q3","choiceId":"o1"},{"questionId":"q4","choiceId":"o3"},{"questionId":"q5","choiceId":"o1"}]'::jsonb),
  ('2026-08-07T10:55:09.481Z', 'be5a9181-da89-4c3c-8a26-94ce79e9744d', 'aca84a70-6541-4235-86f0-a555393f67f1', '[{"questionId":"q1","choiceId":"o2"},{"questionId":"q2","choiceId":"o2"},{"questionId":"q3","choiceId":"o1"}]'::jsonb),
  ('2026-08-08T10:55:09.481Z', '965d3fd5-7508-4429-b5b2-bce645250be3', 'aca84a70-6541-4235-86f0-a555393f67f1', '[{"questionId":"q1","choiceId":"o2"},{"questionId":"q2","choiceId":"o2"},{"questionId":"q3","choiceId":"o1"}]'::jsonb),
  ('2026-08-09T10:55:09.481Z', 'e6165c0e-bf04-4315-850d-7408efbb75ce', 'aca84a70-6541-4235-86f0-a555393f67f1', '[{"questionId":"q1","choiceId":"o1"},{"questionId":"q2","choiceId":"o1"},{"questionId":"q3","choiceId":"o2"}]'::jsonb),
  ('2026-08-10T10:55:09.481Z', '6ab7be15-91b6-4190-b007-5860cd52520e', 'aca84a70-6541-4235-86f0-a555393f67f1', '[{"questionId":"q1","choiceId":"o2"},{"questionId":"q2","choiceId":"o2"},{"questionId":"q3","choiceId":"o3"}]'::jsonb),
  ('2026-08-11T10:55:09.481Z', '6ab7be15-91b6-4190-b007-5860cd52520e', '0361a9b9-bba6-4323-b357-a49e190e9ec9', '[{"questionId":"q1","choiceId":"o1"},{"questionId":"q2","choiceId":"o2"},{"questionId":"q3","choiceId":"o1"},{"questionId":"q4","choiceId":"o2"}]'::jsonb),
  ('2026-08-12T10:55:09.481Z', '8f30f3b0-8d91-4b0d-8fb3-62ac25994d9f', '0361a9b9-bba6-4323-b357-a49e190e9ec9', '[{"questionId":"q1","choiceId":"o1"},{"questionId":"q2","choiceId":"o2"},{"questionId":"q3","choiceId":"o1"},{"questionId":"q4","choiceId":"o2"}]'::jsonb),
  ('2026-08-13T10:55:09.481Z', 'b316370e-f9a8-4800-8846-5f415d3312ad', '0361a9b9-bba6-4323-b357-a49e190e9ec9', '[{"questionId":"q1","choiceId":"o2"},{"questionId":"q2","choiceId":"o2"},{"questionId":"q3","choiceId":"o1"},{"questionId":"q4","choiceId":"o1"}]'::jsonb),
  ('2026-08-14T10:55:09.481Z', 'e3fc19e5-cbd7-4988-b12e-70c8f19af19d', '0361a9b9-bba6-4323-b357-a49e190e9ec9', '[{"questionId":"q1","choiceId":"o3"},{"questionId":"q2","choiceId":"o1"},{"questionId":"q3","choiceId":"o2"},{"questionId":"q4","choiceId":"o3"}]'::jsonb),
  ('2026-08-15T10:55:09.481Z', '63bb3dd6-adbe-499f-b0a2-aa40184feee6', '934cf10d-7eb3-4494-8a91-20fb5f21c947', '[{"questionId":"q1","choiceId":"o1"},{"questionId":"q2","choiceId":"o2"},{"questionId":"q3","choiceId":"o3"},{"questionId":"q4","choiceId":"o1"}]'::jsonb),
  ('2026-08-16T10:55:09.481Z', '965d3fd5-7508-4429-b5b2-bce645250be3', '934cf10d-7eb3-4494-8a91-20fb5f21c947', '[{"questionId":"q1","choiceId":"o1"},{"questionId":"q2","choiceId":"o2"},{"questionId":"q3","choiceId":"o3"},{"questionId":"q4","choiceId":"o2"}]'::jsonb),
  ('2026-08-17T10:55:09.481Z', 'e6165c0e-bf04-4315-850d-7408efbb75ce', '934cf10d-7eb3-4494-8a91-20fb5f21c947', '[{"questionId":"q1","choiceId":"o1"},{"questionId":"q2","choiceId":"o1"},{"questionId":"q3","choiceId":"o1"},{"questionId":"q4","choiceId":"o2"}]'::jsonb),
  ('2026-08-18T10:55:09.481Z', 'dfa7573e-5f47-408b-aab7-35b17ca6a2f6', '934cf10d-7eb3-4494-8a91-20fb5f21c947', '[{"questionId":"q1","choiceId":"o2"},{"questionId":"q2","choiceId":"o1"},{"questionId":"q3","choiceId":"o3"},{"questionId":"q4","choiceId":"o1"}]'::jsonb),
  ('2026-08-19T10:55:09.481Z', 'dfa7573e-5f47-408b-aab7-35b17ca6a2f6', '99048ce6-efcb-455b-9594-640e99f56dcc', '[{"questionId":"q1","choiceId":"o1"},{"questionId":"q2","choiceId":"o2"},{"questionId":"q3","choiceId":"o3"}]'::jsonb),
  ('2026-08-20T10:55:09.481Z', '8d801ac3-1c86-405a-8046-8081f2c1e833', '99048ce6-efcb-455b-9594-640e99f56dcc', '[{"questionId":"q1","choiceId":"o1"},{"questionId":"q2","choiceId":"o2"},{"questionId":"q3","choiceId":"o3"}]'::jsonb),
  ('2026-08-21T10:55:09.481Z', 'b316370e-f9a8-4800-8846-5f415d3312ad', '99048ce6-efcb-455b-9594-640e99f56dcc', '[{"questionId":"q1","choiceId":"o1"},{"questionId":"q2","choiceId":"o2"},{"questionId":"q3","choiceId":"o1"}]'::jsonb),
  ('2026-08-22T10:55:09.481Z', '971eeed2-8cfa-42d8-b63e-fbf13b1dea88', '0b5e0a2e-7291-450c-87c5-bbf30f5831a9', '[{"questionId":"q1","choiceId":"o1"},{"questionId":"q2","choiceId":"o2"},{"questionId":"q3","choiceId":"o1"}]'::jsonb),
  ('2026-08-23T10:55:09.481Z', '8d801ac3-1c86-405a-8046-8081f2c1e833', '0b5e0a2e-7291-450c-87c5-bbf30f5831a9', '[{"questionId":"q1","choiceId":"o1"},{"questionId":"q2","choiceId":"o2"},{"questionId":"q3","choiceId":"o2"}]'::jsonb);

-- 5) Kaydırmalar ------------------------------------------------------------
insert into public.swipes (created_at, from_user, to_user, action)
values
  ('2026-08-15T10:55:09.481Z', '8d801ac3-1c86-405a-8046-8081f2c1e833', '965d3fd5-7508-4429-b5b2-bce645250be3', 'like'),
  ('2026-08-16T10:55:09.481Z', 'c55b52c4-c42c-409d-b353-c0988e345962', '965d3fd5-7508-4429-b5b2-bce645250be3', 'like'),
  ('2026-08-17T10:55:09.481Z', 'e3fc19e5-cbd7-4988-b12e-70c8f19af19d', '965d3fd5-7508-4429-b5b2-bce645250be3', 'like'),
  ('2026-08-18T10:55:09.481Z', '965d3fd5-7508-4429-b5b2-bce645250be3', 'b316370e-f9a8-4800-8846-5f415d3312ad', 'like'),
  ('2026-08-19T10:55:09.481Z', 'b316370e-f9a8-4800-8846-5f415d3312ad', '965d3fd5-7508-4429-b5b2-bce645250be3', 'like'),
  ('2026-08-20T10:55:09.481Z', '8f30f3b0-8d91-4b0d-8fb3-62ac25994d9f', '63bb3dd6-adbe-499f-b0a2-aa40184feee6', 'like'),
  ('2026-08-21T10:55:09.481Z', 'e6165c0e-bf04-4315-850d-7408efbb75ce', 'e3fc19e5-cbd7-4988-b12e-70c8f19af19d', 'dislike');

-- 6) Eşleşmeler ---------------------------------------------------------
insert into public.matches (created_at, user_a, user_b)
values
  ('2026-08-19T10:55:09.481Z', '965d3fd5-7508-4429-b5b2-bce645250be3', 'b316370e-f9a8-4800-8846-5f415d3312ad');

-- 7) Sohbetler + mesajlar -------------------------------------------------
do $$
declare
  v_chat_1_id bigint;
  v_chat_2_id bigint;
begin
  insert into public.chats (created_at, last_message_at, user_a, user_b, source)
  values ('2026-08-19T10:55:09.481Z', '2026-08-26T10:55:09.481Z', '965d3fd5-7508-4429-b5b2-bce645250be3', 'b316370e-f9a8-4800-8846-5f415d3312ad', 'match')
  returning id into v_chat_1_id;
  insert into public.chats (created_at, last_message_at, user_a, user_b, source)
  values ('2026-08-24T10:55:09.481Z', '2026-08-25T10:55:09.481Z', '965d3fd5-7508-4429-b5b2-bce645250be3', 'c55b52c4-c42c-409d-b353-c0988e345962', 'match')
  returning id into v_chat_2_id;
  insert into public.messages (created_at, chat_id, sender_id, content)
  values ('2026-08-19T10:55:09.481Z', v_chat_1_id, 'b316370e-f9a8-4800-8846-5f415d3312ad', 'Selam! Hangi Diziyi İzlersin testinde %80 çıkmışız, fena değil :)');
  insert into public.messages (created_at, chat_id, sender_id, content)
  values ('2026-08-20T10:55:09.481Z', v_chat_1_id, '965d3fd5-7508-4429-b5b2-bce645250be3', 'Selam Mert! Gördüm, sadece son soruda ayrılmışız sanırım.');
  insert into public.messages (created_at, chat_id, sender_id, content)
  values ('2026-08-26T10:55:09.481Z', v_chat_1_id, 'b316370e-f9a8-4800-8846-5f415d3312ad', 'Bu akşam yeni sezonu başlatıyorum, tavsiye ister misin?');
  insert into public.messages (created_at, chat_id, sender_id, content)
  values ('2026-08-24T10:55:09.481Z', v_chat_2_id, 'c55b52c4-c42c-409d-b353-c0988e345962', 'Testte %100 çıktık, bu biraz ürkütücü ama güzel 😄');
  insert into public.messages (created_at, chat_id, sender_id, content)
  values ('2026-08-25T10:55:09.481Z', v_chat_2_id, '965d3fd5-7508-4429-b5b2-bce645250be3', 'Aynen! Beş sorunun beşinde de aynı şıkkı seçmişiz.');
end $$;

-- 8) Gönderiler -------------------------------------------------------------
insert into public.posts (created_at, user_id, content, tagged_test_id)
values
  ('2026-08-26T10:55:09.481Z', 'c55b52c4-c42c-409d-b353-c0988e345962', 'Bugün biriyle bir testte %100 uyum yakaladım. Bu uygulama fena değil cidden.', 'f04b5b2e-e25f-4f57-bc88-985cccc4c6f6'),
  ('2026-08-25T10:55:09.481Z', '8d801ac3-1c86-405a-8046-8081f2c1e833', 'Berlin''den herkese merhaba! Polisiye öneren olursa çok sevinirim.', '1e69d674-2e13-478d-8d78-ae44a2fe63d9'),
  ('2026-08-24T10:55:09.481Z', '6ab7be15-91b6-4190-b007-5860cd52520e', 'Yeni bir test oluşturdum: müzik zevkinizin ne anlattığını merak edenler buraya.', '0361a9b9-bba6-4323-b357-a49e190e9ec9'),
  ('2026-08-23T10:55:09.481Z', 'be5a9181-da89-4c3c-8a26-94ce79e9744d', 'Hafta sonu planı testini çözenlerin çoğu ''akışına bırakırım'' demiş. Beni rahatlattı.', 'aca84a70-6541-4235-86f0-a555393f67f1'),
  ('2026-08-21T10:55:09.481Z', 'e3fc19e5-cbd7-4988-b12e-70c8f19af19d', 'İkinci el kitapçıda bulduğum çizimli baskıyı paylaşmadan duramadım.', null);

-- Notlar
insert into public.notes (created_at, user_id, text)
values
  ('2026-08-22T10:55:09.481Z', '965d3fd5-7508-4429-b5b2-bce645250be3', 'Ece ile test-1''de tam uyum çıktı, mutlaka yaz.'),
  ('2026-08-25T10:55:09.481Z', '965d3fd5-7508-4429-b5b2-bce645250be3', 'Zeynep''in önerdiği polisiyeyi listeye ekle.');

-- Profil görüntülemeleri
insert into public.profile_views (created_at, viewer_id, viewed_id)
values
  ('2026-08-23T10:55:09.481Z', 'b316370e-f9a8-4800-8846-5f415d3312ad', '965d3fd5-7508-4429-b5b2-bce645250be3'),
  ('2026-08-24T10:55:09.481Z', 'c55b52c4-c42c-409d-b353-c0988e345962', '965d3fd5-7508-4429-b5b2-bce645250be3'),
  ('2026-08-25T10:55:09.481Z', 'e3fc19e5-cbd7-4988-b12e-70c8f19af19d', '965d3fd5-7508-4429-b5b2-bce645250be3'),
  ('2026-08-26T10:55:09.481Z', '8f30f3b0-8d91-4b0d-8fb3-62ac25994d9f', '965d3fd5-7508-4429-b5b2-bce645250be3');

-- 9) Bildirimler ------------------------------------------------------------
insert into public.notifications (created_at, user_id, type, actor_id, test_id, similarity, is_read)
values
  ('2026-08-26T10:55:09.481Z', '965d3fd5-7508-4429-b5b2-bce645250be3', 'test_similarity', 'c55b52c4-c42c-409d-b353-c0988e345962', 'f04b5b2e-e25f-4f57-bc88-985cccc4c6f6', 100, false),
  ('2026-08-25T10:55:09.481Z', '965d3fd5-7508-4429-b5b2-bce645250be3', 'test_similarity', 'b316370e-f9a8-4800-8846-5f415d3312ad', 'f04b5b2e-e25f-4f57-bc88-985cccc4c6f6', 80, false),
  ('2026-08-24T10:55:09.481Z', '965d3fd5-7508-4429-b5b2-bce645250be3', 'test_similarity', '8d801ac3-1c86-405a-8046-8081f2c1e833', '1e69d674-2e13-478d-8d78-ae44a2fe63d9', 100, true),
  ('2026-08-23T10:55:09.481Z', '965d3fd5-7508-4429-b5b2-bce645250be3', 'incoming_like', 'e3fc19e5-cbd7-4988-b12e-70c8f19af19d', null, null, true);

-- Coin bakiyeleri
insert into public.user_coins (user_id, coin)
values
  ('965d3fd5-7508-4429-b5b2-bce645250be3', 500),
  ('b316370e-f9a8-4800-8846-5f415d3312ad', 100),
  ('8d801ac3-1c86-405a-8046-8081f2c1e833', 220),
  ('c55b52c4-c42c-409d-b353-c0988e345962', 80);

-- Puan bakiyeleri
insert into public.user_points (user_id, point)
values
  ('965d3fd5-7508-4429-b5b2-bce645250be3', 260),
  ('c55b52c4-c42c-409d-b353-c0988e345962', 195),
  ('63bb3dd6-adbe-499f-b0a2-aa40184feee6', 175),
  ('b316370e-f9a8-4800-8846-5f415d3312ad', 155),
  ('8d801ac3-1c86-405a-8046-8081f2c1e833', 130),
  ('e3fc19e5-cbd7-4988-b12e-70c8f19af19d', 120),
  ('be5a9181-da89-4c3c-8a26-94ce79e9744d', 95),
  ('6ab7be15-91b6-4190-b007-5860cd52520e', 80),
  ('e6165c0e-bf04-4315-850d-7408efbb75ce', 70),
  ('dfa7573e-5f47-408b-aab7-35b17ca6a2f6', 70),
  ('8f30f3b0-8d91-4b0d-8fb3-62ac25994d9f', 55),
  ('971eeed2-8cfa-42d8-b63e-fbf13b1dea88', 40);

-- Giriş yapabileceğin hesaplar:
--   demo@hemdem.test / demo1234
--   admin@hemdem.test / admin1234
--   <isim>@demo.hemdem.test / Demo1234!  (diğer 11 demo profil)
