import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  TrendingUp, DollarSign, Users, Bell, Briefcase, Mail, Activity, 
  MousePointer2, FileCheck, Lock, Crown, ShieldAlert, Globe, Info, 
  Eye, Server, CreditCard, PieChart, ChevronRight, UserMinus, 
  UserPlus, BarChart3, Coins, Volume2, VolumeX, Wallet, Zap, LayoutGrid
} from 'lucide-react';

// プランの定数定義
const PLAN_DEFS = [
  { id: 'mb_m', name: 'モバイルベーシック', nameEn: 'Mobile Basic', type: 'monthly', price: 19.9, color: 'text-zinc-400', bar: 'bg-zinc-600' },
  { id: 'mb_y', name: 'モバイルベーシック', nameEn: 'Mobile Basic', type: 'yearly', price: 199, color: 'text-zinc-400', bar: 'bg-zinc-500' },
  { id: 'mp_m', name: 'モバイルプレミアム', nameEn: 'Mobile Premium', type: 'monthly', price: 29.9, color: 'text-blue-400', bar: 'bg-blue-500' },
  { id: 'mp_y', name: 'モバイルプレミアム', nameEn: 'Mobile Premium', type: 'yearly', price: 299, color: 'text-blue-400', bar: 'bg-blue-600' },
  { id: 'cb_m', name: 'コンボベーシック', nameEn: 'Combo Basic', type: 'monthly', price: 29.9, color: 'text-violet-400', bar: 'bg-violet-500' },
  { id: 'cb_y', name: 'コンボベーシック', nameEn: 'Combo Basic', type: 'yearly', price: 299, color: 'text-violet-400', bar: 'bg-violet-600' },
  { id: 'cp_m', name: 'コンボプレミアム', nameEn: 'Combo Premium', type: 'monthly', price: 39.9, color: 'text-emerald-400', bar: 'bg-emerald-500' },
  { id: 'cp_y', name: 'コンボプレミアム', nameEn: 'Combo Premium', type: 'yearly', price: 399, color: 'text-emerald-400', bar: 'bg-emerald-600' },
];

const ShareMotive = () => {
  const [lang, setLang] = useState('ja');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioCtxRef = useRef(null);

  const translations = {
    ja: {
      appTitle: "ShareMotive",
      goodMorning: "ダッシュボード",
      estimatedBonus: "推定ボーナス",
      startWorking: "表示更新",
      totalRevenue: "総収益 (MRR)",
      goal: "目標",
      totalUsers: "総契約者数",
      churned: "解約",
      newContracts: "新規",
      myShareLabel: "シェア率",
      myShareDesc: "パーセンテージを入力",
      myShare: "配分",
      privacy: "シェア率はローカルに保存されます。",
      live: "ライブ",
      notifications: {
        titleSuccess: "新規契約",
        titleError: "解約アラート",
        churn: "サブスクリプションがキャンセルされました"
      },
      financials: {
        title: "収支サマリー",
        gross: "総売上",
        expenses: "経費合計",
        fees: "決済手数料",
        net: "純利益",
        breakdown: "内訳"
      },
      salesBreakdown: {
        title: "リアルタイム販売状況",
        count: "件",
        revenue: "収益",
        monthly: "月額",
        yearly: "年額"
      }
    },
    en: {
      appTitle: "ShareMotive",
      goodMorning: "Dashboard",
      estimatedBonus: "Estimated Bonus",
      startWorking: "Update View",
      totalRevenue: "Total Revenue (MRR)",
      goal: "Goal",
      totalUsers: "Subscribers",
      churned: "Churn",
      newContracts: "New",
      myShareLabel: "Share Rate",
      myShareDesc: "Input your percentage",
      myShare: "Allocation",
      privacy: "Share rate is stored locally.",
      live: "LIVE",
      notifications: {
        titleSuccess: "New Contract",
        titleError: "Churn Alert",
        churn: "Subscription Cancelled"
      },
      financials: {
        title: "P/L Summary",
        gross: "Gross Revenue",
        expenses: "Total Expenses",
        fees: "Platform Fees",
        net: "Net Profit",
        breakdown: "Breakdown"
      },
      salesBreakdown: {
        title: "Real-time Sales",
        count: "subs",
        revenue: "rev",
        monthly: "Mo",
        yearly: "Yr"
      }
    },
    zh: {
      appTitle: "ShareMotive",
      goodMorning: "仪表盘",
      estimatedBonus: "预计奖金",
      startWorking: "刷新视图",
      totalRevenue: "总营收 (MRR)",
      goal: "目标",
      totalUsers: "订阅用户",
      churned: "流失",
      newContracts: "新增",
      myShareLabel: "分成比例",
      myShareDesc: "输入百分比",
      myShare: "分配",
      privacy: "比例仅保存在本地。",
      live: "实时",
      notifications: {
        titleSuccess: "新合约",
        titleError: "退订警报",
        churn: "订阅已取消"
      },
      financials: {
        title: "财务摘要",
        gross: "总收入",
        expenses: "总支出",
        fees: "平台手续费",
        net: "净利润",
        breakdown: "明细"
      },
      salesBreakdown: {
        title: "实时销售",
        count: "数",
        revenue: "收",
        monthly: "月",
        yearly: "年"
      }
    }
  };

  const t = translations[lang];

  // アプリの状態管理
  const [revenue, setRevenue] = useState(102450); 
  const [notifications, setNotifications] = useState([]);
  
  const [subscribers, setSubscribers] = useState({
    total: 3300,
    new: 300,
    churn: 200
  });
  
  // ブラウザ保存機能付きのシェア率
  const [mySharePercent, setMySharePercent] = useState(() => {
    const saved = localStorage.getItem('mySharePercent');
    return saved ? parseFloat(saved) : 2.0;
  });

  useEffect(() => {
    localStorage.setItem('mySharePercent', mySharePercent);
  }, [mySharePercent]);

  const RATE_CNY = 7.25;
  const RATE_JPY = 150.5;

  const [planSales, setPlanSales] = useState(
    PLAN_DEFS.map(def => ({
      ...def,
      count: def.id === 'mb_m' ? 95 : 
             def.id === 'mb_y' ? 12 :
             def.id === 'mp_m' ? 65 :
             def.id === 'mp_y' ? 8 :
             def.id === 'cb_m' ? 70 :
             def.id === 'cb_y' ? 15 :
             def.id === 'cp_m' ? 30 : 5 
    }))
  );

  const fixedExpenses = {
    server: 1200,
    ads: 5400
  };

  const stripeFees = Math.floor(revenue * 0.036);
  const totalExpenses = fixedExpenses.server + fixedExpenses.ads + stripeFees;
  const netProfit = revenue - totalExpenses;
  const myBonusAmount = Math.floor(revenue * (mySharePercent / 100));

  const formatUSD = (num) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
  const formatNum = (num) => new Intl.NumberFormat('en-US').format(num);

  const CurrencyDisplay = ({ amount, size = "large", accent = false }) => {
    const usd = formatUSD(amount);
    const cny = new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', currencyDisplay: 'symbol', maximumFractionDigits: 0 }).format(amount * RATE_CNY);
    const jpy = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', currencyDisplay: 'symbol', maximumFractionDigits: 0 }).format(amount * RATE_JPY);

    return (
      <div className="flex flex-col">
        <span className={`${size === "large" ? "text-4xl lg:text-5xl" : "text-xl"} font-medium tracking-tighter ${accent ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-zinc-400' : 'text-zinc-100'}`}>{usd}</span>
        <div className="flex gap-3 text-[10px] sm:text-xs text-zinc-500 font-mono mt-1 uppercase tracking-wider">
          <span>{cny}</span>
          <span className="text-zinc-700">|</span>
          <span>{jpy}</span>
        </div>
      </div>
    );
  };

  const playChime = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.error("Audio play failed", e);
    }
  }, [soundEnabled]);

  const toggleSound = () => {
    if (!soundEnabled) {
       const AudioContext = window.AudioContext || window.webkitAudioContext;
       if (AudioContext) {
         if (!audioCtxRef.current) {
           audioCtxRef.current = new AudioContext();
         }
         if (audioCtxRef.current.state === 'suspended') {
           audioCtxRef.current.resume();
         }
       }
    }
    setSoundEnabled(!soundEnabled);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.08) { 
        const isNewContract = Math.random() > 0.1;

        if (isNewContract) {
          const randomPlanIndex = Math.floor(Math.random() * 8);
          const planDef = PLAN_DEFS[randomPlanIndex];
          
          setPlanSales(currentPlans => {
            const updated = [...currentPlans];
            if (updated[randomPlanIndex]) {
              updated[randomPlanIndex].count += 1;
            }
            return updated;
          });
          
          setRevenue(r => r + planDef.price);
          setSubscribers(s => ({ ...s, total: s.total + 1, new: s.new + 1 }));
          playChime(); 
          
          const planName = lang === 'en' && planDef.nameEn ? planDef.nameEn : planDef.name;
          addNotification(`${planName} (+${formatUSD(planDef.price)})`, 'success');
        } else {
          setSubscribers(s => ({ ...s, total: s.total - 1, churn: s.churn + 1 }));
          setRevenue(r => r - 30);
          addNotification(t.notifications.churn, 'error');
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [lang, playChime, t.notifications]);

  const addNotification = (message, type) => {
    const newNotification = {
      id: Date.now(),
      message,
      type
    };
    setNotifications(prev => [newNotification, ...prev]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== newNotification.id)), 5000);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-zinc-200 font-sans selection:bg-indigo-500/30 selection:text-white overflow-y-auto lg:overflow-hidden flex flex-col">
      
      {/* Background Ambient Glow */}
      <div className="fixed top-0 left-0 right-0 h-96 bg-gradient-to-b from-indigo-900/10 to-transparent pointer-events-none z-0"></div>
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-emerald-900/5 rounded-full blur-3xl pointer-events-none z-0 translate-x-1/2 translate-y-1/2"></div>

      {/* --- ヘッダー --- */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-neutral-950/80 backdrop-blur-xl shrink-0">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative group">
              <div className="absolute inset-0 bg-indigo-500 rounded-xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative bg-neutral-900 border border-white/10 p-2 rounded-xl shadow-2xl">
                <LayoutGrid size={20} className="text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white tracking-tight leading-none mb-1">
                {t.appTitle}
              </h1>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] text-emerald-500 font-mono font-medium tracking-wider uppercase">Stripe Live</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto justify-end">
             <div className="flex items-center gap-2 bg-neutral-900/50 px-3 py-1.5 rounded-full border border-white/5">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{t.myShareLabel}</span>
                <div className="flex items-baseline gap-1">
                  <input 
                    type="number" 
                    value={mySharePercent}
                    onChange={(e) => setMySharePercent(Number(e.target.value))}
                    className="w-10 bg-transparent text-right text-white font-mono font-bold focus:outline-none border-b border-indigo-500/50 focus:border-indigo-400 transition-colors py-0.5 text-sm"
                    step="0.1"
                  />
                  <span className="text-zinc-500 text-[10px]">%</span>
                </div>
             </div>
             <div className="h-4 w-px bg-white/10 hidden sm:block"></div>
             <div className="flex items-center gap-2">
                <button onClick={toggleSound} className={`p-2 rounded-full transition-all ${soundEnabled ? 'bg-white/10 text-white' : 'text-zinc-600'}`}>
                  {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
                <div className="flex bg-neutral-900 rounded-full p-1 border border-white/5">
                  {['ja', 'en', 'zh'].map((l) => (
                    <button key={l} onClick={() => setLang(l)} className={`px-2.5 py-1 text-[10px] font-bold rounded-full transition-all ${lang === l ? 'bg-white text-black' : 'text-zinc-500 hover:text-zinc-300'}`}>
                      {l.toUpperCase()}
                    </button>
                  ))}
                </div>
             </div>
          </div>
        </div>
      </header>

      {/* --- メインコンテンツ (3カラム構成: Bento Grid Style) --- */}
      <main className="flex-grow p-4 lg:p-6 lg:overflow-hidden relative z-10 flex flex-col lg:justify-center">
        <div className="max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-4 h-auto lg:h-full lg:max-h-[800px]">
          
          {/* 左カラム: KPI (推定ボーナス & 契約者数) */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            
            {/* 推定ボーナス */}
            <div className="bg-neutral-900/60 backdrop-blur-md rounded-[24px] border border-white/5 p-6 relative overflow-hidden group hover:border-white/10 transition-all flex-1 flex flex-col justify-center min-h-[200px] lg:min-h-0">
               <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-gradient-to-br from-indigo-600/20 to-purple-600/5 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
               <div className="relative z-10">
                 <div className="flex items-center gap-2 text-zinc-400 mb-4">
                   <div className="bg-white/5 p-1.5 rounded-lg border border-white/5">
                     <Coins size={16} className="text-indigo-400" />
                   </div>
                   <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">{t.estimatedBonus}</h2>
                 </div>
                 <CurrencyDisplay amount={myBonusAmount} size="large" accent={true} />
                 <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-mono">
                   <TrendingUp size={12} />
                   <span>+2.4%</span>
                 </div>
               </div>
            </div>

            {/* 総契約者数 */}
            <div className="bg-neutral-900/60 backdrop-blur-md rounded-[24px] border border-white/5 p-6 flex-1 flex flex-col justify-center hover:border-white/10 transition-all min-h-[200px] lg:min-h-0">
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-2 text-zinc-400">
                   <div className="bg-white/5 p-1.5 rounded-lg border border-white/5">
                     <Users size={16} className="text-zinc-400" />
                   </div>
                   <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">{t.totalUsers}</h3>
                 </div>
                 <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                 </span>
              </div>
              <div className="text-5xl font-medium text-white tracking-tighter mb-4">{formatNum(subscribers.total)}</div>
              <div className="flex gap-3">
                <div className="flex-1 bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3">
                  <span className="text-[10px] text-emerald-500/70 font-bold uppercase block mb-1">{t.newContracts}</span>
                  <span className="text-lg font-medium text-emerald-400">+{subscribers.new}</span>
                </div>
                <div className="flex-1 bg-rose-500/5 border border-rose-500/10 rounded-xl p-3">
                  <span className="text-[10px] text-rose-500/70 font-bold uppercase block mb-1">{t.churned}</span>
                  <span className="text-lg font-medium text-rose-400">-{subscribers.churn}</span>
                </div>
              </div>
            </div>

          </div>

          {/* 中央カラム: Bento Grid Sales (2x2 Big Cards) */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            
            {/* 【修正】grid-cols-2 にしてスマホでも常に2列表示に。 */}
            <div className="flex-grow grid grid-cols-2 lg:grid-cols-2 grid-rows-none lg:grid-rows-2 gap-4">
              {['モバイルベーシック', 'モバイルプレミアム', 'コンボベーシック', 'コンボプレミアム'].map((planName) => {
                const moPlan = planSales.find(p => (p.name === planName || p.nameEn === planName) && p.type === 'monthly');
                const yrPlan = planSales.find(p => (p.name === planName || p.nameEn === planName) && p.type === 'yearly');
                if (!moPlan || !yrPlan) return null;

                const displayName = lang === 'en' && moPlan.nameEn ? moPlan.nameEn : moPlan.name;
                const totalRev = (moPlan.count * moPlan.price) + (yrPlan.count * yrPlan.price);
                const totalCount = moPlan.count + yrPlan.count;

                return (
                  // 【修正】スマホではpaddingを小さく(p-3)、文字サイズも小さく(text-xsなど)してレイアウト崩れを防ぐ
                  <div key={planName} className="bg-neutral-900/60 backdrop-blur-md rounded-[24px] border border-white/5 p-3 sm:p-5 hover:border-white/10 transition-all group flex flex-col justify-between h-auto min-h-[200px] lg:h-full relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="flex justify-between items-start mb-2">
                       <div>
                          <div className={`w-8 h-1.5 rounded-full ${moPlan.bar} mb-3`}></div>
                          {/* プラン名: スマホでは text-xs, PCで text-sm */}
                          <h4 className={`font-bold text-xs sm:text-sm leading-snug ${moPlan.color || 'text-white'}`}>{displayName}</h4>
                       </div>
                       <div className="text-right">
                          <span className="block text-lg sm:text-xl font-bold text-white tracking-tight">${Math.floor(totalRev).toLocaleString()}</span>
                          <span className="text-[10px] text-zinc-500 font-mono uppercase">REV</span>
                       </div>
                    </div>

                    <div className="space-y-3">
                      {/* Monthly Bar */}
                      <div className="space-y-1">
                         <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                            <span>{t.salesBreakdown.monthly}</span>
                            <span>{moPlan.count}</span>
                         </div>
                         <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden">
                            <div className="h-full bg-zinc-600 rounded-full" style={{ width: `${Math.min((moPlan.count / 150) * 100, 100)}%` }}></div>
                         </div>
                      </div>

                      {/* Yearly Bar */}
                      <div className="space-y-1">
                         <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                            <span>{t.salesBreakdown.yearly}</span>
                            <span>{yrPlan.count}</span>
                         </div>
                         <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden">
                            <div className="h-full bg-zinc-500 rounded-full" style={{ width: `${Math.min((yrPlan.count / 50) * 100, 100)}%` }}></div>
                         </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 右カラム: 収支サマリー */}
          <div className="lg:col-span-3 bg-neutral-900/60 backdrop-blur-md rounded-[24px] border border-white/5 p-6 flex flex-col hover:border-white/10 transition-all min-h-[300px] lg:min-h-0">
            
            <div className="flex items-center gap-2 mb-6 shrink-0">
              <div className="bg-white/5 p-1.5 rounded-lg border border-white/5">
                <PieChart className="text-orange-400" size={16} />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">{t.financials.title}</h3>
            </div>

            <div className="flex-grow flex flex-col justify-center space-y-6">
              {/* Gross */}
              <div className="group">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-zinc-400 font-medium">{t.financials.gross}</span>
                  <span className="text-white font-mono tracking-wide">{formatUSD(revenue)}</span>
                </div>
                <div className="w-full bg-zinc-800/50 h-2 rounded-full overflow-hidden border border-white/5">
                  <div className="bg-zinc-200 h-full rounded-full w-full"></div>
                </div>
              </div>

              {/* Expenses */}
              <div className="group">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-zinc-400 font-medium">{t.financials.expenses}</span>
                  <span className="text-rose-400 font-mono tracking-wide">-{formatUSD(fixedExpenses.server + fixedExpenses.ads)}</span>
                </div>
                <div className="w-full bg-zinc-800/50 h-2 rounded-full overflow-hidden border border-white/5">
                  <div className="bg-rose-500/80 h-full rounded-full" style={{ width: '15%' }}></div>
                </div>
              </div>

              {/* Fees */}
              <div className="group">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-zinc-400 font-medium">{t.financials.fees}</span>
                  <span className="text-amber-400 font-mono tracking-wide">-{formatUSD(stripeFees)}</span>
                </div>
                <div className="w-full bg-zinc-800/50 h-2 rounded-full overflow-hidden border border-white/5">
                  <div className="bg-amber-500/80 h-full rounded-full" style={{ width: '3.6%' }}></div>
                </div>
              </div>
              
              <div className="pt-6 mt-6 border-t border-white/5">
                <div className="flex flex-col gap-1">
                  <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest">{t.financials.net}</span>
                  <span className="text-4xl font-medium text-white tracking-tighter">{formatUSD(netProfit)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* --- Toast Notifications (Minimal) --- */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-3 w-80 pointer-events-none">
        {notifications.map((notif) => (
          <div key={notif.id} className={`bg-neutral-900 border ${notif.type === 'error' ? 'border-rose-900/50' : 'border-emerald-900/50'} text-zinc-200 p-4 rounded-2xl shadow-2xl animate-in slide-in-from-right fade-in duration-300 pointer-events-auto flex items-start gap-4 backdrop-blur-xl`}>
            <div className={`${notif.type === 'error' ? 'bg-rose-950 text-rose-500' : 'bg-emerald-950 text-emerald-500'} p-2.5 rounded-xl`}>
              {notif.type === 'error' ? <UserMinus size={18} /> : <CreditCard size={18} />}
            </div>
            <div>
              <p className="font-bold text-xs text-white mb-1 tracking-wide">
                {notif.type === 'error' ? t.notifications.titleError : t.notifications.titleSuccess}
              </p>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-mono">{notif.message}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default ShareMotive;