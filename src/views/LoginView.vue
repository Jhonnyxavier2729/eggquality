<template>
    <AuthLayout>
      <AuthForm :isLogin="true" @toggle-auth-mode="goToRegister" />
    </AuthLayout>
  </template>
  
  <script setup>
  import AuthLayout from '@/components/auth/AuthLayout.vue';
  import AuthForm from '@/components/auth/AuthForm.vue';
  import { useRouter } from 'vue-router';
  
  const router = useRouter();
  
  const goToRegister = () => {
    router.push('/register');
  };
  </script>