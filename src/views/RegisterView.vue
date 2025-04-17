<template>
    <AuthLayout>
      <AuthForm :isLogin="false" @toggle-auth-mode="goToLogin" />
    </AuthLayout>
  </template>
  
  <script setup>
  import AuthLayout from '@/components/auth/AuthLayout.vue';
  import AuthForm from '@/components/auth/AuthForm.vue';
  import { useRouter } from 'vue-router';
  
  const router = useRouter();
  
  const goToLogin = () => {
    router.push('/login');
  };
  </script>