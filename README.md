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

The database structure is in `db/schema.ts`. Until [this bug](https://github.com/drizzle-team/drizzle-orm/issues/3504) in `drizzle-kit push` is fixed, use `drizzle-kit generate` and `drizzle-kit migrate`.

#### Role-Based Access Control

Permissions are managed using the [Custom Claims & Role-based Access Control (RBAC) template from the Supabase docs](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac?queryGroups=language&language=plpgsql). The following SQL needs to be run before using drizzle to set up the rest of the schema. Using the Supabase SQL editor works fine.

```sql
CREATE TYPE app_permission AS ENUM (
  'manage_brands',
  'manage_pages',
  'manage_pending_items',
  'manage_published_items'
);
CREATE TYPE app_role AS ENUM (
  'admin',
  'maintainer'
);

CREATE TABLE "role_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role" "app_role" NOT NULL,
	"permission" "app_permission" NOT NULL,
	CONSTRAINT "role_permissions_role_permission_unique" UNIQUE("role","permission")
);

ALTER TABLE "role_permissions" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read for all" ON "role_permissions" AS PERMISSIVE FOR SELECT TO public USING (true);

CREATE TABLE "user_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "app_role" NOT NULL,
	CONSTRAINT "user_roles_userId_role_unique" UNIQUE("user_id","role")
);

ALTER TABLE "user_roles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;
CREATE POLICY "user can read own roles" ON "user_roles" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.uid()) = user_id);

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

Then, in the Supabase dashboard, under Authentication > Hooks, add the Customize Access Token (JWT) Claims hook, calling the custom_access_token_hook function. Make sure to hit the toggle to enable the hook before saving it.

## Notes

### Workarounds Used During Development

- [Issue](https://github.com/nuxt/ui/issues/3139) when setting up Nuxt UI, [had to install tailwind packages to dev dependencies as described here](https://github.com/nuxt-modules/tailwindcss/issues/942#issuecomment-2669947831).

## Testing

### Unit

`pnpm unit`

### E2E

`pnpm e2e`

End-to-end tests use [Playwright](https://playwright.dev/).

#### E2E Environment Setup

Tests are run against the preview environment deployments on NuxtHub, so there's no extra setup there. The preview environment should be configured to use a test Supabase db, which should be configured with:

- The same schema as the production database (see [above](#Supabase)).
- Test users in Supabase Auth.
- A function to truncate all tables in the public schema.

##### DB Schema

For now, until [this](https://github.com/drizzle-team/drizzle-orm/discussions/3405) is available, temporarily change the db url in `drizzle.config.ts`.

##### Test Users

Create the users as listed in tests/e2e/util.ts:getTestUsers.

##### Clear Public Schema Function

Create a new function named `clear_public_schema` in the test Supabase, in the public schema, changing language to `sql`.

```sql
do $$ declare
    r record;
begin
    for r in (select tablename from pg_tables where schemaname = 'public') loop
        execute 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE';
    end loop;
end $$;
```

(This only clears table rows, so it won't delete itself or the enums.)
