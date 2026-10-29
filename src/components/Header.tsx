import React from 'react';
import { User } from '../types/attendance';
import { Smartphone, LayoutDashboard, Sparkles, Server, UserCheck, Languages, ShoppingBag } from 'lucide-react';
import { Language, Translations } from '../i18n/translations';

interface HeaderProps {
  activeTab: 'app' | 'admin' | 'ai' | 'arch';
  setActiveTab: (tab: 'app' | 'admin' | 'ai' | 'arch') => void;
  currentUser: User;
  allUsers: User[];
  onSwitchUser: (userId: string) => void;
  language: Language;
  onToggleLanguage: () => void;
  t: Translations;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  allUsers,
  onSwitchUser,
  language,
  onToggleLanguage,
  t,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Brand Logo & Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-lg text-white shadow-md shadow-emerald-600/30">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-white">{t.brandName}</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hidden sm:inline-block">
                  {t.supermarketBadge}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden xs:block">{t.brandSub}</p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setActiveTab('app')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'app'
                  ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{t.tabApp}</span>
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'admin'
                  ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>{t.tabAdmin}</span>
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'ai'
                  ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.tabAi}</span>
            </button>

            <button
              onClick={() => setActiveTab('arch')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'arch'
                  ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>{t.tabArch}</span>
            </button>
          </nav>

          {/* Right Action: Language Switcher & User Selector */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Language Toggle Button */}
            <button
              onClick={onToggleLanguage}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-700 text-xs font-semibold text-emerald-400 transition-colors shadow-sm"
              title="切换中英文 / Switch Language"
            >
              <Languages className="w-4 h-4 text-emerald-400" />
              <span>{language === 'zh' ? 'EN / 中文' : '中文 / EN'}</span>
            </button>

            {/* User Switcher Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-700 text-xs">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <div className="hidden xl:block text-left">
                <span className="text-slate-400 text-[10px] block">{t.currentUserLabel}</span>
                <span className="font-medium text-slate-200">{currentUser.name}</span>
              </div>
              <select
                value={currentUser.id}
                onChange={(e) => onSwitchUser(e.target.value)}
                className="bg-transparent text-xs text-emerald-300 font-medium focus:outline-none cursor-pointer border-l border-slate-700 pl-1.5 ml-1 max-w-[130px] sm:max-w-none truncate"
              >
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                    {u.name} ({u.employeeNo} - {u.department.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>

          </div>

        </div>
      </div>

      {/* Mobile / Tablet nav row */}
      <div className="lg:hidden flex items-center justify-around bg-slate-950 border-t border-slate-800 py-2 px-2 text-xs">
        <button
          onClick={() => setActiveTab('app')}
          className={`px-2.5 py-1 rounded-md ${activeTab === 'app' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400'}`}
        >
          {t.tabApp}
        </button>
        <button
          onClick={() => setActiveTab('admin')}
          className={`px-2.5 py-1 rounded-md ${activeTab === 'admin' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400'}`}
        >
          {t.tabAdmin}
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`px-2.5 py-1 rounded-md ${activeTab === 'ai' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400'}`}
        >
          {t.tabAi}
        </button>
        <button
          onClick={() => setActiveTab('arch')}
          className={`px-2.5 py-1 rounded-md ${activeTab === 'arch' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400'}`}
        >
          {t.tabArch}
        </button>
      </div>
    </header>
  );
};
