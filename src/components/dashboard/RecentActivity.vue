<template>
    <div class="recent-activity">
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
            <td><span class="badge success">Calidad AA</span></td>
          </tr>
          <tr>
            <td>#002</td>
            <td>Análisis Externo</td>
            <td>2023-11-15</td>
            <td><span class="badge error">Grieta detectada</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>

  <script setup>
  </script>

  <style scoped>
  .recent-activity {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  }

  table {
    width: 100%;
    border-collapse: collapse;
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

  .badge.success {
    background-color: #d4edda;
    color: #155724;
  }

  .badge.error {
    background-color: #f8d7da;
    color: #721c24;
  }
  </style>
