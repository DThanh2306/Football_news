<template>
  <a-modal
    v-model:open="visible"
    :footer="null"
    centered
    width="400px"
    :title="null"
    class="login-modal"
  >
    <div class="flex flex-col items-center mb-6">
      <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="Login" class="w-16 h-16 mb-2" />
      <h2 class="text-2xl font-bold text-blue-700 mb-1">
        {{ activeTab === 'login' ? 'Đăng nhập' : 'Đăng ký' }}
      </h2>
      <p class="text-gray-500 text-sm">
        {{ activeTab === 'login' ? 'Chào mừng bạn quay lại!' : 'Tạo tài khoản mới để trải nghiệm.' }}
      </p>
    </div>
    <a-tabs v-model:activeKey="activeTab" centered>
      <a-tab-pane key="login" tab="Đăng nhập">
        <div class="tab-content-min-h">
          <a-form layout="vertical" @finish="onLogin" :model="loginForm" autocomplete="off">
            <a-form-item label="Tên đăng nhập" name="username" :rules="[{ required: true, message: 'Vui lòng nhập username' }]">
              <a-input v-model:value="loginForm.username" size="large" placeholder="Nhập tên đăng nhập" />
            </a-form-item>
            <a-form-item label="Mật khẩu" name="password" :rules="[{ required: true, message: 'Vui lòng nhập mật khẩu' }]">
              <a-input-password v-model:value="loginForm.password" size="large" placeholder="Nhập mật khẩu" />
            </a-form-item>
            <a-button
              type="primary"
              html-type="submit"
              :loading="isLoginLoading"
              size="large"
              block
              class="bg-blue-600 border-blue-600 hover:bg-blue-700 hover:border-blue-700"
            >
              Đăng nhập
            </a-button>
          </a-form>
          <div class="text-center mt-4">
            <span class="text-gray-500 text-sm">Chưa có tài khoản?</span>
            <a @click="activeTab = 'register'" class="text-blue-600 hover:underline ml-1 text-sm cursor-pointer">Đăng ký</a>
          </div>
        </div>
      </a-tab-pane>
      <a-tab-pane key="register" tab="Đăng ký">
        <div class="tab-content-min-h">
          <a-form layout="vertical" @finish="onRegister" :model="registerForm" autocomplete="off">
            <a-form-item label="Tên đăng nhập" name="username" :rules="[{ required: true, message: 'Vui lòng nhập username' }]">
              <a-input v-model:value="registerForm.username" size="large" placeholder="Nhập tên đăng nhập" />
            </a-form-item>
            <a-form-item label="Email" name="email" :rules="[{ required: true, message: 'Vui lòng nhập email' }]">
              <a-input v-model:value="registerForm.email" size="large" placeholder="Nhập email" />
            </a-form-item>
            <a-form-item label="Mật khẩu" name="password" :rules="[{ required: true, message: 'Vui lòng nhập mật khẩu' }]">
              <a-input-password v-model:value="registerForm.password" size="large" placeholder="Nhập mật khẩu" />
            </a-form-item>
            <a-form-item label="Xác nhận mật khẩu" name="confirm" :rules="[{ required: true, message: 'Vui lòng xác nhận mật khẩu' }, { validator: validateConfirm }]">
              <a-input-password v-model:value="registerForm.confirm" size="large" placeholder="Nhập lại mật khẩu" />
            </a-form-item>
            <a-button
              type="primary"
              html-type="submit"
              :loading="isRegisterLoading"
              size="large"
              block
              class="bg-blue-600 border-blue-600 hover:bg-blue-700 hover:border-blue-700"
            >
              Đăng ký
            </a-button>
          </a-form>
          <div class="text-center mt-4">
            <span class="text-gray-500 text-sm">Đã có tài khoản?</span>
            <a @click="activeTab = 'login'" class="text-blue-600 hover:underline ml-1 text-sm cursor-pointer">Đăng nhập</a>
          </div>
        </div>
      </a-tab-pane>
    </a-tabs>
  </a-modal>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useMutation } from '@tanstack/vue-query'
import { message } from 'ant-design-vue'
import { usersService } from '@/services/users.service'
import { useAuthStore } from '@/stores/auth'

const visible = ref(false)
const activeTab = ref('login')
const auth = useAuthStore()

const loginForm = reactive({ username: '', password: '' })
const registerForm = reactive({ username: '', email: '', password: '', confirm: '' })

const { mutate: loginMutate, isLoading: isLoginLoading } = useMutation({
  mutationFn: usersService.login,
  onSuccess: ({ token, user }) => {
    auth.setToken(token)
    auth.setUser(user)
    message.success('Đăng nhập thành công!')
    visible.value = false
  },
  onError: (err) => {
    message.error(err?.response?.data?.message || 'Đăng nhập thất bại')
  }
})

const { mutate: registerMutate, isLoading: isRegisterLoading } = useMutation({
  mutationFn: usersService.register,
  onSuccess: () => {
    message.success('Đăng ký thành công! Vui lòng đăng nhập')
    activeTab.value = 'login'
  },
  onError: (err) => {
    message.error(err?.response?.data?.message || 'Đăng ký thất bại')
  }
})

const validateConfirm = async (_rule, value) => {
  if (!value) return Promise.reject('Vui lòng xác nhận mật khẩu')
  if (value !== registerForm.password) return Promise.reject('Mật khẩu xác nhận không khớp')
  return Promise.resolve()
}

const onLogin = () => {
  loginMutate(loginForm)
}
const onRegister = () => {
  registerMutate(registerForm)
}

defineExpose({
  open: () => {
    visible.value = true
    activeTab.value = 'login'
  }
})
</script>

<style scoped>
.login-modal .ant-modal-content {
  border-radius: 18px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
  padding-top: 0;
}
.login-modal .ant-tabs-nav {
  margin-bottom: 24px;
}
.login-modal .ant-tabs-tab-active .ant-tabs-tab-btn {
  color: #2563eb !important;
}
.tab-content-min-h {
  min-height: 340px; /* Đảm bảo hai tab luôn bằng chiều cao nhau */
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
