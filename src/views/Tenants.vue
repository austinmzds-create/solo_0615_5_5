<template>
  <div class="tenants-page">
    <div class="page-stats">
      <div class="mini-stat">
        <div class="mini-stat-val">{{ store.tenants.length }}</div>
        <div class="mini-stat-label">企业总数</div>
      </div>
      <div class="mini-stat">
        <div class="mini-stat-val">{{ store.tenants.filter(t => t.status === '在租').length }}</div>
        <div class="mini-stat-label">在租企业</div>
      </div>
      <div class="mini-stat">
        <div class="mini-stat-val">{{ store.tenants.filter(t => t.status === '即将到期').length }}</div>
        <div class="mini-stat-label">即将到期</div>
      </div>
      <div class="mini-stat">
        <div class="mini-stat-val">{{ store.tenants.filter(t => t.status === '已退租').length }}</div>
        <div class="mini-stat-label">已退租</div>
      </div>
      <div class="mini-stat">
        <div class="mini-stat-val">{{ industryCount }}</div>
        <div class="mini-stat-label">行业分布</div>
      </div>
    </div>

    <div class="section-card">
      <div class="section-header">
        <h3 class="section-title">企业租户列表</h3>
        <div class="header-actions">
          <el-input v-model="searchKey" placeholder="搜索企业名称" clearable style="width: 200px; margin-right: 12px" />
          <el-button type="primary" @click="openDialog()">新增租户</el-button>
        </div>
      </div>
      <el-table :data="filteredTenants" stripe style="width: 100%">
        <el-table-column prop="id" label="编号" width="70" />
        <el-table-column prop="name" label="企业名称" min-width="160" />
        <el-table-column prop="industry" label="行业" width="100" />
        <el-table-column prop="contactPerson" label="联系人" width="90" />
        <el-table-column prop="contactPhone" label="联系电话" width="130" />
        <el-table-column label="入驻房源" min-width="140">
          <template #default="{ row }">
            {{ getRoomLabel(row.roomId) }}
          </template>
        </el-table-column>
        <el-table-column label="租期" min-width="180">
          <template #default="{ row }">
            {{ row.leaseStart }} ~ {{ row.leaseEnd }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="tenantStatusType(row.status)" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center">
          <template #default="{ row }">
            <el-button type="primary" text size="small" @click="openDialog(row)">编辑</el-button>
            <el-button v-if="row.status === '在租' || row.status === '即将到期'" type="warning" text size="small" @click="openRenewDialog(row)">续租</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="section-card">
      <div class="section-header">
        <h3 class="section-title">行业分布统计</h3>
      </div>
      <div class="industry-chart">
        <div v-for="item in industryStats" :key="item.name" class="industry-row">
          <span class="industry-name">{{ item.name }}</span>
          <div class="industry-bar-wrap">
            <div class="industry-bar" :style="{ width: item.percent + '%', background: item.color }"></div>
          </div>
          <span class="industry-count">{{ item.count }}家</span>
          <span class="industry-percent">{{ item.percent }}%</span>
        </div>
      </div>
    </div>

    <el-dialog v-model="dialogVisible" :title="editingTenant ? '编辑租户' : '新增租户'" width="520" destroy-on-close>
      <el-form :model="form" label-width="80px" label-position="left">
        <el-form-item label="企业名称">
          <el-input v-model="form.name" placeholder="请输入企业名称" />
        </el-form-item>
        <el-form-item label="行业">
          <el-select v-model="form.industry" placeholder="请选择行业" style="width: 100%">
            <el-option v-for="ind in industries" :key="ind" :label="ind" :value="ind" />
          </el-select>
        </el-form-item>
        <el-form-item label="联系人">
          <el-input v-model="form.contactPerson" placeholder="请输入联系人" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="form.contactPhone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="入驻房源">
          <el-select v-model="form.roomId" placeholder="请选择房源" style="width: 100%" filterable>
            <el-option v-for="r in vacantRooms" :key="r.id" :label="getRoomLabel(r.id)" :value="r.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="租约起始">
          <el-date-picker v-model="form.leaseStart" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" style="width: 100%" />
        </el-form-item>
        <el-form-item label="租约结束">
          <el-date-picker v-model="form.leaseEnd" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" style="width: 100%">
            <el-option label="在租" value="在租" />
            <el-option label="即将到期" value="即将到期" />
            <el-option label="已退租" value="已退租" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTenant">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="renewDialogVisible" title="续租" width="440" destroy-on-close>
      <div style="margin-bottom: 16px; font-size: 14px; color: #1e293b">
        <strong>{{ renewTarget?.name }}</strong> 当前租期至 <strong>{{ renewTarget?.leaseEnd }}</strong>
      </div>
      <el-form label-width="90px" label-position="left">
        <el-form-item label="新租约结束日">
          <el-date-picker
            v-model="renewDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择新的租约结束日期"
            style="width: 100%"
            :disabled-date="(d: Date) => d <= new Date(renewTarget!.leaseEnd)"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="renewDialogVisible = false">取消</el-button>
        <el-button type="primary" :disabled="!renewDate" @click="saveRenew">确认续租</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { store, addTenant, updateTenant, renewTenant, getRoomById, getBuildingById } from '../mock/data'
import type { Tenant } from '../mock/data'

const searchKey = ref('')
const dialogVisible = ref(false)
const editingTenant = ref<Tenant | null>(null)
const renewDialogVisible = ref(false)
const renewTarget = ref<Tenant | null>(null)
const renewDate = ref('')

const industries = ['软件开发', '大数据', '人工智能', '光电技术', '环保科技', '在线教育', '半导体', '机器人', '生物科技', '数字传媒', '其他']

const form = reactive({
  name: '',
  contactPerson: '',
  contactPhone: '',
  industry: '',
  leaseStart: '',
  leaseEnd: '',
  roomId: '',
  status: '在租' as Tenant['status'],
})

const filteredTenants = computed(() => {
  if (!searchKey.value) return store.tenants
  const key = searchKey.value.toLowerCase()
  return store.tenants.filter(t => t.name.toLowerCase().includes(key))
})

const industryCount = computed(() => new Set(store.tenants.map(t => t.industry)).size)

const industryColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1']

const industryStats = computed(() => {
  const map: Record<string, number> = {}
  store.tenants.forEach(t => { map[t.industry] = (map[t.industry] || 0) + 1 })
  const total = store.tenants.length
  return Object.entries(map)
    .map(([name, count], i) => ({ name, count, percent: total ? Math.round((count / total) * 100) : 0, color: industryColors[i % industryColors.length] }))
    .sort((a, b) => b.count - a.count)
})

const vacantRooms = computed(() => {
  const rooms = store.rooms.filter(r => r.status === '空闲')
  if (editingTenant.value) {
    const currentRoom = store.rooms.find(r => r.id === editingTenant.value!.roomId)
    if (currentRoom) rooms.push(currentRoom)
  }
  return rooms
})

function tenantStatusType(status: string) {
  const map: Record<string, string> = { '在租': 'success', '即将到期': 'warning', '已退租': 'info' }
  return map[status] || 'info'
}

function getRoomLabel(roomId: string) {
  const room = getRoomById(roomId)
  if (!room) return '-'
  const building = getBuildingById(room.buildingId)
  return `${building?.name ?? ''} ${room.roomNumber}`
}

function openDialog(tenant?: Tenant) {
  editingTenant.value = tenant || null
  if (tenant) {
    Object.assign(form, { name: tenant.name, contactPerson: tenant.contactPerson, contactPhone: tenant.contactPhone, industry: tenant.industry, leaseStart: tenant.leaseStart, leaseEnd: tenant.leaseEnd, roomId: tenant.roomId, status: tenant.status })
  } else {
    Object.assign(form, { name: '', contactPerson: '', contactPhone: '', industry: '', leaseStart: '', leaseEnd: '', roomId: '', status: '在租' as Tenant['status'] })
  }
  dialogVisible.value = true
}

function saveTenant() {
  if (editingTenant.value) {
    updateTenant(editingTenant.value.id, { ...form })
  } else {
    addTenant({ ...form })
  }
  dialogVisible.value = false
}

function openRenewDialog(tenant: Tenant) {
  renewTarget.value = tenant
  renewDate.value = ''
  renewDialogVisible.value = true
}

function saveRenew() {
  if (!renewTarget.value || !renewDate.value) return
  renewTenant(renewTarget.value.id, renewDate.value)
  renewDialogVisible.value = false
}
</script>

<style scoped>
.tenants-page {
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

.industry-chart {
  padding: 16px 20px;
}

.industry-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f8fafc;
}

.industry-row:last-child {
  border-bottom: none;
}

.industry-name {
  width: 80px;
  font-size: 13px;
  color: #1e293b;
  font-weight: 500;
}

.industry-bar-wrap {
  flex: 1;
  height: 8px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
}

.industry-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.4s ease;
}

.industry-count {
  font-size: 12px;
  color: #64748b;
  width: 36px;
  text-align: right;
}

.industry-percent {
  font-size: 12px;
  color: #94a3b8;
  width: 36px;
  text-align: right;
}
</style>
