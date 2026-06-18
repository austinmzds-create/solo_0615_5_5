import type { VisitorAppointment } from '../mock/data'

export type VisitorStatus = '待审核' | '已通过' | '已拒绝' | '已完成'

export const VISITOR_STATUS: Record<VisitorStatus, VisitorStatus> = {
  待审核: '待审核',
  已通过: '已通过',
  已拒绝: '已拒绝',
  已完成: '已完成',
}

export const VISITOR_STATUS_LIST: VisitorStatus[] = ['待审核', '已通过', '已拒绝', '已完成']

const statusTagMap: Record<VisitorStatus, string> = {
  待审核: 'warning',
  已通过: 'success',
  已拒绝: 'danger',
  已完成: 'info',
}

export function getVisitorStatusTag(status: string): string {
  return statusTagMap[status as VisitorStatus] || 'info'
}

export function canApprove(status: string): boolean {
  return status === '待审核'
}

export function canReject(status: string): boolean {
  return status === '待审核'
}

export function canComplete(status: string): boolean {
  return status === '已通过'
}

export function hasActions(status: string): boolean {
  return canApprove(status) || canReject(status) || canComplete(status)
}

export function getNextStatusForApprove(): VisitorStatus {
  return '已通过'
}

export function getNextStatusForReject(): VisitorStatus {
  return '已拒绝'
}

export function getNextStatusForComplete(): VisitorStatus {
  return '已完成'
}

export function countByStatus(visitors: VisitorAppointment[], status: VisitorStatus): number {
  return visitors.filter(v => v.status === status).length
}

export function filterByStatus(visitors: VisitorAppointment[], status: VisitorStatus | ''): VisitorAppointment[] {
  if (!status) return visitors
  return visitors.filter(v => v.status === status)
}

export function filterPending(visitors: VisitorAppointment[]): VisitorAppointment[] {
  return visitors.filter(v => v.status === '待审核')
}

export function getStatusLabel(status: VisitorStatus): string {
  return status
}
