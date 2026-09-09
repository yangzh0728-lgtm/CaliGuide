-- Internal trigger functions are not public RPC endpoints.
do $$
declare function_name text;
begin
  foreach function_name in array array['create_profile_for_new_auth_user', 'rls_auto_enable', 'set_updated_at'] loop
    if to_regprocedure(format('public.%I()', function_name)) is not null then
      execute format('revoke execute on function public.%I() from public, anon, authenticated', function_name);
    end if;
  end loop;
  if to_regprocedure('public.set_updated_at()') is not null then
    alter function public.set_updated_at() set search_path = pg_catalog;
  end if;
end $$;
