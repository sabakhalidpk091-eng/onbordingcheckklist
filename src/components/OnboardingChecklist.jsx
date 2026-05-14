import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ChevronUp, ListChecks } from 'lucide-react';
import ProgressBar from './ProgressBar';
import StepItem from './StepItem';
import { cn } from '../lib/utils';

const OnboardingChecklist = ({ 
  steps = [], 
  onStepClick, 
  onLaunchGuide,
  title = "Account Setup",
  subtitle = "Complete these steps to unlock full features",
  layoutMode = "card", // card, sidebar
  theme = 'dark'
}) => {
  const [isOpen, setIsOpen] = useState(() => (
    typeof window === 'undefined' ? true : window.innerWidth >= 768
  ));
  
  // Update state if window is resized (optional, but good for testing)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const completedCount = steps.filter(
    (step) => step.status === 'Completed' || step.status === 'Skipped'
  ).length;
  const totalSteps = steps.length;
  const isFullyCompleted = completedCount === totalSteps;

  // Desktop Card View
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="md:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[35]"
          />
        )}
      </AnimatePresence>

      {/* Layout Wrapper with Perspective for 3D Effects */}
      <div className={cn(
        "z-40 transition-all duration-500 [perspective:1000px] w-full",
        layoutMode === "sidebar" 
          ? "md:fixed md:top-0 md:right-0 md:h-screen md:w-80 md:border-l md:border-slate-800 md:bg-slate-900/50 md:backdrop-blur-xl" 
          : "md:relative md:w-full md:max-w-md mx-auto",
        "fixed inset-x-0 bottom-0 md:relative md:inset-auto md:translate-y-0",
        !isOpen && "translate-y-full md:translate-y-0 opacity-0 md:opacity-100 pointer-events-none md:pointer-events-auto"
      )}>
        {/* Main Container with 3D Hover Tilt */}
        <motion.div
          layout
          whileHover={layoutMode !== "sidebar" ? { rotateX: 2, rotateY: -2 } : {}}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={cn(
            "overflow-hidden transition-all duration-500",
            theme === 'dark' 
              ? "bg-slate-900/95 backdrop-blur-3xl shadow-2xl border border-slate-700/50" 
              : "bg-white shadow-2xl border border-slate-100",
            layoutMode === "sidebar" ? "md:h-full md:rounded-none" : "md:rounded-2xl",
            "rounded-t-[2.5rem] md:rounded-t-2xl",
            isFullyCompleted && "border-emerald-500/30 ring-1 ring-emerald-500/10"
          )}
        >
          <div className="md:hidden flex justify-center pt-3 pb-1">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className={cn(
                "w-12 h-1.5 rounded-full transition-colors",
                theme === 'dark' ? "bg-slate-700/50 hover:bg-slate-600" : "bg-slate-200 hover:bg-slate-300"
              )} 
            />
          </div>

          <div className={cn(
            "p-6 border-b transition-colors",
            theme === 'dark' ? "border-slate-700/30" : "border-slate-100"
          )}>
            <div className="flex justify-between items-start gap-4 mb-5">
              <motion.div 
                animate={isFullyCompleted ? { scale: [1, 1.02, 1] } : {}} 
                transition={{ repeat: Infinity, duration: 3 }} 
                className="flex-1"
              >
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className={cn(
                    "p-2 rounded-xl transition-all duration-500 shadow-lg",
                    isFullyCompleted ? "bg-emerald-500/20 rotate-12" : "bg-blue-600/20 shadow-blue-500/10"
                  )}>
                    <Sparkles className={cn(
                      "w-4 h-4",
                      isFullyCompleted ? "text-emerald-400" : "text-blue-400"
                    )} />
                  </div>
                  <h3 className={cn(
                    "text-sm md:text-lg font-black tracking-tight leading-none uppercase italic transition-colors",
                    theme === 'dark' ? "text-white" : "text-slate-900"
                  )}>
                    {isFullyCompleted ? "Activation Pro" : title}
                  </h3>
                </div>
                <p className={cn(
                  "text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] leading-none transition-colors",
                  theme === 'dark' ? "text-slate-500" : "text-slate-400"
                )}>
                  {isFullyCompleted ? "Mastery Achieved" : subtitle}
                </p>
              </motion.div>
              
              <button 
                onClick={() => setIsOpen((prev) => !prev)}
                className={cn(
                  "flex p-2 rounded-xl transition-all border border-transparent",
                  theme === 'dark' ? "hover:bg-slate-800 text-slate-500 hover:text-white hover:border-slate-700" : "hover:bg-slate-100 text-slate-400 hover:text-slate-900 hover:border-slate-200"
                )}
              >
                {isOpen ? <X className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
            </div>

            <ProgressBar total={totalSteps} completed={completedCount} theme={theme} />
          </div>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className={cn(
                  "p-4 space-y-3 overflow-y-auto scrollbar-thin scrollbar-track-transparent pr-2",
                  theme === 'dark' ? "scrollbar-thumb-slate-700 hover:scrollbar-thumb-slate-600" : "scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300",
                  layoutMode === "sidebar" ? "md:h-[calc(100vh-280px)]" : "max-h-[60vh] md:max-h-[450px]"
                )}>
                  {steps.map((step, index) => (
                    <StepItem
                      key={step.id || index}
                      index={index}
                      {...step}
                      theme={theme}
                      onClick={() => onStepClick?.(step)}
                      onLaunchGuide={() => onLaunchGuide?.(step)}
                    />
                  ))}
                </div>

                {/* Footer Section */}
                <div className={cn(
                  "p-6 border-t transition-all duration-1000",
                  theme === 'dark' ? "border-slate-700/30" : "border-slate-100",
                  isFullyCompleted 
                    ? (theme === 'dark' ? "bg-emerald-900/10" : "bg-emerald-50") 
                    : (theme === 'dark' ? "bg-slate-800/30" : "bg-slate-50")
                )}>
                  {isFullyCompleted ? (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="space-y-4 text-center"
                    >
                      <div className="flex items-center justify-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em]">
                        <div className="h-px w-8 bg-emerald-500/30" />
                        Mastery Achieved
                        <div className="h-px w-8 bg-emerald-500/30" />
                      </div>
                      <button className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-[0_15px_30px_rgba(16,185,129,0.2)] active:scale-95">
                        Claim Your Final Reward
                      </button>
                    </motion.div>
                  ) : (
                    <div className="flex justify-between items-center px-2">
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-[0.2em]",
                        theme === 'dark' ? "text-slate-500" : "text-slate-400"
                      )}>
                        Checklist Progress
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                        <span className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em]">
                          {Math.round((completedCount/totalSteps)*100)}% Synchronized
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {!isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={() => setIsOpen(true)}
          className="md:hidden fixed bottom-8 right-6 w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl shadow-[0_10px_40px_rgba(37,99,235,0.4)] flex items-center justify-center border border-blue-400/30 z-[60] active:scale-90 transition-transform"
        >
          <ListChecks className="w-7 h-7" />
          <div className="absolute -top-2 -right-2 w-7 h-7 bg-emerald-500 rounded-full border-2 border-white text-white text-[10px] flex items-center justify-center font-black shadow-md">
            {totalSteps - completedCount}
          </div>
        </motion.button>
      )}
    </>
  );
};

export default OnboardingChecklist;
