<template>
  <div class="dashboard-view">
    <h2>Dashboard</h2>

    <DashboardCards />

    <h3>Actividad Reciente</h3>
    <RecentActivity />

  </div>
</template>

<script setup>
import DashboardCards from '@/components/dashboard/DashboardCards.vue'
import RecentActivity from '@/components/dashboard/RecentActivity.vue'
</script>

<style scoped>
.dashboard-view {
  max-width: 1200px;
  margin: 0 auto;
}

h2 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

h3 {
  color: #2c3e50;
  margin: 2rem 0 1rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
}
</style>
