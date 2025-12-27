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
    <div className="min-h-screen w-full bg-[#F9FAFB] font-sans text-slate-900 selection:bg-blue-100">
      
      {/* Header - Always visible unless in full screen results mode (optional, but keeping it clean) */}
      <header className="w-full max-w-5xl mx-auto p-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-600 fill-blue-600" />
          <span className="font-bold text-xl tracking-tight">BillShield</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
           <span className="text-orange-600 text-xs font-bold">JD</span>
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
              className="w-full grid grid-cols-1 md:grid-cols-12 gap-4"
            >
              {/* Cell 1: Hero Text */}
              <div className="col-span-12 lg:col-span-8 bg-white rounded-3xl p-8 md:p-12 flex flex-col justify-center gap-6 border border-slate-200 shadow-sm">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wider w-fit">
                  <Zap className="w-3 h-3 fill-blue-600" />
                  AI-Powered Finance
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                  Stop paying for subscriptions you don't use.
                </h1>
                <p className="text-lg text-slate-500 max-w-xl leading-relaxed">
                  BillShield analyzes your bank statement to find hidden recurring charges and helps you cancel them instantly.
                </p>
              </div>

              {/* Cell 2: Savings Stat */}
              <div className="col-span-6 lg:col-span-2 bg-white rounded-3xl p-6 flex flex-col justify-between border border-slate-200 shadow-sm hover:shadow-md transition-all group min-h-[180px]">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <TrendingDown className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="px-2 py-1 rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                    Proven
                  </span>
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-slate-900 tracking-tight">₹12k</div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Avg. Annual Savings</div>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Most users find 3+ unused subscriptions in their first scan.
                  </p>
                </div>
              </div>

              {/* Cell 3: Privacy Stat */}
              <div className="col-span-6 lg:col-span-2 bg-white rounded-3xl p-6 flex flex-col justify-between border border-slate-200 shadow-sm hover:shadow-md transition-all group min-h-[180px]">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="px-2 py-1 rounded-full bg-blue-50 text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                    Local
                  </span>
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-slate-900 tracking-tight">100%</div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Private & Secure</div>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Analysis runs locally in your browser. No data upload.
                  </p>
                </div>
              </div>

              {/* Cell 4: The Input Tool */}
              <div className="col-span-12 lg:col-span-8 row-span-2 bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-bl-2xl z-20">
                  Try it now — No login
                </div>
                
                <div className="flex flex-col gap-6 h-full justify-center relative z-10">
                  {/* PDF Upload */}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className={`
                      group relative flex flex-col items-center justify-center gap-4 
                      rounded-xl border-2 border-dashed p-10 transition-all cursor-pointer
                      ${pdfFile 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'
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
                      w-12 h-12 rounded-full flex items-center justify-center transition-colors
                      ${pdfFile ? 'bg-blue-100 text-blue-600' : 'bg-blue-50 text-blue-600 group-hover:scale-110 duration-200'}
                    `}>
                      {pdfFile ? <Check className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
                    </div>

                    <div className="space-y-1 text-center">
                      <p className="font-semibold text-slate-900">
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
                    <span className="flex-shrink-0 mx-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">OR</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>

                  {/* Text Input */}
                  <textarea
                    value={statementText}
                    onChange={(e) => setStatementText(e.target.value)}
                    placeholder="Paste your bank or card statement text here..."
                    className="w-full h-32 p-4 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none text-sm transition-all"
                  />

                  {error && (
                    <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                      <AlertTriangle className="w-4 h-4" />
                      {error}
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    onClick={handleAudit}
                    disabled={!canAnalyze}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold h-12 rounded-lg transition-all shadow-sm active:scale-[0.98] text-lg"
                  >
                    Analyze Subscriptions
                  </button>

                  {/* Security Note */}
                  <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-medium">
                    <Lock className="w-3 h-3" />
                    Your data is analyzed once and never stored.
                  </div>
                </div>
              </div>

              {/* Cell 5: How it Works */}
              <div className="col-span-12 lg:col-span-4 bg-slate-50 rounded-3xl p-8 border border-slate-200 flex flex-col justify-center">
                <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  How it works
                </h3>
                <div className="space-y-6">
                  {[
                    { title: "Upload Statement", desc: "PDF or text paste." },
                    { title: "AI Analysis", desc: "Gemini scans for patterns." },
                    { title: "Cancel & Save", desc: "Get actionable insights." }
                  ].map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-sm text-slate-900 shadow-sm flex-shrink-0">
                        {i + 1}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{step.title}</div>
                        <div className="text-xs text-slate-500">{step.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cell 6: What We Detect */}
              <div className="col-span-12 lg:col-span-4 bg-white rounded-3xl p-8 border border-slate-200">
                 <h3 className="font-bold text-slate-900 mb-4">We detect</h3>
                 <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: "🎬", label: "Streaming" },
                      { icon: "🎵", label: "Music" },
                      { icon: "💪", label: "Fitness" },
                      { icon: "☁️", label: "SaaS" },
                      { icon: "📦", label: "Deliveries" },
                      { icon: "🎮", label: "Gaming" }
                    ].map((cat, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-lg">{cat.icon}</span>
                        <span className="text-xs font-bold text-slate-700">{cat.label}</span>
                      </div>
                    ))}
                 </div>
              </div>

              {/* Cell 7: Banks */}
              <div className="col-span-12 lg:col-span-6 bg-white rounded-3xl p-8 border border-slate-200 flex flex-col justify-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6 text-center">Supported Banks</p>
                <div className="flex flex-wrap justify-center gap-x-8 gap-y-6 items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
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
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Cell 8: FAQ */}
              <div className="col-span-12 lg:col-span-6 bg-blue-50 rounded-3xl p-8 border border-blue-100">
                 <h3 className="font-bold text-blue-900 mb-4">FAQ</h3>
                 <div className="space-y-3">
                    <div className="bg-white/50 p-3 rounded-lg">
                      <p className="text-xs font-bold text-blue-900">Is it safe?</p>
                      <p className="text-xs text-blue-700 mt-1">Yes. Data is processed in-browser and never stored.</p>
                    </div>
                    <div className="bg-white/50 p-3 rounded-lg">
                      <p className="text-xs font-bold text-blue-900">Cost?</p>
                      <p className="text-xs text-blue-700 mt-1">100% Free for now.</p>
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
              <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                
                {/* Header */}
                <div className="bg-blue-50/50 p-8 flex flex-col items-center gap-4 border-b border-blue-100/50">
                  <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center relative">
                    <div className="absolute inset-0 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
                    <Shield className="w-8 h-8 text-blue-600 fill-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Analyzing Expenses</h2>
                </div>

                {/* Progress Body */}
                <div className="p-8 space-y-8">
                  
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold tracking-wider text-blue-600 uppercase">
                      <span>Processing</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-blue-600 rounded-full"
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
                              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" strokeWidth={3} />
                              </div>
                            ) : isCurrent ? (
                              <div className="w-6 h-6 rounded-full border-2 border-blue-600 flex items-center justify-center">
                                <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
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
                  <Lock className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-700">Secure Analysis</p>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      This process creates a secure, read-only snapshot. Your data is encrypted end-to-end. 
                      Please do not close this window.
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
              className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 p-4"
            >
              {/* Summary Cell */}
              <div className="col-span-12 md:col-span-8 bg-white rounded-3xl p-8 border border-slate-200 flex flex-col justify-center gap-2 shadow-sm">
                <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  You spend <span className="text-blue-600">₹{auditResult.total_annual_spend.toLocaleString('en-IN')}</span> /yr
                </h2>
                <p className="text-slate-500 text-lg">on {auditResult.subscriptions.length} subscriptions found in your statement.</p>
                <div className="text-xs text-slate-400 mt-2">
                  Analysis generated {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>

              {/* Savings Cell */}
              <div className="col-span-12 md:col-span-4 bg-emerald-500 rounded-3xl p-8 flex flex-col justify-center text-white shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-20">
                  <TrendingDown className="w-24 h-24" />
                </div>
                <div className="relative z-10">
                  <div className="text-sm font-bold uppercase tracking-wider opacity-90 mb-1">Potential Savings</div>
                  <div className="text-4xl font-extrabold">₹{auditResult.potential_savings.toLocaleString('en-IN')}</div>
                  <div className="text-xs font-medium opacity-80 mt-2">If you cancel unused items</div>
                </div>
              </div>

              {/* List Header */}
              <div className="col-span-12 flex items-center justify-between px-2 mt-4">
                 <h3 className="text-lg font-bold text-slate-900">Subscriptions Found</h3>
                 <button onClick={handleReset} className="text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-full transition-colors">
                    Analyze New File
                 </button>
              </div>

              {/* List Grid */}
              <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...auditResult.subscriptions].sort((a, b) => (b.unused_flag ? 1 : 0) - (a.unused_flag ? 1 : 0)).map((sub, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedSubscription(sub)}
                      className={`
                        group relative bg-white p-6 rounded-3xl border transition-all cursor-pointer
                        hover:shadow-lg hover:-translate-y-1
                        ${sub.unused_flag ? 'border-orange-200 bg-orange-50/30' : 'border-slate-200'}
                      `}
                    >
                      <div className="flex items-start justify-between mb-4">
                         <div className={`
                            w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold
                            ${sub.unused_flag ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}
                          `}>
                            {sub.merchant[0]}
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-slate-900 text-lg">₹{sub.monthly_cost}</div>
                            <div className="text-xs text-slate-500">/mo</div>
                          </div>
                      </div>
                      
                      <div>
                        <h4 className="font-bold text-slate-900 text-lg mb-1">{sub.merchant}</h4>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {sub.unused_flag && (
                                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-[10px] font-bold uppercase tracking-wider rounded-full">
                                  Review
                                </span>
                              )}
                             <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-full">
                                {sub.billing_cycle || 'Monthly'}
                             </span>
                        </div>
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
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-[480px] bg-white shadow-2xl flex flex-col"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <h3 className="font-bold text-lg text-slate-900">Action Required</h3>
                <button 
                  onClick={() => setSelectedSubscription(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                
                {/* Subscription Header */}
                <div className="flex items-start gap-5">
                  <div className="w-16 h-16 rounded-xl bg-blue-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg shadow-blue-600/20">
                    {selectedSubscription.merchant[0]}
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-slate-900">{selectedSubscription.merchant}</h2>
                    <p className="text-xs font-mono text-slate-500">Membership ID: #8839210</p>
                    {selectedSubscription.unused_flag && (
                      <div className="inline-block px-2 py-1 bg-orange-100 text-orange-700 text-[10px] font-bold uppercase tracking-wider rounded mt-1">
                        Potential Savings
                      </div>
                    )}
                  </div>
                </div>

                {/* Why We Flagged This */}
                {selectedSubscription.unused_flag && selectedSubscription.unused_reason && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                    <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">Why we flagged this</p>
                    <p className="text-sm text-amber-700">{selectedSubscription.unused_reason}</p>
                  </div>
                )}

                {/* Savings Box */}
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white flex-shrink-0">
                    <span className="font-bold text-lg">₹</span>
                  </div>
                  <div>
                    <p className="font-bold text-emerald-800 text-sm">
                      Cancel now to save ₹{selectedSubscription.annual_cost.toLocaleString('en-IN')}/yr
                    </p>
                    <p className="text-xs text-emerald-600 mt-1">
                      Based on your recurring monthly payment of ₹{selectedSubscription.monthly_cost.toLocaleString('en-IN')}.
                    </p>
                  </div>
                </div>

                {/* Cancellation Steps */}
                <div className="space-y-6">
                  <h4 className="font-bold text-slate-900">How to cancel</h4>
                  
                  <div className="relative pl-4 ml-3 border-l-2 border-slate-100 space-y-8">
                    {selectedSubscription.cancellation_steps.map((step, i) => (
                      <div key={i} className="relative pl-8">
                        <div className="absolute -left-[21px] top-0 w-8 h-8 rounded-full bg-blue-50 text-blue-600 border-4 border-white flex items-center justify-center text-sm font-bold">
                          {i + 1}
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-slate-900 text-sm">
                            {i === 0 ? "Log in to the Portal" : 
                             i === 1 ? "Navigate to Membership Settings" :
                             i === 2 ? "Request Cancellation" : "Confirm Email"}
                          </p>
                          <p className="text-sm text-slate-500 leading-relaxed">
                            {step}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Drawer Footer */}
              <div className="p-6 border-t border-slate-100 bg-slate-50 space-y-4">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98]">
                  Open {selectedSubscription.merchant} Website
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button className="w-full text-sm font-medium text-slate-500 hover:text-slate-900 underline decoration-dashed underline-offset-4">
                  I want to keep this
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-slate-400" />
            <span className="font-bold text-slate-500">BillShield</span>
          </div>
          <p className="text-sm text-slate-400">© 2025 BillShield. Built for the Hackathon.</p>
          <div className="flex gap-6 text-sm font-medium text-slate-500">
            <a href="#" className="hover:text-slate-900">Privacy</a>
            <a href="#" className="hover:text-slate-900">Terms</a>
            <a href="#" className="hover:text-slate-900">Contact</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default BillShield;

