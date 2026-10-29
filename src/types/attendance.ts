export type UserRole = 'EMPLOYEE' | 'ADMIN' | 'HR_MANAGER' | 'SUPER_ADMIN';

export type AttendanceStatus = 'ON_TIME' | 'LATE' | 'EARLY_LEAVE' | 'ABSENT' | 'CORRECTION_APPROVED';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  avatar: string;
  employeeNo: string;
  department: string;
  position: string;
  shiftId: string;
  deviceId: string;
  isActive: boolean;
  hireDate: string;
}

export interface Shift {
  id: string;
  name: string;
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "18:00"
  gracePeriodMinutes: number; // e.g. 15
  isNightShift: boolean;
  timezone: string; // e.g. "Asia/Shanghai" or "Africa/Nairobi"
}

export interface WifiPolicy {
  id: string;
  ssid: string;
  siteName: string;
  bssidPattern?: string;
  egressIpPattern?: string;
  isActive: boolean;
  requireEgressIpVerification: boolean;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  employeeNo: string;
  department: string;
  shiftId: string;
  shiftName: string;
  workDate: string; // "YYYY-MM-DD"
  checkInAt?: string; // ISO string
  checkOutAt?: string; // ISO string
  checkInStatus?: AttendanceStatus;
  checkOutStatus?: AttendanceStatus;
  checkInSsid?: string;
  checkOutSsid?: string;
  workHoursMinutes?: number;
  notes?: string;
}

export interface AttendanceEvent {
  id: string;
  recordId: string;
  userId: string;
  userName: string;
  eventType: 'CHECK_IN' | 'CHECK_OUT' | 'CORRECTION_APPLIED';
  serverTime: string;
  result: 'SUCCESS' | 'REJECTED_UNAUTHORIZED_WIFI' | 'REJECTED_EXPIRED_CHALLENGE' | 'REJECTED_DEVICE_MISMATCH' | 'DUPLICATE_ATTEMPT';
  ssidUsed: string;
  deviceIdUsed: string;
  challengeId: string;
  ipAddress: string;
}

export interface LeaveOrCorrectionRequest {
  id: string;
  userId: string;
  userName: string;
  employeeNo: string;
  department: string;
  type: 'PATCH_CHECK_IN' | 'PATCH_CHECK_OUT' | 'LEAVE' | 'BUSINESS_TRIP';
  targetDate: string;
  proposedTime?: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewerName?: string;
  reviewerComment?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string; // e.g. "WIFI_POLICY_UPDATED", "EMPLOYEE_STATUS_CHANGED", "ATTENDANCE_CHECK_IN"
  target: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}

export interface ChallengeResponse {
  challengeId: string;
  serverTime: string;
  expiresInSeconds: number;
  serverSignatureNonce: string;
}

export interface AttendanceCheckRequest {
  challengeId: string;
  wifi: {
    connected: boolean;
    ssid: string;
    bssid?: string;
  };
  deviceId: string;
  idempotencyKey?: string;
}
