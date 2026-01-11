-- Adicionar role "admin" para um usuário específico
-- Rode este SQL no Supabase SQL Editor:
-- https://supabase.com/dashboard/project/hcgntbskqevibpehyvrr/sql/new

-- Substitua 'USER_ID_AQUI' pelo id do usuário que você quer tornar admin.
-- Você pode encontrar o id do usuário em Authentication > Users.
-- Ex.: 42f33689-05c2-4ad2-adc9-588c3d542adf

INSERT INTO public.user_roles (user_id, role)
VALUES ('42f33689-05c2-4ad2-adc9-588c3d542adf', 'admin')
ON CONFLICT DO NOTHING;

-- VERIFICAR: rode esta query para ver os admins atuais:
-- SELECT * FROM public.user_roles WHERE role = 'admin';
