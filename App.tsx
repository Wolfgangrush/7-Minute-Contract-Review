import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckSquare, 
  ChevronRight, 
  ChevronLeft, 
  Clock, 
  FileText, 
  AlertTriangle, 
  Copy, 
  Shield, 
  DollarSign, 
  BookOpen, 
  Gavel, 
  CheckCircle,
  Menu,
  X
} from 'lucide-react';
import { StepDefinition, FindingsMap } from './types';

const App: React.FC = () => {
  // -- State --
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [findings, setFindings] = useState<FindingsMap>({});
  const [reviewComplete, setReviewComplete] = useState<boolean>(false);
  const [contractName, setContractName] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // -- Data Definition --
  // Memoized to prevent re-creation on every render, though strictly static here.
  const steps: StepDefinition[] = useMemo(() => [
    {
      id: 1,
      title: "Control Clauses",
      duration: 60,
      icon: <Shield className="w-5 h-5" />,
      description: "Identify the 3 clauses that decide who wins. If these are vague or one-sided, nothing else matters.",
      checklist: [
        "Term: Is the duration clear?",
        "Termination: Can we get out? At what cost?",
        "Liability: Is it capped? Are we exposed?"
      ]
    },
    {
      id: 2,
      title: "Money, Obligations & Timelines",
      duration: 120, // Minutes 2-3
      icon: <DollarSign className="w-5 h-5" />,
      description: "90% of disputes come from these 5 things. Check payment and performance strictly.",
      checklist: [
        "Payment Amount: Is the math exact?",
        "Payment Schedule: When is it due?",
        "Penalties: Are there late fees or interest?",
        "Performance Obligations: What MUST be done?",
        "Deadlines: Are dates hard or soft?"
      ]
    },
    {
      id: 3,
      title: "Definitions",
      duration: 60,
      icon: <BookOpen className="w-5 h-5" />,
      description: "Undefined terms = loopholes. Over-defined terms = traps.",
      checklist: [
        "Check for 'Shall' vs 'May' misuse",
        "Scan for ambiguous words (e.g., 'reasonable')",
        "Find hidden obligations buried in definitions"
      ]
    },
    {
      id: 4,
      title: "Indemnity + Confidentiality",
      duration: 60,
      icon: <AlertTriangle className="w-5 h-5" />,
      description: "The most weaponized clauses. If unlimited, the client is at high risk.",
      checklist: [
        "Indemnity: Who indemnifies whom?",
        "Indemnity Scope: For what exactly?",
        "Confidentiality: Is the scope reasonable?"
      ]
    },
    {
      id: 5,
      title: "Dispute Resolution",
      duration: 60,
      icon: <Gavel className="w-5 h-5" />,
      description: "Avoid the wrong jurisdiction, wrong seat, or expensive arbitration.",
      checklist: [
        "Jurisdiction: Is it favorable/neutral?",
        "Seat: Is the physical location practical?",
        "Arbitration: Is it mandatory? Who pays?",
        "Delays: Are timeline mechanisms clear?"
      ]
    },
    {
      id: 6,
      title: "Final Sanity Check",
      duration: 60,
      icon: <CheckCircle className="w-5 h-5" />,
      description: "Quick scan for structural integrity and missing pieces.",
      checklist: [
        "Conflicting clauses",
        "Missing annexures/exhibits",
        "Internal inconsistencies",
        "Signature blocks correct"
      ]
    }
  ], []);

  // -- Effects --

  // Timer Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timeLeft]);

  // Update timer when step changes
  useEffect(() => {
    setTimeLeft(steps[activeStep].duration);
    setIsTimerRunning(false);
    setMobileMenuOpen(false); // Close mobile menu on step change
  }, [activeStep, steps]);

  // -- Handlers --

  const toggleTimer = useCallback(() => setIsTimerRunning((prev) => !prev), []);
  
  const resetTimer = useCallback(() => {
    setIsTimerRunning(false);
    setTimeLeft(steps[activeStep].duration);
  }, [activeStep, steps]);

  const handleNext = useCallback(() => {
    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
    } else {
      setReviewComplete(true);
    }
  }, [activeStep, steps.length]);

  const handleBack = useCallback(() => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
  }, [activeStep]);

  const updateFinding = (text: string) => {
    setFindings((prev) => ({
      ...prev,
      [activeStep]: {
        checked: prev[activeStep]?.checked || [],
        notes: text
      }
    }));
  };

  const toggleChecklist = (item: string) => {
    setFindings((prev) => {
      const currentList = prev[activeStep]?.checked || [];
      const newList = currentList.includes(item) 
        ? currentList.filter(i => i !== item)
        : [...currentList, item];
      
      return {
        ...prev,
        [activeStep]: {
          notes: prev[activeStep]?.notes || '',
          checked: newList
        }
      };
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const generateReport = () => {
    let report = `7-MINUTE CONTRACT REVIEW REPORT\n`;
    report += `Contract: ${contractName || 'Untitled'}\n`;
    report += `Date: ${new Date().toLocaleDateString()}\n\n`;
    
    steps.forEach((step, index) => {
      const stepData = findings[index];
      const hasIssues = (stepData?.checked?.length ?? 0) > 0 || (stepData?.notes && stepData.notes.trim() !== "");
      
      report += `[${index + 1}] ${step.title.toUpperCase()}\n`;
      if (hasIssues) {
        if (stepData?.checked?.length > 0) {
          report += `Flags Identified:\n`;
          stepData.checked.forEach(item => report += ` - [x] ${item}\n`);
        }
        if (stepData?.notes) {
          report += `Notes: ${stepData.notes}\n`;
        }
      } else {
        report += `Status: No specific issues flagged.\n`;
      }
      report += `\n-----------------------------------\n\n`;
    });
    
    return report;
  };

  const copyToClipboard = () => {
    const text = generateReport();
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
    alert("Report copied to clipboard!"); 
  };

  // -- Render: Complete View --
  if (reviewComplete) {
    return (
      <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans">
        <header className="bg-slate-900 text-white p-4 shadow-md flex justify-between items-center z-10">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6" /> Review Summary
          </h1>
          <button 
            onClick={() => setReviewComplete(false)}
            className="text-sm text-slate-300 hover:text-white font-medium"
          >
            Return to Review
          </button>
        </header>
        
        <main className="flex-1 p-4 md:p-8 overflow-auto w-full flex justify-center">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 md:p-8 max-w-4xl w-full h-fit">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Final Audit Report</h2>
              <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full mt-2 md:mt-0">
                {contractName || "Untitled Contract"}
              </span>
            </div>

            <div className="bg-slate-50 p-6 rounded-lg font-mono text-sm whitespace-pre-wrap mb-8 border border-slate-200 overflow-x-auto shadow-inner text-slate-700">
              {generateReport()}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={copyToClipboard}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md active:transform active:scale-95"
              >
                <Copy className="w-4 h-4" /> Copy to Clipboard
              </button>
              <button 
                onClick={() => {
                  if (window.confirm("Are you sure? This will clear all current review data.")) {
                    setReviewComplete(false);
                    setActiveStep(0);
                    setFindings({});
                    setContractName('');
                    setIsTimerRunning(false);
                  }
                }}
                className="flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Start New Review
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // -- Render: Active Review View --
  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Header */}
      <header className="bg-slate-900 text-white px-4 py-3 shadow-md flex-shrink-0 z-20">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-900/50">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none tracking-tight">7-Minute Reviewer</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">Aethel Legal Method</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <input 
                type="text" 
                placeholder="Contract Name / Reference"
                value={contractName}
                onChange={(e) => setContractName(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-64 placeholder-slate-500 transition-all"
              />
            </div>
            <div className={`px-4 py-1.5 rounded-full font-mono font-bold flex items-center gap-2 border ${timeLeft < 10 ? 'bg-red-900/20 border-red-500 text-red-400 animate-pulse' : 'bg-slate-800 border-slate-700 text-white'}`}>
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeLeft)}</span>
            </div>
            <button 
              className="md:hidden text-slate-300 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex overflow-hidden max-w-6xl mx-auto w-full relative">
        
        {/* Sidebar / Progress (Desktop) */}
        <aside className="w-64 bg-white border-r border-slate-200 overflow-y-auto hidden md:block flex-shrink-0 z-10">
          <div className="p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pl-2">Workflow Steps</h3>
            <div className="space-y-1">
              {steps.map((step, idx) => (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(idx)}
                  className={`w-full text-left p-3 rounded-lg flex items-center gap-3 text-sm transition-all duration-200 group ${
                    activeStep === idx 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm' 
                      : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className={`p-1.5 rounded-md transition-colors ${activeStep === idx ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
                     {step.icon}
                  </div>
                  <span className="font-medium truncate">{step.title}</span>
                  {findings[idx]?.checked?.length || findings[idx]?.notes ? (
                    <div className="ml-auto w-2 h-2 rounded-full bg-amber-400" title="Has findings" />
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="absolute inset-0 bg-white z-30 flex flex-col md:hidden">
            <div className="p-4 border-b border-slate-100">
               <input 
                type="text" 
                placeholder="Contract Name"
                value={contractName}
                onChange={(e) => setContractName(e.target.value)}
                className="w-full bg-slate-100 border-none rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="overflow-y-auto flex-1 p-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Jump to Step</h3>
               <div className="space-y-2">
              {steps.map((step, idx) => (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(idx)}
                  className={`w-full text-left p-4 rounded-lg flex items-center gap-3 text-sm border ${
                    activeStep === idx 
                      ? 'bg-blue-50 text-blue-700 border-blue-200' 
                      : 'bg-slate-50 text-slate-600 border-slate-100'
                  }`}
                >
                  <div className={`${activeStep === idx ? 'text-blue-600' : 'text-slate-400'}`}>
                     {step.icon}
                  </div>
                  <span className="font-medium">{step.title}</span>
                </button>
              ))}
            </div>
            </div>
          </div>
        )}

        {/* Active Step Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
          
          {/* Progress Bar (Mobile) */}
          <div className="h-1 bg-slate-200 w-full md:hidden flex-shrink-0">
            <div 
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
            <div className="max-w-3xl mx-auto pb-24"> {/* pb-24 for footer space */}
              
              {/* Step Header */}
              <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 text-slate-500 text-sm mb-3 font-medium">
                  <span className="bg-slate-200 px-2 py-0.5 rounded text-slate-700 text-xs uppercase tracking-wide">
                    Minute {activeStep === 1 ? '2-3' : (activeStep < 1 ? '1' : activeStep + 2)}
                  </span>
                  <span>Step {activeStep + 1} of {steps.length}</span>
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-3">{steps[activeStep].title}</h2>
                <p className="text-lg text-slate-600 leading-relaxed border-l-4 border-blue-200 pl-4">
                  {steps[activeStep].description}
                </p>
              </div>

              {/* Action Area */}
              <div className="grid lg:grid-cols-2 gap-6">
                
                {/* Checklist */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <CheckSquare className="w-5 h-5 text-blue-600" />
                    Review Checklist
                  </h3>
                  <div className="space-y-3 flex-1">
                    {steps[activeStep].checklist.map((item, i) => (
                      <label key={i} className="flex items-start gap-3 cursor-pointer group p-2 hover:bg-slate-50 rounded-lg transition-colors -mx-2">
                        <div className="relative flex items-center mt-0.5">
                          <input 
                            type="checkbox"
                            checked={findings[activeStep]?.checked?.includes(item) || false}
                            onChange={() => toggleChecklist(item)}
                            className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 shadow-sm transition-all hover:border-blue-400 checked:border-blue-600 checked:bg-blue-600 focus:ring-2 focus:ring-blue-200 focus:ring-offset-1"
                          />
                           <svg className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 w-3.5 h-3.5 text-white" viewBox="0 0 14 14" fill="none">
                            <path d="M3 8L6 11L11 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <span className={`text-sm leading-relaxed transition-colors ${findings[activeStep]?.checked?.includes(item) ? 'text-slate-900 font-medium' : 'text-slate-600 group-hover:text-slate-800'}`}>
                          {item}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    Red Flags / Notes
                  </h3>
                  <div className="flex-1 relative">
                    <textarea 
                      className="w-full h-full min-h-[200px] p-4 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-slate-50 placeholder-slate-400 leading-relaxed"
                      placeholder="Type specific issues, risky clauses, or missing definitions found in this section here..."
                      value={findings[activeStep]?.notes || ''}
                      onChange={(e) => updateFinding(e.target.value)}
                    ></textarea>
                    <div className="absolute bottom-3 right-3 pointer-events-none">
                      <FileText className="w-4 h-4 text-slate-300" />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Sticky Footer Controls */}
          <div className="bg-white border-t border-slate-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
            <div className="max-w-5xl mx-auto flex items-center justify-between">
              
              <div className="flex items-center gap-2 md:gap-4">
                 <button 
                  onClick={handleBack}
                  disabled={activeStep === 0}
                  className={`p-2 rounded-full hover:bg-slate-100 transition-colors ${activeStep === 0 ? 'opacity-30 cursor-not-allowed' : 'text-slate-600'}`}
                  aria-label="Previous Step"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                
                <div className="flex gap-2">
                  <button 
                    onClick={toggleTimer}
                    className={`flex items-center gap-2 px-3 md:px-5 py-2.5 rounded-lg font-medium transition-colors text-sm md:text-base ${isTimerRunning ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100' : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'}`}
                  >
                    {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span className="hidden sm:inline">{isTimerRunning ? 'Pause Timer' : 'Start Timer'}</span>
                    <span className="sm:hidden">{isTimerRunning ? 'Pause' : 'Start'}</span>
                  </button>
                   <button 
                    onClick={resetTimer}
                    className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                    title="Reset Step Timer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button 
                onClick={handleNext}
                className="bg-slate-900 hover:bg-slate-800 text-white px-5 md:px-8 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all hover:shadow-lg active:scale-95"
              >
                {activeStep === steps.length - 1 ? 'Finish Review' : 'Next Step'}
                <ChevronRight className="w-4 h-4" />
              </button>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;