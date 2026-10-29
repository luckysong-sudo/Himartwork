import React, { useState } from 'react';
import {
  User,
  WifiPolicy,
  Shift,
  AttendanceRecord,
  LeaveOrCorrectionRequest,
  AuditLog,
  AttendanceEvent,
} from '../types/attendance';
import {
  Users,
  Wifi,
  FileCheck,
  Download,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Check,
  X,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import { Language, Translations } from '../i18n/translations';

interface AdminDashboardProps {
  currentUser: User;
  employees: User[];
  wifiPolicies: WifiPolicy[];
  shifts: Shift[];
  records: AttendanceRecord[];
  requests: LeaveOrCorrectionRequest[];
  auditLogs: AuditLog[];
  events: AttendanceEvent[];
  onAddEmployee: (user: Omit<User, 'id'>) => Promise<void>;
  onToggleEmployeeStatus: (id: string, isActive: boolean) => Promise<void>;
  onAddWifiPolicy: (policy: Omit<WifiPolicy, 'id'>) => Promise<void>;
  onToggleWifiPolicy: (id: string) => Promise<void>;
  onApproveCorrection: (id: string, approved: boolean, comment: string) => Promise<void>;
  onRefreshData: () => void;
  language: Language;
  t: Translations;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  employees,
  wifiPolicies,
  shifts,
  records,
  requests,
  auditLogs,
  events,
  onAddEmployee,
  onToggleEmployeeStatus,
  onAddWifiPolicy,
  onToggleWifiPolicy,
  onApproveCorrection,
  onRefreshData,
  language,
  t,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'wifi' | 'employees' | 'corrections' | 'audit'>('overview');

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // New Employee Modal
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState<boolean>(false);
  const [newEmpName, setNewEmpName] = useState<string>('');
  const [newEmpNo, setNewEmpNo] = useState<string>(`HM-${Math.floor(6000 + Math.random() * 900)}`);
  const [newEmpDept, setNewEmpDept] = useState<string>('收银客服组 (Front-end & Cashier)');
  const [newEmpPos, setNewEmpPos] = useState<string>('收银员 / Cashier');

  // New Wi-Fi Policy Modal
  const [showAddWifiModal, setShowAddWifiModal] = useState<boolean>(false);
  const [newSsid, setNewSsid] = useState<string>('');
  const [newSiteName, setNewSiteName] = useState<string>('');
  const [newBssidPattern, setNewBssidPattern] = useState<string>('');

  // Reviewer Comment
  const [reviewerComment, setReviewerComment] = useState<string>(
    language === 'zh' ? '情况属实，生鲜冷库/码头查验核准' : 'Verified with store section lead, approved'
  );

  // Metrics
  const totalEmpCount = 128; // Standard Himart staff count
  const checkedInCount = records.filter((r) => r.checkInAt).length;
  const lateCount = records.filter((r) => r.checkInStatus === 'LATE').length;
  const pendingCorrectionCount = requests.filter((r) => r.status === 'PENDING').length;

  const handleCreateEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName.trim()) return;
    await onAddEmployee({
      username: newEmpName.toLowerCase().replace(/\s+/g, '_'),
      name: newEmpName,
      role: 'EMPLOYEE',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      employeeNo: newEmpNo,
      department: newEmpDept,
      position: newEmpPos,
      shiftId: 'shift-morning',
      deviceId: `android-keystore-hm${newEmpNo.replace('HM-', '')}-${Math.random().toString(36).substring(2, 6)}`,
      isActive: true,
      hireDate: new Date().toISOString().split('T')[0],
    });
    setShowAddEmployeeModal(false);
    setNewEmpName('');
  };

  const handleCreateWifiPolicySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSsid.trim() || !newSiteName.trim()) return;
    await onAddWifiPolicy({
      ssid: newSsid,
      siteName: newSiteName,
      bssidPattern: newBssidPattern || undefined,
      isActive: true,
      requireEgressIpVerification: false,
    });
    setShowAddWifiModal(false);
    setNewSsid('');
    setNewSiteName('');
  };

  // Filtered records
  const filteredRecords = records.filter((r) => {
    const matchesSearch = r.userName.toLowerCase().includes(searchTerm.toLowerCase()) || r.employeeNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === 'ALL' || r.department.includes(deptFilter);
    const matchesStatus = statusFilter === 'ALL' || r.checkInStatus === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="py-6 px-4 max-w-7xl mx-auto space-y-6">
      
      {/* Top Banner & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">{t.adminTitle}</h2>
            <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded border border-emerald-200">
              {t.supermarketBadge}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t.adminSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onRefreshData}
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors"
            title={t.adminRefresh}
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <a
            href="/api/v1/admin/reports/export/"
            download
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            {t.adminExportCsv}
          </a>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">{t.kpiTotalStaff}</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-slate-900 font-mono">{totalEmpCount}</span>
              <span className="text-[11px] text-slate-400">{t.kpiTotalStaffUnit}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">{t.kpiCheckedIn}</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-emerald-600 font-mono">{checkedInCount}</span>
              <span className="text-[11px] text-emerald-700 font-semibold">
                ({Math.round((checkedInCount / totalEmpCount) * 100)}% {t.kpiCheckedInRate})
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">{t.kpiLate}</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-amber-600 font-mono">{lateCount}</span>
              <span className="text-[11px] text-amber-700">{t.kpiLateUnit}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">{t.kpiPendingCorrections}</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-purple-600 font-mono">{pendingCorrectionCount}</span>
              <span className="text-[11px] text-purple-700">{t.kpiPendingUnit}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Admin Nav Sub-Tabs */}
      <div className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200 flex flex-wrap gap-1 text-xs font-medium">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeSubTab === 'overview'
              ? 'bg-white text-slate-900 font-bold shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {t.subtabMonitor}
        </button>

        <button
          onClick={() => setActiveSubTab('wifi')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeSubTab === 'wifi'
              ? 'bg-white text-slate-900 font-bold shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Wifi className="w-3.5 h-3.5 text-emerald-600" />
          {t.subtabWifi} ({wifiPolicies.filter((w) => w.isActive).length})
        </button>

        <button
          onClick={() => setActiveSubTab('employees')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeSubTab === 'employees'
              ? 'bg-white text-slate-900 font-bold shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-emerald-600" />
          {t.subtabEmployees} ({employees.length})
        </button>

        <button
          onClick={() => setActiveSubTab('corrections')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeSubTab === 'corrections'
              ? 'bg-white text-slate-900 font-bold shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5 text-purple-600" />
          {t.subtabCorrections} {pendingCorrectionCount > 0 && <span className="w-2 h-2 rounded-full bg-purple-600"></span>}
        </button>

        <button
          onClick={() => setActiveSubTab('audit')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeSubTab === 'audit'
              ? 'bg-white text-slate-900 font-bold shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-slate-700" />
          {t.subtabAudit} ({auditLogs.length})
        </button>
      </div>

      {/* SUB-TAB 1: OVERVIEW & ATTENDANCE MONITOR */}
      {activeSubTab === 'overview' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          
          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-100 text-xs">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none font-medium text-slate-700"
              >
                <option value="ALL">{t.allDepts}</option>
                <option value="Fresh">{t.deptFresh}</option>
                <option value="Cashier">{t.deptCashier}</option>
                <option value="Grocery">{t.deptGrocery}</option>
                <option value="Logistics">{t.deptLogistics}</option>
                <option value="Operations">{t.deptStoreOps}</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none font-medium text-slate-700"
              >
                <option value="ALL">{t.allStatuses}</option>
                <option value="ON_TIME">{t.statusOnTime}</option>
                <option value="LATE">{t.statusLate}</option>
                <option value="CORRECTION_APPROVED">{t.statusCorrectionApproved}</option>
              </select>
            </div>

            <span className="text-slate-500 font-mono">{t.totalRecordsDisplay}: {filteredRecords.length}</span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                  <th className="py-2.5 px-3">{t.thEmployee}</th>
                  <th className="py-2.5 px-3">{t.thDept}</th>
                  <th className="py-2.5 px-3">{t.thCheckInTime}</th>
                  <th className="py-2.5 px-3">{t.thCheckInSsid}</th>
                  <th className="py-2.5 px-3">{t.thStatus}</th>
                  <th className="py-2.5 px-3">{t.thCheckOutTime}</th>
                  <th className="py-2.5 px-3">{t.thNotes}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      <div>{r.userName}</div>
                      <span className="text-[10px] text-slate-400 font-mono">{r.employeeNo}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{r.department}</td>
                    <td className="py-3 px-3 font-mono font-medium text-slate-800">
                      {r.checkInAt ? new Date(r.checkInAt).toLocaleTimeString(language === 'zh' ? 'zh-CN' : 'en-US') : <span className="text-slate-400">{t.notCheckedIn}</span>}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">
                      {r.checkInSsid ? (
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                          {r.checkInSsid}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                          r.checkInStatus === 'ON_TIME'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.checkInStatus === 'LATE'
                            ? 'bg-amber-100 text-amber-800'
                            : r.checkInStatus === 'CORRECTION_APPROVED'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {r.checkInStatus === 'ON_TIME'
                          ? t.statusOnTime
                          : r.checkInStatus === 'LATE'
                          ? t.statusLate
                          : r.checkInStatus === 'CORRECTION_APPROVED'
                          ? t.statusCorrectionApproved
                          : t.notCheckedIn}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-800">
                      {r.checkOutAt ? new Date(r.checkOutAt).toLocaleTimeString(language === 'zh' ? 'zh-CN' : 'en-US') : <span className="text-slate-400">{t.notCheckedIn}</span>}
                    </td>
                    <td className="py-3 px-3 text-slate-500 max-w-xs truncate">{r.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* SUB-TAB 2: WIFI POLICIES */}
      {activeSubTab === 'wifi' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Wifi className="w-5 h-5 text-emerald-600" />
                {t.wifiTitle}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {t.wifiDesc}
              </p>
            </div>

            <button
              onClick={() => setShowAddWifiModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" />
              {t.addWifiBtn}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {wifiPolicies.map((wp) => (
              <div
                key={wp.id}
                className={`p-4 rounded-2xl border transition-all space-y-3 ${
                  wp.isActive ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl ${wp.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                      <Wifi className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm font-mono">{wp.ssid}</h4>
                      <span className="text-xs text-slate-500">{wp.siteName}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleWifiPolicy(wp.id)}
                    className={`px-3 py-1 rounded-full font-bold text-xs transition-colors ${
                      wp.isActive
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    {wp.isActive ? t.activeStatus : t.disabledStatus}
                  </button>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl text-[11px] font-mono text-slate-600 space-y-1 border border-slate-100">
                  <div className="flex justify-between">
                    <span>{t.bssidMaskLabel}</span>
                    <span className="font-medium text-slate-800">{wp.bssidPattern || t.anyBssid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.egressIpCheckLabel}</span>
                    <span className="font-medium text-slate-800">{wp.requireEgressIpVerification ? `${t.enabled} (113.108.*.*)` : t.disabled}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* SUB-TAB 3: EMPLOYEES MANAGEMENT */}
      {activeSubTab === 'employees' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                {t.empTitle}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {t.empDesc}
              </p>
            </div>

            <button
              onClick={() => setShowAddEmployeeModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" />
              {t.addEmpBtn}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                  <th className="py-2.5 px-3">{t.thEmpInfo}</th>
                  <th className="py-2.5 px-3">{t.thDeptRole}</th>
                  <th className="py-2.5 px-3">{t.thAccountRole}</th>
                  <th className="py-2.5 px-3">{t.thKeystoreKey}</th>
                  <th className="py-2.5 px-3">{t.thEmpStatus}</th>
                  <th className="py-2.5 px-3">{t.thActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <img src={emp.avatar} alt={emp.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                        <div>
                          <div className="font-bold text-slate-900">{emp.name}</div>
                          <span className="text-[10px] text-slate-400 font-mono">{emp.employeeNo}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-800">{emp.department}</div>
                      <span className="text-[10px] text-slate-400">{emp.position}</span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-700">{emp.role}</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-600 max-w-xs truncate">
                      {emp.deviceId}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          emp.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {emp.isActive ? t.activeEmp : t.suspendedEmp}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => onToggleEmployeeStatus(emp.id, !emp.isActive)}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold ${
                          emp.isActive
                            ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        }`}
                      >
                        {emp.isActive ? t.suspendAction : t.activateAction}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: CORRECTIONS & APPROVALS */}
      {activeSubTab === 'corrections' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-purple-600" />
              {t.approvalTitle}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {t.approvalDesc}
            </p>
          </div>

          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className={`p-4 rounded-2xl border transition-all ${
                  req.status === 'PENDING'
                    ? 'bg-purple-50/50 border-purple-200 shadow-sm'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{req.userName}</span>
                      <span className="text-[10px] bg-slate-200 px-1.5 py-0.2 rounded font-mono text-slate-700">
                        {req.employeeNo}
                      </span>
                      <span className="text-xs text-slate-500">· {req.department}</span>
                    </div>
                    <div className="text-xs text-slate-600 mt-1 flex items-center gap-3">
                      <span>{t.typeLabel}: <strong className="text-slate-800">{req.type}</strong></span>
                      <span>{t.dateLabel}: <strong className="font-mono text-slate-800">{req.targetDate}</strong></span>
                      {req.proposedTime && (
                        <span>{t.timeLabel}: <strong className="font-mono text-slate-800">{req.proposedTime}</strong></span>
                      )}
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${
                      req.status === 'PENDING'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : req.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {req.status === 'PENDING' ? t.statusPendingApproval : req.status === 'APPROVED' ? t.statusApproved : t.statusRejected}
                  </span>
                </div>

                <div className="pt-3 text-xs space-y-2">
                  <p className="text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200/80 leading-relaxed">
                    <strong className="text-slate-900">{t.reasonHeader}</strong> {req.reason}
                  </p>

                  {req.status === 'PENDING' && (
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="text"
                        placeholder={t.commentPlaceholder}
                        value={reviewerComment}
                        onChange={(e) => setReviewerComment(e.target.value)}
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none"
                      />
                      <button
                        onClick={() => onApproveCorrection(req.id, true, reviewerComment)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1 shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        {t.approveBtn}
                      </button>
                      <button
                        onClick={() => onApproveCorrection(req.id, false, reviewerComment)}
                        className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center gap-1 shadow-sm"
                      >
                        <X className="w-3.5 h-3.5" />
                        {t.rejectBtn}
                      </button>
                    </div>
                  )}

                  {req.status !== 'PENDING' && (
                    <div className="text-[11px] text-slate-500 pt-1">
                      {t.reviewedBy}: <strong>{req.reviewerName}</strong> · {req.reviewerComment || 'N/A'}
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* SUB-TAB 5: AUDIT LOGS */}
      {activeSubTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Shield className="w-5 h-5 text-slate-800" />
              {t.auditTitle}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {t.auditDesc}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                  <th className="py-2.5 px-3">{t.thTimestamp}</th>
                  <th className="py-2.5 px-3">{t.thActor}</th>
                  <th className="py-2.5 px-3">{t.thAction}</th>
                  <th className="py-2.5 px-3">{t.thTarget}</th>
                  <th className="py-2.5 px-3">{t.thDetails}</th>
                  <th className="py-2.5 px-3">{t.thIp}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 text-slate-500">{new Date(log.createdAt).toLocaleString(language === 'zh' ? 'zh-CN' : 'en-US')}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{log.actorName}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">{log.target}</td>
                    <td className="py-2.5 px-3 text-slate-600 max-w-md truncate">{log.details}</td>
                    <td className="py-2.5 px-3 text-slate-400">{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ADD SUPERMARKET EMPLOYEE */}
      {showAddEmployeeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
                {t.modalAddEmpTitle}
              </h3>
              <button onClick={() => setShowAddEmployeeModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateEmployeeSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">{t.nameLabel}</label>
                <input
                  type="text"
                  value={newEmpName}
                  onChange={(e) => setNewEmpName(e.target.value)}
                  placeholder={t.namePlaceholder}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">{t.empNoLabel}</label>
                <input
                  type="text"
                  value={newEmpNo}
                  onChange={(e) => setNewEmpNo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">{t.deptLabel}</label>
                <select
                  value={newEmpDept}
                  onChange={(e) => setNewEmpDept(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                >
                  <option value="生鲜熟食课 (Fresh Food & Deli)">生鲜熟食课 (Fresh Food & Deli)</option>
                  <option value="收银客服组 (Front-end & Cashier)">收银客服组 (Front-end & Cashier)</option>
                  <option value="食品百货课 (Grocery & Merchandise)">食品百货课 (Grocery & Merchandise)</option>
                  <option value="收货仓储组 (Receiving & Logistics)">收货仓储组 (Receiving & Logistics)</option>
                  <option value="商场运营部 (Store Operations)">商场运营部 (Store Operations)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">{t.roleLabel}</label>
                <input
                  type="text"
                  value={newEmpPos}
                  onChange={(e) => setNewEmpPos(e.target.value)}
                  placeholder="例: Cashier Team Lead / 生鲜技师"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddEmployeeModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600"
                >
                  {t.cancelBtn}
                </button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold">
                  {t.createConfirmBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD WIFI POLICY */}
      {showAddWifiModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">{t.modalAddWifiTitle}</h3>
              <button onClick={() => setShowAddWifiModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateWifiPolicySubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">{t.ssidLabel}</label>
                <input
                  type="text"
                  value={newSsid}
                  onChange={(e) => setNewSsid(e.target.value)}
                  placeholder={t.ssidPlaceholder}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">{t.siteLabel}</label>
                <input
                  type="text"
                  value={newSiteName}
                  onChange={(e) => setNewSiteName(e.target.value)}
                  placeholder={t.sitePlaceholder}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddWifiModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600"
                >
                  {t.cancelBtn}
                </button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold">
                  {t.savePolicyBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
