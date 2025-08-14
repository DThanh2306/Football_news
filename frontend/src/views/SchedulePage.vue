<template>
  <div class="bg-white min-h-screen py-4">
    <h1 class="text-3xl font-bold text-blue-800 text-center mb-6">
      Lịch thi đấu bóng đá hôm nay, LTĐ ngày mai mới nhất
    </h1>
    <div class="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">

      <aside class="w-full lg:w-64 flex-shrink-0">
        <div class="bg-gray-50 rounded-lg shadow mb-4">
          <div class="font-bold px-4 py-2 bg-gray-200 rounded-t-lg">GIẢI NỔI BẬT</div>
          <ul>
            <li
              v-for="g in topLeagues"
              :key="g"
              class="px-4 py-2 border-b hover:bg-blue-50 cursor-pointer"
            >
              {{ g }}
            </li>
          </ul>
        </div>
        <div class="bg-gray-50 rounded-lg shadow">
          <div class="font-bold px-4 py-2 bg-gray-200 rounded-t-lg">KHU VỰC</div>
          <ul>
            <li v-for="region in regions" :key="region.name" class="px-4 py-2 border-b">
              <span class="font-semibold">{{ region.name }}</span>
              <ul v-if="region.leagues" class="pl-4">
                <li
                  v-for="l in region.leagues"
                  :key="l"
                  class="py-1 hover:underline cursor-pointer text-blue-700"
                >
                  {{ l }}
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </aside>

      <div class="flex-1">

        <div class="flex justify-between mb-4 overflow-x-auto">
          <button
            v-for="(d, idx) in dates"
            :key="d.label"
            class="px-4 py-2 rounded-t font-semibold border-b-4"
            :class="
              idx === 0
                ? 'bg-blue-600 text-white border-blue-700'
                : 'bg-gray-100 text-gray-700 border-transparent hover:bg-blue-50'
            "
          >
            {{ d.label }}<br /><span class="text-xs font-normal">{{ d.sub }}</span>
          </button>
          <button
            class="px-4 py-2 rounded-t bg-gray-200 text-gray-700 font-semibold border-b-4 border-transparent"
          >
            Chọn ngày
          </button>
        </div>

        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
          <h2 class="text-2xl font-bold text-blue-700">Lịch bóng đá hôm nay, rạng sáng mai</h2>
          <div class="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Tìm kiếm trận đấu, giải đấu hôm nay, ngày mai"
              class="w-full border border-blue-300 rounded px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <svg
              class="absolute left-3 top-3 w-5 h-5 text-blue-400"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </div>
        </div>

        <div class="flex gap-2 mb-2">
          <button class="px-4 py-2 rounded bg-blue-600 text-white font-semibold">Tất cả</button>
          <button
            class="px-4 py-2 rounded bg-blue-100 text-blue-700 font-semibold flex items-center gap-1"
          >
            HOT <span>⚡</span>
          </button>
          <button class="px-4 py-2 rounded bg-blue-100 text-blue-700 font-semibold">
            Vừa diễn ra
          </button>
          <button class="px-4 py-2 rounded bg-blue-100 text-blue-700 font-semibold">
            Đang diễn ra
          </button>
          <button class="px-4 py-2 rounded bg-blue-100 text-blue-700 font-semibold">
            Sắp diễn ra
          </button>
        </div>

        <div class="bg-white rounded-lg shadow">
          <div class="flex items-center justify-between px-4 py-2 border-b bg-gray-50">
            <span class="font-semibold">Lịch thi đấu Premier League</span>
            <div class="flex gap-4 text-blue-700 font-semibold text-sm">
              <span class="cursor-pointer">LTĐ</span>
              <span class="cursor-pointer">KQ</span>
              <span class="cursor-pointer">BXH</span>
            </div>
          </div>
          <div>
            <div
              v-for="match in matches"
              :key="match.id"
              class="flex items-center px-4 py-3 border-b hover:bg-blue-50"
            >
              <span class="w-28 text-gray-500 text-center text-sm">{{ match.time }}</span>
              <span class="w-20 text-gray-500 text-center text-xs">{{ match.stage }}</span>
              <span class="flex-1 grid grid-cols-5 items-center">
                <div class="col-span-2 flex items-center gap-2 justify-center min-w-0">
                  <img :src="match.homeLogo" alt="home" class="w-6 h-6 object-contain" />
                  <span class="font-semibold truncate">{{ match.home }}</span>
                </div>
                <div class="col-span-1 flex justify-start">
                  <span class="bg-blue-600 text-white px-4 py-1 rounded font-bold">vs</span>
                </div>
                <div class="col-span-2 flex items-center gap-2 justify-start min-w-0">
                  <span class="font-semibold truncate">{{ match.away }}</span>
                  <img :src="match.awayLogo" alt="away" class="w-6 h-6 object-contain" />
                </div>
              </span>
              <span class="w-12 text-xs text-blue-700 font-bold text-center">ND</span>
              <svg
                class="w-5 h-5 text-blue-400 ml-2"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const topLeagues = [
  'Premier League',
  'V-League',
  'Champions League',
  'Europa League',
  'La Liga',
  'Serie A',
  'Bundesliga',
  'Ligue 1',
]

const regions = [
  { name: 'Anh', leagues: ['Premier League', 'Championship'] },
  { name: 'Việt Nam', leagues: ['V-League', 'Hạng Nhất'] },
  { name: 'Đức', leagues: ['Bundesliga', 'Bundesliga 2'] },
]

const dates = [
  { label: 'Hôm nay', sub: 'Thứ 6' },
  { label: 'Ngày mai', sub: 'Thứ 7' },
  { label: '10/08', sub: 'CN' },
  { label: '11/08', sub: 'Thứ 2' },
  { label: '12/08', sub: 'Thứ 3' },
  { label: '13/08', sub: 'Thứ 4' },
  { label: '14/08', sub: 'Thứ 5' },
]

const matches = [
  {
    id: 1,
    time: '00:00 - 08/08',
    stage: 'V.Loại',
    home: 'Arsernal',
    homeLogo: '/public/Arsenal.svg',
    homeScore: 0,
    awayScore: 2,
    away: 'Manchester City',
    awayLogo: '/public/Manchester_City.svg',
  },
  {
    id: 2,
    time: '00:30 - 08/08',
    stage: 'V.Loại',
    home: 'Sheffield United',
    homeLogo: '/public/Sheffield.png',
    homeScore: 0,
    awayScore: 0,
    away: 'Nottingham Forest',
    awayLogo: '/public/Nottingham_Forest.webp',
  },
  {
    id: 3,
    time: '01:00 - 08/08',
    stage: 'V.Loại',
    home: 'Manchester United',
    homeLogo: '/public/Manchester_United.svg',
    homeScore: 1,
    awayScore: 1,
    away: 'Liverpool',
    awayLogo: '/public/Liverpool.svg',
  },
  {
    id: 4,
    time: '01:00 - 08/08',
    stage: 'V.Loại',
    home: 'Leicester City',
    homeLogo: '/public/Leicester_City.webp',
    homeScore: 0,
    awayScore: 0,
    away: 'Southampton',
    awayLogo: '/public/Southampton.svg',
  },
]
</script>
