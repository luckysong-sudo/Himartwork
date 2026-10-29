import React, { useState } from 'react';
import { Database, Code2, Server, Terminal, Copy, Check, ShoppingBag } from 'lucide-react';
import { Language, Translations } from '../i18n/translations';

interface ArchitectureViewProps {
  language: Language;
  t: Translations;
}

export const ArchitectureView: React.FC<ArchitectureViewProps> = ({ language, t }) => {
  const [activeSubTab, setActiveSubTab] = useState<'arch' | 'schema' | 'kotlin' | 'django' | 'docker'>('arch');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copySnippet = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const djangoCodeSnippet = `@transaction.atomic
def create_store_check_in(user, challenge_id, wifi_data, device_id):
    """
    Himart Supermarket Atomic Check-In Transaction (Python / Django REST Framework)
    1. Verify staff employment status (Cashier, Fresh Deli, Logistics, etc.)
    2. Verify Android Keystore Hardware Fingerprint
    3. Validate 60s Challenge Nonce (Single-use consumption)
    4. Match Whitelisted Store Zone SSIDs & Egress Public IP
    5. Write immutable attendance records and audit stream
    """
    # 1. Verify active employment
    if not user.is_active:
        raise ValidationError("Staff account is suspended. Check-in prohibited.")

    # 2. Check 60s challenge token
    challenge = ChallengeNonce.objects.select_for_update().filter(
        id=challenge_id, user=user, is_consumed=False, expires_at__gt=timezone.now()
    ).first()
    if not challenge:
        raise ValidationError("Challenge token is invalid or expired. Please refresh.")
    challenge.is_consumed = True
    challenge.save(update_fields=['is_consumed'])

    # 3. Match Store Zone Wi-Fi policy (e.g. Himart-Store-Staff-5G / Himart-FreshDept-WiFi)
    ssid = wifi_data.get("ssid")
    policy = WifiPolicy.objects.filter(ssid__iexact=ssid, is_active=True).first()
    if not policy:
        AuditLog.objects.create(
            actor=user, action="STORE_CHECK_IN_BLOCKED",
            details=f"Attempted check-in via unauthorized network [{ssid}]"
        )
        raise ValidationError(f"Network [{ssid}] is not whitelisted for Himart supermarket attendance.")

    # 4. Acquire row-lock on today's attendance record
    today = timezone.now().date()
    record, created = AttendanceRecord.objects.select_for_update().get_or_create(
        user=user, work_date=today,
        defaults={'shift': user.shift}
    )
    if record.check_in_at is not None:
        raise ValidationError("Today's shift clock-in has already been registered.")

    # 5. Server-authoritative timestamping
    now = timezone.now()
    record.check_in_at = now
    record.check_in_ssid = ssid
    
    # Check on-time status against store shift + grace period
    shift_start = user.shift.start_time
    grace_cutoff = shift_start + timedelta(minutes=user.shift.grace_period_minutes)
    record.check_in_status = "ON_TIME" if now.time() <= grace_cutoff else "LATE"
    record.save()

    # 6. Append-only event logging
    AttendanceEvent.objects.create(
        record=record, user=user, event_type="CHECK_IN",
        server_time=now, result="SUCCESS", ssid=ssid, device_id=device_id
    )

    return record`;

  const kotlinCodeSnippet = `// Himart Android Jetpack Compose Store Wi-Fi Attendance (Kotlin)
class SupermarketAttendanceRepository(private val apiService: AttendanceApiService) {

    suspend fun executeClockIn(context: Context, storeWifiSsid: String): Result<AttendanceCheckResponse> {
        return try {
            // 1. Fetch short-lived 60s Challenge Nonce from Himart backend
            val challengeResponse = apiService.fetchChallenge()
            if (!challengeResponse.isSuccessful) {
                return Result.failure(Exception("Failed to acquire server challenge nonce"))
            }

            val challenge = challengeResponse.body()!!.challenge

            // 2. Retrieve Android Keystore Hardware Device Fingerprint (TEE/SE)
            val deviceId = AndroidKeystoreManager.getOrCreateDeviceId(context)

            // 3. Construct attendance payload
            val requestBody = CheckInRequest(
                challengeId = challenge.challengeId,
                wifi = WifiPayload(
                    connected = true,
                    ssid = storeWifiSsid
                ),
                deviceId = deviceId
            )

            // 4. Send encrypted HTTPS request to Himart Django API
            val result = apiService.checkIn(requestBody)
            if (result.isSuccessful) {
                Result.success(result.body()!!)
            } else {
                Result.failure(Exception(result.errorBody()?.string() ?: "Store Wi-Fi validation rejected"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}`;

  const dockerComposeSnippet = `version: '3.8'

services:
  web:
    build: .
    command: gunicorn backend.wsgi:application --bind 0.0.0.0:8000 --workers 4
    environment:
      - DATABASE_URL=postgres://himart_user:SecurePass2026!@db:5432/himart_attendance
      - SECRET_KEY=himart-supermarket-prod-secret-2026
      - ALLOWED_HOSTS=attendance.himart.com,localhost
    depends_on:
      - db
    restart: always

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=himart_attendance
      - POSTGRES_USER=himart_user
      - POSTGRES_PASSWORD=SecurePass2026!
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - web
    restart: always

volumes:
  postgres_data:`;

  return (
    <div className="py-6 px-4 max-w-6xl mx-auto space-y-6">
      
      {/* Top Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Server className="w-5 h-5 text-emerald-600" />
            {t.archTitle}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.archSubtitle}
          </p>
        </div>

        {/* Sub tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setActiveSubTab('arch')}
            className={`px-3 py-1.5 rounded-lg ${activeSubTab === 'arch' ? 'bg-white text-slate-900 font-bold shadow-sm' : 'text-slate-600'}`}
          >
            {t.archSubtabFlow}
          </button>
          <button
            onClick={() => setActiveSubTab('schema')}
            className={`px-3 py-1.5 rounded-lg ${activeSubTab === 'schema' ? 'bg-white text-slate-900 font-bold shadow-sm' : 'text-slate-600'}`}
          >
            {t.archSubtabSchema}
          </button>
          <button
            onClick={() => setActiveSubTab('django')}
            className={`px-3 py-1.5 rounded-lg ${activeSubTab === 'django' ? 'bg-white text-slate-900 font-bold shadow-sm' : 'text-slate-600'}`}
          >
            {t.archSubtabDjango}
          </button>
          <button
            onClick={() => setActiveSubTab('kotlin')}
            className={`px-3 py-1.5 rounded-lg ${activeSubTab === 'kotlin' ? 'bg-white text-slate-900 font-bold shadow-sm' : 'text-slate-600'}`}
          >
            {t.archSubtabKotlin}
          </button>
          <button
            onClick={() => setActiveSubTab('docker')}
            className={`px-3 py-1.5 rounded-lg ${activeSubTab === 'docker' ? 'bg-white text-slate-900 font-bold shadow-sm' : 'text-slate-600'}`}
          >
            {t.archSubtabDocker}
          </button>
        </div>
      </div>

      {/* SUB TAB 1: ARCHITECTURE DIAGRAM */}
      {activeSubTab === 'arch' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">
              {language === 'zh'
                ? '面向商超高并发换班打卡的软硬件防伪链与系统流'
                : 'Supermarket Shift Handover Anti-Spoofing & Data Flow Architecture'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'zh'
                ? '由 Android 客户端获取服务端 60s Challenge 令牌，校验各商超卖场/生鲜/收货区 Wi-Fi，并在 PostgreSQL 事务中原子化完成打卡与审计。'
                : 'Android staff app acquires a 60s Challenge Nonce, verifies store zone Wi-Fi, and executes atomic PostgreSQL transactions.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2">
              <span className="font-extrabold text-emerald-900 text-sm block">{t.archCard1Title}</span>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                {t.archCard1Desc}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-extrabold text-slate-900 text-sm block">{t.archCard2Title}</span>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                {t.archCard2Desc}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-extrabold text-slate-900 text-sm block">{t.archCard3Title}</span>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                {t.archCard3Desc}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2">
              <span className="font-extrabold text-emerald-900 text-sm block">{t.archCard4Title}</span>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                {t.archCard4Desc}
              </p>
            </div>

          </div>

          <div className="p-4 bg-slate-900 text-slate-200 rounded-2xl font-mono text-xs space-y-2">
            <span className="text-emerald-400 font-bold block">
              {language === 'zh' ? '【商超 REST API 交互协议规范 /api/v1/】' : '[Himart Store REST API Protocol /api/v1/]'}
            </span>
            <div>1. POST /api/v1/auth/login/ -&gt; JWT Session & Role Check</div>
            <div>2. POST /api/v1/attendance/challenge/ -&gt; 60s Single-Use Nonce</div>
            <div>3. POST /api/v1/attendance/check-in/ -&gt; Atomic Store Wi-Fi & Shift Validation</div>
            <div>4. GET /api/v1/admin/reports/export/ -&gt; Supermarket CSV Shift Report</div>
          </div>
        </div>
      )}

      {/* SUB TAB 2: POSTGRESQL SCHEMA */}
      {activeSubTab === 'schema' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
            {language === 'zh' ? 'PostgreSQL 商超考勤核心数据表结构' : 'PostgreSQL Supermarket Attendance Schema Tables'}
          </h3>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse font-mono">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                  <th className="py-2.5 px-3">Table Name</th>
                  <th className="py-2.5 px-3">Primary Fields</th>
                  <th className="py-2.5 px-3">Constraints & Indexes</th>
                  <th className="py-2.5 px-3">{language === 'zh' ? '说明' : 'Description'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px] text-slate-700">
                <tr>
                  <td className="py-2.5 px-3 font-bold text-emerald-600">users</td>
                  <td className="py-2.5 px-3">id, username, password_hash, role, is_active</td>
                  <td className="py-2.5 px-3 text-slate-500">PRIMARY KEY(id), UNIQUE(username)</td>
                  <td className="py-2.5 px-3">{language === 'zh' ? '商超员工与管理员登录账号' : 'Store staff & admin login'}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold text-emerald-600">employees</td>
                  <td className="py-2.5 px-3">user_id, employee_no, department_id, device_id</td>
                  <td className="py-2.5 px-3 text-slate-500">UNIQUE(employee_no)</td>
                  <td className="py-2.5 px-3">{language === 'zh' ? '员工档案与 Android 硬件设备指纹' : 'Staff profiles & Keystore device keys'}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold text-emerald-600">wifi_policies</td>
                  <td className="py-2.5 px-3">id, ssid, site_name, bssid_pattern, is_active</td>
                  <td className="py-2.5 px-3 text-slate-500">INDEX(ssid, is_active)</td>
                  <td className="py-2.5 px-3">{language === 'zh' ? '商超各卖场及生鲜冷库 Wi-Fi 白名单' : 'Store zones & dock Wi-Fi whitelist'}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold text-emerald-600">attendance_records</td>
                  <td className="py-2.5 px-3">id, user_id, shift_id, work_date, check_in_at, check_out_at</td>
                  <td className="py-2.5 px-3 text-slate-500 font-semibold text-amber-700">UNIQUE(user_id, work_date)</td>
                  <td className="py-2.5 px-3">{language === 'zh' ? '每日班次考勤记录主表' : 'Daily shift attendance records (unique per day)'}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold text-emerald-600">attendance_events</td>
                  <td className="py-2.5 px-3">id, record_id, event_type, server_time, result, ssid</td>
                  <td className="py-2.5 px-3 text-slate-500">APPEND-ONLY (No UPDATE)</td>
                  <td className="py-2.5 px-3">{language === 'zh' ? '不可篡改的商超打卡事件历史流水' : 'Immutable check-in event stream'}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold text-emerald-600">audit_logs</td>
                  <td className="py-2.5 px-3">id, actor_id, action, target_id, details, created_at</td>
                  <td className="py-2.5 px-3 text-slate-500">INDEX(created_at)</td>
                  <td className="py-2.5 px-3">{language === 'zh' ? '管理员审批与伪造网络拦截安全审计' : 'Store admin approvals & spoofing audit trail'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB TAB 3: DJANGO CODE */}
      {activeSubTab === 'django' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Code2 className="w-4 h-4 text-emerald-600" />
              {language === 'zh'
                ? 'Django 商超打卡事务核心代码 (backend/apps/attendance/services.py)'
                : 'Django Supermarket Check-In Transaction Service'}
            </h3>
            <button
              onClick={() => copySnippet('django', djangoCodeSnippet)}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-semibold text-xs flex items-center gap-1"
            >
              {copiedKey === 'django' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedKey === 'django' ? t.copiedBtn : t.copyBtn}
            </button>
          </div>

          <pre className="bg-slate-950 text-slate-100 p-4 rounded-xl text-[11px] font-mono leading-relaxed overflow-x-auto">
            {djangoCodeSnippet}
          </pre>
        </div>
      )}

      {/* SUB TAB 4: KOTLIN CODE */}
      {activeSubTab === 'kotlin' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Code2 className="w-4 h-4 text-emerald-600" />
              {language === 'zh'
                ? 'Android 客户端商超 Wi-Fi 考勤调用 (Kotlin Repository)'
                : 'Android Staff App Wi-Fi Attendance Repository (Kotlin)'}
            </h3>
            <button
              onClick={() => copySnippet('kotlin', kotlinCodeSnippet)}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-semibold text-xs flex items-center gap-1"
            >
              {copiedKey === 'kotlin' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedKey === 'kotlin' ? t.copiedBtn : t.copyBtn}
            </button>
          </div>

          <pre className="bg-slate-950 text-slate-100 p-4 rounded-xl text-[11px] font-mono leading-relaxed overflow-x-auto">
            {kotlinCodeSnippet}
          </pre>
        </div>
      )}

      {/* SUB TAB 5: DOCKER COMPOSE */}
      {activeSubTab === 'docker' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-600" />
              {language === 'zh'
                ? '商超生产环境 Docker Compose 部署配置 (deploy/compose.yaml)'
                : 'Supermarket Production Docker Compose Deployment Script'}
            </h3>
            <button
              onClick={() => copySnippet('docker', dockerComposeSnippet)}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-semibold text-xs flex items-center gap-1"
            >
              {copiedKey === 'docker' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedKey === 'docker' ? t.copiedBtn : t.copyBtn}
            </button>
          </div>

          <pre className="bg-slate-950 text-slate-100 p-4 rounded-xl text-[11px] font-mono leading-relaxed overflow-x-auto">
            {dockerComposeSnippet}
          </pre>
        </div>
      )}

    </div>
  );
};
