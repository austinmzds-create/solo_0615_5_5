import {
  store,
  _resetNextId,
  initialBuildings,
  initialRooms,
  initialTenants,
  initialVisitors,
  initialTodos,
  type Building,
  type Room,
  type Tenant,
  type VisitorAppointment,
  type TodoItem,
} from './data'

function deepCopy<T>(data: T): T {
  return JSON.parse(JSON.stringify(data))
}

export function freshBuildings(): Building[] {
  return deepCopy(initialBuildings)
}

export function freshRooms(): Room[] {
  return deepCopy(initialRooms)
}

export function freshTenants(): Tenant[] {
  return deepCopy(initialTenants)
}

export function freshVisitors(): VisitorAppointment[] {
  return deepCopy(initialVisitors)
}

export function freshTodos(): TodoItem[] {
  return deepCopy(initialTodos)
}

export function resetStore() {
  store.buildings.splice(0, store.buildings.length, ...freshBuildings())
  store.rooms.splice(0, store.rooms.length, ...freshRooms())
  store.tenants.splice(0, store.tenants.length, ...freshTenants())
  store.visitors.splice(0, store.visitors.length, ...freshVisitors())
  store.todos.splice(0, store.todos.length, ...freshTodos())
  _resetNextId()
}

export function clearStore() {
  store.buildings.splice(0, store.buildings.length)
  store.rooms.splice(0, store.rooms.length)
  store.tenants.splice(0, store.tenants.length)
  store.visitors.splice(0, store.visitors.length)
  store.todos.splice(0, store.todos.length)
  _resetNextId()
}
