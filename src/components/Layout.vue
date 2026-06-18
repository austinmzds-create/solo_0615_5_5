<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="sidebar-logo">
        <div class="logo-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <span class="logo-text">园区运营工作台</span>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/" class="nav-item" :class="{ active: route.path === '/' }">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
          </svg>
          <span>工作台</span>
        </router-link>
        <router-link to="/buildings" class="nav-item" :class="{ active: route.path === '/buildings' }">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 21h18M5 21V7l8-4v18M13 21V3l6 4v14M9 9v.01M9 12v.01M9 15v.01M9 18v.01" />
          </svg>
          <span>楼宇房源</span>
        </router-link>
        <router-link to="/tenants" class="nav-item" :class="{ active: route.path === '/tenants' }">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
          </svg>
          <span>企业租户</span>
        </router-link>
        <router-link to="/visitors" class="nav-item" :class="{ active: route.path === '/visitors' }">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
          </svg>
          <span>访客预约</span>
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">管</div>
          <div class="user-detail">
            <div class="user-name">园区管理员</div>
            <div class="user-role">运营管理</div>
          </div>
        </div>
      </div>
    </aside>
    <div class="main-area">
      <header class="topbar">
        <div class="topbar-left">
          <h1 class="page-title">{{ pageTitle }}</h1>
        </div>
        <div class="topbar-right">
          <span class="date-display">{{ currentDate }}</span>
          <el-badge :value="unhandledCount" :hidden="unhandledCount === 0" class="todo-badge">
            <el-icon :size="20"><Bell /></el-icon>
          </el-badge>
        </div>
      </header>
      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Bell } from '@element-plus/icons-vue'
import { store } from '../mock/data'

const route = useRoute()

const pageTitle = computed(() => {
  const map: Record<string, string> = {
    '/': '工作台',
    '/buildings': '楼宇房源管理',
    '/tenants': '企业租户管理',
    '/visitors': '访客预约管理',
  }
  return map[route.path] || '工作台'
})

const unhandledCount = computed(() => store.todos.filter(t => !t.handled).length)

const currentDate = computed(() => {
  const d = new Date()
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 周${weekdays[d.getDay()]}`
})
</script>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
  background: #f0f2f5;
}

.sidebar {
  width: 220px;
  background: linear-gradient(180deg, #1a1f36 0%, #0f1225 100%);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.logo-icon {
  color: #60a5fa;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: rgba(96, 165, 250, 0.12);
  border-radius: 8px;
}

.logo-text {
  color: #e2e8f0;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.sidebar-nav {
  flex: 1;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  color: #94a3b8;
  text-decoration: none;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}

.nav-item:hover {
  color: #e2e8f0;
  background: rgba(255, 255, 255, 0.06);
}

.nav-item.active {
  color: #fff;
  background: rgba(96, 165, 250, 0.15);
  font-weight: 500;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #60a5fa, #818cf8);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
}

.user-detail {
  flex: 1;
}

.user-name {
  color: #e2e8f0;
  font-size: 13px;
  font-weight: 500;
}

.user-role {
  color: #64748b;
  font-size: 11px;
}

.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.topbar {
  height: 56px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  flex-shrink: 0;
}

.page-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.date-display {
  font-size: 13px;
  color: #64748b;
}

.todo-badge {
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #64748b;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
}
</style>
