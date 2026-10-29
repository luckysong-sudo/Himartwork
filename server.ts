import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { attendanceStore } from './src/server/attendanceStore';

async function startServer() {
  const app = express();
  app.use(express.json());

  // Log requests
  app.use((req, res, next) => {
    if (req.url.startsWith('/api/')) {
      console.log(`[API ${req.method}] ${req.url}`);
    }
    next();
  });

  // -------------------------------------------------------------
  // REST API v1 ENDPOINTS
  // -------------------------------------------------------------

  // GET current session / auth user info
  app.get('/api/v1/me/', (req: Request, res: Response) => {
    const user = attendanceStore.getCurrentUser();
    res.json({ success: true, user });
  });

  // POST switch user session (for testing different roles/employees in demo)
  app.post('/api/v1/auth/switch-user/', (req: Request, res: Response) => {
    const { userId } = req.body;
    const user = attendanceStore.setCurrentUserId(userId);
    if (user) {
      res.json({ success: true, message: `已切换至账号 ${user.name} (${user.role})`, user });
    } else {
      res.status(404).json({ success: false, message: '用户不存在' });
    }
  });

  // GET today's attendance status for current employee
  app.get('/api/v1/attendance/today/', (req: Request, res: Response) => {
    const currentUser = attendanceStore.getCurrentUser();
    const record = attendanceStore.getTodayRecord(currentUser.id);
    res.json({
      success: true,
      user: currentUser,
      serverTime: new Date().toISOString(),
      record,
    });
  });

  // GET attendance history for current employee
  app.get('/api/v1/attendance/history/', (req: Request, res: Response) => {
    const currentUser = attendanceStore.getCurrentUser();
    const history = attendanceStore.getHistory(currentUser.id);
    res.json({ success: true, history });
  });

  // POST request short-lived Challenge for check-in / check-out
  app.post('/api/v1/attendance/challenge/', (req: Request, res: Response) => {
    const currentUser = attendanceStore.getCurrentUser();
    const challenge = attendanceStore.createChallenge(currentUser.id);
    res.json({ success: true, challenge });
  });

  // POST Check-In
  app.post('/api/v1/attendance/check-in/', (req: Request, res: Response) => {
    const currentUser = attendanceStore.getCurrentUser();
    const result = attendanceStore.checkIn(currentUser.id, req.body);
    if (!result.success) {
      res.status(400).json(result);
    } else {
      res.json(result);
    }
  });

  // POST Check-Out
  app.post('/api/v1/attendance/check-out/', (req: Request, res: Response) => {
    const currentUser = attendanceStore.getCurrentUser();
    const result = attendanceStore.checkOut(currentUser.id, req.body);
    if (!result.success) {
      res.status(400).json(result);
    } else {
      res.json(result);
    }
  });

  // POST Correction / Leave Request
  app.post('/api/v1/attendance/correction-request/', (req: Request, res: Response) => {
    const currentUser = attendanceStore.getCurrentUser();
    const newReq = attendanceStore.createCorrectionRequest({
      userId: currentUser.id,
      ...req.body,
    });
    res.json({ success: true, message: '考勤补签申请已提交，等待 HR 审批', request: newReq });
  });

  // -------------------------------------------------------------
  // ADMIN API ENDPOINTS
  // -------------------------------------------------------------

  // GET / POST Employees
  app.get('/api/v1/admin/employees/', (req: Request, res: Response) => {
    const users = attendanceStore.getUsers();
    res.json({ success: true, employees: users });
  });

  app.post('/api/v1/admin/employees/', (req: Request, res: Response) => {
    const newUser = attendanceStore.addUser(req.body);
    res.json({ success: true, employee: newUser });
  });

  app.patch('/api/v1/admin/employees/:id/', (req: Request, res: Response) => {
    const { id } = req.params;
    const { isActive } = req.body;
    const updated = attendanceStore.updateUserStatus(id, isActive);
    if (updated) {
      res.json({ success: true, employee: updated });
    } else {
      res.status(404).json({ success: false, message: '员工未找到' });
    }
  });

  // GET / POST Wi-Fi Policies
  app.get('/api/v1/admin/wifi-policies/', (req: Request, res: Response) => {
    const policies = attendanceStore.getWifiPolicies();
    res.json({ success: true, policies });
  });

  app.post('/api/v1/admin/wifi-policies/', (req: Request, res: Response) => {
    const newPolicy = attendanceStore.addWifiPolicy(req.body);
    res.json({ success: true, policy: newPolicy });
  });

  app.patch('/api/v1/admin/wifi-policies/:id/toggle/', (req: Request, res: Response) => {
    const updated = attendanceStore.toggleWifiPolicy(req.params.id);
    if (updated) {
      res.json({ success: true, policy: updated });
    } else {
      res.status(404).json({ success: false, message: 'Wi-Fi 规则未找到' });
    }
  });

  // GET Shifts
  app.get('/api/v1/admin/shifts/', (req: Request, res: Response) => {
    res.json({ success: true, shifts: attendanceStore.getShifts() });
  });

  // GET All Attendance Records
  app.get('/api/v1/admin/attendance/', (req: Request, res: Response) => {
    res.json({ success: true, records: attendanceStore.getRecords() });
  });

  // GET All Correction Requests
  app.get('/api/v1/admin/corrections/', (req: Request, res: Response) => {
    res.json({ success: true, requests: attendanceStore.getRequests() });
  });

  // POST Approve / Reject Correction
  app.post('/api/v1/admin/corrections/:id/approve/', (req: Request, res: Response) => {
    const { id } = req.params;
    const { approved, reviewerName, reviewerComment } = req.body;
    const updated = attendanceStore.approveCorrection(id, approved, reviewerName || '王琳 (Store HR Lead)', reviewerComment || '核准');
    if (updated) {
      res.json({ success: true, request: updated });
    } else {
      res.status(404).json({ success: false, message: '申请未找到' });
    }
  });

  // GET Audit Logs
  app.get('/api/v1/admin/audit-logs/', (req: Request, res: Response) => {
    res.json({ success: true, logs: attendanceStore.getAuditLogs() });
  });

  // GET Attendance Events (immutable raw feed)
  app.get('/api/v1/admin/events/', (req: Request, res: Response) => {
    res.json({ success: true, events: attendanceStore.getEvents() });
  });

  // GET CSV Report Export
  app.get('/api/v1/admin/reports/export/', (req: Request, res: Response) => {
    const csvContent = attendanceStore.exportRecordsCSV();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=Himart_Supermarket_Attendance_${new Date().toISOString().split('T')[0]}.csv`);
    res.send('\uFEFF' + csvContent); // Add UTF-8 BOM for Excel
  });

  // POST AI Attendance Anomaly Analysis (Gemini API)
  app.post('/api/v1/ai/analyze-anomalies/', async (req: Request, res: Response) => {
    const { lang = 'zh' } = req.body;
    const records = attendanceStore.getRecords();
    const events = attendanceStore.getEvents();
    const auditLogs = attendanceStore.getAuditLogs();

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const systemPrompt = lang === 'en'
          ? `You are an enterprise HR & attendance specialist for retail supermarkets. Analyze today's attendance logs for Himart Hypermarket (128 store staff across fresh food, cashier, grocery, receiving dock, and operations).
Attendance record summary:
${JSON.stringify(records.slice(0, 10), null, 2)}
Check-in events count: ${events.length}
Security audit events: ${JSON.stringify(auditLogs.slice(0, 5), null, 2)}

Provide a concise, professional Markdown report in ENGLISH covering:
1. **Today's Store Attendance Summary & Rate**
2. **Shift & Department Anomaly Diagnosis (e.g. fresh food freezer blind spots, cashier late arrivals)**
3. **Wi-Fi Spoofing & Security Risk Assessment**
4. **Actionable Recommendations for Store Operations**`
          : `你是一名专注大型商超零售行业的企业 HR 考勤专家与安全审计员。请对 Himart (海玛特超级生活商超) 今日门店考勤数据进行异常分析并给出专业运营建议。
涵盖生鲜熟食课、收银客服组、食品百货课、仓储收货组及商场运营人员。
考勤记录数据摘要:
${JSON.stringify(records.slice(0, 10), null, 2)}
考勤打卡事件数: ${events.length}
安全审计事件: ${JSON.stringify(auditLogs.slice(0, 5), null, 2)}

请以简洁清晰的 Markdown 格式输出中文分析结果，包含：
1. **今日商超考勤概括与出勤率**
2. **重点课组异常诊断 (如收货码头拥堵迟到、生鲜冷库 Wi-Fi 盲区补卡)**
3. **商超分区 Wi-Fi 安全与防伪风控评估**
4. **商超店长与 HR 管理优化建议**`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: systemPrompt,
        });

        return res.json({ success: true, analysis: response.text });
      } catch (err: any) {
        console.error('Gemini API Error:', err);
      }
    }

    // Fallback rule-based response if no API key or error
    const totalCount = records.length;
    const lateCount = records.filter((r) => r.checkInStatus === 'LATE').length;
    const onTimeCount = records.filter((r) => r.checkInStatus === 'ON_TIME').length;

    const fallbackAnalysis = lang === 'en'
      ? `### 📊 Himart Hypermarket Attendance & Risk Analysis Report (Rule Engine)

1. **Today's Store Attendance Overview**
   - Sample monitored staff records: **${totalCount}**, with **${onTimeCount}** on-time check-ins and **${lateCount}** late clock-in.
   - Overall shift fulfillment rate is healthy (**${Math.round((onTimeCount / (totalCount || 1)) * 100)}%**).

2. **Section Anomaly Diagnosis**
   - **Receiving & Logistics - Chen Jie (HM-4022)**: Clocked in at 06:48 (8 minutes past the 06:40 morning grace period). Morning delivery dock congestion identified.
   - **Bakery & Deli - Elena Rostova (HM-5011)**: Early arrival for cold-chain flour delivery; freezer room Wi-Fi blind spot noted, patch check-in submitted.

3. **Store Wi-Fi Security & Anti-Spoofing**
   - All check-in transactions validated against 60s single-use Challenge Nonces and dedicated store zone SSIDs.
   - Public customer Wi-Fi (\`Himart-Public-Guest\`) clock-in attempts successfully blocked.

4. **Store HR Recommendations**
   - Recommend adding an AP signal repeater near the fresh food cold-storage dock to eliminate clock-in dead zones.
   - For multinational staff, dual-language bilingual shift schedules and push notifications are actively functioning.`
      : `### 📊 Himart 海玛特超级商超考勤异常分析报告 (规则引擎)

1. **今日商超考勤概括**
   - 包含样本记录 **${totalCount}** 条，其中准时打卡 **${onTimeCount}** 人，迟到 **${lateCount}** 人。
   - 整体商超班次履约率处于良好水平 (**${Math.round((onTimeCount / (totalCount || 1)) * 100)}%**)。

2. **异常课组诊断**
   - **收货仓储组 陈杰 (HM-4022)**：早班 06:48 打卡，超出 06:40 宽限期，早间供应商货车集中进场卸货造成延误。
   - **生鲜熟食课 Elena Rostova (HM-5011)**：早晨 06:20 协助冷链面粉卸料，由于后库冷库金属屏蔽 Wi-Fi 信号，已发起补签。

3. **商超 Wi-Fi 安全与防作弊评估**
   - 所有打卡请求均携带合法 \`challenge_id\` 60秒短期随机 Token 与 Android Keystore 硬件设备指纹。
   - 拦截顾客公用网络 (\`Himart-Public-Guest\`) 冒充打卡行为，分区专网策略正常运作。

4. **商超运营与 HR 优化建议**
   - 建议在后仓生鲜冷库入口增设壁挂式工业级 Wi-Fi AP 放大器，减少补卡申请工单。
   - 维持早晚班次双语排班通知，确保中外籍员工顺畅打卡。`;

    res.json({ success: true, analysis: fallbackAnalysis });
  });

  // -------------------------------------------------------------
  // VITE DEV MIDDLEWARE
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n==================================================`);
    console.log(`⚡ Himart WorkGate Server running at http://0.0.0.0:${PORT}`);
    console.log(`==================================================\n`);
  });
}

startServer();
