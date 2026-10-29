import React, { useState } from 'react';
import { Sparkles, RefreshCw, AlertCircle, ShieldCheck, Brain } from 'lucide-react';
import { Language, Translations } from '../i18n/translations';

interface AiAnalyticsViewProps {
  language: Language;
  t: Translations;
}

export const AiAnalyticsView: React.FC<AiAnalyticsViewProps> = ({ language, t }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleRunAiAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/ai/analyze-anomalies/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang: language }),
      });
      const data = await res.json();
      if (data.success) {
        setAnalysis(data.analysis);
      } else {
        setError(language === 'zh' ? 'AI 诊断生成失败，请稍后重试' : 'Failed to generate AI analysis, please retry');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-6 px-4 max-w-5xl mx-auto space-y-6">
      
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white p-6 rounded-3xl border border-emerald-800/50 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Brain className="w-64 h-64 text-emerald-400" />
        </div>

        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs px-3 py-1 rounded-full font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.aiBadge}</span>
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white">
            {t.aiTitle}
          </h2>

          <p className="text-xs text-emerald-200/90 leading-relaxed">
            {t.aiDesc}
          </p>

          <div className="pt-2">
            <button
              onClick={handleRunAiAnalysis}
              disabled={loading}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? t.aiRunningBtn : t.aiRunBtn}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Output Container */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm min-h-[300px]">
        {loading && (
          <div className="py-16 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500 font-medium">
              {t.aiLoadingText}
            </p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!loading && !analysis && !error && (
          <div className="py-16 text-center space-y-3 text-slate-400">
            <Brain className="w-12 h-12 mx-auto stroke-[1.5] text-slate-300" />
            <p className="text-xs">{t.aiInitialPrompt}</p>
          </div>
        )}

        {!loading && analysis && (
          <div className="prose prose-slate max-w-none text-xs leading-relaxed space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                {t.aiReportTitle}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {new Date().toLocaleString(language === 'zh' ? 'zh-CN' : 'en-US')}
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 whitespace-pre-wrap font-sans text-slate-800 leading-relaxed text-xs">
              {analysis}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
