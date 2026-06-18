import { describe, it, expect, beforeEach } from 'vitest'
import {
  store,
  renewTenant,
  computeTenantStatus,
  refreshAllTenantStatuses,
  type Tenant,
} from './data'

describe('企业租户续租回归测试', () => {
  beforeEach(() => {
    store.tenants = []
    store.todos = []
    store.rooms = []
    store.buildings = []
  })

  function createExpiringTenant(daysUntilExpiry: number): Tenant {
    const now = new Date()
    const leaseEnd = new Date(now.getTime() + daysUntilExpiry * 24 * 60 * 60 * 1000)
    const leaseStart = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    
    return {
      id: 'T999',
      name: '测试企业有限公司',
      contactPerson: '张三',
      contactPhone: '13800000000',
      industry: '软件开发',
      leaseStart: leaseStart.toISOString().slice(0, 10),
      leaseEnd: leaseEnd.toISOString().slice(0, 10),
      roomId: 'R999',
      status: computeTenantStatus(leaseEnd.toISOString().slice(0, 10)),
    }
  }

  function getExpiringTenants() {
    return store.tenants.filter(t => t.status === '即将到期')
  }

  function getExpiringCount() {
    return store.tenants.filter(t => t.status === '即将到期').length
  }

  function getLeaseTodos() {
    return store.todos.filter(t => t.type === 'lease' && !t.handled)
  }

  it('续租即将到期企业后，首页租约到期提醒应按新到期日重新计算', () => {
    const tenant = createExpiringTenant(30)
    expect(tenant.status).toBe('即将到期')
    store.tenants.push(tenant)
    store.todos.push({
      id: 'TD999',
      type: 'lease',
      title: `${tenant.name}租约即将到期`,
      description: `租约将于${tenant.leaseEnd}到期，需跟进续签`,
      time: new Date().toISOString().slice(0, 10),
      relatedId: tenant.id,
      handled: false,
    })

    const beforeExpiringCount = getExpiringCount()
    const beforeExpiringTenants = getExpiringTenants()
    const beforeLeaseTodos = getLeaseTodos()
    expect(beforeExpiringCount).toBe(1)
    expect(beforeExpiringTenants[0].id).toBe(tenant.id)
    expect(beforeLeaseTodos.length).toBe(1)
    expect(beforeLeaseTodos[0].relatedId).toBe(tenant.id)

    const newLeaseEnd = new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    renewTenant(tenant.id, newLeaseEnd)

    const updatedTenant = store.tenants.find(t => t.id === tenant.id)!
    expect(updatedTenant.leaseEnd).toBe(newLeaseEnd)
    expect(updatedTenant.status).toBe('在租')

    const afterExpiringCount = getExpiringCount()
    const afterExpiringTenants = getExpiringTenants()
    const afterLeaseTodos = getLeaseTodos()

    expect(afterExpiringCount).toBe(0)
    expect(afterExpiringTenants.length).toBe(0)
    expect(afterLeaseTodos.length).toBe(0)

    refreshAllTenantStatuses()

    const afterRefreshExpiringCount = getExpiringCount()
    const afterRefreshExpiringTenants = getExpiringTenants()
    const afterRefreshTenant = store.tenants.find(t => t.id === tenant.id)!

    expect(afterRefreshExpiringCount).toBe(afterExpiringCount)
    expect(afterRefreshExpiringTenants.length).toBe(afterExpiringTenants.length)
    expect(afterRefreshTenant.status).toBe('在租')
    expect(afterRefreshTenant.leaseEnd).toBe(newLeaseEnd)
  })

  it('续租后新到期日仍在90天内时，首页提醒应保留但日期更新', () => {
    const tenant = createExpiringTenant(30)
    expect(tenant.status).toBe('即将到期')
    store.tenants.push(tenant)
    store.todos.push({
      id: 'TD999',
      type: 'lease',
      title: `${tenant.name}租约即将到期`,
      description: `租约将于${tenant.leaseEnd}到期，需跟进续签`,
      time: new Date().toISOString().slice(0, 10),
      relatedId: tenant.id,
      handled: false,
    })

    const beforeExpiringCount = getExpiringCount()
    expect(beforeExpiringCount).toBe(1)

    const newLeaseEnd = new Date(new Date().getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    renewTenant(tenant.id, newLeaseEnd)

    const updatedTenant = store.tenants.find(t => t.id === tenant.id)!
    expect(updatedTenant.leaseEnd).toBe(newLeaseEnd)
    expect(updatedTenant.status).toBe('即将到期')

    const afterExpiringCount = getExpiringCount()
    const afterExpiringTenants = getExpiringTenants()
    expect(afterExpiringCount).toBe(1)
    expect(afterExpiringTenants[0].leaseEnd).toBe(newLeaseEnd)

    refreshAllTenantStatuses()

    const afterRefreshExpiringCount = getExpiringCount()
    const afterRefreshTenant = store.tenants.find(t => t.id === tenant.id)!
    expect(afterRefreshExpiringCount).toBe(1)
    expect(afterRefreshTenant.status).toBe('即将到期')
    expect(afterRefreshTenant.leaseEnd).toBe(newLeaseEnd)
  })

  it('续租到期日早于当前到期日时，不应执行续租', () => {
    const tenant = createExpiringTenant(60)
    store.tenants.push(tenant)
    const originalLeaseEnd = tenant.leaseEnd

    const invalidNewEnd = new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    renewTenant(tenant.id, invalidNewEnd)

    const unchangedTenant = store.tenants.find(t => t.id === tenant.id)!
    expect(unchangedTenant.leaseEnd).toBe(originalLeaseEnd)
    expect(unchangedTenant.status).toBe('即将到期')

    refreshAllTenantStatuses()
    expect(unchangedTenant.leaseEnd).toBe(originalLeaseEnd)
    expect(unchangedTenant.status).toBe('即将到期')
  })

  it('已退租企业无法续租', () => {
    const tenant: Tenant = {
      id: 'T998',
      name: '已退租企业',
      contactPerson: '李四',
      contactPhone: '13900000000',
      industry: '大数据',
      leaseStart: '2023-01-01',
      leaseEnd: '2024-01-01',
      roomId: 'R998',
      status: '已退租',
    }
    store.tenants.push(tenant)

    const newLeaseEnd = new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    renewTenant(tenant.id, newLeaseEnd)

    const unchangedTenant = store.tenants.find(t => t.id === tenant.id)!
    expect(unchangedTenant.leaseEnd).toBe('2024-01-01')
    expect(unchangedTenant.status).toBe('已退租')

    refreshAllTenantStatuses()
    expect(unchangedTenant.status).toBe('已退租')
  })

  it('验证computeTenantStatus计算逻辑正确性', () => {
    const now = new Date()
    
    const futureDate = new Date(now.getTime() + 91 * 24 * 60 * 60 * 1000)
    expect(computeTenantStatus(futureDate.toISOString().slice(0, 10))).toBe('在租')
    
    const expiringDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
    expect(computeTenantStatus(expiringDate.toISOString().slice(0, 10))).toBe('即将到期')
    
    const soonDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    expect(computeTenantStatus(soonDate.toISOString().slice(0, 10))).toBe('即将到期')
    
    const pastDate = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)
    expect(computeTenantStatus(pastDate.toISOString().slice(0, 10))).toBe('即将到期')
  })
})
