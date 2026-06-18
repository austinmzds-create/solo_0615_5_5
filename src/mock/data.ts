import { reactive, watch } from 'vue'

export interface Building {
  id: string
  name: string
  floors: number
  totalRooms: number
  address: string
  status: '正常' | '维护中'
}

export interface Room {
  id: string
  buildingId: string
  floor: number
  roomNumber: string
  area: number
  status: '空闲' | '已租' | '装修中'
  tenantId: string | null
}

export interface Tenant {
  id: string
  name: string
  contactPerson: string
  contactPhone: string
  industry: string
  leaseStart: string
  leaseEnd: string
  roomId: string
  status: '在租' | '即将到期' | '已退租'
}

export interface VisitorAppointment {
  id: string
  visitorName: string
  visitorPhone: string
  visitorCompany: string
  targetTenantId: string
  purpose: string
  appointmentDate: string
  appointmentTime: string
  status: '待审核' | '已通过' | '已拒绝' | '已完成'
  createdAt: string
}

export interface TodoItem {
  id: string
  type: 'lease' | 'visitor' | 'room' | 'tenant'
  title: string
  description: string
  time: string
  relatedId: string
  handled: boolean
}

const initialBuildings: Building[] = [
  { id: 'B001', name: 'A栋·创新中心', floors: 12, totalRooms: 48, address: '园区路1号', status: '正常' },
  { id: 'B002', name: 'B栋·智造工坊', floors: 8, totalRooms: 32, address: '园区路2号', status: '正常' },
  { id: 'B003', name: 'C栋·科创大厦', floors: 15, totalRooms: 60, address: '园区路3号', status: '正常' },
  { id: 'B004', name: 'D栋·孵化基地', floors: 6, totalRooms: 24, address: '园区路4号', status: '维护中' },
  { id: 'B005', name: 'E栋·人才公寓', floors: 10, totalRooms: 40, address: '园区路5号', status: '正常' },
]

const initialRooms: Room[] = [
  { id: 'R001', buildingId: 'B001', floor: 1, roomNumber: 'A-101', area: 120, status: '已租', tenantId: 'T001' },
  { id: 'R002', buildingId: 'B001', floor: 1, roomNumber: 'A-102', area: 85, status: '已租', tenantId: 'T002' },
  { id: 'R003', buildingId: 'B001', floor: 2, roomNumber: 'A-201', area: 150, status: '已租', tenantId: 'T003' },
  { id: 'R004', buildingId: 'B001', floor: 2, roomNumber: 'A-202', area: 90, status: '空闲', tenantId: null },
  { id: 'R005', buildingId: 'B001', floor: 3, roomNumber: 'A-301', area: 200, status: '装修中', tenantId: null },
  { id: 'R006', buildingId: 'B002', floor: 1, roomNumber: 'B-101', area: 110, status: '已租', tenantId: 'T004' },
  { id: 'R007', buildingId: 'B002', floor: 1, roomNumber: 'B-102', area: 75, status: '空闲', tenantId: null },
  { id: 'R008', buildingId: 'B002', floor: 2, roomNumber: 'B-201', area: 130, status: '已租', tenantId: 'T005' },
  { id: 'R009', buildingId: 'B002', floor: 3, roomNumber: 'B-301', area: 95, status: '已租', tenantId: 'T006' },
  { id: 'R010', buildingId: 'B003', floor: 1, roomNumber: 'C-101', area: 180, status: '已租', tenantId: 'T007' },
  { id: 'R011', buildingId: 'B003', floor: 1, roomNumber: 'C-102', area: 65, status: '空闲', tenantId: null },
  { id: 'R012', buildingId: 'B003', floor: 2, roomNumber: 'C-201', area: 140, status: '已租', tenantId: 'T008' },
  { id: 'R013', buildingId: 'B003', floor: 5, roomNumber: 'C-501', area: 220, status: '空闲', tenantId: null },
  { id: 'R014', buildingId: 'B004', floor: 1, roomNumber: 'D-101', area: 100, status: '装修中', tenantId: null },
  { id: 'R015', buildingId: 'B004', floor: 2, roomNumber: 'D-201', area: 88, status: '空闲', tenantId: null },
  { id: 'R016', buildingId: 'B005', floor: 1, roomNumber: 'E-101', area: 160, status: '已租', tenantId: 'T009' },
  { id: 'R017', buildingId: 'B005', floor: 2, roomNumber: 'E-201', area: 105, status: '已租', tenantId: 'T010' },
  { id: 'R018', buildingId: 'B005', floor: 3, roomNumber: 'E-301', area: 78, status: '空闲', tenantId: null },
]

const initialTenants: Tenant[] = [
  { id: 'T001', name: '星辰科技有限公司', contactPerson: '张明', contactPhone: '13800001001', industry: '软件开发', leaseStart: '2024-01-15', leaseEnd: '2026-01-14', roomId: 'R001', status: '在租' },
  { id: 'T002', name: '碧海数据科技', contactPerson: '李芳', contactPhone: '13800001002', industry: '大数据', leaseStart: '2024-03-01', leaseEnd: '2025-06-30', roomId: 'R002', status: '即将到期' },
  { id: 'T003', name: '云帆智能科技', contactPerson: '王磊', contactPhone: '13800001003', industry: '人工智能', leaseStart: '2024-06-01', leaseEnd: '2027-05-31', roomId: 'R003', status: '在租' },
  { id: 'T004', name: '锐视光电有限公司', contactPerson: '赵婷', contactPhone: '13800001004', industry: '光电技术', leaseStart: '2023-09-01', leaseEnd: '2026-08-31', roomId: 'R006', status: '在租' },
  { id: 'T005', name: '青山环保科技', contactPerson: '陈刚', contactPhone: '13800001005', industry: '环保科技', leaseStart: '2024-02-01', leaseEnd: '2025-07-31', roomId: 'R008', status: '即将到期' },
  { id: 'T006', name: '领航教育科技', contactPerson: '刘洋', contactPhone: '13800001006', industry: '在线教育', leaseStart: '2024-08-01', leaseEnd: '2026-07-31', roomId: 'R009', status: '在租' },
  { id: 'T007', name: '极光半导体', contactPerson: '孙浩', contactPhone: '13800001007', industry: '半导体', leaseStart: '2024-04-01', leaseEnd: '2027-03-31', roomId: 'R010', status: '在租' },
  { id: 'T008', name: '天工机器人', contactPerson: '周敏', contactPhone: '13800001008', industry: '机器人', leaseStart: '2024-05-01', leaseEnd: '2026-04-30', roomId: 'R012', status: '在租' },
  { id: 'T009', name: '蓝海生物科技', contactPerson: '吴丽', contactPhone: '13800001009', industry: '生物科技', leaseStart: '2024-01-01', leaseEnd: '2025-12-31', roomId: 'R016', status: '在租' },
  { id: 'T010', name: '晨曦传媒', contactPerson: '郑伟', contactPhone: '13800001010', industry: '数字传媒', leaseStart: '2025-01-01', leaseEnd: '2025-12-31', roomId: 'R017', status: '在租' },
]

const initialVisitors: VisitorAppointment[] = [
  { id: 'V001', visitorName: '钱学', visitorPhone: '13900001001', visitorCompany: '远景投资', targetTenantId: 'T001', purpose: '商务洽谈', appointmentDate: '2026-06-18', appointmentTime: '09:00', status: '待审核', createdAt: '2026-06-17 14:30' },
  { id: 'V002', visitorName: '冯杰', visitorPhone: '13900001002', visitorCompany: '华信咨询', targetTenantId: 'T003', purpose: '项目验收', appointmentDate: '2026-06-18', appointmentTime: '10:30', status: '已通过', createdAt: '2026-06-16 09:15' },
  { id: 'V003', visitorName: '杨柳', visitorPhone: '13900001003', visitorCompany: '鼎盛建设', targetTenantId: 'T005', purpose: '设备维修', appointmentDate: '2026-06-18', appointmentTime: '14:00', status: '待审核', createdAt: '2026-06-17 16:45' },
  { id: 'V004', visitorName: '何静', visitorPhone: '13900001004', visitorCompany: '明德律所', targetTenantId: 'T007', purpose: '合同签署', appointmentDate: '2026-06-17', appointmentTime: '15:00', status: '已完成', createdAt: '2026-06-16 11:20' },
  { id: 'V005', visitorName: '朱峰', visitorPhone: '13900001005', visitorCompany: '翔宇物流', targetTenantId: 'T004', purpose: '样品交付', appointmentDate: '2026-06-19', appointmentTime: '09:30', status: '待审核', createdAt: '2026-06-18 08:00' },
  { id: 'V006', visitorName: '许薇', visitorPhone: '13900001006', visitorCompany: '新元材料', targetTenantId: 'T008', purpose: '技术交流', appointmentDate: '2026-06-19', appointmentTime: '13:30', status: '已通过', createdAt: '2026-06-17 10:00' },
  { id: 'V007', visitorName: '秦朗', visitorPhone: '13900001007', visitorCompany: '智联招聘', targetTenantId: 'T006', purpose: '校招宣讲', appointmentDate: '2026-06-20', appointmentTime: '09:00', status: '待审核', createdAt: '2026-06-18 07:30' },
  { id: 'V008', visitorName: '曹雪', visitorPhone: '13900001008', visitorCompany: '国检认证', targetTenantId: 'T009', purpose: '年检审核', appointmentDate: '2026-06-16', appointmentTime: '10:00', status: '已拒绝', createdAt: '2026-06-15 13:00' },
]

const initialTodos: TodoItem[] = [
  { id: 'TD001', type: 'lease', title: '碧海数据科技租约即将到期', description: '租约将于2025-06-30到期，需跟进续签', time: '2026-06-18', relatedId: 'T002', handled: false },
  { id: 'TD002', type: 'lease', title: '青山环保科技租约即将到期', description: '租约将于2025-07-31到期，需跟进续签', time: '2026-06-18', relatedId: 'T005', handled: false },
  { id: 'TD003', type: 'visitor', title: '钱学访客预约待审核', description: '远景投资-商务洽谈，今日09:00', time: '2026-06-18', relatedId: 'V001', handled: false },
  { id: 'TD004', type: 'visitor', title: '杨柳访客预约待审核', description: '鼎盛建设-设备维修，今日14:00', time: '2026-06-18', relatedId: 'V003', handled: false },
  { id: 'TD005', type: 'visitor', title: '朱峰访客预约待审核', description: '翔宇物流-样品交付，明日09:30', time: '2026-06-18', relatedId: 'V005', handled: false },
  { id: 'TD006', type: 'visitor', title: '秦朗访客预约待审核', description: '智联招聘-校招宣讲，6月20日', time: '2026-06-18', relatedId: 'V007', handled: false },
  { id: 'TD007', type: 'room', title: 'A-301房间装修中', description: 'A栋3楼301室正在装修，预计下周完工', time: '2026-06-18', relatedId: 'R005', handled: false },
  { id: 'TD008', type: 'room', title: 'D栋整栋维护中', description: 'D栋·孵化基地公共设施检修', time: '2026-06-18', relatedId: 'B004', handled: false },
]

let nextId = 100

function genId(prefix: string) {
  nextId += 1
  return `${prefix}${String(nextId).padStart(3, '0')}`
}

const STORAGE_KEY = 'property-admin-data-v1'

function saveToStorage() {
  try {
    const data = {
      buildings: store.buildings,
      rooms: store.rooms,
      tenants: store.tenants,
      visitors: store.visitors,
      todos: store.todos,
      nextId,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.warn('保存数据失败', e)
  }
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch (e) {
    console.warn('加载数据失败', e)
    return null
  }
}

function refreshAllTenantStatuses() {
  store.tenants.forEach(tenant => {
    if (tenant.status === '已退租') return
    tenant.status = computeTenantStatus(tenant.leaseEnd)
  })
}

const saved = loadFromStorage()

export const store = reactive({
  buildings: (saved?.buildings ?? initialBuildings) as Building[],
  rooms: (saved?.rooms ?? initialRooms) as Room[],
  tenants: (saved?.tenants ?? initialTenants) as Tenant[],
  visitors: (saved?.visitors ?? initialVisitors) as VisitorAppointment[],
  todos: (saved?.todos ?? initialTodos) as TodoItem[],
})

if (saved?.nextId) nextId = saved.nextId

refreshAllTenantStatuses()

watch(
  () => [store.buildings, store.rooms, store.tenants, store.visitors, store.todos],
  () => saveToStorage(),
  { deep: true }
)

export function addBuilding(data: Omit<Building, 'id'>) {
  const item: Building = { ...data, id: genId('B') }
  store.buildings.push(item)
  return item
}

export function updateBuilding(id: string, data: Partial<Building>) {
  const idx = store.buildings.findIndex(b => b.id === id)
  if (idx !== -1) Object.assign(store.buildings[idx], data)
}

export function addRoom(data: Omit<Room, 'id'>) {
  const item: Room = { ...data, id: genId('R') }
  store.rooms.push(item)
  const building = store.buildings.find(b => b.id === data.buildingId)
  if (building) building.totalRooms = store.rooms.filter(r => r.buildingId === data.buildingId).length
  return item
}

export function updateRoom(id: string, data: Partial<Room>) {
  const idx = store.rooms.findIndex(r => r.id === id)
  if (idx !== -1) Object.assign(store.rooms[idx], data)
}

export function addTenant(data: Omit<Tenant, 'id'>) {
  const item: Tenant = { ...data, id: genId('T') }
  store.tenants.push(item)
  if (data.roomId) {
    const room = store.rooms.find(r => r.id === data.roomId)
    if (room) {
      room.status = '已租'
      room.tenantId = item.id
    }
  }
  return item
}

export function computeTenantStatus(leaseEnd: string): '在租' | '即将到期' {
  const end = new Date(leaseEnd)
  const now = new Date()
  const diff = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  return diff <= 90 ? '即将到期' : '在租'
}

export function renewTenant(id: string, newLeaseEnd: string) {
  const tenant = store.tenants.find(t => t.id === id)
  if (!tenant) return
  if (tenant.status !== '在租' && tenant.status !== '即将到期') return
  if (new Date(newLeaseEnd) <= new Date(tenant.leaseEnd)) return

  tenant.leaseEnd = newLeaseEnd
  const newStatus = computeTenantStatus(newLeaseEnd)
  const wasExpiring = tenant.status === '即将到期'
  tenant.status = newStatus

  if (wasExpiring && newStatus === '在租') {
    const todo = store.todos.find(t => t.relatedId === id && t.type === 'lease' && !t.handled)
    if (todo) todo.handled = true
  }
}

export function updateTenant(id: string, data: Partial<Tenant>) {
  const idx = store.tenants.findIndex(t => t.id === id)
  if (idx !== -1) Object.assign(store.tenants[idx], data)
}

export function addVisitor(data: Omit<VisitorAppointment, 'id' | 'createdAt'>) {
  const item: VisitorAppointment = { ...data, id: genId('V'), createdAt: new Date().toLocaleString('zh-CN') }
  store.visitors.push(item)
  if (data.status === '待审核') {
    store.todos.push({
      id: genId('TD'),
      type: 'visitor',
      title: `${data.visitorName}访客预约待审核`,
      description: `${data.visitorCompany}-${data.purpose}，${data.appointmentDate} ${data.appointmentTime}`,
      time: data.appointmentDate,
      relatedId: item.id,
      handled: false,
    })
  }
  return item
}

export function updateVisitor(id: string, data: Partial<VisitorAppointment>) {
  const idx = store.visitors.findIndex(v => v.id === id)
  if (idx !== -1) Object.assign(store.visitors[idx], data)
  if (data.status && data.status !== '待审核') {
    const todo = store.todos.find(t => t.relatedId === id && t.type === 'visitor' && !t.handled)
    if (todo) todo.handled = true
  }
}

export function handleTodo(id: string) {
  const todo = store.todos.find(t => t.id === id)
  if (todo) todo.handled = true
}

export function getRoomsByBuilding(buildingId: string) {
  return store.rooms.filter(r => r.buildingId === buildingId)
}

export function getTenantById(id: string) {
  return store.tenants.find(t => t.id === id)
}

export function getRoomById(id: string) {
  return store.rooms.find(r => r.id === id)
}

export function getBuildingById(id: string) {
  return store.buildings.find(b => b.id === id)
}

export function getOccupancyStats() {
  const total = store.rooms.length
  const rented = store.rooms.filter(r => r.status === '已租').length
  const vacant = store.rooms.filter(r => r.status === '空闲').length
  const decorating = store.rooms.filter(r => r.status === '装修中').length
  const totalArea = store.rooms.reduce((s, r) => s + r.area, 0)
  const rentedArea = store.rooms.filter(r => r.status === '已租').reduce((s, r) => s + r.area, 0)
  return { total, rented, vacant, decorating, totalArea, rentedArea, rate: total ? Math.round((rented / total) * 100) : 0 }
}

export function getBuildingOccupancy(buildingId: string) {
  const rooms = store.rooms.filter(r => r.buildingId === buildingId)
  const total = rooms.length
  const rented = rooms.filter(r => r.status === '已租').length
  const vacant = rooms.filter(r => r.status === '空闲').length
  return { total, rented, vacant, rate: total ? Math.round((rented / total) * 100) : 0 }
}
