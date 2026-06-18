<template>
  <div class="dashboard">
    <div class="stat-cards">
      <div class="stat-card" style="--accent: #3b82f6">
        <div class="stat-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 21h18M5 21V7l8-4v18M13 21V3l6 4v14M9 9v.01M9 12v.01M9 15v.01M9 18v.01" />
          </svg>
        </div>
        <div class="stat-body">
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">总房源</div>
        </div>
        <div class="stat-detail">{{ stats.rented }}已租 · {{ stats.vacant }}空闲 · {{ stats.decorating }}装修</div>
      </div>
      <div class="stat-card" style="--accent: #10b981">
        <div class="stat-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>
        <div class="stat-body">
          <div class="stat-value">{{ stats.rate }}%</div>
          <div class="stat-label">出租率</div>
        </div>
        <div class="stat-detail">已租面积 {{ stats.rentedArea }}㎡ / 总 {{ stats.totalArea }}㎡</div>
      </div>
      <div class="stat-card" style="--accent: #8b5cf6">
        <div class="stat-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
          </svg>
        </div>
        <div class="stat-body">
          <div class="stat-value">{{ tenantCount }}</div>
          <div class="stat-label">在租企业</div>
        </div>
        <div class="stat-detail">{{ expiringCount }}家租约即将到期</div>
      </div>
      <div class="stat-card" style="--accent: #f59e0b">
        <div class="stat-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
          </svg>
        </div>
        <div class="stat-body">
          <div class="stat-value">{{ pendingVisitors }}</div>
          <div class="stat-label">待审核访客</div>
        </div>
        <div class="stat-detail">今日 {{ todayVisitors }} 条预约</div>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="panel todo-panel">
        <div class="panel-header">
          <h3 class="panel-title">待办事项</h3>
          <span class="panel-badge">{{ unhandledTodos.length }} 项待处理</span>
        </div>
        <div class="panel-body">
          <div v-if="unhandledTodos.length === 0" class="empty-state">暂无待办事项</div>
          <div v-for="item in unhandledTodos" :key="item.id" class="todo-item" :class="'todo-' + item.type">
            <div class="todo-indicator"></div>
            <div class="todo-content">
              <div class="todo-title">{{ item.title }}</div>
              <div class="todo-desc">{{ item.description }}</div>
            </div>
            <div class="todo-actions">
              <el-tag :type="typeTagMap[item.type]" size="small">{{ typeLabelMap[item.type] }}</el-tag>
              <el-button size="small" type="primary" text @click="onHandleTodo(item)">处理</el-button>
            </div>
          </div>
        </div>
      </div>

      <div class="panel occupancy-panel">
        <div class="panel-header">
          <h3 class="panel-title">楼宇占用概览</h3>
        </div>
        <div class="panel-body">
          <div v-for="b in store.buildings" :key="b.id" class="building-row">
            <div class="building-info">
              <span class="building-name">{{ b.name }}</span>
              <span class="building-addr">{{ b.address }}</span>
            </div>
            <div class="building-bar-wrap">
              <div class="building-bar">
                <div class="building-bar-fill" :style="{ width: getOcc(b.id).rate + '%' }"></div>
              </div>
              <span class="building-rate">{{ getOcc(b.id).rate }}%</span>
            </div>
            <div class="building-detail">
              <span class="detail-item">{{ getOcc(b.id).rented }}已租</span>
              <span class="detail-item">{{ getOcc(b.id).vacant }}空闲</span>
              <span class="detail-item">共{{ b.totalRooms }}间</span>
            </div>
          </div>
        </div>
      </div>

      <div class="panel visitor-panel">
        <div class="panel-header">
          <h3 class="panel-title">今日访客动态</h3>
        </div>
        <div class="panel-body">
          <div v-if="todayVisitorList.length === 0" class="empty-state">今日暂无访客预约</div>
          <div v-for="v in todayVisitorList" :key="v.id" class="visitor-item">
            <div class="visitor-avatar">{{ v.visitorName[0] }}</div>
            <div class="visitor-content">
              <div class="visitor-top">
                <span class="visitor-name">{{ v.visitorName }}</span>
                <el-tag :type="visitorStatusType(v.status)" size="small">{{ v.status }}</el-tag>
              </div>
              <div class="visitor-detail">{{ v.visitorCompany }} · {{ v.purpose }} · {{ v.appointmentTime }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="panel lease-panel">
        <div class="panel-header">
          <h3 class="panel-title">租约到期提醒</h3>
        </div>
        <div class="panel-body">
          <div v-if="expiringTenants.length === 0" class="empty-state">暂无即将到期租约</div>
          <div v-for="t in expiringTenants" :key="t.id" class="lease-item">
            <div class="lease-left">
              <div class="lease-name">{{ t.name }}</div>
              <div class="lease-room">{{ getRoomLabel(t.roomId) }}</div>
            </div>
            <div class="lease-right">
              <div class="lease-date">到期日：{{ t.leaseEnd }}</div>
              <el-tag type="warning" size="small">即将到期</el-tag>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { store, getOccupancyStats, getBuildingOccupancy, getRoomById, getBuildingById, handleTodo } from '../mock/data'
import type { TodoItem } from '../mock/data'

const router = useRouter()

const stats = computed(() => getOccupancyStats())

const tenantCount = computed(() => store.tenants.filter(t => t.status !== '已退租').length)
const expiringCount = computed(() => store.tenants.filter(t => t.status === '即将到期').length)
const expiringTenants = computed(() => store.tenants.filter(t => t.status === '即将到期'))
const pendingVisitors = computed(() => store.visitors.filter(v => v.status === '待审核').length)

const todayStr = new Date().toISOString().slice(0, 10)
const todayVisitors = computed(() => store.visitors.filter(v => v.appointmentDate === todayStr).length)
const todayVisitorList = computed(() => store.visitors.filter(v => v.appointmentDate === todayStr))

const unhandledTodos = computed(() => store.todos.filter(t => !t.handled))

const typeLabelMap: Record<string, string> = { lease: '租约', visitor: '访客', room: '房间', tenant: '租户' }
const typeTagMap: Record<string, string> = { lease: 'warning', visitor: 'danger', room: 'info', tenant: 'success' }

function getOcc(buildingId: string) {
  return getBuildingOccupancy(buildingId)
}

function getRoomLabel(roomId: string) {
  const room = getRoomById(roomId)
  if (!room) return ''
  const building = getBuildingById(room.buildingId)
  return `${building?.name ?? ''} ${room.roomNumber}`
}

function visitorStatusType(status: string) {
  const map: Record<string, string> = { '待审核': 'warning', '已通过': 'success', '已拒绝': 'danger', '已完成': 'info' }
  return map[status] || 'info'
}

function onHandleTodo(item: TodoItem) {
  handleTodo(item.id)
  if (item.type === 'visitor') {
    router.push('/visitors')
  } else if (item.type === 'lease' || item.type === 'tenant') {
    router.push('/tenants')
  } else {
    router.push('/buildings')
  }
}
</script>

<style scoped>
.dashboard {
  max-width: 1400px;
}

.stat-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #f1f5f9;
  position: relative;
  overflow: hidden;
}

.stat-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: var(--accent);
  border-radius: 0 2px 2px 0;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--accent) 10%, transparent);
  color: var(--accent);
  margin-bottom: 12px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
  margin-top: 2px;
}

.stat-detail {
  margin-top: 12px;
  font-size: 12px;
  color: #94a3b8;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.panel {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f8fafc;
}

.panel-title {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}

.panel-badge {
  font-size: 12px;
  color: #ef4444;
  background: #fef2f2;
  padding: 2px 8px;
  border-radius: 10px;
}

.panel-body {
  padding: 12px 20px;
  max-height: 340px;
  overflow-y: auto;
}

.empty-state {
  text-align: center;
  padding: 24px;
  color: #94a3b8;
  font-size: 13px;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #f8fafc;
}

.todo-item:last-child {
  border-bottom: none;
}

.todo-indicator {
  width: 4px;
  height: 36px;
  border-radius: 2px;
  flex-shrink: 0;
}

.todo-lease .todo-indicator { background: #f59e0b; }
.todo-visitor .todo-indicator { background: #ef4444; }
.todo-room .todo-indicator { background: #3b82f6; }
.todo-tenant .todo-indicator { background: #10b981; }

.todo-content {
  flex: 1;
  min-width: 0;
}

.todo-title {
  font-size: 13px;
  font-weight: 500;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.todo-desc {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.todo-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.building-row {
  padding: 10px 0;
  border-bottom: 1px solid #f8fafc;
}

.building-row:last-child {
  border-bottom: none;
}

.building-info {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 6px;
}

.building-name {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
}

.building-addr {
  font-size: 11px;
  color: #94a3b8;
}

.building-bar-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.building-bar {
  flex: 1;
  height: 6px;
  background: #f1f5f9;
  border-radius: 3px;
  overflow: hidden;
}

.building-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  border-radius: 3px;
  transition: width 0.4s ease;
}

.building-rate {
  font-size: 12px;
  font-weight: 600;
  color: #3b82f6;
  width: 36px;
  text-align: right;
}

.building-detail {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: #94a3b8;
}

.visitor-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #f8fafc;
}

.visitor-item:last-child {
  border-bottom: none;
}

.visitor-avatar {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: linear-gradient(135deg, #60a5fa, #818cf8);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
}

.visitor-content {
  flex: 1;
  min-width: 0;
}

.visitor-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;
}

.visitor-name {
  font-size: 13px;
  font-weight: 500;
  color: #1e293b;
}

.visitor-detail {
  font-size: 12px;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lease-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f8fafc;
}

.lease-item:last-child {
  border-bottom: none;
}

.lease-name {
  font-size: 13px;
  font-weight: 500;
  color: #1e293b;
}

.lease-room {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 2px;
}

.lease-right {
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.lease-date {
  font-size: 12px;
  color: #64748b;
}
</style>
