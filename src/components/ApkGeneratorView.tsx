import React, { useState } from 'react';
import {
  Download,
  Terminal,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Smartphone,
  Cpu,
  Layers,
  Settings,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import { Language, Translations } from '../i18n/translations';

interface ApkGeneratorViewProps {
  language: Language;
  t: Translations;
}

export const ApkGeneratorView: React.FC<ApkGeneratorViewProps> = ({ language, t }) => {
  // Build Config State
  const [storeBranch, setStoreBranch] = useState<string>('Himart 旗舰店 (Store #01)');
  const [apiBaseUrl, setApiBaseUrl] = useState<string>(
    typeof window !== 'undefined' ? `${window.location.origin}/api/v1` : 'https://attendance.himart.com/api/v1'
  );
  const [version, setVersion] = useState<string>('v2.5.0');
  const [packageName, setPackageName] = useState<string>('com.himart.attendance.store');

  // Build State
  const [building, setBuilding] = useState<boolean>(false);
  const [buildLogs, setBuildLogs] = useState<string[]>([
    '> Configure project :app',
    'Himart Supermarket Attendance Gradle Pipeline v8.3.0 initialized.',
    'Ready for production Android release build.',
  ]);
  const [apkReady, setApkReady] = useState<boolean>(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'manifest' | 'gradle' | 'wifi' | 'keystore'>('manifest');

  const handleBuildApk = async () => {
    setBuilding(true);
    setBuildLogs(['> Starting Gradle daemon and compiling Himart Store Attendance APK...']);
    try {
      const res = await fetch('/api/v1/apk/build/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeBranch,
          apiBaseUrl,
          version,
          packageName,
        }),
      });
      const data = await res.json();
      if (data.success && data.logs) {
        setBuildLogs(data.logs);
        setApkReady(true);
      }
    } catch (err: any) {
      setBuildLogs((prev) => [...prev, `[ERROR] Build pipeline interrupted: ${err.message}`]);
    } finally {
      setBuilding(false);
    }
  };

  const copyCode = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const downloadUrl = `/api/v1/apk/download/?branch=${encodeURIComponent(storeBranch)}&v=${version}`;

  // Android project source snippets
  const manifestSnippet = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${packageName}">

    <!-- Android 13+ (API 33+) 专用附近 Wi-Fi 设备权限，免除后台精确定位负担 -->
    <uses-permission
        android:name="android.permission.NEARBY_WIFI_DEVICES"
        android:usesPermissionFlags="neverForLocation" />

    <!-- 兼容 Android 12 及以下设备读取当前连接的 SSID -->
    <uses-permission
        android:name="android.permission.ACCESS_FINE_LOCATION"
        android:maxSdkVersion="32" />

    <!-- 网络状态检测与 HTTP 通信 -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />

    <application
        android:allowBackup="false"
        android:icon="@mipmap/ic_launcher_himart"
        android:label="Himart WIFI打卡"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.HimartAttendance"
        android:usesCleartextTraffic="false">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:screenOrientation="portrait">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

  const gradleSnippet = `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "${packageName}"
    compileSdk = 34

    defaultConfig {
        applicationId = "${packageName}"
        minSdk = 26
        targetSdk = 34
        versionCode = 250
        versionName = "${version}"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables { useSupportLibrary = true }
    }

    signingConfigs {
        create("release") {
            storeFile = file("keystore/himart-retail.jks")
            storePassword = System.getenv("KSTORE_PASS") ?: "HimartSecure2026!"
            keyAlias = "Himart_Retail_ReleaseKey"
            keyPassword = System.getenv("KEY_PASS") ?: "HimartSecure2026!"
            enableV1Signing = true
            enableV2Signing = true
            enableV3Signing = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
            signingConfig = signingConfigs.getByName("release")
        }
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")
    implementation("androidx.activity:activity-compose:1.8.2")
    implementation(platform("androidx.compose:compose-bom:2024.02.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
}`;

  return (
    <div className="py-6 px-4 max-w-6xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 rounded-3xl border border-emerald-800/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs px-3 py-0.5 rounded-full font-semibold">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android APK Build Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            {t.apkGeneratorTitle}
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            {t.apkGeneratorSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href={downloadUrl}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{t.downloadApkBtn}</span>
          </a>
        </div>
      </div>

      {/* Grid: Left Build Controls & Logs; Right Download & Mobile QR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: APK Build Configuration & Terminal Logs */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Config Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Settings className="w-4 h-4 text-emerald-600" />
                {t.buildSettingsTitle}
              </h3>
              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                Target: Android 14 (API 34)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">{t.storeBranchLabel}</label>
                <select
                  value={storeBranch}
                  onChange={(e) => setStoreBranch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                >
                  <option value="Himart 旗舰店 (Store #01)">Himart 旗舰店 (Store #01 Flagship)</option>
                  <option value="Himart 深圳二店 (Store #02)">Himart 深圳二店 (Store #02)</option>
                  <option value="Himart 物流大仓枢纽 (DC #01)">Himart 物流大仓枢纽 (DC #01)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">{t.appVersionLabel}</label>
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">{t.apiBaseUrlLabel}</label>
                <input
                  type="text"
                  value={apiBaseUrl}
                  onChange={(e) => setApiBaseUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-[11px]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">{t.packageNameLabel}</label>
                <input
                  type="text"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleBuildApk}
                disabled={building}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-98 transition-all disabled:opacity-50"
              >
                {building ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{t.buildingApkBtn}</span>
                  </>
                ) : (
                  <>
                    <span>{t.buildApkBtn}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Build Terminal Logs */}
          <div className="bg-slate-950 text-slate-100 rounded-2xl p-4 border border-slate-800 shadow-md space-y-2 font-mono text-[11px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                {t.buildLogTitle}
              </span>
              <span className="text-[10px] text-slate-500">Gradle Daemon :app:assembleRelease</span>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1 text-slate-300 leading-relaxed pr-2">
              {buildLogs.map((log, i) => (
                <div key={i} className={log.includes('SUCCESS') ? 'text-emerald-400 font-bold' : log.includes('ERROR') ? 'text-rose-400 font-bold' : ''}>
                  {log}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Download Card, Mobile QR Code & Package Security Info */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Download & Mobile QR Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <QrCode className="w-4 h-4 text-emerald-600" />
              {t.scanQrInstall}
            </h3>

            {/* QR Code Graphic Container */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200">
                {/* Clean SVG QR Code Representation */}
                <svg
                  className="w-40 h-40"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="100" height="100" fill="white" />
                  {/* Outer Positon Markers */}
                  <rect x="5" y="5" width="26" height="26" rx="4" stroke="#047857" strokeWidth="4" />
                  <rect x="11" y="11" width="14" height="14" fill="#047857" />
                  <rect x="69" y="5" width="26" height="26" rx="4" stroke="#047857" strokeWidth="4" />
                  <rect x="75" y="11" width="14" height="14" fill="#047857" />
                  <rect x="5" y="69" width="26" height="26" rx="4" stroke="#047857" strokeWidth="4" />
                  <rect x="11" y="75" width="14" height="14" fill="#047857" />
                  {/* Data Matrix Dots */}
                  <rect x="36" y="8" width="5" height="5" fill="#0f172a" />
                  <rect x="45" y="8" width="5" height="5" fill="#0f172a" />
                  <rect x="54" y="8" width="5" height="5" fill="#0f172a" />
                  <rect x="36" y="18" width="5" height="5" fill="#0f172a" />
                  <rect x="50" y="18" width="8" height="5" fill="#0f172a" />
                  <rect x="10" y="38" width="8" height="5" fill="#0f172a" />
                  <rect x="24" y="38" width="5" height="5" fill="#0f172a" />
                  <rect x="35" y="35" width="30" height="30" rx="3" fill="#047857" />
                  {/* Center Brand Mark */}
                  <text x="50" y="55" fill="white" fontSize="16" fontWeight="bold" textAnchor="middle">H</text>
                  <rect x="70" y="38" width="8" height="5" fill="#0f172a" />
                  <rect x="85" y="38" width="5" height="5" fill="#0f172a" />
                  <rect x="38" y="72" width="6" height="6" fill="#0f172a" />
                  <rect x="48" y="72" width="6" height="6" fill="#0f172a" />
                  <rect x="60" y="72" width="6" height="6" fill="#0f172a" />
                  <rect x="75" y="72" width="6" height="6" fill="#0f172a" />
                  <rect x="85" y="72" width="6" height="6" fill="#0f172a" />
                  <rect x="38" y="85" width="8" height="6" fill="#0f172a" />
                  <rect x="55" y="85" width="12" height="6" fill="#0f172a" />
                  <rect x="75" y="85" width="8" height="6" fill="#0f172a" />
                </svg>
              </div>

              <p className="text-[11px] text-slate-500 text-center max-w-xs leading-relaxed">
                {t.qrInstructions}
              </p>
            </div>

            {/* Direct Download Button */}
            <a
              href={downloadUrl}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all text-center"
            >
              <Download className="w-4 h-4" />
              <span>{t.downloadApkBtn} ({version})</span>
            </a>
          </div>

          {/* Package Security & Signature Details */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 flex items-center gap-2 text-xs border-b border-slate-100 pb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              APK 签名与环境规格 (Security & Release Spec)
            </h4>

            <div className="space-y-2 text-[11px] text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="font-medium text-slate-500">{t.apkSize}:</span>
                <span className="font-mono font-bold text-slate-800">18.4 MB</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="font-medium text-slate-500">{t.targetSdk}:</span>
                <span className="font-mono text-slate-800">API 26 (8.0+) ~ API 34 (Android 14)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="font-medium text-slate-500">{t.packageNameLabel}:</span>
                <span className="font-mono text-slate-800">{packageName}</span>
              </div>
              <div className="flex flex-col py-1">
                <span className="font-medium text-slate-500 mb-0.5">{t.apkFingerprint}:</span>
                <span className="font-mono text-[10px] text-slate-700 bg-slate-50 p-1.5 rounded border border-slate-200 break-all">
                  9A:4F:2E:88:1B:77:3C:90:55:0D:12:F4:7E:6A:9C:21:55:88:99:AA
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* BOTTOM SECTION: Android Studio Project Source Code Explorer */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              {t.sourceCodeTab}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              可直接导入 Android Studio 进行原生编译、定制 UI 界面或打包签名分发。
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setActiveCodeTab('manifest')}
              className={`px-3 py-1.5 rounded-lg ${activeCodeTab === 'manifest' ? 'bg-white text-slate-900 font-bold shadow-sm' : 'text-slate-600'}`}
            >
              AndroidManifest.xml
            </button>
            <button
              onClick={() => setActiveCodeTab('gradle')}
              className={`px-3 py-1.5 rounded-lg ${activeCodeTab === 'gradle' ? 'bg-white text-slate-900 font-bold shadow-sm' : 'text-slate-600'}`}
            >
              app/build.gradle.kts
            </button>
          </div>
        </div>

        {activeCodeTab === 'manifest' && (
          <div className="space-y-2">
            <div className="flex justify-end">
              <button
                onClick={() => copyCode('manifest', manifestSnippet)}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-semibold text-xs flex items-center gap-1"
              >
                {copiedKey === 'manifest' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === 'manifest' ? t.copiedBtn : t.copyBtn}
              </button>
            </div>
            <pre className="bg-slate-950 text-slate-100 p-4 rounded-xl text-[11px] font-mono leading-relaxed overflow-x-auto">
              {manifestSnippet}
            </pre>
          </div>
        )}

        {activeCodeTab === 'gradle' && (
          <div className="space-y-2">
            <div className="flex justify-end">
              <button
                onClick={() => copyCode('gradle', gradleSnippet)}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-semibold text-xs flex items-center gap-1"
              >
                {copiedKey === 'gradle' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === 'gradle' ? t.copiedBtn : t.copyBtn}
              </button>
            </div>
            <pre className="bg-slate-950 text-slate-100 p-4 rounded-xl text-[11px] font-mono leading-relaxed overflow-x-auto">
              {gradleSnippet}
            </pre>
          </div>
        )}

        {/* Staff Installation Guide Card */}
        <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-2">
          <h4 className="font-bold text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {t.installGuideTitle}
          </h4>
          <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed text-emerald-900/90">
            <li>在手机上下载 APK 并点击安装。若提示“禁止安装未知来源应用”，请在系统弹窗中点击【允许来自此来源的应用】。</li>
            <li>首次打开 Himart 客户端，允许“获取附近的 Wi-Fi 设备”或“位置信息”权限（用于 Android 系统读取当前连接的商超 SSID）。</li>
            <li>连接商超卖场或对应分区的员工 Wi-Fi（如 <code>Himart-Store-Staff-5G</code> 或 <code>Himart-FreshDept-WiFi</code>），点击【上班打卡】即可完成。</li>
          </ol>
        </div>

      </div>

    </div>
  );
};
