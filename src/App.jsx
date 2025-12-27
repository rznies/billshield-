import React, { useState, useRef } from 'react';
import { Shield, CreditCard, Zap, Upload, FileText, AlertCircle, CheckCircle2, ChevronRight, X, Loader2, IndianRupee, TrendingDown, Calendar, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeSubscriptions, fileToBase64 } from './lib/gemini';

// Loading messages for progressive UX
const LOADING_MESSAGES = [
  "Scanning transactions...",
  "Detecting recurring charges...",
  "Calculating annual spend...",
  "Finding unused subscriptions...",
  "Generating cancellation guides..."
];

const BillShield = () => {
  // Input states
  const [statementText, setStatementText] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [inputMode, setInputMode] = useState('text'); // 'text' | 'pdf'

  // Analysis states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [auditResult, setAuditResult] = useState(null);
  const [error, setError] = useState(null);

  // Modal state
  const [selectedSubscription, setSelectedSubscription] = useState(null);

  const fileInputRef = useRef(null);

  // Handle PDF file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setInputMode('pdf');
      setError(null);
    } else if (file) {
      setError('Please upload a PDF file.');
    }
  };

  // Handle drag and drop
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setInputMode('pdf');
      setError(null);
    } else if (file) {
      setError('Please upload a PDF file.');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Main audit function
  const handleAudit = async () => {
    setError(null);
    setAuditResult(null);
    setIsAnalyzing(true);

    // Progressive loading messages
    let messageIndex = 0;
    setLoadingMessage(LOADING_MESSAGES[0]);
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % LOADING_MESSAGES.length;
      setLoadingMessage(LOADING_MESSAGES[messageIndex]);
    }, 2000);

    try {
      let result;

      if (inputMode === 'pdf' && pdfFile) {
        const base64 = await fileToBase64(pdfFile);
        result = await analyzeSubscriptions(base64, 'pdf');
      } else if (statementText.trim()) {
        result = await analyzeSubscriptions(statementText, 'text');
      } else {
        throw new Error('Please paste your statement text or upload a PDF.');
      }

      setAuditResult(result);
    } catch (err) {
      console.error('Audit error:', err);
      if (inputMode === 'pdf') {
        setError("We couldn't read this PDF. Please paste the statement text instead.");
        setInputMode('text');
        setPdfFile(null);
      } else {
        setError(err.message || 'Analysis failed. Please try again.');
      }
    } finally {
      clearInterval(messageInterval);
      setIsAnalyzing(false);
      setLoadingMessage('');
    }
  };

  // Reset to start over
  const handleReset = () => {
    setStatementText('');
    setPdfFile(null);
    setAuditResult(null);
    setError(null);
    setSelectedSubscription(null);
  };

  // Check if we can run audit
  const canAnalyze = (inputMode === 'pdf' && pdfFile) || (inputMode === 'text' && statementText.trim().length > 10);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-200 font-sans selection:bg-purple-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">BillShield</span>
          </div>
          <div className="text-sm text-slate-500">Powered by Google Gemini</div>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {!auditResult ? (
            // INPUT SCREEN
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Hero */}
              <div className="text-center space-y-4 mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-white">
                  Find Your <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Hidden Subscriptions</span>
                </h1>
                <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                  Paste your bank statement or upload a PDF. We'll show you what subscriptions you're paying for, what you can cancel, and how much you'll save.
                </p>
              </div>

              {/* Input Mode Toggle */}
              <div className="flex justify-center gap-2 p-1 bg-white/5 rounded-xl w-fit mx-auto">
                <button
                  onClick={() => setInputMode('text')}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${inputMode === 'text'
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-400 hover:text-white'
                    }`}
                >
                  <FileText className="w-4 h-4 inline mr-2" />
                  Paste Text
                </button>
                <button
                  onClick={() => setInputMode('pdf')}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${inputMode === 'pdf'
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-400 hover:text-white'
                    }`}
                >
                  <Upload className="w-4 h-4 inline mr-2" />
                  Upload PDF
                </button>
              </div>

              {/* Input Area */}
              {inputMode === 'text' ? (
                <div className="space-y-4">
                  <textarea
                    value={statementText}
                    onChange={(e) => setStatementText(e.target.value)}
                    placeholder="Paste your bank statement transactions here...

Example:
15 Dec 2024  NETFLIX.COM           ₹649.00
15 Dec 2024  SPOTIFY PREMIUM       ₹119.00
14 Dec 2024  AMAZON PRIME*1234     ₹1,499.00
10 Dec 2024  GOOGLE *YOUTUBE       ₹129.00
..."
                    className="w-full h-72 p-6 bg-white/5 border border-white/10 rounded-2xl text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 resize-none font-mono text-sm"
                  />
                  <p className="text-sm text-slate-500 text-center">
                    Copy transactions from your bank app, email statement, or exported PDF text.
                  </p>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className={`p-12 border-2 border-dashed rounded-3xl text-center cursor-pointer transition-all group ${pdfFile
                      ? 'border-purple-500/50 bg-purple-500/10'
                      : 'border-white/10 bg-white/5 hover:bg-white/[0.07] hover:border-white/20'
                    }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {pdfFile ? (
                    <div className="space-y-3">
                      <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-8 h-8 text-purple-400" />
                      </div>
                      <p className="text-lg font-medium text-white">{pdfFile.name}</p>
                      <p className="text-sm text-slate-500">Click to change file</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                        <CreditCard className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-lg font-medium">Drop your PDF statement here</p>
                      <p className="text-slate-500 text-sm">Or click to browse files</p>
                    </div>
                  )}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Analyze Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleAudit}
                  disabled={!canAnalyze || isAnalyzing}
                  className="px-12 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-2xl hover:shadow-xl hover:shadow-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {loadingMessage}
                    </>
                  ) : (
                    <>
                      Analyze Subscriptions
                      <Zap className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            // RESULTS SCREEN
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Back button */}
              <button
                onClick={handleReset}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                Analyze another statement
              </button>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                  <div className="flex items-center gap-3 text-slate-400 mb-2">
                    <IndianRupee className="w-5 h-5" />
                    <span className="text-sm font-medium">Total Annual Spend</span>
                  </div>
                  <div className="text-4xl font-bold text-white">
                    ₹{auditResult.total_annual_spend.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="p-6 bg-gradient-to-br from-emerald-900/20 to-emerald-800/10 border border-emerald-500/20 rounded-3xl">
                  <div className="flex items-center gap-3 text-emerald-400 mb-2">
                    <TrendingDown className="w-5 h-5" />
                    <span className="text-sm font-medium">Potential Savings</span>
                  </div>
                  <div className="text-4xl font-bold text-emerald-400">
                    ₹{auditResult.potential_savings.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Subscriptions List */}
              <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-white/5">
                  <h3 className="text-lg font-bold text-white">
                    Detected Subscriptions ({auditResult.subscriptions.length})
                  </h3>
                </div>
                <div className="divide-y divide-white/5">
                  {auditResult.subscriptions.map((sub, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => setSelectedSubscription(sub)}
                      className={`p-6 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all ${sub.unused_flag ? 'bg-amber-500/5' : ''
                        }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${sub.unused_flag
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-white/10 text-white'
                          }`}>
                          {sub.merchant[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{sub.merchant}</span>
                            {sub.unused_flag && (
                              <span className="px-2 py-0.5 text-xs font-bold bg-amber-500/20 text-amber-400 rounded-full">
                                Possibly Unused
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-slate-500 flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            {sub.billing_cycle}
                            {sub.unused_flag && sub.unused_reason && (
                              <span className="text-amber-400/80">• {sub.unused_reason}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-white">₹{sub.monthly_cost.toLocaleString('en-IN')}/mo</div>
                        <div className="text-sm text-slate-500">₹{sub.annual_cost.toLocaleString('en-IN')}/yr</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Gemini Attribution */}
              <div className="text-center text-sm text-slate-500">
                Analysis powered by <span className="text-purple-400">Google Gemini</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Cancellation Modal */}
      <AnimatePresence>
        {selectedSubscription && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setSelectedSubscription(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#12121a] border border-white/10 rounded-3xl p-8 max-w-lg w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl ${selectedSubscription.unused_flag
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-purple-500/20 text-purple-400'
                    }`}>
                    {selectedSubscription.merchant[0]}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedSubscription.merchant}</h3>
                    <p className="text-slate-400">₹{selectedSubscription.monthly_cost}/month</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSubscription(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {selectedSubscription.unused_flag && (
                <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 mb-6">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span className="text-sm">{selectedSubscription.unused_reason || 'This subscription may no longer be needed.'}</span>
                </div>
              )}

              <div className="space-y-4">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-purple-400" />
                  How to Cancel
                </h4>
                <ol className="space-y-3">
                  {selectedSubscription.cancellation_steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-slate-300">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="text-sm text-slate-500">
                  Cancelling this saves you <span className="text-emerald-400 font-bold">₹{selectedSubscription.annual_cost.toLocaleString('en-IN')}/year</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BillShield;
