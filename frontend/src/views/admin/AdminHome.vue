<template>
  <div class="p-6">
    <a-breadcrumb class="mb-6">
      <a-breadcrumb-item>Admin</a-breadcrumb-item>
      <a-breadcrumb-item>Dashboard</a-breadcrumb-item>
    </a-breadcrumb>
    <h1 class="text-2xl font-bold mb-6 text-blue-700">Dashboard</h1>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow p-5 flex items-center gap-4">
        <div class="bg-blue-100 text-blue-600 rounded-full p-3">
          <i class="ri-file-list-2-line text-2xl"></i>
        </div>
        <div>
          <div class="text-3xl font-bold">128</div>
          <div class="text-gray-500">Posts</div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow p-5 flex items-center gap-4">
        <div class="bg-green-100 text-green-600 rounded-full p-3">
          <i class="ri-user-3-line text-2xl"></i>
        </div>
        <div>
          <div class="text-3xl font-bold">56</div>
          <div class="text-gray-500">Users</div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow p-5 flex items-center gap-4">
        <div class="bg-yellow-100 text-yellow-600 rounded-full p-3">
          <i class="ri-football-line text-2xl"></i>
        </div>
        <div>
          <div class="text-3xl font-bold">34</div>
          <div class="text-gray-500">Leagues</div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow p-5 flex items-center gap-4">
        <div class="bg-red-100 text-red-600 rounded-full p-3">
          <i class="ri-team-line text-2xl"></i>
        </div>
        <div>
          <div class="text-3xl font-bold">20</div>
          <div class="text-gray-500">Clubs</div>
        </div>
      </div>
    </div>
    <div class="bg-white rounded-lg shadow p-8 flex flex-col items-center justify-center min-h-[200px]">
      <span class="text-gray-400 text-lg">Welcome to the Football News Admin Dashboard!</span>
    </div>
  </div>
</template>

<script setup>
// No logic needed for static dashboard
</script>