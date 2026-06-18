<template>
  <div class="visitors-page">
    <div class="page-stats">
      <div class="mini-stat">
        <div class="mini-stat-val">{{ store.visitors.length }}</div>
        <div class="mini-stat-label">预约总数</div>
      </div>
      <div class="mini-stat">
        <div class="mini-stat-val">{{ store.visitors.filter(v => v.status === '待审核').length }}</div>
        <div class="mini-stat-label">待审核</div>
      </div>
      <div class="mini-stat">
        <div class="mini-stat-val">{{ store.visitors.filter(v => v.status === '已通过').length }}</div>
        <div class="mini-stat-label">已通过</div>
      </div>
      <div class="mini-stat">
        <div class="mini-stat-val">{{ store.visitors.filter(v => v.status === '已完成').length }}</div>
        <div class="mini-stat-label">已完成</div>
      </div>
      <div class="mini-stat">
        <div class="mini-stat-val">{{ store.visitors.filter(v => v.status === '已拒绝').length }}</div>
        <div class="mini-stat-label">已拒绝</div>
      </div>
    </div>

    <div class="section-card">
      <div class="section-header">
        <h3 class="section-title">访客预约列表</h3>
        <div class="header-actions">
          <el-select v-model="statusFilter" placeholder="状态筛选" clearable style="width: 120px; margin-right: 12px">
            <el-option label="待审核" value="待审核" />
            <el-option label="已通过" value="已通过" />
            <el-option label="已拒绝" value="已拒绝" />
            <el-option label="已完成" value="已完成" />
          </el-select>
          <el-button type="primary" @click="openDialog()">新增预约</el-button>
        </div>
      </div>
      <el-table :data="filteredVisitors" stripe style="width: 100%">
        <el-table-column prop="id" label="编号" width="70" />
        <el-table-column prop="visitorName" label="访客姓名" width="90" />
        <el-table-column prop="visitorPhone" label="联系电话" width="130" />
        <el-table-column prop="visitorCompany" label="来访单位" min-width="120" />
        <el-table-column label="拜访企业" min-width="140">
          <template #default="{ row }">
            {{ getTenantName(row.targetTenantId) }}
          </template>
        </el-table-column>
        <el-table-column prop="purpose" label="来访目的" width="100" />
        <el-table-column label="预约时间" min-width="140">
          <template #default="{ row }">
            {{ row.appointmentDate }} {{ row.appointmentTime }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="visitorStatusType(row.status)" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template #default="{ row }">
            <template v-if="row.status === '待审核'">
              <el-button type="success" text size="small" @click="approveVisitor(row)">通过</el-button>
              <el-button type="danger" text size="small" @click="rejectVisitor(row)">拒绝</el-button>
            </template>
            <template v-else-if="row.status === '已通过'">
              <el-button type="primary" text size="small" @click="completeVisitor(row)">完成</el-button>
            </template>
            <template v-else>
              <span class="text-muted">已处理</span>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="section-card">
      <div class="section-header">
        <h3 class="section-title">预约统计</h3>
      </div>
      <div class="stats-grid">
        <div class="stat-block">
          <div class="stat-block-title">近7日预约趋势</div>
          <div class="trend-chart">
            <div v-for="(item, idx) in weekTrend" :key="idx" class="trend-col">
              <div class="trend-bar-wrap">
                <div class="trend-bar" :style="{ height: item.height + '%' }"></div>
              </div>
              <div class="trend-label">{{ item.label }}</div>
            </div>
          </div>
        </div>
        <div class="stat-block">
          <div class="stat-block-title">来访目的分布</div>
          <div class="purpose-list">
            <div v-for="item in purposeStats" :key="item.name" class="purpose-row">
              <span class="purpose-name">{{ item.name }}</span>
              <div class="purpose-bar-wrap">
                <div class="purpose-bar" :style="{ width: item.percent + '%', background: item.color }"></div>
              </div>
              <span class="purpose-count">{{ item.count }}次</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="dialogVisible" title="新增访客预约" width="520" destroy-on-close>
      <el-form :model="form" label-width="80px" label-position="left">
        <el-form-item label="访客姓名">
          <el-input v-model="form.visitorName" placeholder="请输入访客姓名" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="form.visitorPhone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="来访单位">
          <el-input v-model="form.visitorCompany" placeholder="请输入来访单位" />
        </el-form-item>
        <el-form-item label="拜访企业">
          <el-select v-model="form.targetTenantId" placeholder="请选择拜访企业" style="width: 100%" filterable>
            <el-option v-for="t in store.tenants.filter(t => t.status !== '已退租')" :key="t.id" :label="t.name" :value="t.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="来访目的">
          <el-select v-model="form.purpose" placeholder="请选择来访目的" style="width: 100%">
            <el-option v-for="p in purposes" :key="p" :label="p" :value="p" />
          </el-select>
        </el-form-item>
        <el-form-item label="预约日期">
          <el-date-picker v-model="form.appointmentDate" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" style="width: 100%" />
        </el-form-item>
        <el-form-item label="预约时间">
          <el-time-select v-model="form.appointmentTime" start="08:00" step="00:30" end="18:00" placeholder="选择时间" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveVisitor">确认预约</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { store, addVisitor, updateVisitor, getTenantById } from '../mock/data'
import type { VisitorAppointment } from '../mock/data'

const statusFilter = ref('')
const dialogVisible = ref(false)

const purposes = ['商务洽谈', '项目验收', '设备维修', '合同签署', '样品交付', '技术交流', '校招宣讲', '年检审核', '其他']

const form = reactive({
  visitorName: '',
  visitorPhone: '',
  visitorCompany: '',
  targetTenantId: '',
  purpose: '',
  appointmentDate: '',
  appointmentTime: '',
})

const filteredVisitors = computed(() => {
  if (!statusFilter.value) return store.visitors
  return store.visitors.filter(v => v.status === statusFilter.value)
})

const purposeColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316']

const purposeStats = computed(() => {
  const map: Record<string, number> = {}
  store.visitors.forEach(v => { map[v.purpose] = (map[v.purpose] || 0) + 1 })
  const total = store.visitors.length
  return Object.entries(map)
    .map(([name, count], i) => ({ name, count, percent: total ? Math.round((count / total) * 100) : 0, color: purposeColors[i % purposeColors.length] }))
    .sort((a, b) => b.count - a.count)
})

const weekTrend = computed(() => {
  const days: { label: string; count: number; height: number }[] = []
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  const now = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const count = store.visitors.filter(v => v.appointmentDate === dateStr).length
    days.push({ label: `周${weekdays[d.getDay()]}`, count, height: 0 })
  }
  const max = Math.max(...days.map(d => d.count), 1)
  days.forEach(d => { d.height = Math.round((d.count / max) * 100) })
  return days
})

function visitorStatusType(status: string) {
  const map: Record<string, string> = { '待审核': 'warning', '已通过': 'success', '已拒绝': 'danger', '已完成': 'info' }
  return map[status] || 'info'
}

function getTenantName(tenantId: string) {
  return getTenantById(tenantId)?.name ?? '-'
}

function approveVisitor(row: VisitorAppointment) {
  updateVisitor(row.id, { status: '已通过' })
  ElMessage.success(`${row.visitorName}的预约已通过`)
}

function rejectVisitor(row: VisitorAppointment) {
  updateVisitor(row.id, { status: '已拒绝' })
  ElMessage.warning(`${row.visitorName}的预约已拒绝`)
}

function completeVisitor(row: VisitorAppointment) {
  updateVisitor(row.id, { status: '已完成' })
  ElMessage.success(`${row.visitorName}的来访已完成`)
}

function openDialog() {
  Object.assign(form, { visitorName: '', visitorPhone: '', visitorCompany: '', targetTenantId: '', purpose: '', appointmentDate: '', appointmentTime: '' })
  dialogVisible.value = true
}

function saveVisitor() {
  addVisitor({ ...form, status: '待审核' })
  dialogVisible.value = false
  ElMessage.success('访客预约已提交，等待审核')
}
</script>

<style scoped>
.visitors-page {
  max-width: 1400px;
}

.page-stats {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.mini-stat {
  background: #fff;
  border-radius: 10px;
  padding: 16px 20px;
  border: 1px solid #f1f5f9;
  flex: 1;
  text-align: center;
}

.mini-stat-val {
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
}

.mini-stat-label {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

.section-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
  margin-bottom: 16px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f8fafc;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}

.header-actions {
  display: flex;
  align-items: center;
}

.section-card :deep(.el-table) {
  --el-table-border-color: #f1f5f9;
}

.text-muted {
  color: #cbd5e1;
  font-size: 12px;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  padding: 20px;
}

.stat-block-title {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
}

.trend-chart {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 140px;
  padding: 0 4px;
}

.trend-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.trend-bar-wrap {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.trend-bar {
  width: 60%;
  max-width: 32px;
  background: linear-gradient(180deg, #3b82f6, #60a5fa);
  border-radius: 4px 4px 0 0;
  min-height: 4px;
  transition: height 0.4s ease;
}

.trend-label {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 6px;
}

.purpose-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.purpose-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.purpose-name {
  width: 70px;
  font-size: 12px;
  color: #475569;
}

.purpose-bar-wrap {
  flex: 1;
  height: 6px;
  background: #f1f5f9;
  border-radius: 3px;
  overflow: hidden;
}

.purpose-bar {
  height: 100%;
  border-radius: 3px;
  transition: width 0.4s ease;
}

.purpose-count {
  font-size: 12px;
  color: #64748b;
  width: 36px;
  text-align: right;
}
</style>
