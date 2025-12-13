import './assets/style.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'

import App from './App.vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import router from './router'



const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(Antd);
app.use(VueQueryPlugin);

app.mount('#app');