# FilDB

## Development Server

Start the development server on `http://localhost:3000`:

```bash
pnpm dev
```

## Production

```bash
pnpm build
```

## Deploy

```bash
npx nuxthub deploy
```

## Setup

### Supabase

#### Role-Based Access Control

Permissions are managed using the [Custom Claims & Role-based Access Control (RBAC) template from the Supabase docs](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac?queryGroups=language&language=plpgsql). The necessary enums and tables are included in schema.ts, but there are two postgres functions that need to manually be created. To do so, first run just the top "Permissions" section of schema.ts, and then run the following SQL (the Supabase SQL editor works fine).

```sql
-- Create the auth hook function
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
  declare
    claims jsonb;
    user_role public.app_role;
  begin
    -- Fetch the user role in the user_roles table
    select role into user_role from public.user_roles where user_id = (event->>'user_id')::uuid;

    claims := event->'claims';

    if user_role is not null then
      -- Set the claim
      claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
    else
      claims := jsonb_set(claims, '{user_role}', 'null');
    end if;

    -- Update the 'claims' object in the original event
    event := jsonb_set(event, '{claims}', claims);

    -- Return the modified or original event
    return event;
  end;
$$;

grant usage on schema public to supabase_auth_admin;

grant execute
  on function public.custom_access_token_hook
  to supabase_auth_admin;

revoke execute
  on function public.custom_access_token_hook
  from authenticated, anon, public;

grant all
  on table public.user_roles
to supabase_auth_admin;

revoke all
  on table public.user_roles
  from authenticated, anon, public;

create policy "Allow auth admin to read user roles" ON public.user_roles
as permissive for select
to supabase_auth_admin
using (true);

-- Create authorize function to use in RLS policies.
create or replace function public.authorize(
  requested_permission app_permission
)
returns boolean as $$
declare
  bind_permissions int;
  user_role public.app_role;
begin
  -- Fetch user role once and store it to reduce number of calls
  select (auth.jwt() ->> 'user_role')::public.app_role into user_role;

  select count(*)
  into bind_permissions
  from public.role_permissions
  where role_permissions.permission = requested_permission
    and role_permissions.role = user_role;

  return bind_permissions > 0;
end;
$$ language plpgsql stable security definer set search_path = '';
```

Then, in the Supabase dashboard, under Authentication > Hooks, add the Customize Access Token (JWT) Claims hook, calling the custom_access_token_hook function.

## Notes

### Workarounds Used During Development

- [Issue](https://github.com/nuxt/ui/issues/3139) when setting up Nuxt UI, [had to install tailwind packages to dev dependencies as described here](https://github.com/nuxt-modules/tailwindcss/issues/942#issuecomment-2669947831).
