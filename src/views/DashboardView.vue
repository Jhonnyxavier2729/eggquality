<template>
<<<<<<< HEAD
    <div class="dashboard-container">
      <!-- Sidebar -->
      <div class="sidebar">
        <div class="logo">
          <h1>EggQuality</h1>
        </div>

        <nav class="menu">
          <h3>Dashboard</h3>
          <ul>
            <li class="active">
              <span>📊</span> Análisis de Huevos
            </li>
            <li>
              <span>🍯</span> Panales
            </li>
            <li>
              <router-link to="/registro-panal">
                <span>➕</span> Registrar Panal
              </router-link>
            </li>
            <li>
              <span>⚙️</span> Configuración
            </li>
          </ul>
        </nav>
      </div>

      <!-- Main Content -->
      <div class="main-content">
        <header class="dashboard-header">
          <h2>Bienvenido al Dashboard</h2>
          <div class="user-info">
            <span>Usuario: {{ userEmail }}</span>
            <button @click="logout" class="logout-btn">Cerrar sesión</button>
          </div>
        </header>

        <div class="dashboard-cards">
          <!-- Card: Análisis Recientes -->
          <div class="card recent-analysis">
            <h3>Análisis Recientes</h3>
            <div class="analysis-count">5 realizados hoy</div>
            <div class="progress-bar">
              <div class="progress" style="width: 70%;"></div>
            </div>
            <small>Meta diaria: 8 análisis</small>
          </div>

          <!-- Card: Análisis Reciente -->
          <div class="card recent-activity">
            <h3>Actividad Reciente</h3>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tipo</th>
                  <th>Fecha</th>
                  <th>Resultado</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>#001</td>
                  <td>Análisis Interno</td>
                  <td>2023-11-15</td>
                  <td><span class="badge quality-aa">Calidad AA</span></td>
                </tr>
                <tr>
                  <td>#002</td>
                  <td>Análisis Externo</td>
                  <td>2023-11-15</td>
                  <td><span class="badge quality-bad">Grieta detectada</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </template>

  <script setup>
  import { ref, onMounted } from 'vue'
  import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'
  import { useRouter } from 'vue-router'
  import { useToast } from 'vue-toastification'

  const router = useRouter()
  const toast = useToast()
  const userEmail = ref('')

  const auth = getAuth()

  // Verificar estado de autenticación
  onMounted(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        userEmail.value = user.email
      } else {
        router.push('/login')
      }
    })
  })

  // Función para cerrar sesión
  const logout = async () => {
    try {
      await signOut(auth)
      toast.success('Sesión cerrada correctamente')
      router.push('/login')
    } catch (error) {
      toast.error(`Error al cerrar sesión: ${error.message}`)
    }
  }
  </script>

  <style scoped>
  .dashboard-container {
    display: flex;
    min-height: 100vh;
    background-color: #f5f7fa;
  }

  .sidebar {
    width: 250px;
    background: linear-gradient(135deg, #42b983 0%, #369f6b 100%);
    color: white;
    padding: 1.5rem;
    box-shadow: 2px 0 10px rgba(0,0,0,0.1);
  }

  .logo h1 {
    color: white;
    margin: 0;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid rgba(255,255,255,0.2);
  }

  .menu h3 {
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    text-transform: uppercase;
    color: rgba(255,255,255,0.7);
  }

  .menu ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .menu li {
    padding: 0.75rem 0.5rem;
    margin: 0.25rem 0;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
  }

  .menu li span {
    margin-right: 10px;
    font-size: 1.1rem;
  }

  .menu li:hover {
    background-color: rgba(255,255,255,0.1);
  }

  .menu li.active {
    background-color: rgba(255,255,255,0.2);
    font-weight: bold;
  }

  .main-content {
    flex: 1;
    padding: 1.5rem;
  }

  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e0e0e0;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .logout-btn {
    padding: 0.5rem 1rem;
    background-color: #ff6b6b;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .logout-btn:hover {
    background-color: #ff5252;
  }

  .dashboard-cards {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 1.5rem;
  }

  .card {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    transition: transform 0.3s, box-shadow 0.3s;
  }

  .card:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  }

  .recent-analysis h3 {
    margin-top: 0;
    color: #2c3e50;
  }

  .analysis-count {
    font-size: 2rem;
    font-weight: bold;
    color: #42b983;
    margin: 1rem 0;
  }

  .progress-bar {
    height: 10px;
    background-color: #e0e0e0;
    border-radius: 5px;
    margin: 1rem 0;
    overflow: hidden;
  }

  .progress {
    height: 100%;
    background: linear-gradient(90deg, #42b983, #369f6b);
    border-radius: 5px;
    transition: width 0.5s ease;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
  }

  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #e0e0e0;
  }

  th {
    color: #7f8c8d;
    font-weight: normal;
    text-transform: uppercase;
    font-size: 0.8rem;
  }

  .badge {
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: bold;
  }

  .quality-aa {
    background-color: #d4edda;
    color: #155724;
  }

  .quality-bad {
    background-color: #f8d7da;
    color: #721c24;
  }

  /* Animaciones */
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .card {
    animation: fadeIn 0.5s ease-out forwards;
  }

  .recent-analysis {
    animation-delay: 0.1s;
  }

  .recent-activity {
    animation-delay: 0.2s;
  }
  </style>
=======
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
>>>>>>> origin/test
