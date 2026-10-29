import {
  User,
  Shift,
  WifiPolicy,
  AttendanceRecord,
  LeaveOrCorrectionRequest,
  AuditLog,
  AttendanceEvent,
  ChallengeResponse,
  AttendanceCheckRequest,
  AttendanceStatus,
} from '../types/attendance';
import {
  INITIAL_USERS,
  INITIAL_SHIFTS,
  INITIAL_WIFI_POLICIES,
  INITIAL_ATTENDANCE_RECORDS,
  INITIAL_CORRECTION_REQUESTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_ATTENDANCE_EVENTS,
} from './mockData';

// Active Challenges Map: challengeId -> { userId, expiresAt, nonce }
interface ChallengeInfo {
  userId: string;
  expiresAt: number;
  nonce: string;
}

class AttendanceStore {
  private users: User[] = [...INITIAL_USERS];
  private shifts: Shift[] = [...INITIAL_SHIFTS];
  private wifiPolicies: WifiPolicy[] = [...INITIAL_WIFI_POLICIES];
  private records: AttendanceRecord[] = [...INITIAL_ATTENDANCE_RECORDS];
  private requests: LeaveOrCorrectionRequest[] = [...INITIAL_CORRECTION_REQUESTS];
  private auditLogs: AuditLog[] = [...INITIAL_AUDIT_LOGS];
  private events: AttendanceEvent[] = [...INITIAL_ATTENDANCE_EVENTS];
  private activeChallenges: Map<string, ChallengeInfo> = new Map();

  // Active user session simulation (default: u-1 / 张伟)
  private currentUserId: string = 'u-1';

  public getCurrentUser(): User {
    return this.users.find((u) => u.id === this.currentUserId) || this.users[0];
  }

  public setCurrentUserId(userId: string): User | null {
    const found = this.users.find((u) => u.id === userId);
    if (found) {
      this.currentUserId = userId;
      return found;
    }
    return null;
  }

  public getUsers(): User[] {
    return this.users;
  }

  public addUser(user: Omit<User, 'id'>): User {
    const newUser: User = {
      ...user,
      id: `u-${Date.now()}`,
    };
    this.users.push(newUser);
    this.logAudit(
      'admin',
      '管理员',
      'SUPER_ADMIN',
      'EMPLOYEE_CREATED',
      `创建新员工账号 ${newUser.name} (${newUser.employeeNo})`,
      `部门: ${newUser.department}`
    );
    return newUser;
  }

  public updateUserStatus(userId: string, isActive: boolean): User | null {
    const user = this.users.find((u) => u.id === userId);
    if (user) {
      user.isActive = isActive;
      this.logAudit(
        'admin',
        '管理员',
        'SUPER_ADMIN',
        'EMPLOYEE_STATUS_CHANGED',
        `员工 ${user.name} 账号状态变更`,
        `新状态: ${isActive ? '启用 (ACTIVE)' : '停用 (SUSPENDED)'}`
      );
      return user;
    }
    return null;
  }

  public getShifts(): Shift[] {
    return this.shifts;
  }

  public getWifiPolicies(): WifiPolicy[] {
    return this.wifiPolicies;
  }

  public addWifiPolicy(policy: Omit<WifiPolicy, 'id'>): WifiPolicy {
    const newPolicy: WifiPolicy = {
      ...policy,
      id: `wifi-${Date.now()}`,
    };
    this.wifiPolicies.push(newPolicy);
    this.logAudit(
      'admin',
      '管理员',
      'SUPER_ADMIN',
      'WIFI_POLICY_CREATED',
      `新增打卡 Wi-Fi 规则: ${newPolicy.ssid}`,
      `适用园区: ${newPolicy.siteName}`
    );
    return newPolicy;
  }

  public toggleWifiPolicy(id: string): WifiPolicy | null {
    const policy = this.wifiPolicies.find((p) => p.id === id);
    if (policy) {
      policy.isActive = !policy.isActive;
      this.logAudit(
        'admin',
        '管理员',
        'SUPER_ADMIN',
        'WIFI_POLICY_TOGGLED',
        `打卡 Wi-Fi 规则 ${policy.ssid} 状态变更`,
        `开关状态: ${policy.isActive ? '启用' : '禁用'}`
      );
      return policy;
    }
    return null;
  }

  public getRecords(): AttendanceRecord[] {
    return this.records;
  }

  public getTodayRecord(userId: string): AttendanceRecord | null {
    const todayStr = new Date().toISOString().split('T')[0];
    return this.records.find((r) => r.userId === userId && r.workDate === todayStr) || null;
  }

  public getHistory(userId: string): AttendanceRecord[] {
    return this.records.filter((r) => r.userId === userId);
  }

  public getRequests(): LeaveOrCorrectionRequest[] {
    return this.requests;
  }

  public getAuditLogs(): AuditLog[] {
    return this.auditLogs;
  }

  public getEvents(): AttendanceEvent[] {
    return this.events;
  }

  // Generate Short-lived Nonce Challenge for Check-in / Check-out
  public createChallenge(userId: string): ChallengeResponse {
    const now = Date.now();
    const challengeId = `ch-${Math.random().toString(36).substring(2, 9)}-${Date.now().toString(36)}`;
    const nonce = Math.random().toString(36).substring(2, 12);
    const expiresInSeconds = 60;

    this.activeChallenges.set(challengeId, {
      userId,
      expiresAt: now + expiresInSeconds * 1000,
      nonce,
    });

    return {
      challengeId,
      serverTime: new Date().toISOString(),
      expiresInSeconds,
      serverSignatureNonce: nonce,
    };
  }

  // Clock In atomic execution logic
  public checkIn(
    userId: string,
    req: AttendanceCheckRequest
  ): { success: boolean; message: string; record?: AttendanceRecord; status?: AttendanceStatus } {
    const user = this.users.find((u) => u.id === userId);
    if (!user || !user.isActive) {
      return { success: false, message: '员工账号不存在或已被停用，禁止打卡' };
    }

    // 1. Verify Challenge
    const challenge = this.activeChallenges.get(req.challengeId);
    if (!challenge) {
      this.recordEvent(userId, user.name, 'CHECK_IN', 'REJECTED_EXPIRED_CHALLENGE', req.wifi.ssid, req.deviceId, req.challengeId);
      return { success: false, message: '打卡挑战凭证无效或已过期，请重新发起' };
    }
    if (challenge.expiresAt < Date.now()) {
      this.activeChallenges.delete(req.challengeId);
      this.recordEvent(userId, user.name, 'CHECK_IN', 'REJECTED_EXPIRED_CHALLENGE', req.wifi.ssid, req.deviceId, req.challengeId);
      return { success: false, message: '打卡挑战凭证超时，请刷新重试' };
    }
    // Consume challenge
    this.activeChallenges.delete(req.challengeId);

    // 2. Verify Wi-Fi policy
    if (!req.wifi.connected || !req.wifi.ssid) {
      this.recordEvent(userId, user.name, 'CHECK_IN', 'REJECTED_UNAUTHORIZED_WIFI', req.wifi.ssid || 'DISCONNECTED', req.deviceId, req.challengeId);
      return { success: false, message: '设备未连接公司指定 Wi-Fi，打卡被拒绝' };
    }

    const matchedPolicy = this.wifiPolicies.find((p) => p.isActive && p.ssid.toLowerCase() === req.wifi.ssid.toLowerCase());
    if (!matchedPolicy) {
      this.recordEvent(userId, user.name, 'CHECK_IN', 'REJECTED_UNAUTHORIZED_WIFI', req.wifi.ssid, req.deviceId, req.challengeId);
      return { success: false, message: `当前连接的 Wi-Fi (${req.wifi.ssid}) 未在 Himart 考勤白名单中` };
    }

    // 3. Verify duplicate check-in today
    const todayStr = new Date().toISOString().split('T')[0];
    let record = this.records.find((r) => r.userId === userId && r.workDate === todayStr);

    if (record && record.checkInAt) {
      return { success: false, message: '今日上班已打卡，请勿重复提交' };
    }

    // 4. Calculate Server Time & On-Time Status
    const nowISO = new Date().toISOString();
    const shift = this.shifts.find((s) => s.id === user.shiftId) || this.shifts[0];

    // Check if late
    const nowTimeStr = new Date().toTimeString().split(' ')[0].substring(0, 5); // "HH:MM"
    const isLate = nowTimeStr > this.addMinutes(shift.startTime, shift.gracePeriodMinutes);
    const status: AttendanceStatus = isLate ? 'LATE' : 'ON_TIME';

    if (!record) {
      record = {
        id: `rec-${Date.now()}`,
        userId: user.id,
        userName: user.name,
        employeeNo: user.employeeNo,
        department: user.department,
        shiftId: shift.id,
        shiftName: shift.name,
        workDate: todayStr,
      };
      this.records.unshift(record);
    }

    record.checkInAt = nowISO;
    record.checkInStatus = status;
    record.checkInSsid = req.wifi.ssid;
    record.notes = status === 'LATE' ? `迟到打卡 (${nowTimeStr} 超过规定 ${shift.startTime} + ${shift.gracePeriodMinutes}分钟宽限期)` : '正常打卡';

    // Record Event & Audit
    this.recordEvent(userId, user.name, 'CHECK_IN', 'SUCCESS', req.wifi.ssid, req.deviceId, req.challengeId, record.id);
    this.logAudit(
      userId,
      user.name,
      user.role,
      'ATTENDANCE_CHECK_IN_SUCCESS',
      `上班打卡成功 [${status === 'ON_TIME' ? '正常' : '迟到'}]`,
      `服务器写入时间: ${nowISO}, Wi-Fi: ${req.wifi.ssid}`
    );

    return {
      success: true,
      message: status === 'ON_TIME' ? '上班打卡成功！祝您工作愉快！' : '上班打卡成功（已记录迟到）',
      record,
      status,
    };
  }

  // Clock Out atomic execution logic
  public checkOut(
    userId: string,
    req: AttendanceCheckRequest
  ): { success: boolean; message: string; record?: AttendanceRecord; status?: AttendanceStatus } {
    const user = this.users.find((u) => u.id === userId);
    if (!user || !user.isActive) {
      return { success: false, message: '员工账号不存在或已被停用' };
    }

    // 1. Verify Challenge
    const challenge = this.activeChallenges.get(req.challengeId);
    if (!challenge) {
      return { success: false, message: '打卡凭证已过期，请刷新页面重试' };
    }
    this.activeChallenges.delete(req.challengeId);

    // 2. Verify Wi-Fi
    const matchedPolicy = this.wifiPolicies.find((p) => p.isActive && p.ssid.toLowerCase() === req.wifi.ssid.toLowerCase());
    if (!matchedPolicy) {
      return { success: false, message: `网络 ${req.wifi.ssid} 不在 Himart 考勤白名单中` };
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const record = this.records.find((r) => r.userId === userId && r.workDate === todayStr);

    if (!record || !record.checkInAt) {
      return { success: false, message: '您尚未进行上班打卡，请先执行上班打卡或提交补签申请' };
    }

    if (record.checkOutAt) {
      return { success: false, message: '今日下班打卡已完成，无需重复提交' };
    }

    const nowISO = new Date().toISOString();
    const shift = this.shifts.find((s) => s.id === user.shiftId) || this.shifts[0];
    const nowTimeStr = new Date().toTimeString().split(' ')[0].substring(0, 5);

    const isEarlyLeave = !shift.isNightShift && nowTimeStr < shift.endTime;
    const status: AttendanceStatus = isEarlyLeave ? 'EARLY_LEAVE' : 'ON_TIME';

    record.checkOutAt = nowISO;
    record.checkOutStatus = status;
    record.checkOutSsid = req.wifi.ssid;

    // Calculate worked minutes
    const startMs = new Date(record.checkInAt).getTime();
    const endMs = new Date(nowISO).getTime();
    record.workHoursMinutes = Math.round((endMs - startMs) / (1000 * 60));

    this.recordEvent(userId, user.name, 'CHECK_OUT', 'SUCCESS', req.wifi.ssid, req.deviceId, req.challengeId, record.id);
    this.logAudit(
      userId,
      user.name,
      user.role,
      'ATTENDANCE_CHECK_OUT_SUCCESS',
      `下班打卡成功 [${status === 'ON_TIME' ? '正常下班' : '早退'}]`,
      `已工时: ${Math.floor(record.workHoursMinutes / 60)}小时${record.workHoursMinutes % 60}分钟`
    );

    return {
      success: true,
      message: isEarlyLeave ? '下班打卡成功（已记录早退）' : '下班打卡成功，辛苦了！',
      record,
      status,
    };
  }

  // Submit Correction / Leave request
  public createCorrectionRequest(req: {
    userId: string;
    type: 'PATCH_CHECK_IN' | 'PATCH_CHECK_OUT' | 'LEAVE' | 'BUSINESS_TRIP';
    targetDate: string;
    proposedTime?: string;
    reason: string;
  }): LeaveOrCorrectionRequest {
    const user = this.users.find((u) => u.id === req.userId);
    const newReq: LeaveOrCorrectionRequest = {
      id: `req-${Date.now()}`,
      userId: req.userId,
      userName: user ? user.name : '未知员工',
      employeeNo: user ? user.employeeNo : '',
      department: user ? user.department : '',
      type: req.type,
      targetDate: req.targetDate,
      proposedTime: req.proposedTime,
      reason: req.reason,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    this.requests.unshift(newReq);
    this.logAudit(
      req.userId,
      user ? user.name : '未知',
      'EMPLOYEE',
      'CORRECTION_REQUEST_SUBMITTED',
      `提交考勤补签/假单`,
      `类型: ${req.type}, 针对日期: ${req.targetDate}`
    );
    return newReq;
  }

  // Approve or Reject Correction request
  public approveCorrection(
    requestId: string,
    approved: boolean,
    reviewerName: string,
    reviewerComment: string
  ): LeaveOrCorrectionRequest | null {
    const req = this.requests.find((r) => r.id === requestId);
    if (!req) return null;

    req.status = approved ? 'APPROVED' : 'REJECTED';
    req.reviewerName = reviewerName;
    req.reviewerComment = reviewerComment;

    if (approved) {
      // Apply correction to attendance records
      let record = this.records.find((r) => r.userId === req.userId && r.workDate === req.targetDate);
      if (!record) {
        record = {
          id: `rec-${Date.now()}`,
          userId: req.userId,
          userName: req.userName,
          employeeNo: req.employeeNo,
          department: req.department,
          shiftId: 'shift-1',
          shiftName: 'Himart 标准班次',
          workDate: req.targetDate,
        };
        this.records.unshift(record);
      }

      const isoTime = `${req.targetDate}T${req.proposedTime || '09:00'}:00.000Z`;
      if (req.type === 'PATCH_CHECK_IN') {
        record.checkInAt = isoTime;
        record.checkInStatus = 'CORRECTION_APPROVED';
        record.checkInSsid = 'HR补打卡审批';
        record.notes = `补打卡核准 (${reviewerName}: ${reviewerComment})`;
      } else if (req.type === 'PATCH_CHECK_OUT') {
        record.checkOutAt = isoTime;
        record.checkOutStatus = 'CORRECTION_APPROVED';
        record.checkOutSsid = 'HR补打卡审批';
      }
    }

    this.logAudit(
      'hr-admin',
      reviewerName,
      'HR_MANAGER',
      approved ? 'CORRECTION_APPROVED' : 'CORRECTION_REJECTED',
      `审批补打卡申请 (${req.userName}) - ${approved ? '通过' : '驳回'}`,
      `审批意见: ${reviewerComment}`
    );

    return req;
  }

  // Export records as CSV string
  public exportRecordsCSV(): string {
    const headers = ['记录ID', '员工编号', '姓名', '部门', '考勤日期', '班次名称', '上班打卡时间', '上班状态', '下班打卡时间', '下班状态', '打卡Wi-Fi', '备注'];
    const rows = this.records.map((r) => [
      r.id,
      r.employeeNo,
      r.userName,
      r.department,
      r.workDate,
      r.shiftName,
      r.checkInAt ? new Date(r.checkInAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '未打卡',
      r.checkInStatus || '未打卡',
      r.checkOutAt ? new Date(r.checkOutAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '未打卡',
      r.checkOutStatus || '未打卡',
      r.checkInSsid || '-',
      r.notes || '',
    ]);

    return [headers.join(','), ...rows.map((row) => row.map((val) => `"${val}"`).join(','))].join('\n');
  }

  private recordEvent(
    userId: string,
    userName: string,
    type: 'CHECK_IN' | 'CHECK_OUT' | 'CORRECTION_APPLIED',
    result: AttendanceEvent['result'],
    ssid: string,
    deviceId: string,
    challengeId: string,
    recordId?: string
  ) {
    this.events.unshift({
      id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      recordId: recordId || '',
      userId,
      userName,
      eventType: type,
      serverTime: new Date().toISOString(),
      result,
      ssidUsed: ssid,
      deviceIdUsed: deviceId,
      challengeId,
      ipAddress: '113.108.88.100',
    });
  }

  private logAudit(actorId: string, actorName: string, role: string, action: string, target: string, details: string) {
    this.auditLogs.unshift({
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      actorId,
      actorName,
      actorRole: role,
      action,
      target,
      details,
      ipAddress: '113.108.88.100',
      createdAt: new Date().toISOString(),
    });
  }

  private addMinutes(timeHHMM: string, mins: number): string {
    const [h, m] = timeHHMM.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m + mins, 0, 0);
    const newH = String(date.getHours()).padStart(2, '0');
    const newM = String(date.getMinutes()).padStart(2, '0');
    return `${newH}:${newM}`;
  }
}

export const attendanceStore = new AttendanceStore();
