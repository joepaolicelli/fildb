<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';
import { z } from 'zod';

const user = useSupabaseUser();
const supabase = useSupabaseClient();
const creds = reactive({
  email: '',
  password: '',
});

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email' }),
  password: z.string(),
});
type LoginSchema = z.output<typeof loginSchema>;

const signInWithPassword = async (event: FormSubmitEvent<LoginSchema>) => {
  const { error } = await supabase.auth.signInWithPassword({
    email: event.data.email,
    password: event.data.password,
  });
  if (error) console.log(error);
};

watchEffect(() => {
  if (user.value) {
    navigateTo('/admin');
  }
});
</script>
<template>
  <div>
    <UForm :schema="loginSchema" :state="creds" @submit="signInWithPassword">
      <UFormField label="Email" name="email">
        <UInput v-model="creds.email" />
      </UFormField>
      <UFormField label="Password" name="password">
        <UInput v-model="creds.password" type="password" />
      </UFormField>
      <UButton type="submit"> Log In </UButton>
    </UForm>
  </div>
</template>
