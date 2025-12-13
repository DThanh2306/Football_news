<template>
  <div class="p-6">
    <a-breadcrumb class="mb-6">
      <a-breadcrumb-item>Admin</a-breadcrumb-item>
      <a-breadcrumb-item>Matches</a-breadcrumb-item>
    </a-breadcrumb>
    <div class="flex items-center gap-3 mb-6">
      <i class="ri-calendar-event-line text-2xl text-blue-600"></i>
      <h1 class="text-2xl font-bold text-blue-700">Manage Matches</h1>
      <a-button type="primary" class="ml-auto bg-blue-600 border-blue-600">Add match</a-button>
    </div>
    <a-table
      :columns="columns"
      :data-source="data"
      :pagination="{ pageSize: 5 }"
      row-key="id"
      bordered
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'homeLogo'">
          <img :src="record.homeLogo" alt="home" class="w-8 h-8 object-contain rounded border" />
        </template>
        <template v-if="column.key === 'awayLogo'">
          <img :src="record.awayLogo" alt="away" class="w-8 h-8 object-contain rounded border" />
        </template>
        <template v-if="column.key === 'actions'">
          <a-button type="link" size="small">Edit</a-button>
          <a-button type="link" danger size="small">Delete</a-button>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup>
const columns = [
  { title: 'Ngày', dataIndex: 'date', key: 'date' },
  { title: 'Giải đấu', dataIndex: 'league', key: 'league' },
  { title: 'Sân', dataIndex: 'stadium', key: 'stadium' },
  { title: 'Logo chủ nhà', dataIndex: 'homeLogo', key: 'homeLogo' },
  { title: 'Chủ nhà', dataIndex: 'home', key: 'home' },
  { title: 'Tỉ số', dataIndex: 'score', key: 'score' },
  { title: 'Đội khách', dataIndex: 'away', key: 'away' },
  { title: 'Logo khách', dataIndex: 'awayLogo', key: 'awayLogo' },
  { title: 'Thao tác', key: 'actions' }
]

const data = [
  {
    id: 1,
    date: '2025-08-10',
    league: 'Premier League',
    stadium: 'Old Trafford',
    home: 'Manchester United',
    homeLogo: '/public/Manchester_United.svg',
    score: '2 - 1',
    away: 'Liverpool',
    awayLogo: '/public/Liverpool.svg'
  },
  {
    id: 2,
    date: '2025-08-11',
    league: 'La Liga',
    stadium: 'Camp Nou',
    home: 'Barcelona',
    homeLogo: '/public/Barcelona.svg',
    score: '3 - 0',
    away: 'Real Madrid',
    awayLogo: '/public/Real_Madrid.svg'
  }
]
</script>