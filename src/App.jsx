import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  TrendingUp, Users, CreditCard, PieChart, 
  UserMinus, Volume2, VolumeX, LayoutGrid,
  Calculator, ArrowRightLeft, Coins,
  X, ChevronUp, Sparkles
} from 'lucide-react';

// --- 定数・初期設定 ---

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
  // --- State Management ---
  const [lang, setLang] = useState('ja');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioCtxRef = useRef(null);
  
  // シミュレーターウィジェットの開閉状態
  const [isSimOpen, setIsSimOpen] = useState(false);

  // 翻訳データ
  const translations = {
    ja: {
      appTitle: "ShareMotive",
      estimatedBonus: "今月の推定ボーナス",
      totalUsers: "現在の契約者数",
      monthlyStats: "今月の推移",
      newContracts: "新規加入",
      churned: "解約",
      myShareLabel: "シェア率",
      plansTitle: "プラン別販売状況",
      simulator: {
        title: "ボーナスシミュレーター",
        targetRevenue: "月間売上高 (USD)",
        targetBonus: "ボーナス支給額",
      },
      notifications: {
        titleSuccess: "新規契約",
        titleError: "解約アラート",
        churn: "サブスクリプションがキャンセルされました"
      },
      financials: {
        title: "人件費支払い前の利益",
        gross: "総売上",
        ads: "広告費",
        server: "サーバー代",
        fees: "決済手数料 (Stripe)",
        margin: "利益率",
      },
      salesBreakdown: {
        monthly: "月額",
        yearly: "年額"
      }
    },
    en: {
      appTitle: "ShareMotive",
      estimatedBonus: "Est. Bonus (Month)",
      totalUsers: "Total Subscribers",
      monthlyStats: "Monthly Stats",
      newContracts: "New",
      churned: "Churn",
      myShareLabel: "Share %",
      plansTitle: "Sales by Plan",
      simulator: {
        title: "Bonus Simulator",
        targetRevenue: "Monthly Revenue (USD)",
        targetBonus: "Bonus Amount",
      },
      notifications: {
        titleSuccess: "New Contract",
        titleError: "Churn Alert",
        churn: "Subscription Cancelled"
      },
      financials: {
        title: "Profit Before Labor Cost",
        gross: "Gross Revenue",
        ads: "Ads Cost",
        server: "Server Cost",
        fees: "Stripe Fees",
        margin: "Margin",
      },
      salesBreakdown: {
        monthly: "Mo",
        yearly: "Yr"
      }
    },
    zh: {
      appTitle: "ShareMotive",
      estimatedBonus: "本月预计奖金",
      totalUsers: "当前订阅用户",
      monthlyStats: "本月变动",
      newContracts: "新增",
      churned: "流失",
      myShareLabel: "分成比例",
      plansTitle: "各计划销售额",
      simulator: {
        title: "奖金模拟器",
        targetRevenue: "月总收入 (USD)",
        targetBonus: "奖金金额",
      },
      notifications: {
        titleSuccess: "新合约",
        titleError: "退订警报",
        churn: "订阅已取消"
      },
      financials: {
        title: "扣除人工前利润",
        gross: "总收入",
        ads: "广告费",
        server: "服务器费",
        fees: "支付手续费 (Stripe)",
        margin: "利润率",
      },
      salesBreakdown: {
        monthly: "月",
        yearly: "年"
      }
    }
  };

  const t = translations[lang];
  
  const langLabels = { ja: '日', en: '英', zh: '中' };

  // ダッシュボード用データ
  const [revenue, setRevenue] = useState(102450); 
  const [notifications, setNotifications] = useState([]);
  const [subscribers, setSubscribers] = useState({ total: 3300, new: 300, churn: 200 });
  
  // シェア率
  const [mySharePercent, setMySharePercent] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mySharePercent');
      return saved ? parseFloat(saved) : 2.0;
    }
    return 2.0;
  });

  useEffect(() => {
    localStorage.setItem('mySharePercent', mySharePercent);
    setSimBonus(Math.floor(simRevenue * (mySharePercent / 100)));
  }, [mySharePercent]);

  // シミュレーター用 State
  const [simRevenue, setSimRevenue] = useState(200000);
  const [simBonus, setSimBonus] = useState(0);

  useEffect(() => {
    setSimBonus(Math.floor(simRevenue * (mySharePercent / 100)));
  }, []);

  const handleSimRevenueChange = (e) => {
    const val = Number(e.target.value);
    setSimRevenue(val);
    setSimBonus(Math.floor(val * (mySharePercent / 100)));
  };

  const handleSimBonusChange = (e) => {
    const val = Number(e.target.value);
    setSimBonus(val);
    if (mySharePercent > 0) {
      setSimRevenue(Math.floor(val / (mySharePercent / 100)));
    }
  };

  // 為替レート
  const RATE_CNY = 7.25;
  const RATE_JPY = 150.5;

  // フォーマッター
  const formatUSD = (num) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
  const formatUnitPrice = (num) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(num);
  const formatNum = (num) => new Intl.NumberFormat('en-US').format(num);
  const formatJPY = (usd) => new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(usd * RATE_JPY);
  const formatCNY = (usd) => new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', maximumFractionDigits: 0 }).format(usd * RATE_CNY);

  const [planSales, setPlanSales] = useState(
    PLAN_DEFS.map(def => ({
      ...def,
      count: def.id === 'mb_m' ? 95 : def.id === 'mb_y' ? 12 : def.id === 'mp_m' ? 65 : def.id === 'mp_y' ? 8 : def.id === 'cb_m' ? 70 : def.id === 'cb_y' ? 15 : def.id === 'cp_m' ? 30 : 5 
    }))
  );

  const fixedExpenses = { server: 1200, ads: 5400 };
  const stripeFees = Math.floor(revenue * 0.036);
  const totalExpenses = fixedExpenses.server + fixedExpenses.ads + stripeFees;
  const netProfit = revenue - totalExpenses;
  const myBonusAmount = Math.floor(revenue * (mySharePercent / 100));

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
       if (AudioContext && !audioCtxRef.current) {
           audioCtxRef.current = new AudioContext();
       }
       if (audioCtxRef.current?.state === 'suspended') {
           audioCtxRef.current.resume();
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
          setPlanSales(current => {
            const updated = [...current];
            if (updated[randomPlanIndex]) updated[randomPlanIndex].count += 1;
            return updated;
          });
          setRevenue(r => r + planDef.price);
          setSubscribers(s => ({ ...s, total: s.total + 1, new: s.new + 1 }));
          playChime(); 
          const planName = lang === 'en' && planDef.nameEn ? planDef.nameEn : planDef.name;
          addNotification(`${planName} (+${formatUnitPrice(planDef.price)})`, 'success');
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
    const newNotif = { id: Date.now(), message, type };
    setNotifications(prev => [newNotif, ...prev]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== newNotif.id)), 5000);
  };

  const SubCurrency = ({ amount, color = "text-zinc-500" }) => {
    if (lang === 'ja') {
      return (
        <div className={`text-[10px] font-mono mt-0.5 ${color} flex items-center gap-1.5`}>
           <span className="w-1 h-1 rounded-full bg-indigo-500/50"></span>
           JPY: {formatJPY(amount)}
        </div>
      );
    }
    if (lang === 'zh') {
      return (
        <div className={`text-[10px] font-mono mt-0.5 ${color} flex items-center gap-1.5`}>
           <span className="w-1 h-1 rounded-full bg-red-500/50"></span>
           CNY: {formatCNY(amount)}
        </div>
      );
    }
    return (
      <div className={`text-[10px] font-mono mt-0.5 ${color} opacity-60`}>
         {formatJPY(amount)} / {formatCNY(amount)}
      </div>
    );
  };

  // --- Grid Item for Plans ---
  const PlanGridItem = ({ planName }) => {
    const moPlan = planSales.find(p => (p.name === planName || p.nameEn === planName) && p.type === 'monthly');
    const yrPlan = planSales.find(p => (p.name === planName || p.nameEn === planName) && p.type === 'yearly');
    if (!moPlan || !yrPlan) return null;

    const displayName = (lang === 'en' || lang === 'zh') && moPlan.nameEn ? moPlan.nameEn : moPlan.name;
    const totalRev = (moPlan.count * moPlan.price) + (yrPlan.count * yrPlan.price);

    return (
      <div className="flex flex-col justify-between h-full p-4 bg-black/40 rounded-2xl border border-white/5 hover:border-white/15 hover:bg-black/60 transition-all duration-300 group">
        
        {/* Header: Vertical Stack */}
        <div className="mb-3">
            <div className={`w-6 h-1 rounded-full ${moPlan.bar} mb-2 shadow-[0_0_10px_rgba(0,0,0,0.5)]`}></div>
            {/* Plan Name */}
            <h4 className={`font-bold text-xs sm:text-xs leading-snug ${moPlan.color || 'text-white'} opacity-90 group-hover:opacity-100 block mb-1`}>{displayName}</h4>
            
            {/* Price moved below name, LEFT aligned */}
            <div className="text-left">
              <span className="block text-lg sm:text-lg font-bold text-white tracking-tight group-hover:scale-105 transition-transform origin-left">${Math.floor(totalRev).toLocaleString()}</span>
            </div>
        </div>

        <div className="space-y-2 mt-auto">
          {/* Monthly Row */}
          <div className="space-y-1">
              <div className="flex justify-between text-[10px] sm:text-[9px] text-zinc-300 sm:text-zinc-500 font-mono">
                <span className="flex items-center gap-1.5">
                   {t.salesBreakdown.monthly} 
                   <span className="text-zinc-400 sm:text-zinc-600 text-[9px] font-normal opacity-70">{formatUnitPrice(moPlan.price)}</span>
                </span>
                <span>{moPlan.count}</span>
              </div>
              <div className="h-1 w-full bg-zinc-800/50 rounded-full overflow-hidden">
                <div className="h-full bg-zinc-500 rounded-full transition-all duration-500" style={{ width: `${Math.min((moPlan.count / 150) * 100, 100)}%` }}></div>
              </div>
          </div>
          {/* Yearly Row */}
          <div className="space-y-1">
              <div className="flex justify-between text-[10px] sm:text-[9px] text-zinc-300 sm:text-zinc-500 font-mono">
                <span className="flex items-center gap-1.5">
                   {t.salesBreakdown.yearly}
                   <span className="text-zinc-400 sm:text-zinc-600 text-[9px] font-normal opacity-70">{formatUnitPrice(yrPlan.price)}</span>
                </span>
                <span>{yrPlan.count}</span>
              </div>
              <div className="h-1 w-full bg-zinc-800/50 rounded-full overflow-hidden">
                <div className="h-full bg-zinc-600 rounded-full transition-all duration-500" style={{ width: `${Math.min((yrPlan.count / 50) * 100, 100)}%` }}></div>
              </div>
          </div>
        </div>
      </div>
    );
  };

  // --- Common Card Style ---
  const CardBase = ({ children, className = "" }) => (
    <div className={`bg-neutral-900/60 backdrop-blur-xl rounded-[28px] border border-white/5 p-4 sm:p-6 hover:border-white/10 hover:shadow-2xl hover:shadow-black/50 transition-all duration-500 ${className}`}>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen h-full w-full bg-[#050505] text-zinc-200 font-sans selection:bg-indigo-500/30 selection:text-white flex flex-col relative overflow-y-auto lg:overflow-hidden">
      
      {/* Background Ambience */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-600/10 rounded-[100%] blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-0 right-0 w-[800px] h-[800px] bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
      
      {/* --- Header --- */}
      <header className="shrink-0 z-40 flex items-center justify-center pt-4 pb-2 px-4 sm:pt-6 sm:px-8">
        <div className="w-full max-w-[1400px] flex justify-between items-center">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative group cursor-pointer">
              <div className="absolute inset-0 bg-indigo-500 rounded-xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
              <div className="relative bg-black/40 border border-white/10 p-2 rounded-xl shadow-lg backdrop-blur-md">
                <LayoutGrid size={18} className="text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-none">{t.appTitle}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span className="text-[9px] text-emerald-500 font-mono font-bold tracking-widest uppercase opacity-80">Live</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
             <div className="flex items-center gap-1.5 sm:gap-3 bg-white/5 px-2 py-1 sm:px-4 sm:py-2 rounded-full border border-white/5 hover:bg-white/10 transition-colors backdrop-blur-md">
                <span className="text-[9px] text-zinc-300 sm:text-zinc-500 font-bold uppercase tracking-widest">{t.myShareLabel}</span>
                <div className="h-3 w-px bg-white/10 hidden sm:block"></div>
                <div className="flex items-baseline gap-0.5 sm:gap-1">
                  <input 
                    type="number" 
                    value={mySharePercent}
                    onChange={(e) => setMySharePercent(Number(e.target.value))}
                    className="w-5 sm:w-10 bg-transparent text-right text-white font-mono font-bold focus:outline-none focus:text-indigo-400 transition-colors text-sm"
                    step="0.1"
                  />
                  <span className="text-zinc-300 sm:text-zinc-500 text-[10px]">%</span>
                </div>
             </div>
             
             <div className="flex items-center gap-2">
                <button onClick={toggleSound} className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full transition-all hover:bg-white/10 ${soundEnabled ? 'text-zinc-300' : 'text-zinc-600'}`}>
                  {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
                <div className="flex bg-black/40 rounded-full p-1 border border-white/5 backdrop-blur-md">
                  {['ja', 'en', 'zh'].map((l) => (
                    <button 
                      key={l} 
                      onClick={() => setLang(l)} 
                      className={`px-2 py-1 sm:px-3 sm:py-1 text-[10px] font-bold rounded-full transition-all duration-300 ${lang === l ? 'bg-zinc-200 text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      {langLabels[l]}
                    </button>
                  ))}
                </div>
             </div>
          </div>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="flex-1 flex items-start lg:items-center justify-center p-4 lg:p-12 z-10">
        
        {/* Main Grid */}
        <div className="w-full max-w-[1400px] lg:h-full lg:max-h-[850px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          
          {/* === COLUMN 1 (Left: KPIs) === */}
          <div className="flex flex-col gap-4 sm:gap-5 h-full">
            
            {/* Top-Left: Bonus */}
            <div className="flex-1 relative overflow-hidden group flex flex-col justify-center bg-gradient-to-br from-indigo-950/40 to-neutral-900/80 backdrop-blur-xl rounded-[28px] border border-indigo-500/40 p-6 shadow-[0_0_40px_rgba(79,70,229,0.15)] hover:shadow-[0_0_60px_rgba(79,70,229,0.3)] hover:border-indigo-400/60 transition-all duration-500 min-h-[180px]">
               <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-indigo-500/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/3 pointer-events-none group-hover:bg-indigo-400/30 transition-colors duration-500"></div>
               
               <div className="relative z-10">
                 <div className="flex items-center gap-2 mb-4">
                   <div className="bg-indigo-500/20 p-1.5 rounded-lg border border-indigo-500/30 text-indigo-300 shadow-lg shadow-indigo-500/20">
                     <Sparkles size={16} fill="currentColor" className="text-indigo-200" />
                   </div>
                   <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-100 sm:text-indigo-200/80">{t.estimatedBonus}</h2>
                 </div>

                 {lang === 'ja' ? (
                   <div>
                     <div className="text-5xl lg:text-6xl font-semibold tracking-tighter text-white mb-2 drop-shadow-2xl">
                       {formatJPY(myBonusAmount)}
                     </div>
                     <div className="text-indigo-200/50 text-sm font-mono tracking-wide">
                        {formatUSD(myBonusAmount)} (USD)
                     </div>
                   </div>
                 ) : lang === 'zh' ? (
                   <div>
                     <div className="text-5xl lg:text-6xl font-semibold tracking-tighter text-white mb-2 drop-shadow-2xl">
                       {formatCNY(myBonusAmount)}
                     </div>
                     <div className="text-indigo-200/50 text-sm font-mono tracking-wide">
                        {formatUSD(myBonusAmount)} (USD)
                     </div>
                   </div>
                 ) : (
                   <div>
                     <div className="text-5xl lg:text-6xl font-semibold tracking-tighter text-white mb-2 drop-shadow-2xl">
                       {formatUSD(myBonusAmount)}
                     </div>
                     <SubCurrency amount={myBonusAmount} color="text-indigo-200/50" />
                   </div>
                 )}
               </div>
            </div>

            {/* Bottom-Left: Users */}
            <CardBase className="flex-1 flex flex-col justify-center min-h-[160px]">
              <div className="flex items-center gap-2 mb-3">
                 <div className="bg-white/5 p-1.5 rounded-lg border border-white/5">
                    <Users size={14} className="text-zinc-400 sm:text-zinc-500" />
                 </div>
                 <h3 className="text-xs sm:text-[10px] font-bold uppercase tracking-widest text-zinc-300 sm:text-zinc-500">{t.totalUsers}</h3>
              </div>
              <div className="text-4xl lg:text-5xl font-medium text-white tracking-tight mb-4">{formatNum(subscribers.total)}</div>
              
              <div className="flex items-center gap-4">
                 <div className="flex gap-0.5 items-end h-8">
                    {[40,60,30,70,50,80,60].map((h,i) => (
                      <div key={i} className="w-1.5 bg-zinc-800 rounded-sm" style={{height: `${h}%`}}></div>
                    ))}
                 </div>
                 <div className="h-8 w-px bg-white/5"></div>
                 <div className="flex flex-col justify-center gap-1.5 w-full">
                    <div className="text-[9px] text-zinc-400 sm:text-zinc-500 font-bold uppercase tracking-wider mb-0.5">{t.monthlyStats}</div>
                    
                    <div className="flex justify-between items-center w-full text-xs">
                      <span className="text-zinc-300 sm:text-zinc-400">{t.newContracts}</span>
                      <span className="font-medium text-emerald-400">+{subscribers.new}</span>
                    </div>
                    <div className="flex justify-between items-center w-full text-xs">
                      <span className="text-zinc-300 sm:text-zinc-400">{t.churned}</span>
                      <span className="font-medium text-rose-500">-{subscribers.churn}</span>
                    </div>
                 </div>
              </div>
            </CardBase>

          </div>

          {/* === COLUMN 2 & 3 (Center: Plans) === */}
          <div className="lg:col-span-2 h-full min-h-[400px]">
            <CardBase className="h-full flex flex-col p-2 lg:p-5 !bg-neutral-900/40">
              <div className="flex items-center justify-between mb-4 px-2 pt-1 shrink-0">
                <div className="flex items-center gap-2">
                  <LayoutGrid size={14} className="text-zinc-400 sm:text-zinc-500" />
                  <h3 className="text-xs sm:text-[10px] font-bold uppercase tracking-widest text-zinc-300 sm:text-zinc-500">{t.plansTitle}</h3>
                </div>
              </div>

              {/* 2x2 Inner Grid */}
              <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-3">
                  <PlanGridItem planName="モバイルベーシック" />
                  <PlanGridItem planName="モバイルプレミアム" />
                  <PlanGridItem planName="コンボベーシック" />
                  <PlanGridItem planName="コンボプレミアム" />
              </div>
            </CardBase>
          </div>

          {/* === COLUMN 4 (Right: Financials) === */}
          <div className="flex flex-col h-full min-h-[300px]">
            <CardBase className="h-full flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-8">
                <div className="bg-white/5 p-1.5 rounded-lg border border-white/5">
                   <PieChart className="text-orange-400" size={14} />
                </div>
                <h3 className="text-xs sm:text-[10px] font-bold uppercase tracking-widest text-zinc-300 sm:text-zinc-500">{t.financials.title}</h3>
              </div>
              
              <div className="flex-1 flex flex-col justify-center">
                 <div className="text-4xl lg:text-5xl font-medium text-white tracking-tight mb-8">
                   {formatUSD(netProfit)}
                 </div>
                 
                 <div className="space-y-6">
                    <div className="w-full h-2 bg-zinc-800/50 rounded-full overflow-hidden flex border border-white/5">
                       <div className="bg-zinc-200 h-full shadow-[0_0_10px_rgba(255,255,255,0.3)]" style={{ width: '80%' }}></div>
                       <div className="bg-rose-500 h-full" style={{ width: '15%' }}></div>
                       <div className="bg-amber-500 h-full" style={{ width: '5%' }}></div>
                    </div>

                    <div className="flex flex-col gap-2.5">
                       <div className="flex justify-between text-xs text-zinc-300 sm:text-zinc-400 font-mono border-b border-white/5 pb-2">
                          <span className="uppercase tracking-wider opacity-80">{t.financials.gross}</span>
                          <span className="text-white font-bold">{formatUSD(revenue)}</span>
                       </div>

                       <div className="flex flex-col gap-1.5 py-1">
                          <div className="flex justify-between text-[11px] text-zinc-300 sm:text-zinc-500 font-mono">
                             <span>{t.financials.ads}</span>
                             <span className="text-rose-400/80">-{formatUSD(fixedExpenses.ads)}</span>
                          </div>
                          <div className="flex justify-between text-[11px] text-zinc-300 sm:text-zinc-500 font-mono">
                             <span>{t.financials.server}</span>
                             <span className="text-rose-400/80">-{formatUSD(fixedExpenses.server)}</span>
                          </div>
                          <div className="flex justify-between text-[11px] text-zinc-300 sm:text-zinc-500 font-mono">
                             <span>{t.financials.fees}</span>
                             <span className="text-amber-400/80">-{formatUSD(stripeFees)}</span>
                          </div>
                       </div>

                       <div className="flex justify-between text-xs text-zinc-300 sm:text-zinc-400 font-mono border-t border-white/5 pt-2">
                          <span className="uppercase tracking-wider opacity-80">{t.financials.margin}</span>
                          <span className="text-emerald-400 font-bold">{(netProfit/revenue*100).toFixed(1)}%</span>
                       </div>
                    </div>
                 </div>
              </div>
            </CardBase>
          </div>

        </div>
      </main>

      {/* --- Floating Simulator Widget --- */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-4">
         
         <div className={`
             transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) origin-bottom-left overflow-hidden
             ${isSimOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-4 pointer-events-none h-0'}
         `}>
           <div className="w-[300px] bg-neutral-900/90 backdrop-blur-2xl border border-indigo-500/30 rounded-3xl p-5 shadow-2xl relative">
              <button 
                onClick={() => setIsSimOpen(false)}
                className="absolute top-3 right-3 p-1 text-zinc-500 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <Calculator size={14} className="text-indigo-400" />
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">{t.simulator.title}</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">{t.simulator.targetRevenue}</label>
                  <div className="bg-black/50 border border-indigo-500/20 rounded-xl px-3 py-2 flex items-center gap-2">
                     <span className="text-zinc-600 text-xs">USD</span>
                     <input type="number" step="10" value={simRevenue} onChange={handleSimRevenueChange} className="w-full bg-transparent text-sm font-mono text-white focus:outline-none"/>
                  </div>
                </div>
                
                <div className="flex justify-center -my-2 relative z-10">
                   <div className="bg-neutral-900 border border-indigo-500/30 rounded-full p-0.5"><ArrowRightLeft size={10} className="text-indigo-500 rotate-90"/></div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-indigo-400 uppercase font-bold tracking-wider">{t.simulator.targetBonus}</label>
                  
                  {lang === 'ja' ? (
                    <div className="flex flex-col gap-2">
                        <div className="text-3xl font-bold text-white tracking-tight">
                            {formatJPY(simBonus)}
                        </div>
                        <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl px-3 py-1.5 flex items-center gap-2">
                            <span className="text-indigo-400 text-[10px] font-bold">USD</span>
                            <input type="number" step="10" value={simBonus} onChange={handleSimBonusChange} className="w-full bg-transparent text-sm font-mono text-white font-bold focus:outline-none"/>
                        </div>
                    </div>
                  ) : lang === 'zh' ? (
                    <div className="flex flex-col gap-2">
                        <div className="text-3xl font-bold text-white tracking-tight">
                            {formatCNY(simBonus)}
                        </div>
                        <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl px-3 py-1.5 flex items-center gap-2">
                            <span className="text-indigo-400 text-[10px] font-bold">USD</span>
                            <input type="number" step="10" value={simBonus} onChange={handleSimBonusChange} className="w-full bg-transparent text-sm font-mono text-white font-bold focus:outline-none"/>
                        </div>
                    </div>
                  ) : (
                    <>
                        <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl px-3 py-2 flex items-center gap-2">
                            <span className="text-indigo-400 text-xs">USD</span>
                            <input type="number" step="10" value={simBonus} onChange={handleSimBonusChange} className="w-full bg-transparent text-lg font-mono text-white font-bold focus:outline-none"/>
                        </div>
                        <div className="pl-1"><SubCurrency amount={simBonus} color="text-indigo-300/50" /></div>
                    </>
                  )}
                </div>
              </div>
           </div>
         </div>

         <button 
            onClick={() => setIsSimOpen(!isSimOpen)}
            className={`
              h-12 w-auto px-4 rounded-full flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 border border-indigo-500/30 backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95
              ${isSimOpen ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-neutral-900/80 text-indigo-400 hover:bg-neutral-800'}
            `}
         >
            {isSimOpen ? <ChevronUp size={20} className="rotate-180 transition-transform"/> : <Calculator size={20} />}
            {!isSimOpen && <span className="text-xs font-bold whitespace-nowrap hidden sm:inline">{t.simulator.title}</span>}
         </button>
      </div>

      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-2 w-80 pointer-events-none">
        {notifications.map((notif) => (
          <div key={notif.id} className={`bg-neutral-900/90 border ${notif.type === 'error' ? 'border-rose-900/50' : 'border-emerald-900/50'} text-zinc-200 p-3 rounded-2xl shadow-2xl animate-in slide-in-from-right fade-in duration-300 pointer-events-auto flex items-center gap-3 backdrop-blur-md`}>
            <div className={`${notif.type === 'error' ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'} p-2 rounded-xl shrink-0`}>
              {notif.type === 'error' ? <UserMinus size={14} /> : <CreditCard size={14} />}
            </div>
            <div>
              <p className="font-bold text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">{notif.type === 'error' ? t.notifications.titleError : t.notifications.titleSuccess}</p>
              <p className="text-xs text-white font-medium">{notif.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShareMotive;