import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import LoginForm from '@/components/LoginForm.vue'
import PostDetail from '@/views/PostDetail.vue'
import SchedulePage from '@/views/SchedulePage.vue'
import ProfilePage from '@/views/ProfilePage.vue'
import SearchResult from '@/views/SearchResultsPage.vue'

// Admin views (lazy load)
const AdminLayout = () => import('@/views/admin/AdminLayout.vue')
const AdminHome = () => import('@/views/admin/AdminHome.vue')
const AdminPosts = () => import('@/views/admin/AdminPosts.vue')
const AdminLeagues = () => import('@/views/admin/AdminLeagues.vue')
const AdminClubs = () => import('@/views/admin/AdminClubs.vue')
const AdminUsers = () => import('@/views/admin/AdminUsers.vue')
const AdminComments = () => import('@/views/admin/AdminComments.vue')
const AdminPlayers = () => import('@/views/admin/AdminPlayers.vue')
// const AdminMatches = () => import('@/views/admin/AdminMatches.vue')
// const AdminSettings = () => import('@/views/admin/AdminSettings.vue')

const routes = [
  { path: '/', name: 'home', component: HomePage },
  { path: '/login', name: 'login', component: LoginForm },
  { path: '/post/:slug', name: 'postDetail', component: PostDetail },
  { path: '/schedule', name: 'schedule', component: SchedulePage },
  {path: '/profile', name: 'profile', component: ProfilePage },
  {path: '/posts', name: 'posts', component: SearchResult },
  { path: '/league/:slug', name: 'homeLeague', component: HomePage, props: true },

  {
    path: '/admin',
    component: AdminLayout,
    children: [
      { path: '', name: 'adminHome', component: AdminHome },
      { path: 'posts', name: 'adminPosts', component: AdminPosts },
      { path: 'users', name: 'adminUsers', component: AdminUsers },
      { path: 'leagues', name: 'adminLeagues', component: AdminLeagues },
      { path: 'clubs', name: 'adminClubs', component: AdminClubs },
      { path: 'comments', name: 'adminComments', component: AdminComments },
      { path: 'players', name: 'adminPlayers', component: AdminPlayers },
      // { path: 'matches', name: 'adminMatches', component: AdminMatches },
      // { path: 'settings', name: 'adminSettings', component: AdminSettings }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
