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
        {{ activeTab === 'login' ? 'Login' : 'Register' }}
      </h2>
      <p class="text-gray-500 text-sm">
        {{ activeTab === 'login' ? 'Welcome back!' : 'Create a new account to experience.' }}
      </p>
    </div>
    <a-tabs v-model:activeKey="activeTab" centered>
      <a-tab-pane key="login" tab="Login">
        <div class="tab-content-min-h">
          <a-form layout="vertical" @finish="onLogin" :model="loginForm" autocomplete="off">
            <a-form-item label="Username" name="username" :rules="[{ required: true, message: 'Please enter username' }]">
              <a-input v-model:value="loginForm.username" size="large" placeholder="Enter username" />
            </a-form-item>
            <a-form-item label="Password" name="password" :rules="[{ required: true, message: 'Please enter password' }]">
              <a-input-password v-model:value="loginForm.password" size="large" placeholder="Enter password" />
            </a-form-item>
            <a-button
              type="primary"
              html-type="submit"
              :loading="isLoginLoading"
              size="large"
              block
              class="bg-blue-600 border-blue-600 hover:bg-blue-700 hover:border-blue-700"
            >
              Login
            </a-button>
          </a-form>
          <div class="text-center mt-4">
            <span class="text-gray-500 text-sm">Do not have an account?</span>
            <a @click="activeTab = 'register'" class="text-blue-600 hover:underline ml-1 text-sm cursor-pointer">Register</a>
          </div>
        </div>
      </a-tab-pane>
      <a-tab-pane key="register" tab="Register">
        <div class="tab-content-min-h">
          <a-form layout="vertical" @finish="onRegister" :model="registerForm" autocomplete="off">
            <a-form-item label="Username" name="username" :rules="[{ required: true, message: 'Please enter username' }]">
              <a-input v-model:value="registerForm.username" size="large" placeholder="Enter username" />
            </a-form-item>
            <a-form-item label="Email" name="email" :rules="[{ required: true, message: 'Please enter email' }]">
              <a-input v-model:value="registerForm.email" size="large" placeholder="Enter email" />
            </a-form-item>
            <a-form-item label="Password" name="password" :rules="[{ required: true, message: 'Please enter password' }]">
              <a-input-password v-model:value="registerForm.password" size="large" placeholder="Enter password" />
            </a-form-item>
            <a-form-item label="Confirm Password" name="confirm" :rules="[{ required: true, message: 'Please confirm password' }, { validator: validateConfirm }]">
              <a-input-password v-model:value="registerForm.confirm" size="large" placeholder="Confirm password" />
            </a-form-item>
            <a-button
              type="primary"
              html-type="submit"
              :loading="isRegisterLoading"
              size="large"
              block
              class="bg-blue-600 border-blue-600 hover:bg-blue-700 hover:border-blue-700"
            >
              Register
            </a-button>
          </a-form>
          <div class="text-center mt-4">
            <span class="text-gray-500 text-sm">Already have an account?</span>
            <a @click="activeTab = 'login'" class="text-blue-600 hover:underline ml-1 text-sm cursor-pointer">Login</a>
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
    message.success('Login successful!')
    visible.value = false
  },
  onError: (err) => {
    message.error(err?.response?.data?.message || 'Login failed')
  }
})

const { mutate: registerMutate, isLoading: isRegisterLoading } = useMutation({
  mutationFn: usersService.register,
  onSuccess: () => {
    message.success('Registration successful! Please login')
    activeTab.value = 'login'
  },
  onError: (err) => {
    message.error(err?.response?.data?.message || 'Registration failed')
  }
})

const validateConfirm = async (_rule, value) => {
  if (!value) return Promise.reject('Please confirm password')
  if (value !== registerForm.password) return Promise.reject('Password confirmation does not match')
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
