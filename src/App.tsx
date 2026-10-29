import React, { useState, useEffect } from 'react';
import { User, AttendanceRecord, WifiPolicy, Shift, LeaveOrCorrectionRequest, AuditLog, AttendanceEvent } from './types/attendance';
import { Header } from './components/Header';
import { AndroidSimulator } from './components/AndroidSimulator';
import { AdminDashboard } from './components/AdminDashboard';
import { AiAnalyticsView } from './components/AiAnalyticsView';
import { ArchitectureView } from './components/ArchitectureView';
import { ApkGeneratorView } from './components/ApkGeneratorView';
import { Language, TRANSLATIONS } from './i18n/translations';

export default function App() {
  const [activeTab, setActiveTab] = useState<'app' | 'admin' | 'apk' | 'ai' | 'arch'>('apk');

  // Language state (default: 'zh', persisted in localStorage)
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('himart_lang');
    return saved === 'en' ? 'en' : 'zh';
  });

  const t = TRANSLATIONS[language];

  const handleToggleLanguage = () => {
    setLanguage((prev) => {
      const next = prev === 'zh' ? 'en' : 'zh';
      localStorage.setItem('himart_lang', next);
      return next;
    });
  };

  // Server Data States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [userHistory, setUserHistory] = useState<AttendanceRecord[]>([]);
  const [wifiPolicies, setWifiPolicies] = useState<WifiPolicy[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [allRecords, setAllRecords] = useState<AttendanceRecord[]>([]);
  const [requests, setRequests] = useState<LeaveOrCorrectionRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [events, setEvents] = useState<AttendanceEvent[]>([]);

  const [loading, setLoading] = useState<boolean>(true);

  // Fetch all initial data from REST API
  const fetchAllData = async () => {
    try {
      // Current User & Today
      const meRes = await fetch('/api/v1/me/').then((r) => r.json());
      if (meRes.user) setCurrentUser(meRes.user);

      const todayRes = await fetch('/api/v1/attendance/today/').then((r) => r.json());
      if (todayRes.record) setTodayRecord(todayRes.record);
      else setTodayRecord(null);

      // User History
      const histRes = await fetch('/api/v1/attendance/history/').then((r) => r.json());
      if (histRes.history) setUserHistory(histRes.history);

      // Admin Datasets
      const empRes = await fetch('/api/v1/admin/employees/').then((r) => r.json());
      if (empRes.employees) setAllUsers(empRes.employees);

      const wifiRes = await fetch('/api/v1/admin/wifi-policies/').then((r) => r.json());
      if (wifiRes.policies) setWifiPolicies(wifiRes.policies);

      const shiftRes = await fetch('/api/v1/admin/shifts/').then((r) => r.json());
      if (shiftRes.shifts) setShifts(shiftRes.shifts);

      const recRes = await fetch('/api/v1/admin/attendance/').then((r) => r.json());
      if (recRes.records) setAllRecords(recRes.records);

      const reqRes = await fetch('/api/v1/admin/corrections/').then((r) => r.json());
      if (reqRes.requests) setRequests(reqRes.requests);

      const auditRes = await fetch('/api/v1/admin/audit-logs/').then((r) => r.json());
      if (auditRes.logs) setAuditLogs(auditRes.logs);

      const evtRes = await fetch('/api/v1/admin/events/').then((r) => r.json());
      if (evtRes.events) setEvents(evtRes.events);
    } catch (err) {
      console.error('Failed to load attendance store data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Switch User Session Handler
  const handleSwitchUser = async (userId: string) => {
    setLoading(true);
    try {
      await fetch('/api/v1/auth/switch-user/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      await fetchAllData();
    } catch (err) {
      console.error('Failed to switch user:', err);
    } finally {
      setLoading(false);
    }
  };

  // Staff Login Action
  const handleLogin = async (credential: string, deviceId: string) => {
    try {
      const res = await fetch('/api/v1/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: credential, deviceId }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchAllData();
      }
      return data;
    } catch (err: any) {
      return { success: false, message: err?.message || (language === 'zh' ? '网络通信异常' : 'Network communication error') };
    }
  };

  // Staff Register Action
  const handleRegister = async (data: {
    name: string;
    employeeNo: string;
    department: string;
    position: string;
    deviceId: string;
  }) => {
    try {
      const res = await fetch('/api/v1/auth/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (resData.success) {
        await fetchAllData();
      }
      return resData;
    } catch (err: any) {
      return { success: false, message: err?.message || (language === 'zh' ? '注册请求失败' : 'Registration failed') };
    }
  };

  // Staff Logout Action
  const handleLogout = async () => {
    try {
      await fetch('/api/v1/auth/logout/', { method: 'POST' });
      await fetchAllData();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Clock In Action
  const handleCheckIn = async (wifiSsid: string, deviceId: string) => {
    const chalRes = await fetch('/api/v1/attendance/challenge/', { method: 'POST' }).then((r) => r.json());
    if (!chalRes.success) {
      return {
        success: false,
        message: language === 'zh' ? '无法获取服务器 Challenge 凭证' : 'Failed to obtain server challenge nonce',
      };
    }

    const checkInRes = await fetch('/api/v1/attendance/check-in/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        challengeId: chalRes.challenge.challengeId,
        wifi: { connected: wifiSsid !== 'Disconnected', ssid: wifiSsid },
        deviceId,
      }),
    }).then((r) => r.json());

    await fetchAllData();
    return checkInRes;
  };

  // Clock Out Action
  const handleCheckOut = async (wifiSsid: string, deviceId: string) => {
    const chalRes = await fetch('/api/v1/attendance/challenge/', { method: 'POST' }).then((r) => r.json());
    if (!chalRes.success) {
      return {
        success: false,
        message: language === 'zh' ? '无法获取服务器凭证' : 'Failed to obtain server challenge nonce',
      };
    }

    const checkOutRes = await fetch('/api/v1/attendance/check-out/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        challengeId: chalRes.challenge.challengeId,
        wifi: { connected: wifiSsid !== 'Disconnected', ssid: wifiSsid },
        deviceId,
      }),
    }).then((r) => r.json());

    await fetchAllData();
    return checkOutRes;
  };

  // Submit Correction / Leave
  const handleSubmitCorrection = async (data: {
    type: 'PATCH_CHECK_IN' | 'PATCH_CHECK_OUT' | 'LEAVE';
    targetDate: string;
    proposedTime?: string;
    reason: string;
  }) => {
    await fetch('/api/v1/attendance/correction-request/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    await fetchAllData();
  };

  // Add Employee
  const handleAddEmployee = async (user: Omit<User, 'id'>) => {
    await fetch('/api/v1/admin/employees/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    await fetchAllData();
  };

  // Toggle Employee Active/Suspended
  const handleToggleEmployeeStatus = async (id: string, isActive: boolean) => {
    await fetch(`/api/v1/admin/employees/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive }),
    });
    await fetchAllData();
  };

  // Add Wi-Fi Policy
  const handleAddWifiPolicy = async (policy: Omit<WifiPolicy, 'id'>) => {
    await fetch('/api/v1/admin/wifi-policies/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(policy),
    });
    await fetchAllData();
  };

  // Toggle Wi-Fi Policy
  const handleToggleWifiPolicy = async (id: string) => {
    await fetch(`/api/v1/admin/wifi-policies/${id}/toggle/`, {
      method: 'PATCH',
    });
    await fetchAllData();
  };

  // Approve Correction Request
  const handleApproveCorrection = async (id: string, approved: boolean, comment: string) => {
    await fetch(`/api/v1/admin/corrections/${id}/approve/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved, reviewerComment: comment }),
    });
    await fetchAllData();
  };

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-mono text-slate-300">
          {language === 'zh'
            ? '正在同步 Himart 超市智能 Wi-Fi 考勤通道...'
            : 'Synchronizing Himart Supermarket Wi-Fi Attendance Gateway...'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      
      {/* Top App Header with Language Toggle */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        allUsers={allUsers}
        onSwitchUser={handleSwitchUser}
        language={language}
        onToggleLanguage={handleToggleLanguage}
        t={t}
      />

      {/* Main Tab Views */}
      <main className="flex-1">
        {activeTab === 'app' && (
          <AndroidSimulator
            currentUser={currentUser}
            allUsers={allUsers}
            todayRecord={todayRecord}
            history={userHistory}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
            onSubmitCorrection={handleSubmitCorrection}
            onLogin={handleLogin}
            onRegister={handleRegister}
            onLogout={handleLogout}
            refreshToday={fetchAllData}
            language={language}
            t={t}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            currentUser={currentUser}
            employees={allUsers}
            wifiPolicies={wifiPolicies}
            shifts={shifts}
            records={allRecords}
            requests={requests}
            auditLogs={auditLogs}
            events={events}
            onAddEmployee={handleAddEmployee}
            onToggleEmployeeStatus={handleToggleEmployeeStatus}
            onAddWifiPolicy={handleAddWifiPolicy}
            onToggleWifiPolicy={handleToggleWifiPolicy}
            onApproveCorrection={handleApproveCorrection}
            onRefreshData={fetchAllData}
            language={language}
            t={t}
          />
        )}

        {activeTab === 'apk' && <ApkGeneratorView language={language} t={t} />}

        {activeTab === 'ai' && <AiAnalyticsView language={language} t={t} />}

        {activeTab === 'arch' && <ArchitectureView language={language} t={t} />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500 space-y-1">
        <p className="font-semibold text-slate-700">{t.footerCopyright}</p>
        <p className="text-[11px] text-slate-400">
          {t.footerDesc}
        </p>
      </footer>

    </div>
  );
}
