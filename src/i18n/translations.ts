export type Language = 'zh' | 'en';

export interface Translations {
  // Brand
  brandName: string;
  brandSub: string;
  supermarketBadge: string;
  version: string;

  // Tabs
  tabApp: string;
  tabAdmin: string;
  tabAi: string;
  tabArch: string;

  // Header
  currentUserLabel: string;
  switchUser: string;
  langToggle: string;

  // Android Simulator Controls
  simControlsTitle: string;
  simControlsToggleCollapse: string;
  simControlsToggleExpand: string;
  simWifiLabel: string;
  simWifiAllowed: string;
  simWifiForbidden: string;
  simPermissionsTitle: string;
  simPermissionNearby: string;
  simPermissionLocation: string;
  simKeystoreFingerprint: string;
  simViewKeystoreKey: string;
  simApplyCorrection: string;
  simSecurityNoticeTitle: string;
  simSecurityNotice1: string;
  simSecurityNotice2: string;

  // Android App Frame
  appTitle: string;
  appCompany: string;
  networkStatusTitle: string;
  networkDisconnected: string;
  networkStatusMissingPerms: string;
  networkStatusConnected: string;
  networkStatusMismatch: string;
  androidPermsWarning: string;
  todayAttendanceTitle: string;
  serverTimeLabel: string;
  checkInBtn: string;
  checkInDone: string;
  checkInLate: string;
  checkInRule: string;
  checkOutBtn: string;
  checkOutDone: string;
  checkOutRule: string;
  clockInValidating: string;
  recentHistoryTitle: string;
  statusOnTime: string;
  statusLate: string;
  statusEarlyLeave: string;
  statusCorrectionApproved: string;
  statusPending: string;
  statusAbsent: string;
  unauthorizedWifiWarning: string;

  // Correction Modal
  correctionTitle: string;
  correctionTypeLabel: string;
  corrPatchIn: string;
  corrPatchOut: string;
  corrLeave: string;
  targetDateLabel: string;
  proposedTimeLabel: string;
  reasonLabel: string;
  reasonPlaceholder: string;
  cancelBtn: string;
  submitToHrBtn: string;

  // Keystore Modal
  keystoreTitle: string;
  keystoreDescription: string;
  closeBtn: string;

  // Admin Dashboard
  adminTitle: string;
  adminSubtitle: string;
  adminRefresh: string;
  adminExportCsv: string;
  kpiTotalStaff: string;
  kpiTotalStaffUnit: string;
  kpiCheckedIn: string;
  kpiCheckedInRate: string;
  kpiLate: string;
  kpiLateUnit: string;
  kpiPendingCorrections: string;
  kpiPendingUnit: string;

  // Admin Sub Tabs
  subtabMonitor: string;
  subtabWifi: string;
  subtabEmployees: string;
  subtabCorrections: string;
  subtabAudit: string;

  // Admin Monitor Table
  searchPlaceholder: string;
  allDepts: string;
  deptFresh: string;
  deptCashier: string;
  deptGrocery: string;
  deptLogistics: string;
  deptStoreOps: string;
  allStatuses: string;
  totalRecordsDisplay: string;
  thEmployee: string;
  thDept: string;
  thCheckInTime: string;
  thCheckInSsid: string;
  thStatus: string;
  thCheckOutTime: string;
  thNotes: string;
  notCheckedIn: string;

  // Admin Wi-Fi tab
  wifiTitle: string;
  wifiDesc: string;
  addWifiBtn: string;
  activeStatus: string;
  disabledStatus: string;
  bssidMaskLabel: string;
  anyBssid: string;
  egressIpCheckLabel: string;
  enabled: string;
  disabled: string;

  // Admin Employee tab
  empTitle: string;
  empDesc: string;
  addEmpBtn: string;
  thEmpInfo: string;
  thDeptRole: string;
  thAccountRole: string;
  thKeystoreKey: string;
  thEmpStatus: string;
  thActions: string;
  activeEmp: string;
  suspendedEmp: string;
  suspendAction: string;
  activateAction: string;

  // Admin Approvals tab
  approvalTitle: string;
  approvalDesc: string;
  typeLabel: string;
  dateLabel: string;
  timeLabel: string;
  statusPendingApproval: string;
  statusApproved: string;
  statusRejected: string;
  reasonHeader: string;
  commentPlaceholder: string;
  approveBtn: string;
  rejectBtn: string;
  reviewedBy: string;

  // Admin Audit tab
  auditTitle: string;
  auditDesc: string;
  thTimestamp: string;
  thActor: string;
  thAction: string;
  thTarget: string;
  thDetails: string;
  thIp: string;

  // Add Employee Modal
  modalAddEmpTitle: string;
  nameLabel: string;
  namePlaceholder: string;
  empNoLabel: string;
  deptLabel: string;
  roleLabel: string;
  createConfirmBtn: string;

  // Add Wi-Fi Modal
  modalAddWifiTitle: string;
  ssidLabel: string;
  ssidPlaceholder: string;
  siteLabel: string;
  sitePlaceholder: string;
  savePolicyBtn: string;

  // AI Tab
  aiTitle: string;
  aiBadge: string;
  aiDesc: string;
  aiRunBtn: string;
  aiRunningBtn: string;
  aiLoadingText: string;
  aiInitialPrompt: string;
  aiReportTitle: string;

  // Architecture Tab
  archTitle: string;
  archSubtitle: string;
  archSubtabFlow: string;
  archSubtabSchema: string;
  archSubtabDjango: string;
  archSubtabKotlin: string;
  archSubtabDocker: string;
  archCard1Title: string;
  archCard1Desc: string;
  archCard2Title: string;
  archCard2Desc: string;
  archCard3Title: string;
  archCard3Desc: string;
  archCard4Title: string;
  archCard4Desc: string;
  copyBtn: string;
  copiedBtn: string;

  // Footer
  footerCopyright: string;
  footerDesc: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  zh: {
    brandName: 'Himart 商超打卡',
    brandSub: '海玛特超市 Wi-Fi 考勤管理系统',
    supermarketBadge: '大型生活商超版',
    version: 'v2.5',

    tabApp: 'Android 员工 App 仿真',
    tabAdmin: '商超考勤管理后台',
    tabAi: 'AI 考勤智能风控',
    tabArch: '技术架构与部署',

    currentUserLabel: '当前商超员工',
    switchUser: '切换账号',
    langToggle: 'English',

    simControlsTitle: 'Android 手机考勤环境控制台',
    simControlsToggleCollapse: '收起设置',
    simControlsToggleExpand: '展开设置',
    simWifiLabel: '模拟手机连接的商超 Wi-Fi (SSID)',
    simWifiAllowed: '✓ 符合商超考勤专网',
    simWifiForbidden: '✕ 非考勤专网',
    simPermissionsTitle: 'Android 考勤所需权限状态:',
    simPermissionNearby: 'NEARBY_WIFI_DEVICES (Android 13+)',
    simPermissionLocation: 'ACCESS_FINE_LOCATION (定位读 SSID)',
    simKeystoreFingerprint: 'Android Keystore 商超设备指纹:',
    simViewKeystoreKey: '查看硬件加密凭证',
    simApplyCorrection: '申请考勤补签 / 请假',
    simSecurityNoticeTitle: '商超服务器安全判定标准',
    simSecurityNotice1: '1. 统一采用服务端标准时间，不受收银员/理货员修改手机本地时间影响。',
    simSecurityNotice2: '2. 打卡前获取 60 秒 Challenge Nonce，严格验证超市各分区 Wi-Fi 白名单。',

    appTitle: '商超员工 Wi-Fi 考勤',
    appCompany: 'Himart 海玛特超市',
    networkStatusTitle: '当前连接网络状态',
    networkDisconnected: '未连接任何商超 Wi-Fi',
    networkStatusMissingPerms: '权限缺失',
    networkStatusConnected: '已连接商超专网',
    networkStatusMismatch: '未匹配白名单',
    androidPermsWarning: '⚠️ Android 提示：请允许读取 nearby Wi-Fi 设备与定位权限以读取 SSID。',
    todayAttendanceTitle: '今日商超考勤打卡',
    serverTimeLabel: '服务器时间',
    checkInBtn: '上班打卡',
    checkInDone: '上班已打卡',
    checkInLate: '迟到打卡',
    checkInRule: '规定',
    checkOutBtn: '下班打卡',
    checkOutDone: '下班已打卡',
    checkOutRule: '规定',
    clockInValidating: '服务器校验中...',
    recentHistoryTitle: '近期商超打卡记录',
    statusOnTime: '准时打卡',
    statusLate: '迟到',
    statusEarlyLeave: '早退',
    statusCorrectionApproved: '补卡核准',
    statusPending: '待审核',
    statusAbsent: '缺勤',
    unauthorizedWifiWarning: '❌ 当前手机未连接 Himart 超市员工 Wi-Fi，请在控制台中切换连接。',

    correctionTitle: '申请商超考勤补打卡 / 请假',
    correctionTypeLabel: '申请类型',
    corrPatchIn: '补上班卡 (如生鲜开市盘点)',
    corrPatchOut: '补下班卡 (如收银扎帐延迟)',
    corrLeave: '事假 / 病假申请',
    targetDateLabel: '目标考勤日期',
    proposedTimeLabel: '拟定打卡时间',
    reasonLabel: '申请事由及说明',
    reasonPlaceholder: '例如：早晨 06:20 到达生鲜冻库卸货验收，因冷库信号盲区未能及时连接 Himart-FreshDept 打卡...',
    cancelBtn: '取消',
    submitToHrBtn: '提交 HR 审批',

    keystoreTitle: 'Android Keystore 硬件安全凭证',
    keystoreDescription: '本 App 在员工手机安全芯片（TEE/SE）内生成独占私钥，有效杜绝超市代打卡与多账号迁移。',
    closeBtn: '关闭',

    adminTitle: 'Himart 海玛特超级生活商超 HR 考勤控制台',
    adminSubtitle: '商超多班次考勤 · 各分区 Wi-Fi 策略 · 补卡审核 · CSV 导出 · 不可篡改审计日志',
    adminRefresh: '刷新考勤数据',
    adminExportCsv: '一键导出 CSV 考勤报表',
    kpiTotalStaff: '商超在册总人数',
    kpiTotalStaffUnit: '名员工',
    kpiCheckedIn: '今日出勤打卡人数',
    kpiCheckedInRate: '出勤履约率',
    kpiLate: '今日迟到人数',
    kpiLateUnit: '超宽限期',
    kpiPendingCorrections: '待审批补卡/假单',
    kpiPendingUnit: '待 HR 核准',

    subtabMonitor: '今日商超打卡实时监控',
    subtabWifi: '商超 Wi-Fi 白名单策略',
    subtabEmployees: '超市员工与设备管理',
    subtabCorrections: '补卡审批中心',
    subtabAudit: '不可篡改审计日志',

    searchPlaceholder: '搜索员工姓名 / 工号...',
    allDepts: '全部商超部门',
    deptFresh: '生鲜熟食课',
    deptCashier: '收银客服组',
    deptGrocery: '食品百货课',
    deptLogistics: '收货仓储组',
    deptStoreOps: '商场运营部',
    allStatuses: '全部出勤状态',
    totalRecordsDisplay: '展示记录数',
    thEmployee: '员工姓名 / 工号',
    thDept: '所属课组',
    thCheckInTime: '上班打卡时间',
    thCheckInSsid: '打卡 Wi-Fi SSID',
    thStatus: '考勤状态',
    thCheckOutTime: '下班打卡时间',
    thNotes: '系统备注 / 班次',
    notCheckedIn: '未打卡',

    wifiTitle: 'Himart 各门店与分区 Wi-Fi 考勤白名单',
    wifiDesc: '涵盖商超各卖场专网、生鲜加工区及收货码头，员工必须在对应网络下打卡。',
    addWifiBtn: '新增商超 Wi-Fi 策略',
    activeStatus: '已启用 (ACTIVE)',
    disabledStatus: '已禁用',
    bssidMaskLabel: 'AP BSSID 掩码:',
    anyBssid: '不限 AP MAC',
    egressIpCheckLabel: '门店公网出口 IP 校验:',
    enabled: '开启',
    disabled: '关闭',

    empTitle: '商超员工名册与考勤设备指纹',
    empDesc: '支持收银员、理货员、生鲜师傅等跨国与多语种员工，绑定独占 Android 手机安全 Key。',
    addEmpBtn: '添加商超新员工',
    thEmpInfo: '员工基本信息',
    thDeptRole: '课组与岗位',
    thAccountRole: '系统权限角色',
    thKeystoreKey: 'Android 硬件 Key 指纹',
    thEmpStatus: '在职状态',
    thActions: '操作',
    activeEmp: '在职 (ACTIVE)',
    suspendedEmp: '已停用',
    suspendAction: '停用账号',
    activateAction: '恢复在职',

    approvalTitle: '商超补卡与调休假单审批中心',
    approvalDesc: '店长或人事核准后，系统将自动核正出勤数据并追加不可撤销的审计日志。',
    typeLabel: '申请类型',
    dateLabel: '考勤日期',
    timeLabel: '拟定打卡时间',
    statusPendingApproval: '待店长/HR审批',
    statusApproved: '已核准通过',
    statusRejected: '已驳回',
    reasonHeader: '补卡申请原由:',
    commentPlaceholder: '输入审批意见 (如：生鲜收货查实核准)...',
    approveBtn: '同意核准',
    rejectBtn: '驳回申请',
    reviewedBy: '审批人',

    auditTitle: '不可篡改审计日志流水 (Append-Only Audit Trail)',
    auditDesc: '记录商超所有打卡事件、策略修改、伪造 Wi-Fi 拦截日志及审批详情。',
    thTimestamp: '时间戳 (UTC)',
    thActor: '操作人',
    thAction: '动作类型',
    thTarget: '操作对象',
    thDetails: '详细信息',
    thIp: 'IP 地址',

    modalAddEmpTitle: '录入 Himart 超市新员工',
    nameLabel: '员工姓名',
    namePlaceholder: '例: Sarah Jenkins / 李明',
    empNoLabel: '工号',
    deptLabel: '所属课组',
    roleLabel: '岗位职责',
    createConfirmBtn: '确认录入',

    modalAddWifiTitle: '新增商超考勤 Wi-Fi 白名单',
    ssidLabel: 'Wi-Fi 名称 (SSID)',
    ssidPlaceholder: '例: Himart-Bakery-5G',
    siteLabel: '所属商超区域说明',
    sitePlaceholder: '例: 旗舰店 1F 面包烘焙坊',
    savePolicyBtn: '保存规则',

    aiTitle: 'Himart 商超考勤风控与出勤智能诊断',
    aiBadge: 'Google Gemini 2.5 Flash 驱动',
    aiDesc: '针对商超早晚班次、收银换班、生鲜盘点高峰进行智能异常模式识别与代打卡风控分析。',
    aiRunBtn: '立即生成今日商超考勤 AI 诊断报告',
    aiRunningBtn: 'AI 智能引擎深度分析中...',
    aiLoadingText: '正在分析 Himart 超市 128 名员工打卡数据、换班高峰及 Wi-Fi 鉴权日志...',
    aiInitialPrompt: '点击上方按钮，生成 Himart 超市今日考勤风控诊断与出勤改善建议',
    aiReportTitle: 'Himart 商超 AI 考勤诊断报告摘要',

    archTitle: 'Himart 商超考勤系统架构与落地部署方案',
    archSubtitle: '面向商超多班次高并发打卡：Android 原生 Kotlin + Django REST + PostgreSQL 架构。',
    archSubtabFlow: '商超整体数据流',
    archSubtabSchema: 'PostgreSQL 核心表结构',
    archSubtabDjango: 'Django 校验事务源码',
    archSubtabKotlin: 'Android 客户端通信源码',
    archSubtabDocker: 'Docker Compose 部署脚本',
    archCard1Title: '01. 员工 Android App',
    archCard1Desc: 'Kotlin + Compose。读取商超门店 Wi-Fi SSID，利用 Keystore 防作弊。',
    archCard2Title: '02. Nginx 反向代理',
    archCard2Desc: '强制 HTTPS TLS 加密，应对早晚开店打卡高峰限流。',
    archCard3Title: '03. Django REST API',
    archCard3Desc: '执行 @transaction.atomic 原子校验，匹配商超早晚班次与 60s Challenge。',
    archCard4Title: '04. PostgreSQL 数据库',
    archCard4Desc: '存储 attendance_records 主表与 append-only attendance_events 事件流。',
    copyBtn: '复制代码',
    copiedBtn: '已复制',

    footerCopyright: 'Himart Co., Ltd. (海玛特超市) · Supermarket Attendance Enterprise Edition',
    footerDesc: '专为商超零售连锁打造的 Android Jetpack Compose + Django + PostgreSQL 软硬一体化防伪考勤系统',
  },

  en: {
    brandName: 'Himart Supermarket Attendance',
    brandSub: 'Hypermarket Store Wi-Fi Attendance System',
    supermarketBadge: 'Retail Hypermarket Edition',
    version: 'v2.5',

    tabApp: 'Android Staff App Simulator',
    tabAdmin: 'Store HR Admin Dashboard',
    tabAi: 'AI Attendance Risk Analytics',
    tabArch: 'System Architecture & Deploy',

    currentUserLabel: 'Current Store Staff',
    switchUser: 'Switch User',
    langToggle: '中文',

    simControlsTitle: 'Android Attendance Environment Controls',
    simControlsToggleCollapse: 'Collapse Settings',
    simControlsToggleExpand: 'Expand Settings',
    simWifiLabel: 'Simulated Store Wi-Fi Connection (SSID)',
    simWifiAllowed: '✓ Authorized Store Staff Wi-Fi',
    simWifiForbidden: '✕ Unauthorized Network',
    simPermissionsTitle: 'Android Permission Check Status:',
    simPermissionNearby: 'NEARBY_WIFI_DEVICES (Android 13+)',
    simPermissionLocation: 'ACCESS_FINE_LOCATION (SSID Reading)',
    simKeystoreFingerprint: 'Android Keystore Device Fingerprint:',
    simViewKeystoreKey: 'View Hardware Security Key',
    simApplyCorrection: 'Apply for Correction / Leave',
    simSecurityNoticeTitle: 'Server-Authoritative Anti-Spoofing Rules',
    simSecurityNotice1: '1. Official check-in timestamps always use backend server time, ignoring device local clock adjustments.',
    simSecurityNotice2: '2. Check-ins require a short-lived 60s Challenge Nonce and matching whitelisted supermarket branch SSIDs.',

    appTitle: 'Store Staff Wi-Fi Attendance',
    appCompany: 'Himart Supermarket',
    networkStatusTitle: 'Current Network Connection',
    networkDisconnected: 'Disconnected from Store Wi-Fi',
    networkStatusMissingPerms: 'Permissions Missing',
    networkStatusConnected: 'Connected to Store Wi-Fi',
    networkStatusMismatch: 'SSID Not Whitelisted',
    androidPermsWarning: '⚠️ Android Warning: Nearby Wi-Fi and Fine Location permissions are required to read SSID.',
    todayAttendanceTitle: "Today's Store Attendance",
    serverTimeLabel: 'Server Time',
    checkInBtn: 'Clock In',
    checkInDone: 'Clock In Completed',
    checkInLate: 'Late Clock In',
    checkInRule: 'Target',
    checkOutBtn: 'Clock Out',
    checkOutDone: 'Clock Out Completed',
    checkOutRule: 'Target',
    clockInValidating: 'Verifying on Server...',
    recentHistoryTitle: 'Recent Store Attendance Log',
    statusOnTime: 'On Time',
    statusLate: 'Late',
    statusEarlyLeave: 'Early Leave',
    statusCorrectionApproved: 'Correction Approved',
    statusPending: 'Pending',
    statusAbsent: 'Absent',
    unauthorizedWifiWarning: '❌ Phone is not connected to authorized Himart Store Wi-Fi. Switch connection in controls.',

    correctionTitle: 'Apply for Store Attendance Correction / Leave',
    correctionTypeLabel: 'Request Type',
    corrPatchIn: 'Patch Clock-In (e.g., Early Fresh Unloading)',
    corrPatchOut: 'Patch Clock-Out (e.g., Register Tally Delay)',
    corrLeave: 'Leave of Absence / Sick Leave',
    targetDateLabel: 'Target Attendance Date',
    proposedTimeLabel: 'Proposed Time',
    reasonLabel: 'Reason & Justification',
    reasonPlaceholder: 'e.g., Arrived at 06:20 for fresh produce freezer receiving; Wi-Fi blind spot in freezer prevented clock-in...',
    cancelBtn: 'Cancel',
    submitToHrBtn: 'Submit to Store HR',

    keystoreTitle: 'Android Keystore Hardware Key Status',
    keystoreDescription: 'The app generates unique cryptographic keys inside the hardware secure enclave (TEE/SE), preventing credential sharing.',
    closeBtn: 'Close',

    adminTitle: 'Himart Hypermarket HR & Attendance Admin Console',
    adminSubtitle: 'Multi-shift retail attendance · Store zone Wi-Fi policies · Approval center · CSV report · Audit log',
    adminRefresh: 'Refresh Data',
    adminExportCsv: 'Export CSV Attendance Report',
    kpiTotalStaff: 'Total Store Staff',
    kpiTotalStaffUnit: 'Employees',
    kpiCheckedIn: 'Checked In Today',
    kpiCheckedInRate: 'Attendance Rate',
    kpiLate: 'Late Today',
    kpiLateUnit: 'Exceeded Grace',
    kpiPendingCorrections: 'Pending Approvals',
    kpiPendingUnit: 'Awaiting HR',

    subtabMonitor: "Today's Live Store Attendance",
    subtabWifi: 'Store Wi-Fi Whitelist Policies',
    subtabEmployees: 'Staff & Device Management',
    subtabCorrections: 'Approval Center',
    subtabAudit: 'Immutable Audit Trail',

    searchPlaceholder: 'Search staff name / employee ID...',
    allDepts: 'All Store Departments',
    deptFresh: 'Fresh Food & Deli',
    deptCashier: 'Front-end & Cashier',
    deptGrocery: 'Grocery & Merchandise',
    deptLogistics: 'Receiving & Logistics',
    deptStoreOps: 'Store Operations',
    allStatuses: 'All Attendance Statuses',
    totalRecordsDisplay: 'Showing Records',
    thEmployee: 'Staff / Employee ID',
    thDept: 'Department & Section',
    thCheckInTime: 'Clock In Time',
    thCheckInSsid: 'Wi-Fi SSID',
    thStatus: 'Status',
    thCheckOutTime: 'Clock Out Time',
    thNotes: 'Shift & System Notes',
    notCheckedIn: 'Not Clocked In',

    wifiTitle: 'Himart Store & Branch Wi-Fi Attendance Policies',
    wifiDesc: 'Configures store sales floor, fresh food processing, and receiving dock access points.',
    addWifiBtn: 'Add Store Wi-Fi Policy',
    activeStatus: 'ACTIVE',
    disabledStatus: 'DISABLED',
    bssidMaskLabel: 'AP BSSID Mask:',
    anyBssid: 'Any AP MAC',
    egressIpCheckLabel: 'Store Egress Public IP Check:',
    enabled: 'Enabled',
    disabled: 'Disabled',

    empTitle: 'Supermarket Staff Roster & Device Keys',
    empDesc: 'Supports multi-lingual cashier, inventory, fresh meat & produce staff with dedicated Android keys.',
    addEmpBtn: 'Add Store Staff',
    thEmpInfo: 'Staff Information',
    thDeptRole: 'Department & Role',
    thAccountRole: 'System Role',
    thKeystoreKey: 'Android Keystore Fingerprint',
    thEmpStatus: 'Employment Status',
    thActions: 'Actions',
    activeEmp: 'ACTIVE',
    suspendedEmp: 'SUSPENDED',
    suspendAction: 'Suspend',
    activateAction: 'Activate',

    approvalTitle: 'Store Attendance Correction & Leave Approvals',
    approvalDesc: 'Once approved by store manager or HR, the record updates automatically with an append-only audit entry.',
    typeLabel: 'Type',
    dateLabel: 'Date',
    timeLabel: 'Proposed Time',
    statusPendingApproval: 'Pending Review',
    statusApproved: 'Approved',
    statusRejected: 'Rejected',
    reasonHeader: 'Justification Reason:',
    commentPlaceholder: 'Enter reviewer notes (e.g., Verified with fresh food lead)...',
    approveBtn: 'Approve',
    rejectBtn: 'Reject',
    reviewedBy: 'Reviewed By',

    auditTitle: 'Immutable Audit Trail (Append-Only Log)',
    auditDesc: 'Records all store clock-ins, policy modifications, spoofing blocks, and manager approvals.',
    thTimestamp: 'Timestamp (UTC)',
    thActor: 'Actor',
    thAction: 'Action Type',
    thTarget: 'Target',
    thDetails: 'Details',
    thIp: 'IP Address',

    modalAddEmpTitle: 'Register New Himart Store Staff',
    nameLabel: 'Full Name',
    namePlaceholder: 'e.g., Sarah Jenkins / David Miller',
    empNoLabel: 'Employee ID',
    deptLabel: 'Department / Section',
    roleLabel: 'Job Position',
    createConfirmBtn: 'Confirm Registration',

    modalAddWifiTitle: 'Add Store Wi-Fi Whitelist Policy',
    ssidLabel: 'Wi-Fi Name (SSID)',
    ssidPlaceholder: 'e.g., Himart-Bakery-5G',
    siteLabel: 'Store Location / Section Description',
    sitePlaceholder: 'e.g., Store #01 Bakery & Deli Zone',
    savePolicyBtn: 'Save Wi-Fi Policy',

    aiTitle: 'Himart Store Attendance Anomaly & Risk Analytics',
    aiBadge: 'Powered by Google Gemini 2.5 Flash',
    aiDesc: 'Analyzes retail opening shifts, cashier changeover peaks, and fresh produce stock-in clock-in patterns.',
    aiRunBtn: "Generate Today's AI Store Attendance Report",
    aiRunningBtn: 'AI Analyzing Attendance Data...',
    aiLoadingText: 'Analyzing 128 Himart store staff records, shift rush periods, and Wi-Fi logs...',
    aiInitialPrompt: 'Click above to generate comprehensive attendance risk diagnosis and HR staffing recommendations',
    aiReportTitle: 'Himart Supermarket AI Attendance Summary Report',

    archTitle: 'Himart Store Attendance System Architecture & Deployment',
    archSubtitle: 'Designed for high-concurrency retail shifts: Android Kotlin + Django REST + PostgreSQL.',
    archSubtabFlow: 'Store Data Flow',
    archSubtabSchema: 'PostgreSQL Schema',
    archSubtabDjango: 'Django Verification Logic',
    archSubtabKotlin: 'Android Kotlin Repository',
    archSubtabDocker: 'Docker Compose Script',
    archCard1Title: '01. Staff Android App',
    archCard1Desc: 'Kotlin + Compose. Reads store Wi-Fi SSID and leverages Android Keystore against spoofing.',
    archCard2Title: '02. Nginx Reverse Proxy',
    archCard2Desc: 'Enforces HTTPS TLS and handles shift peak burst rate-limiting.',
    archCard3Title: '03. Django REST API',
    archCard3Desc: 'Executes @transaction.atomic checks with 60s Challenge Nonce against retail shifts.',
    archCard4Title: '04. PostgreSQL Database',
    archCard4Desc: 'Houses attendance_records with append-only attendance_events table.',
    copyBtn: 'Copy Code',
    copiedBtn: 'Copied',

    footerCopyright: 'Himart Co., Ltd. · Supermarket Attendance Enterprise Edition',
    footerDesc: 'Engineered for retail hypermarket chains: Android Jetpack Compose + Django + PostgreSQL Wi-Fi attendance system',
  },
};
