import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeSubscriptions, fileToBase64 } from './lib/gemini';
import { 
  Loader2, 
  Upload, 
  FileText, 
  Shield, 
  Lock, 
  CheckCircle2, 
  Circle, 
  X, 
  ExternalLink, 
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronRight,
  Banknote,
  CreditCard,
  Zap,
  TrendingDown,
  Search,
  ShieldCheck,
  Clock
} from 'lucide-react';

const LOADING_STEPS = [
  { title: "Scanning transactions...", desc: "Reading your statement data" },
  { title: "Detecting recurring charges...", desc: "Identifying patterns in your last 12 statements" },
  { title: "Calculating annual spend...", desc: "Summing up monthly and yearly costs" },
  { title: "Finding unused subscriptions...", desc: "Analyzing usage patterns and frequency" }
];

const BillShield = () => {
  // Input states
  const [statementText, setStatementText] = useState('');
  const [pdfFile, setPdfFile] = useState(null);

  // Analysis states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [auditResult, setAuditResult] = useState(null);
  const [error, setError] = useState(null);

  // Modal state
  const [selectedSubscription, setSelectedSubscription] = useState(null);

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setError(null);
    } else if (file) {
      setError('Please upload a PDF file.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setError(null);
    } else if (file) {
      setError('Please upload a PDF file.');
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleAudit = async () => {
    setError(null);
    setIsAnalyzing(true);
    setLoadingStep(0);
    setProgress(0);

    // Simulate progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + 1;
      });
    }, 50);

    // Simulate step progression
    const stepInterval = setInterval(() => {
      setLoadingStep(prev => {
        if (prev < 3) return prev + 1;
        return prev;
      });
    }, 1500);

    try {
      let result;
      if (pdfFile) {
        const base64 = await fileToBase64(pdfFile);
        result = await analyzeSubscriptions(base64, 'pdf');
      } else if (statementText.trim()) {
        result = await analyzeSubscriptions(statementText, 'text');
      } else {
        throw new Error('Please paste your statement text or upload a PDF.');
      }
      
      // Wait a bit to ensure the user sees the last step
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      clearInterval(progressInterval);
      clearInterval(stepInterval);
      setProgress(100);
      setLoadingStep(3); // Ensure all steps are marked complete
      
      setTimeout(() => {
        setAuditResult(result);
        setIsAnalyzing(false);
      }, 500);

    } catch (err) {
      console.error('Audit error:', err);
      setError(err.message || 'Analysis failed. Please try again.');
      setIsAnalyzing(false);
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    }
  };

  const handleReset = () => {
    setStatementText('');
    setPdfFile(null);
    setAuditResult(null);
    setError(null);
    setSelectedSubscription(null);
    setLoadingStep(0);
    setProgress(0);
  };

  const canAnalyze = pdfFile || statementText.trim().length > 10;

  return (
    <div className="min-h-screen w-full bg-[#FAFAFA] font-sans text-slate-900 selection:bg-emerald-100">
      
      {/* Header */}
      <header className="w-full bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-xl tracking-tight">BillShield</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">How it works</a>
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Features</a>
            <a href="#faq" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">FAQ</a>
          </nav>
          <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm px-5 py-2.5 rounded-full transition-all shadow-sm">
            Try Free
          </button>
        </div>
      </header>

      <main className={`w-full max-w-7xl mx-auto px-4 pb-12 flex flex-col items-center ${!isAnalyzing && !auditResult ? 'justify-start pt-4' : 'justify-center'} min-h-[calc(100vh-100px)]`}>
        
        <AnimatePresence mode="wait">
          {/* 1. LANDING PAGE & INPUT SCREEN (BENTO GRID) */}
          {!isAnalyzing && !auditResult && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full space-y-6"
            >
              {/* Hero Section */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Main Hero Card */}
                <div className="col-span-12 lg:col-span-7 bg-[#0D2818] rounded-3xl p-10 md:p-14 flex flex-col justify-between min-h-[400px] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
                  <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider w-fit mb-6">
                      <Zap className="w-3 h-3" />
                      Not another expense tracker
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
                      Paytm tells you <span className="text-emerald-400">where</span> your money went.
                    </h1>
                  </div>
                  <div className="relative z-10">
                    <p className="text-xl md:text-2xl font-bold text-white">
                      We tell you <span className="text-emerald-400">how to get it back.</span>
                    </p>
                  </div>
                </div>

                {/* Stats Column */}
                <div className="col-span-12 lg:col-span-5 grid grid-rows-2 gap-4">
                  {/* Savings Stat */}
                  <div className="bg-emerald-500 rounded-3xl p-8 flex flex-col justify-between text-white relative overflow-hidden group hover:scale-[1.02] transition-transform">
                    <div className="absolute -right-8 -bottom-8 opacity-20">
                      <TrendingDown className="w-32 h-32" />
                    </div>
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                        <TrendingDown className="w-6 h-6" />
                      </div>
                      <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">Proven</span>
                    </div>
                    <div>
                      <div className="text-4xl font-black">₹12,000+</div>
                      <div className="text-sm font-medium opacity-90 mt-1">Average annual savings per user</div>
                    </div>
                  </div>

                  {/* Privacy Stat */}
                  <div className="bg-white rounded-3xl p-8 flex flex-col justify-between border border-slate-200 relative overflow-hidden group hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ShieldCheck className="w-6 h-6 text-emerald-600" />
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider">Local</span>
                    </div>
                    <div>
                      <div className="text-4xl font-black text-slate-900">100%</div>
                      <div className="text-sm font-medium text-slate-600 mt-1">Private & Secure — No data stored</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Input Tool Section */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* The Input Card */}
                <div className="col-span-12 lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-lg p-8 md:p-10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-5 py-2 rounded-bl-2xl">
                    Try now — No signup
                  </div>
                  
                  <div className="space-y-2 mb-8">
                    <h2 className="text-2xl font-black text-slate-900">Run your first audit</h2>
                    <p className="text-slate-500">Upload or paste. Get actionable insights in 60 seconds.</p>
                  </div>
                  
                  <div className="flex flex-col gap-6">
                    {/* PDF Upload */}
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      className={`
                        group relative flex flex-col items-center justify-center gap-4 
                        rounded-2xl border-2 border-dashed p-10 transition-all cursor-pointer
                        ${pdfFile 
                          ? 'border-emerald-500 bg-emerald-50' 
                          : 'border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50'
                        }
                      `}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      
                      <div className={`
                        w-14 h-14 rounded-2xl flex items-center justify-center transition-all
                        ${pdfFile ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-600 group-hover:scale-110 duration-200'}
                      `}>
                        {pdfFile ? <Check className="w-7 h-7" /> : <Upload className="w-7 h-7" />}
                      </div>

                      <div className="space-y-1 text-center">
                        <p className="font-bold text-slate-900">
                          {pdfFile ? pdfFile.name : 'Upload bank statement (PDF)'}
                        </p>
                        <p className="text-sm text-slate-500">
                          {pdfFile ? 'Click to change file' : 'Drag and drop or click to browse'}
                        </p>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="relative flex items-center py-2">
                      <div className="flex-grow border-t border-slate-200"></div>
                      <span className="flex-shrink-0 mx-4 text-xs font-bold text-slate-400 uppercase tracking-wider">OR</span>
                      <div className="flex-grow border-t border-slate-200"></div>
                    </div>

                    {/* Text Input */}
                    <textarea
                      value={statementText}
                      onChange={(e) => setStatementText(e.target.value)}
                      placeholder="Paste your bank or card statement text here..."
                      className="w-full h-28 p-4 rounded-2xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none text-sm transition-all"
                    />

                    {error && (
                      <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-xl">
                        <AlertTriangle className="w-4 h-4" />
                        {error}
                      </div>
                    )}

                    {/* Action Button */}
                    <button
                      onClick={handleAudit}
                      disabled={!canAnalyze}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold h-14 rounded-2xl transition-all shadow-sm active:scale-[0.98] text-lg flex items-center justify-center gap-2"
                    >
                      Analyze My Subscriptions
                      <ArrowRight className="w-5 h-5" />
                    </button>

                    {/* Security Note */}
                    <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-medium">
                      <Lock className="w-3 h-3" />
                      Analyzed once. Never stored. Never shared.
                    </div>
                  </div>
                </div>

                {/* How it Works - Sidebar */}
                <div id="how-it-works" className="col-span-12 lg:col-span-4 bg-[#0D2818] rounded-3xl p-8 flex flex-col justify-center text-white">
                  <h3 className="font-black text-2xl mb-8 flex items-center gap-3">
                    <Clock className="w-6 h-6 text-emerald-400" />
                    How it works
                  </h3>
                  <div className="space-y-8">
                    {[
                      { title: "Upload Statement", desc: "PDF or paste text from any bank." },
                      { title: "AI Scans Patterns", desc: "Gemini detects recurring charges." },
                      { title: "Get Action Steps", desc: "Cancel guides, not just data." }
                    ].map((step, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center font-black text-sm flex-shrink-0">
                          {i + 1}
                        </div>
                        <div>
                          <div className="font-bold text-white">{step.title}</div>
                          <div className="text-sm text-emerald-200/80">{step.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* The Difference Section */}
              <div id="features" className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200">
                <div className="text-center mb-10">
                  <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">Everything you need to take action.</h2>
                  <p className="text-slate-500 max-w-xl mx-auto">Not just insights. Not just data. Real, actionable steps to save money.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { icon: <Search className="w-6 h-6" />, title: "AI Detection", desc: "Gemini identifies recurring patterns even with irregular billing." },
                    { icon: <AlertTriangle className="w-6 h-6" />, title: "Unused Flagging", desc: "We highlight subscriptions you might have forgotten about." },
                    { icon: <FileText className="w-6 h-6" />, title: "Cancel Guides", desc: "Step-by-step instructions for every subscription we find." },
                    { icon: <ShieldCheck className="w-6 h-6" />, title: "Zero Storage", desc: "Your data never leaves your browser. Period." }
                  ].map((feature, i) => (
                    <div key={i} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group">
                      <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600 mb-4 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500 transition-all">
                        {feature.icon}
                      </div>
                      <h3 className="font-bold text-slate-900 mb-2">{feature.title}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comparison Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Expense Trackers */}
                <div className="bg-slate-100 rounded-3xl p-8 border border-slate-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center">
                      <X className="w-5 h-5 text-slate-600" />
                    </div>
                    <h3 className="font-bold text-slate-600">Expense Trackers</h3>
                  </div>
                  <ul className="space-y-3 text-slate-500">
                    {[
                      "Shows you spent ₹199 on Spotify",
                      "Passive dashboard, no recommendations",
                      "Requires login & bank linking",
                      "Data stored on their servers"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <X className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* BillShield */}
                <div className="bg-emerald-500 rounded-3xl p-8 text-white">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <Shield className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold">BillShield</h3>
                  </div>
                  <ul className="space-y-3">
                    {[
                      "Flags that you haven't used Spotify in 3 months",
                      "Actionable cancel guides for every subscription",
                      "Zero login, zero data storage",
                      "One-time audit, not another app to check"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-emerald-200 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Banks & Categories Row */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* What We Detect */}
                <div className="col-span-12 lg:col-span-5 bg-white rounded-3xl p-8 border border-slate-200">
                  <h3 className="font-bold text-slate-900 mb-6">We detect 8+ categories</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { icon: "🎬", label: "Streaming" },
                      { icon: "🎵", label: "Music" },
                      { icon: "💪", label: "Fitness" },
                      { icon: "☁️", label: "SaaS" },
                      { icon: "📦", label: "Delivery" },
                      { icon: "🎮", label: "Gaming" },
                      { icon: "📰", label: "News" },
                      { icon: "📱", label: "Apps" }
                    ].map((cat, i) => (
                      <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors">
                        <span className="text-2xl">{cat.icon}</span>
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{cat.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Banks */}
                <div className="col-span-12 lg:col-span-7 bg-slate-50 rounded-3xl p-8 border border-slate-200 flex flex-col justify-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6 text-center">Works with all major Indian banks</p>
                  <div className="flex flex-wrap justify-center gap-8 items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                    {[
                      { name: 'HDFC Bank', domain: 'hdfcbank.com' },
                      { name: 'ICICI Bank', domain: 'icicibank.com' },
                      { name: 'SBI Card', domain: 'sbicard.com' },
                      { name: 'Axis Bank', domain: 'axisbank.com' },
                      { name: 'American Express', domain: 'americanexpress.com' },
                      { name: 'Cred', domain: 'cred.club' }
                    ].map((bank) => (
                      <img 
                        key={bank.name} 
                        src={`https://logo.clearbit.com/${bank.domain}`} 
                        alt={bank.name}
                        title={bank.name}
                        className="h-8 w-auto object-contain hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* FAQ Section - Bento Grid */}
              <div id="faq" className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* FAQ Header Cell */}
                <div className="col-span-12 md:col-span-5 bg-[#0D2818] rounded-3xl p-8 md:p-10 flex flex-col justify-between min-h-[280px]">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider w-fit mb-4">
                      FAQ
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
                      Got questions?<br/>We've got answers.
                    </h2>
                  </div>
                  <p className="text-emerald-200/70 text-sm">
                    Everything you need to know about BillShield.
                  </p>
                </div>

                {/* FAQ Item 1 - Safety */}
                <div className="col-span-12 md:col-span-7 bg-white rounded-3xl p-8 border border-slate-200 flex flex-col justify-center hover:shadow-lg transition-all group">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Lock className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg mb-2">Is it safe to upload my bank statement?</h3>
                      <p className="text-slate-500 leading-relaxed">
                        Yes. Your statement is processed in real-time <span className="font-semibold text-slate-700">in your browser</span> and never saved to any server. Once you close the tab, everything is wiped instantly.
                      </p>
                    </div>
                  </div>
                </div>

                {/* FAQ Item 2 - Difference */}
                <div className="col-span-12 md:col-span-7 bg-emerald-50 rounded-3xl p-8 border border-emerald-100 flex flex-col justify-center hover:shadow-lg transition-all group">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg mb-2">How is this different from Paytm/CRED?</h3>
                      <p className="text-slate-600 leading-relaxed">
                        They show you expenses. We tell you <span className="font-semibold text-emerald-700">which ones to cancel and how</span>. Action beats information.
                      </p>
                    </div>
                  </div>
                </div>

                {/* FAQ Item 3 - Cost */}
                <div className="col-span-12 md:col-span-5 bg-[#0D2818] rounded-3xl p-8 flex flex-col justify-center hover:shadow-lg transition-all group">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <CreditCard className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg mb-2">How much does it cost?</h3>
                      <p className="text-emerald-200/80 leading-relaxed">
                        <span className="font-bold text-emerald-400">Free.</span> We believe everyone deserves financial clarity. No hidden fees, no premium tiers.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </motion.div>

          )}

          {/* 2. LOADING SCREEN */}
          {isAnalyzing && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-[500px]"
            >
              <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                
                {/* Header */}
                <div className="bg-[#0D2818] p-8 flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center relative">
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-500/30 border-t-emerald-400 animate-spin"></div>
                    <Shield className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h2 className="text-2xl font-black text-white">Analyzing Your Expenses</h2>
                </div>

                {/* Progress Body */}
                <div className="p-8 space-y-8">
                  
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold tracking-wider text-emerald-600 uppercase">
                      <span>Processing</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-emerald-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ type: "spring", stiffness: 50 }}
                      />
                    </div>
                  </div>

                  {/* Steps */}
                  <div className="space-y-6">
                    {LOADING_STEPS.map((step, index) => {
                      const isCompleted = loadingStep > index;
                      const isCurrent = loadingStep === index;
                      const isPending = loadingStep < index;

                      return (
                        <div key={index} className="flex gap-4">
                          <div className="flex-shrink-0 mt-0.5">
                            {isCompleted ? (
                              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" strokeWidth={3} />
                              </div>
                            ) : isCurrent ? (
                              <div className="w-6 h-6 rounded-full border-2 border-emerald-500 flex items-center justify-center">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full border-2 border-slate-200" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className={`text-sm font-semibold ${isPending ? 'text-slate-400' : 'text-slate-900'}`}>
                              {step.title}
                            </span>
                            {isCurrent && (
                              <motion.span 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="text-xs text-slate-500 mt-1"
                              >
                                {step.desc}
                              </motion.span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>

                {/* Footer */}
                <div className="bg-slate-50 p-4 flex items-start gap-3 border-t border-slate-100">
                  <Lock className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-700">Secure Analysis</p>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Your data is processed locally. Nothing is stored or transmitted.
                    </p>
                  </div>
                </div>

              </div>
              
              <p className="text-center text-slate-400 text-xs mt-6">
                This may take up to a minute depending on your transaction volume.
              </p>
            </motion.div>
          )}

          {/* 3. RESULTS SCREEN (BENTO GRID) */}
          {auditResult && !isAnalyzing && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full max-w-7xl mx-auto space-y-6 p-4"
            >
              {/* Summary Row */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Summary Cell */}
                <div className="col-span-12 lg:col-span-8 bg-white rounded-3xl p-8 md:p-10 border border-slate-200 flex flex-col justify-center gap-2">
                  <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                    You spend <span className="text-emerald-600">₹{auditResult.total_annual_spend.toLocaleString('en-IN')}</span> /year
                  </h2>
                  <p className="text-slate-500 text-lg">on {auditResult.subscriptions.length} subscriptions found in your statement.</p>
                  <div className="text-xs text-slate-400 mt-2">
                    Analysis generated {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>

                {/* Savings Cell */}
                <div className="col-span-12 lg:col-span-4 bg-emerald-500 rounded-3xl p-8 flex flex-col justify-center text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-20">
                    <TrendingDown className="w-24 h-24" />
                  </div>
                  <div className="relative z-10">
                    <div className="text-sm font-bold uppercase tracking-wider opacity-90 mb-1">Potential Savings</div>
                    <div className="text-4xl font-black">₹{auditResult.potential_savings.toLocaleString('en-IN')}</div>
                    <div className="text-sm font-medium opacity-80 mt-2">If you cancel unused items</div>
                  </div>
                </div>
              </div>

              {/* List Header */}
              <div className="flex items-center justify-between px-2">
                 <h3 className="text-xl font-black text-slate-900">Subscriptions Found</h3>
                 <button onClick={handleReset} className="text-sm font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-5 py-2.5 rounded-full transition-colors flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    Analyze New File
                 </button>
              </div>

              {/* List Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...auditResult.subscriptions].sort((a, b) => (b.unused_flag ? 1 : 0) - (a.unused_flag ? 1 : 0)).map((sub, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedSubscription(sub)}
                      className={`
                        group relative bg-white p-6 rounded-3xl border-2 transition-all cursor-pointer
                        hover:shadow-xl hover:-translate-y-1
                        ${sub.unused_flag ? 'border-orange-300 bg-orange-50/50' : 'border-slate-200 hover:border-emerald-300'}
                      `}
                    >
                      <div className="flex items-start justify-between mb-4">
                         <div className={`
                            w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black
                            ${sub.unused_flag ? 'bg-orange-500 text-white' : 'bg-emerald-500 text-white'}
                          `}>
                            {sub.merchant[0]}
                          </div>
                          <div className="text-right">
                            <div className="font-black text-slate-900 text-xl">₹{sub.monthly_cost}</div>
                            <div className="text-xs text-slate-500 font-medium">/month</div>
                          </div>
                      </div>
                      
                      <div>
                        <h4 className="font-bold text-slate-900 text-lg mb-2">{sub.merchant}</h4>
                        <div className="flex flex-wrap gap-2">
                            {sub.unused_flag && (
                                <span className="px-3 py-1 bg-orange-100 text-orange-700 text-[10px] font-bold uppercase tracking-wider rounded-full">
                                  Needs Review
                                </span>
                              )}
                             <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-full">
                                {sub.billing_cycle || 'Monthly'}
                             </span>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-slate-500">₹{sub.annual_cost?.toLocaleString('en-IN') || (sub.monthly_cost * 12).toLocaleString('en-IN')}/year</span>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* DETAILS DRAWER */}
      <AnimatePresence>
        {selectedSubscription && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSubscription(null)}
              className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-[480px] bg-white shadow-2xl flex flex-col"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-[#0D2818]">
                <h3 className="font-bold text-lg text-white">Action Required</h3>
                <button 
                  onClick={() => setSelectedSubscription(null)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Subscription Header */}
                <div className="flex items-start gap-5">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg ${selectedSubscription.unused_flag ? 'bg-orange-500 text-white' : 'bg-emerald-500 text-white'}`}>
                    {selectedSubscription.merchant[0]}
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black text-slate-900">{selectedSubscription.merchant}</h2>
                    <p className="text-sm text-slate-500">₹{selectedSubscription.monthly_cost}/month • ₹{selectedSubscription.annual_cost?.toLocaleString('en-IN')}/year</p>
                    {selectedSubscription.unused_flag && (
                      <div className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider rounded-full mt-2">
                        Potential Savings
                      </div>
                    )}
                  </div>
                </div>

                {/* Why We Flagged This */}
                {selectedSubscription.unused_flag && selectedSubscription.unused_reason && (
                  <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5">
                    <p className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-2">Why we flagged this</p>
                    <p className="text-sm text-orange-700 leading-relaxed">{selectedSubscription.unused_reason}</p>
                  </div>
                )}

                {/* Savings Box */}
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white flex-shrink-0">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-emerald-800">
                      Cancel now to save ₹{selectedSubscription.annual_cost?.toLocaleString('en-IN')}/year
                    </p>
                    <p className="text-sm text-emerald-600 mt-1">
                      That's ₹{selectedSubscription.monthly_cost?.toLocaleString('en-IN')} back in your pocket every month.
                    </p>
                  </div>
                </div>

                {/* Cancellation Steps */}
                <div className="space-y-4">
                  <h4 className="font-black text-slate-900">How to cancel</h4>
                  
                  <div className="space-y-4">
                    {selectedSubscription.cancellation_steps?.map((step, i) => (
                      <div key={i} className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {i + 1}
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Drawer Footer */}
              <div className="p-6 border-t border-slate-100 bg-slate-50 space-y-3">
                <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-14 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98]">
                  Open {selectedSubscription.merchant} Website
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button className="w-full text-sm font-medium text-slate-500 hover:text-slate-900 py-3">
                  I want to keep this subscription
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="w-full bg-[#0D2818] py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="font-black text-xl text-white">BillShield</span>
              </div>
              <p className="text-emerald-200/60 text-sm max-w-xs leading-relaxed">
                The subscription audit you run once a year. Find forgotten charges, cancel in 2 minutes.
              </p>
            </div>
            
            {/* Links */}
            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-emerald-200/60">
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How it works</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            
            {/* Legal */}
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-emerald-200/60">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-emerald-900/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-emerald-200/40">© 2025 BillShield. Built for the Hackathon.</p>
            <p className="text-sm text-emerald-200/40">Made with ❤️ in India</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default BillShield;

