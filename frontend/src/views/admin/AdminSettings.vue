<template>
  <div class="p-6">
    <a-breadcrumb class="mb-6">
      <a-breadcrumb-item>Admin</a-breadcrumb-item>
      <a-breadcrumb-item>Settings</a-breadcrumb-item>
    </a-breadcrumb>
    <div class="flex items-center gap-3 mb-6">
      <i class="ri-settings-3-line text-2xl text-blue-600"></i>
      <h1 class="text-2xl font-bold text-blue-700">Cài đặt hệ thống</h1>
    </div>
    <div class="bg-white rounded-xl shadow p-8 min-h-[300px]">
      <div class="mb-6">
        <label class="block font-semibold mb-2 text-blue-700">Chế độ hiển thị</label>
        <a-switch checked-children="Dark" un-checked-children="Light" />
      </div>
      <div class="mb-6">
        <label class="block font-semibold mb-2 text-blue-700">Ngôn ngữ</label>
        <a-select default-value="vi" style="width: 120px">
          <a-select-option value="vi">Tiếng Việt</a-select-option>
          <a-select-option value="en">English</a-select-option>
        </a-select>
      </div>
      <div>
        <a-button type="primary" class="bg-blue-600 border-blue-600">Lưu thay đổi</a-button>
      </div>
    </div>
  </div>
</template>