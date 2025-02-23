<script setup lang="ts">
const user = useSupabaseUser();
const supabase = useSupabaseClient();
const email = ref('');
const password = ref('');

const signInWithPassword = async () => {
  console.log(user);
  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });
  if (error) console.log(error);
};

watchEffect(() => {
  if (user.value) {
    console.log(user.value);
    navigateTo('/admin');
  }
});
</script>
<template>
  <div>
    <button @click="signInWithPassword">Sign In with E-Mail</button>
    <input v-model="email" type="email" />
    <input v-model="password" type="password" />
  </div>
</template>
