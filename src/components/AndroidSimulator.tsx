import React, { useState, useEffect } from 'react';
import { User, AttendanceRecord } from '../types/attendance';
import {
  Wifi,
  WifiOff,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Key,
  RefreshCw,
  FileEdit,
  Send,
  Sliders,
  MapPin,
  Lock,
  ShoppingBag,
  LogOut,
  UserPlus,
  LogIn,
  Eye,
  EyeOff,
  UserCheck,
} from 'lucide-react';
import { Language, Translations } from '../i18n/translations';

interface AndroidSimulatorProps {
  currentUser: User;
  allUsers: User[];
  todayRecord: AttendanceRecord | null;
  history: AttendanceRecord[];
  onCheckIn: (wifiSsid: string, deviceId: string) => Promise<{ success: boolean; message: string }>;
  onCheckOut: (wifiSsid: string, deviceId: string) => Promise<{ success: boolean; message: string }>;
  onSubmitCorrection: (data: { type: 'PATCH_CHECK_IN' | 'PATCH_CHECK_OUT' | 'LEAVE'; targetDate: string; proposedTime?: string; reason: string }) => Promise<void>;
  onLogin: (credential: string, deviceId: string) => Promise<{ success: boolean; message: string }>;
  onRegister: (data: { name: string; employeeNo: string; department: string; position: string; deviceId: string }) => Promise<{ success: boolean; message: string }>;
  onLogout: () => Promise<void>;
  refreshToday: () => void;
  language: Language;
  t: Translations;
}

export const AndroidSimulator: React.FC<AndroidSimulatorProps> = ({
  currentUser,
  allUsers,
  todayRecord,
  history,
  onCheckIn,
  onCheckOut,
  onSubmitCorrection,
  onLogin,
  onRegister,
  onLogout,
  refreshToday,
  language,
  t,
}) => {
  // App Session Screen: 'ATTENDANCE' | 'AUTH'
  const [appScreen, setAppScreen] = useState<'ATTENDANCE' | 'AUTH'>('ATTENDANCE');
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Login Form State
  const [loginCredential, setLoginCredential] = useState<string>('HM-1002');
  const [loginPassword, setLoginPassword] = useState<string>('123456');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  // Register Form State
  const [regName, setRegName] = useState<string>('');
  const [regEmpNo, setRegEmpNo] = useState<string>(`HM-${Math.floor(7000 + Math.random() * 900)}`);
  const [regDept, setRegDept] = useState<string>('生鲜熟食课 (Fresh Food & Deli)');
  const [regPos, setRegPos] = useState<string>('生鲜技师 / Fresh Food Specialist');
  const [regPassword, setRegPassword] = useState<string>('123456');
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>('123456');

  // Simulator Controls State
  const [selectedWifi, setSelectedWifi] = useState<string>('Himart-Store-Staff-5G');
  const [hasNearbyWifiPermission, setHasNearbyWifiPermission] = useState<boolean>(true);
  const [hasFineLocationPermission, setHasFineLocationPermission] = useState<boolean>(true);
  const [simulatedDeviceId, setSimulatedDeviceId] = useState<string>(currentUser.deviceId || 'android-keystore-px7');
  const [showDevControls, setShowDevControls] = useState<boolean>(true);

  // Live Server Time Simulation
  const [serverTime, setServerTime] = useState<Date>(new Date());
  const [loadingAction, setLoadingAction] = useState<boolean>(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal State
  const [showCorrectionModal, setShowCorrectionModal] = useState<boolean>(false);
  const [showKeystoreModal, setShowKeystoreModal] = useState<boolean>(false);

  // Correction Form
  const [corrType, setCorrType] = useState<'PATCH_CHECK_IN' | 'PATCH_CHECK_OUT' | 'LEAVE'>('PATCH_CHECK_IN');
  const [corrDate, setCorrDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [corrTime, setCorrTime] = useState<string>('06:25');
  const [corrReason, setCorrReason] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => {
      setServerTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginCredential.trim()) return;
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await onLogin(loginCredential.trim(), simulatedDeviceId);
      if (res.success) {
        setAppScreen('ATTENDANCE');
        setActionFeedback({ type: 'success', message: res.message });
        refreshToday();
      } else {
        setAuthError(res.message || t.loginFailed);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Network error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleQuickDemoLogin = (empNo: string) => {
    setLoginCredential(empNo);
    setLoginPassword('123456');
    setAuthError(null);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmpNo.trim()) return;
    if (regPassword !== regConfirmPassword) {
      setAuthError(t.passwordMismatch);
      return;
    }

    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await onRegister({
        name: regName.trim(),
        employeeNo: regEmpNo.trim(),
        department: regDept,
        position: regPos,
        deviceId: simulatedDeviceId,
      });
      if (res.success) {
        setAppScreen('ATTENDANCE');
        setActionFeedback({ type: 'success', message: t.registerSuccess });
        refreshToday();
      } else {
        setAuthError(res.message || 'Registration failed');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Network error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogoutClick = async () => {
    await onLogout();
    setAppScreen('AUTH');
    setAuthMode('LOGIN');
    setActionFeedback(null);
  };

  const handleClockInClick = async () => {
    setLoadingAction(true);
    setActionFeedback(null);
    try {
      const res = await onCheckIn(selectedWifi, simulatedDeviceId);
      setActionFeedback({
        type: res.success ? 'success' : 'error',
        message: res.message,
      });
      refreshToday();
    } catch (err: any) {
      setActionFeedback({ type: 'error', message: err.message || 'Network error' });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleClockOutClick = async () => {
    setLoadingAction(true);
    setActionFeedback(null);
    try {
      const res = await onCheckOut(selectedWifi, simulatedDeviceId);
      setActionFeedback({
        type: res.success ? 'success' : 'error',
        message: res.message,
      });
      refreshToday();
    } catch (err: any) {
      setActionFeedback({ type: 'error', message: err.message || 'Network error' });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleCorrectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!corrReason.trim()) return;
    await onSubmitCorrection({
      type: corrType,
      targetDate: corrDate,
      proposedTime: corrTime,
      reason: corrReason,
    });
    setShowCorrectionModal(false);
    setCorrReason('');
    setActionFeedback({
      type: 'success',
      message: language === 'zh' ? '商超补签申请已提交 HR 审批' : 'Store attendance correction submitted to HR',
    });
  };

  const isConnectedStoreWifi = ['Himart-Store-Staff-5G', 'Himart-FreshDept-WiFi', 'Himart-Warehouse-AP'].includes(selectedWifi);

  return (
    <div className="py-6 px-4 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* LEFT COLUMN: Phone Interactive Controls / Debugger Panel */}
      <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-800 text-sm">{t.simControlsTitle}</h3>
          </div>
          <button
            onClick={() => setShowDevControls(!showDevControls)}
            className="text-xs text-emerald-600 font-medium hover:underline"
          >
            {showDevControls ? t.simControlsToggleCollapse : t.simControlsToggleExpand}
          </button>
        </div>

        {showDevControls && (
          <div className="space-y-4 text-xs">
            
            {/* Quick Screen Switcher button (Login/Attendance toggle for simulator) */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
              <span className="font-semibold text-slate-700 text-[11px]">
                {language === 'zh' ? 'APK 当前页面状态:' : 'APK Screen State:'}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setAppScreen('AUTH')}
                  className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-colors ${
                    appScreen === 'AUTH'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {language === 'zh' ? '登录/注册页' : 'Login / Register'}
                </button>
                <button
                  onClick={() => setAppScreen('ATTENDANCE')}
                  className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-colors ${
                    appScreen === 'ATTENDANCE'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {language === 'zh' ? '打卡主页' : 'Check-In Home'}
                </button>
              </div>
            </div>

            {/* 1. Store Wi-Fi Switcher */}
            <div>
              <label className="block text-slate-600 font-medium mb-1.5 flex items-center justify-between">
                <span>{t.simWifiLabel}</span>
                {isConnectedStoreWifi ? (
                  <span className="text-emerald-600 font-bold text-[11px]">{t.simWifiAllowed}</span>
                ) : (
                  <span className="text-rose-500 font-bold text-[11px]">{t.simWifiForbidden}</span>
                )}
              </label>
              <select
                value={selectedWifi}
                onChange={(e) => setSelectedWifi(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="Himart-Store-Staff-5G">Himart-Store-Staff-5G (1F/2F 卖场员工专网 / Sales Floor - 许可)</option>
                <option value="Himart-FreshDept-WiFi">Himart-FreshDept-WiFi (生鲜与肉禽加工区 / Fresh & Deli - 许可)</option>
                <option value="Himart-Warehouse-AP">Himart-Warehouse-AP (物流收货码头大仓 / Receiving Dock - 许可)</option>
                <option value="Himart-Public-Guest">Himart-Public-Guest (顾客公用 Wi-Fi / Prohibited for attendance)</option>
                <option value="Home-Router-5G">Home-Router-5G (员工家庭外网 / Home Wi-Fi - 无法打卡)</option>
                <option value="Disconnected">{t.networkDisconnected} (Cellular only)</option>
              </select>
            </div>

            {/* 2. Android Permission Checks */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
              <span className="font-semibold text-slate-700 block text-[11px]">{t.simPermissionsTitle}</span>
              
              <label className="flex items-center justify-between text-slate-600 cursor-pointer">
                <span className="flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-slate-500" />
                  {t.simPermissionNearby}
                </span>
                <input
                  type="checkbox"
                  checked={hasNearbyWifiPermission}
                  onChange={(e) => setHasNearbyWifiPermission(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between text-slate-600 cursor-pointer">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {t.simPermissionLocation}
                </span>
                <input
                  type="checkbox"
                  checked={hasFineLocationPermission}
                  onChange={(e) => setHasFineLocationPermission(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
              </label>
            </div>

            {/* 3. Simulated Device Key */}
            <div>
              <label className="block text-slate-600 font-medium mb-1 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>{t.simKeystoreFingerprint}</span>
              </label>
              <input
                type="text"
                value={simulatedDeviceId}
                onChange={(e) => setSimulatedDeviceId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono text-[11px] text-slate-700"
              />
            </div>

            {/* Quick Actions */}
            <div className="pt-2 flex items-center justify-between gap-2">
              <button
                onClick={() => setShowKeystoreModal(true)}
                className="flex-1 border border-slate-200 bg-white hover:bg-slate-50 py-1.5 px-2 rounded-lg text-slate-700 font-medium text-[11px] flex items-center justify-center gap-1"
              >
                <Key className="w-3.5 h-3.5 text-amber-500" />
                {t.simViewKeystoreKey}
              </button>
              <button
                onClick={() => setShowCorrectionModal(true)}
                className="flex-1 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 py-1.5 px-2 rounded-lg text-emerald-700 font-semibold text-[11px] flex items-center justify-center gap-1"
              >
                <FileEdit className="w-3.5 h-3.5 text-emerald-600" />
                {t.simApplyCorrection}
              </button>
            </div>

          </div>
        )}

        {/* Informational callout regarding server-authoritative rules */}
        <div className="bg-emerald-50/80 border border-emerald-200 p-3 rounded-xl text-emerald-950 text-xs leading-relaxed space-y-1">
          <p className="font-semibold flex items-center gap-1.5 text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            {t.simSecurityNoticeTitle}
          </p>
          <p className="text-[11px]">{t.simSecurityNotice1}</p>
          <p className="text-[11px]">{t.simSecurityNotice2}</p>
        </div>

      </div>

      {/* RIGHT COLUMN: Realistic Android App Live Frame */}
      <div className="lg:col-span-7 flex justify-center">
        
        {/* Smartphone Shell */}
        <div className="w-[360px] sm:w-[380px] bg-slate-900 rounded-[42px] p-3 shadow-2xl border-4 border-slate-800 relative">
          
          {/* Camera Notch */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-950 rounded-full z-30 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-800 ml-auto mr-3"></div>
          </div>

          {/* Android App Inner Display Container */}
          <div className="bg-slate-50 rounded-[32px] overflow-hidden min-h-[660px] flex flex-col font-sans relative">
            
            {/* Top Android Status Bar */}
            <div className="bg-emerald-900 text-white px-5 pt-3 pb-1 flex items-center justify-between text-[11px] font-medium z-20">
              <span>{serverTime.toLocaleTimeString(language === 'zh' ? 'zh-CN' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</span>
              <div className="flex items-center gap-2">
                {selectedWifi !== 'Disconnected' ? (
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <WifiOff className="w-3.5 h-3.5 text-rose-400" />
                )}
                <span>5G</span>
                <span className="text-[10px]">99%</span>
              </div>
            </div>

            {/* SCREEN 1: LOGIN & REGISTRATION SCREEN */}
            {appScreen === 'AUTH' && (
              <div className="flex-1 flex flex-col justify-between p-4 overflow-y-auto">
                <div className="space-y-4 pt-3">
                  
                  {/* Brand Lockup */}
                  <div className="text-center space-y-1">
                    <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-emerald-600/30">
                      <ShoppingBag className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-base">{t.appCompany}</h3>
                    <p className="text-[11px] text-slate-500 font-medium">{t.appTitle}</p>
                  </div>

                  {/* Auth Mode Tabs */}
                  <div className="flex items-center bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
                    <button
                      onClick={() => { setAuthMode('LOGIN'); setAuthError(null); }}
                      className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        authMode === 'LOGIN' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600'
                      }`}
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>{t.loginTab}</span>
                    </button>

                    <button
                      onClick={() => { setAuthMode('REGISTER'); setAuthError(null); }}
                      className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        authMode === 'REGISTER' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600'
                      }`}
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>{t.registerTab}</span>
                    </button>
                  </div>

                  {/* Auth Error Banner */}
                  {authError && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-[11px] font-medium flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{authError}</span>
                    </div>
                  )}

                  {/* LOGIN FORM */}
                  {authMode === 'LOGIN' && (
                    <form onSubmit={handleLoginSubmit} className="space-y-3 text-xs">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">{t.usernameOrEmpNo}</label>
                        <input
                          type="text"
                          value={loginCredential}
                          onChange={(e) => setLoginCredential(e.target.value)}
                          placeholder="HM-1002"
                          className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">{t.passwordLabel}</label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            placeholder="••••••"
                            className="w-full bg-white border border-slate-200 rounded-xl p-2.5 pr-9 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Keystore Badge */}
                      <div className="p-2 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-[10px] text-emerald-900 flex items-start gap-1.5">
                        <Key className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{t.bindDeviceNotice}</span>
                      </div>

                      <button
                        type="submit"
                        disabled={authLoading}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-1.5"
                      >
                        {authLoading ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>{t.loggingInBtn}</span>
                          </>
                        ) : (
                          <>
                            <LogIn className="w-3.5 h-3.5" />
                            <span>{t.loginBtn}</span>
                          </>
                        )}
                      </button>

                      {/* Quick Demo Accounts Chips */}
                      <div className="pt-2 border-t border-slate-200/60 space-y-1.5">
                        <span className="text-[10px] font-semibold text-slate-400 block">{t.quickDemoLogin}</span>
                        <div className="flex flex-wrap gap-1.5">
                          {allUsers.slice(0, 4).map((u) => (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() => handleQuickDemoLogin(u.employeeNo)}
                              className="px-2 py-1 bg-white hover:bg-emerald-50 border border-slate-200 rounded-lg text-[10px] font-medium text-slate-700 transition-colors"
                            >
                              {u.name} ({u.employeeNo})
                            </button>
                          ))}
                        </div>
                      </div>
                    </form>
                  )}

                  {/* REGISTRATION FORM */}
                  {authMode === 'REGISTER' && (
                    <form onSubmit={handleRegisterSubmit} className="space-y-2.5 text-xs">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-0.5">{t.nameLabel}</label>
                        <input
                          type="text"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="e.g. Alex Wang / 钱雪"
                          className="w-full bg-white border border-slate-200 rounded-xl p-2 font-medium"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-700 font-semibold mb-0.5">{t.empNoLabel}</label>
                          <input
                            type="text"
                            value={regEmpNo}
                            onChange={(e) => setRegEmpNo(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl p-2 font-mono text-[11px]"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-semibold mb-0.5">{t.roleLabel}</label>
                          <input
                            type="text"
                            value={regPos}
                            onChange={(e) => setRegPos(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl p-2 font-medium"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-semibold mb-0.5">{t.deptLabel}</label>
                        <select
                          value={regDept}
                          onChange={(e) => setRegDept(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl p-2 font-medium"
                        >
                          <option value="生鲜熟食课 (Fresh Food & Deli)">生鲜熟食课 (Fresh Food & Deli)</option>
                          <option value="收银客服组 (Front-end & Cashier)">收银客服组 (Front-end & Cashier)</option>
                          <option value="食品百货课 (Grocery & Merchandise)">食品百货课 (Grocery & Merchandise)</option>
                          <option value="收货仓储组 (Receiving & Logistics)">收货仓储组 (Receiving & Logistics)</option>
                          <option value="商场运营部 (Store Operations)">商场运营部 (Store Operations)</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-700 font-semibold mb-0.5">{t.passwordLabel}</label>
                          <input
                            type="password"
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl p-2"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 font-semibold mb-0.5">{t.confirmPasswordLabel}</label>
                          <input
                            type="password"
                            value={regConfirmPassword}
                            onChange={(e) => setRegConfirmPassword(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl p-2"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={authLoading}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-1.5 mt-2"
                      >
                        {authLoading ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>{t.loggingInBtn}</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>{t.registerBtn}</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}

                </div>

                <div className="text-center pt-3 border-t border-slate-100">
                  <p className="text-[10px] text-slate-400">
                    Himart Store Attendance System v2.5.0
                  </p>
                </div>
              </div>
            )}

            {/* SCREEN 2: LOGGED-IN ATTENDANCE SCREEN */}
            {appScreen === 'ATTENDANCE' && (
              <>
                {/* App Action Bar */}
                <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 text-white px-5 pb-5 pt-2">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold tracking-wider bg-white/10 px-2 py-0.5 rounded text-emerald-200">
                        Himart
                      </span>
                      <span className="font-bold text-sm">{t.appTitle}</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={refreshToday}
                        className="p-1 hover:bg-white/10 rounded-full transition-colors"
                        title="Refresh data"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 text-emerald-200 ${loadingAction ? 'animate-spin' : ''}`} />
                      </button>

                      {/* Log Out Button */}
                      <button
                        onClick={handleLogoutClick}
                        className="flex items-center gap-1 text-[10px] bg-white/10 hover:bg-rose-500/80 px-2 py-1 rounded-lg text-emerald-100 hover:text-white transition-colors"
                        title={t.logoutBtn}
                      >
                        <LogOut className="w-3 h-3" />
                        <span>{t.logoutBtn}</span>
                      </button>
                    </div>
                  </div>

                  {/* Supermarket Staff Card */}
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-11 h-11 rounded-full object-cover border-2 border-white/30"
                    />
                    <div>
                      <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                        {currentUser.name}
                        <span className="text-[10px] font-normal bg-emerald-500/40 text-emerald-100 px-1.5 py-0.2 rounded font-mono">
                          {currentUser.employeeNo}
                        </span>
                      </h4>
                      <p className="text-[11px] text-emerald-200">{currentUser.department}</p>
                      <p className="text-[10px] text-slate-300">{currentUser.position}</p>
                    </div>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="p-4 flex-1 space-y-4 overflow-y-auto">
                  
                  {/* Wi-Fi Connection Detection Card */}
                  <div
                    className={`p-3.5 rounded-2xl border transition-all ${
                      !hasNearbyWifiPermission || !hasFineLocationPermission
                        ? 'bg-amber-50 border-amber-200'
                        : isConnectedStoreWifi
                        ? 'bg-emerald-50/90 border-emerald-200'
                        : 'bg-rose-50/90 border-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        {selectedWifi !== 'Disconnected' ? (
                          <Wifi
                            className={`w-5 h-5 ${
                              isConnectedStoreWifi ? 'text-emerald-600' : 'text-rose-500'
                            }`}
                          />
                        ) : (
                          <WifiOff className="w-5 h-5 text-slate-400" />
                        )}
                        <div>
                          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
                            {t.networkStatusTitle}
                          </span>
                          <h5 className="font-bold text-slate-800 text-xs">
                            {selectedWifi === 'Disconnected' ? t.networkDisconnected : selectedWifi}
                          </h5>
                        </div>
                      </div>

                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                          !hasNearbyWifiPermission || !hasFineLocationPermission
                            ? 'bg-amber-200 text-amber-900'
                            : isConnectedStoreWifi
                            ? 'bg-emerald-200/80 text-emerald-800'
                            : 'bg-rose-200/80 text-rose-800'
                        }`}
                      >
                        {!hasNearbyWifiPermission || !hasFineLocationPermission
                          ? t.networkStatusMissingPerms
                          : isConnectedStoreWifi
                          ? t.networkStatusConnected
                          : t.networkStatusMismatch}
                      </span>
                    </div>

                    {(!hasNearbyWifiPermission || !hasFineLocationPermission) && (
                      <p className="text-[10px] text-amber-800 mt-2 border-t border-amber-200 pt-1.5">
                        {t.androidPermsWarning}
                      </p>
                    )}
                  </div>

                  {/* Action Feedback Banner */}
                  {actionFeedback && (
                    <div
                      className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                        actionFeedback.type === 'success'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-rose-600 text-white'
                      }`}
                    >
                      {actionFeedback.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 shrink-0" />
                      )}
                      <span>{actionFeedback.message}</span>
                    </div>
                  )}

                  {/* Big Check-in & Check-out Action Section */}
                  <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        {t.todayAttendanceTitle}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 font-medium">
                        {t.serverTimeLabel}: {serverTime.toLocaleTimeString(language === 'zh' ? 'zh-CN' : 'en-US')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      
                      {/* Clock In */}
                      <div
                        className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                          todayRecord?.checkInAt
                            ? 'bg-emerald-50/50 border-emerald-200'
                            : 'bg-slate-50 border-slate-200 hover:border-emerald-300'
                        }`}
                      >
                        <div>
                          <span className="text-[10px] font-semibold text-slate-500 block">01. {t.checkInBtn}</span>
                          <div className="my-1.5">
                            {todayRecord?.checkInAt ? (
                              <span className="text-lg font-bold text-emerald-700 font-mono block">
                                {new Date(todayRecord.checkInAt).toLocaleTimeString(language === 'zh' ? 'zh-CN' : 'en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            ) : (
                              <span className="text-sm font-semibold text-slate-400 block">{t.checkInRule}: 06:30/09:30</span>
                            )}
                          </div>
                        </div>

                        {todayRecord?.checkInAt ? (
                          <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{todayRecord.checkInStatus === 'LATE' ? t.checkInLate : t.checkInDone}</span>
                          </div>
                        ) : (
                          <button
                            onClick={handleClockInClick}
                            disabled={loadingAction || !isConnectedStoreWifi || !hasNearbyWifiPermission}
                            className={`w-full py-2 rounded-lg font-bold text-xs transition-all ${
                              !isConnectedStoreWifi || !hasNearbyWifiPermission
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 active:scale-95'
                            }`}
                          >
                            {loadingAction ? t.clockInValidating : t.checkInBtn}
                          </button>
                        )}
                      </div>

                      {/* Clock Out */}
                      <div
                        className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                          todayRecord?.checkOutAt
                            ? 'bg-emerald-50/50 border-emerald-200'
                            : 'bg-slate-50 border-slate-200 hover:border-emerald-300'
                        }`}
                      >
                        <div>
                          <span className="text-[10px] font-semibold text-slate-500 block">02. {t.checkOutBtn}</span>
                          <div className="my-1.5">
                            {todayRecord?.checkOutAt ? (
                              <span className="text-lg font-bold text-emerald-700 font-mono block">
                                {new Date(todayRecord.checkOutAt).toLocaleTimeString(language === 'zh' ? 'zh-CN' : 'en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            ) : (
                              <span className="text-sm font-semibold text-slate-400 block">{t.checkOutRule}: 15:30/18:30</span>
                            )}
                          </div>
                        </div>

                        {todayRecord?.checkOutAt ? (
                          <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{t.checkOutDone}</span>
                          </div>
                        ) : (
                          <button
                            onClick={handleClockOutClick}
                            disabled={loadingAction || !todayRecord?.checkInAt || !isConnectedStoreWifi}
                            className={`w-full py-2 rounded-lg font-bold text-xs transition-all ${
                              !todayRecord?.checkInAt || !isConnectedStoreWifi
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 active:scale-95'
                            }`}
                          >
                            {loadingAction ? t.clockInValidating : t.checkOutBtn}
                          </button>
                        )}
                      </div>

                    </div>

                    {!isConnectedStoreWifi && (
                      <p className="text-[10px] text-rose-500 font-medium text-center">
                        {t.unauthorizedWifiWarning}
                      </p>
                    )}
                  </div>

                  {/* Personal Store History Mini List */}
                  <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm space-y-2">
                    <span className="text-xs font-bold text-slate-800 block">{t.recentHistoryTitle}</span>
                    <div className="space-y-2 divide-y divide-slate-100 text-xs">
                      {history.slice(0, 3).map((rec) => (
                        <div key={rec.id} className="pt-2 first:pt-0 flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-slate-800 block">{rec.workDate}</span>
                            <span className="text-[10px] text-slate-500">
                              {rec.checkInAt ? `${t.checkInBtn}: ${new Date(rec.checkInAt).toLocaleTimeString(language === 'zh' ? 'zh-CN' : 'en-US', { hour: '2-digit', minute: '2-digit' })}` : t.notCheckedIn}
                            </span>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              rec.checkInStatus === 'ON_TIME'
                                ? 'bg-emerald-100 text-emerald-800'
                                : rec.checkInStatus === 'LATE'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {rec.checkInStatus === 'ON_TIME' ? t.statusOnTime : rec.checkInStatus === 'LATE' ? t.statusLate : t.statusCorrectionApproved}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </>
            )}

            {/* Android Navigation Bar */}
            <div className="bg-slate-900 text-slate-400 py-2.5 flex items-center justify-around border-t border-slate-800">
              <div className="w-3.5 h-3.5 border-2 border-slate-500 rounded-sm"></div>
              <div className="w-3.5 h-3.5 border-2 border-slate-500 rounded-full"></div>
              <div className="w-0 h-0 border-y-[6px] border-y-transparent border-r-[10px] border-r-slate-500"></div>
            </div>

          </div>
        </div>

      </div>

      {/* CORRECTION REQUEST MODAL */}
      {showCorrectionModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <FileEdit className="w-5 h-5 text-emerald-600" />
                {t.correctionTitle}
              </h3>
              <button
                onClick={() => setShowCorrectionModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCorrectionSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">{t.correctionTypeLabel}</label>
                <select
                  value={corrType}
                  onChange={(e: any) => setCorrType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                >
                  <option value="PATCH_CHECK_IN">{t.corrPatchIn}</option>
                  <option value="PATCH_CHECK_OUT">{t.corrPatchOut}</option>
                  <option value="LEAVE">{t.corrLeave}</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">{t.targetDateLabel}</label>
                  <input
                    type="date"
                    value={corrDate}
                    onChange={(e) => setCorrDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">{t.proposedTimeLabel}</label>
                  <input
                    type="time"
                    value={corrTime}
                    onChange={(e) => setCorrTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">{t.reasonLabel}</label>
                <textarea
                  rows={3}
                  value={corrReason}
                  onChange={(e) => setCorrReason(e.target.value)}
                  placeholder={t.reasonPlaceholder}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCorrectionModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-medium"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {t.submitToHrBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* KEYSTORE INFO MODAL */}
      {showKeystoreModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                {t.keystoreTitle}
              </h3>
              <button
                onClick={() => setShowKeystoreModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="bg-slate-900 text-emerald-400 font-mono p-3 rounded-xl overflow-x-auto text-[11px] leading-relaxed">
                <div>// Android KeyGenParameterSpec</div>
                <div>Algorithm: RSA-2048 / AES-256-GCM</div>
                <div>KeyAlias: Himart_Store_Staff_Key</div>
                <div>Purposes: SIGN | ENCRYPT</div>
                <div>AttestationChallenge: verified</div>
                <div className="text-slate-400 mt-1">KeyID: {simulatedDeviceId}</div>
              </div>

              <p className="text-slate-600 leading-relaxed">
                {t.keystoreDescription}
              </p>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowKeystoreModal(false)}
                className="px-4 py-2 bg-slate-800 text-white font-semibold rounded-lg text-xs"
              >
                {t.closeBtn}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
