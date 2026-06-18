<template>
  <div class="buildings-page">
    <div class="page-stats">
      <div class="mini-stat">
        <div class="mini-stat-val">{{ store.buildings.length }}</div>
        <div class="mini-stat-label">楼宇总数</div>
      </div>
      <div class="mini-stat">
        <div class="mini-stat-val">{{ store.rooms.length }}</div>
        <div class="mini-stat-label">房源总数</div>
      </div>
      <div class="mini-stat">
        <div class="mini-stat-val">{{ store.rooms.filter(r => r.status === '已租').length }}</div>
        <div class="mini-stat-label">已租房源</div>
      </div>
      <div class="mini-stat">
        <div class="mini-stat-val">{{ store.rooms.filter(r => r.status === '空闲').length }}</div>
        <div class="mini-stat-label">空余房源</div>
      </div>
      <div class="mini-stat">
        <div class="mini-stat-val">{{ occupancyRate }}%</div>
        <div class="mini-stat-label">出租率</div>
      </div>
    </div>

    <div class="section-card">
      <div class="section-header">
        <h3 class="section-title">楼宇列表</h3>
        <el-button type="primary" @click="openBuildingDialog()">新增楼宇</el-button>
      </div>
      <el-table :data="store.buildings" stripe style="width: 100%">
        <el-table-column prop="id" label="编号" width="80" />
        <el-table-column prop="name" label="楼宇名称" min-width="160" />
        <el-table-column prop="floors" label="楼层数" width="80" align="center" />
        <el-table-column prop="totalRooms" label="房间数" width="80" align="center" />
        <el-table-column prop="address" label="地址" min-width="140" />
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === '正常' ? 'success' : 'warning'" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="占用率" width="160" align="center">
          <template #default="{ row }">
            <div class="occ-cell">
              <el-progress :percentage="getBuildingOccupancy(row.id).rate" :stroke-width="6" :show-text="false" />
              <span class="occ-text">{{ getBuildingOccupancy(row.id).rate }}%</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template #default="{ row }">
            <el-button type="primary" text size="small" @click="viewRooms(row)">查看房源</el-button>
            <el-button type="primary" text size="small" @click="openBuildingDialog(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div v-if="selectedBuilding" class="section-card">
      <div class="section-header">
        <h3 class="section-title">{{ selectedBuilding.name }} · 房源列表</h3>
        <el-button type="primary" @click="openRoomDialog()">新增房源</el-button>
      </div>
      <el-table :data="currentRooms" stripe style="width: 100%">
        <el-table-column prop="roomNumber" label="房号" width="100" />
        <el-table-column prop="floor" label="楼层" width="70" align="center" />
        <el-table-column prop="area" label="面积(㎡)" width="100" align="center" />
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="roomStatusType(row.status)" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="租户" min-width="160">
          <template #default="{ row }">
            <span v-if="row.tenantId">{{ getTenantName(row.tenantId) }}</span>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template #default="{ row }">
            <el-button type="primary" text size="small" @click="openRoomDialog(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="buildingDialogVisible" :title="editingBuilding ? '编辑楼宇' : '新增楼宇'" width="480" destroy-on-close>
      <el-form :model="buildingForm" label-width="80px" label-position="left">
        <el-form-item label="楼宇名称">
          <el-input v-model="buildingForm.name" placeholder="请输入楼宇名称" />
        </el-form-item>
        <el-form-item label="楼层数">
          <el-input-number v-model="buildingForm.floors" :min="1" :max="99" />
        </el-form-item>
        <el-form-item label="房间数">
          <el-input-number v-model="buildingForm.totalRooms" :min="1" :max="999" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="buildingForm.address" placeholder="请输入地址" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="buildingForm.status" style="width: 100%">
            <el-option label="正常" value="正常" />
            <el-option label="维护中" value="维护中" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="buildingDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveBuilding">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="roomDialogVisible" :title="editingRoom ? '编辑房源' : '新增房源'" width="480" destroy-on-close>
      <el-form :model="roomForm" label-width="80px" label-position="left">
        <el-form-item label="所属楼宇">
          <el-select v-model="roomForm.buildingId" placeholder="请选择楼宇" style="width: 100%" :disabled="!!editingRoom">
            <el-option v-for="b in store.buildings" :key="b.id" :label="b.name" :value="b.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="楼层">
          <el-input-number v-model="roomForm.floor" :min="1" :max="99" />
        </el-form-item>
        <el-form-item label="房号">
          <el-input v-model="roomForm.roomNumber" placeholder="如 A-101" />
        </el-form-item>
        <el-form-item label="面积(㎡)">
          <el-input-number v-model="roomForm.area" :min="1" :max="9999" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="roomForm.status" style="width: 100%">
            <el-option label="空闲" value="空闲" />
            <el-option label="已租" value="已租" />
            <el-option label="装修中" value="装修中" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="roomDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRoom">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { store, addBuilding, updateBuilding, addRoom, updateRoom, getBuildingOccupancy, getTenantById } from '../mock/data'
import type { Building, Room } from '../mock/data'

const selectedBuilding = ref<Building | null>(null)
const buildingDialogVisible = ref(false)
const roomDialogVisible = ref(false)
const editingBuilding = ref<Building | null>(null)
const editingRoom = ref<Room | null>(null)

const buildingForm = reactive({ name: '', floors: 1, totalRooms: 1, address: '', status: '正常' as const })
const roomForm = reactive({ buildingId: '', floor: 1, roomNumber: '', area: 50, status: '空闲' as Room['status'], tenantId: null as string | null })

const occupancyRate = computed(() => {
  const total = store.rooms.length
  if (!total) return 0
  return Math.round((store.rooms.filter(r => r.status === '已租').length / total) * 100)
})

const currentRooms = computed(() => {
  if (!selectedBuilding.value) return []
  return store.rooms.filter(r => r.buildingId === selectedBuilding.value!.id)
})

function roomStatusType(status: string) {
  const map: Record<string, string> = { '空闲': 'success', '已租': 'primary', '装修中': 'warning' }
  return map[status] || 'info'
}

function getTenantName(tenantId: string) {
  return getTenantById(tenantId)?.name ?? '-'
}

function viewRooms(building: Building) {
  selectedBuilding.value = building
}

function openBuildingDialog(building?: Building) {
  editingBuilding.value = building || null
  if (building) {
    Object.assign(buildingForm, { name: building.name, floors: building.floors, totalRooms: building.totalRooms, address: building.address, status: building.status })
  } else {
    Object.assign(buildingForm, { name: '', floors: 1, totalRooms: 1, address: '', status: '正常' as const })
  }
  buildingDialogVisible.value = true
}

function saveBuilding() {
  if (editingBuilding.value) {
    updateBuilding(editingBuilding.value.id, { ...buildingForm })
  } else {
    addBuilding({ ...buildingForm })
  }
  buildingDialogVisible.value = false
}

function openRoomDialog(room?: Room) {
  editingRoom.value = room || null
  if (room) {
    Object.assign(roomForm, { buildingId: room.buildingId, floor: room.floor, roomNumber: room.roomNumber, area: room.area, status: room.status, tenantId: room.tenantId })
  } else {
    Object.assign(roomForm, { buildingId: selectedBuilding.value?.id ?? '', floor: 1, roomNumber: '', area: 50, status: '空闲' as Room['status'], tenantId: null })
  }
  roomDialogVisible.value = true
}

function saveRoom() {
  if (editingRoom.value) {
    updateRoom(editingRoom.value.id, { floor: roomForm.floor, roomNumber: roomForm.roomNumber, area: roomForm.area, status: roomForm.status })
  } else {
    addRoom({ buildingId: roomForm.buildingId, floor: roomForm.floor, roomNumber: roomForm.roomNumber, area: roomForm.area, status: roomForm.status, tenantId: null })
  }
  roomDialogVisible.value = false
}
</script>

<style scoped>
.buildings-page {
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

.section-card :deep(.el-table) {
  --el-table-border-color: #f1f5f9;
}

.occ-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.occ-cell :deep(.el-progress) {
  flex: 1;
}

.occ-text {
  font-size: 12px;
  font-weight: 600;
  color: #3b82f6;
  width: 32px;
  text-align: right;
}

.text-muted {
  color: #cbd5e1;
}
</style>
