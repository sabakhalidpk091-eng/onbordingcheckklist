import { Check, ChevronRight, Lock, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

const StepItem = ({
  title,
  description,
  status = 'Pending',
  onClick,
  onLaunchGuide,
  index,
  theme = 'dark'
}) => {
  const isLocked = status === 'Locked';
  const isCompleted = status === 'Completed';
  const isActive = status === 'Active';
  const isSkipped = status === 'Skipped';
  const isOptional = status === 'Optional';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={!isLocked ? { scale: 1.01, x: 4 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 25, delay: index * 0.05 }}
      onClick={!isLocked ? onClick : undefined}
      className={cn(
        'group relative flex items-start gap-4 rounded-[1.5rem] border p-5 transition-all duration-500',
        isActive ? (theme === 'dark' ? 'border-blue-500/50 bg-blue-600/10 shadow-[0_0_30px_rgba(37,99,235,0.15)] ring-1 ring-blue-500/20' : 'border-blue-500/30 bg-blue-50 shadow-lg shadow-blue-500/10') :
        isCompleted ? (theme === 'dark' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-emerald-100 bg-emerald-50') :
        isLocked ? (theme === 'dark' ? 'pointer-events-none border-slate-800/50 bg-slate-900/40 opacity-40 grayscale' : 'pointer-events-none border-slate-100 bg-slate-50 opacity-40 grayscale') :
        (theme === 'dark' ? 'border-slate-800/80 bg-slate-900/60 hover:border-slate-700' : 'border-slate-100 bg-white shadow-sm hover:border-slate-200'),
        !isLocked && 'cursor-pointer active:scale-[0.99] hover:shadow-xl',
      )}
    >
      <div className={cn(
        'absolute right-4 top-3 rounded-full border px-2.5 py-0.5 text-[8px] font-black uppercase tracking-[0.2em] transition-all',
        isActive ? 'border-blue-400 bg-blue-500 text-white shadow-lg shadow-blue-500/20' :
        isCompleted ? (theme === 'dark' ? 'border-emerald-500/30 bg-emerald-500/20 text-emerald-400' : 'border-emerald-200 bg-emerald-100 text-emerald-600') :
        isLocked ? (theme === 'dark' ? 'border-slate-700 bg-slate-800 text-slate-500' : 'border-slate-200 bg-slate-100 text-slate-400') :
        (theme === 'dark' ? 'border-slate-800 bg-slate-800/50 text-slate-500' : 'border-slate-100 bg-slate-50 text-slate-400')
      )}>
        {status}
      </div>

      <div className={cn(
        'relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border-2 transition-all duration-500',
        isActive ? 'rotate-3 border-blue-400 bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.5)]' :
        isCompleted ? 'border-emerald-400 bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' :
        isLocked ? (theme === 'dark' ? 'border-slate-700 bg-slate-800 text-slate-600' : 'border-slate-200 bg-slate-100 text-slate-300') :
        (theme === 'dark' ? 'border-slate-700/50 bg-slate-800/80 text-slate-400' : 'border-slate-100 bg-white text-slate-300')
      )}>
        {isActive ? (
          <Play className="h-5 w-5 animate-pulse fill-white text-white" />
        ) : isCompleted ? (
          <Check className="h-6 w-6 stroke-[3px] text-white" />
        ) : isLocked ? (
          <Lock className="h-5 w-5 text-slate-500" />
        ) : (
          <div className="h-2 w-2 rounded-full bg-slate-600" />
        )}
      </div>

      <div className="relative z-10 min-w-0 flex-1 py-0.5 pr-16">
        <div className="flex flex-col gap-1">
          <h4 className={cn(
            'text-[15px] font-black leading-tight tracking-tight transition-colors',
            isCompleted ? 'text-slate-400' : (theme === 'dark' ? 'text-white' : 'text-slate-900'),
            isActive && (theme === 'dark' ? 'text-blue-400' : 'text-blue-600')
          )}>
            {title}
          </h4>

          <div className="flex items-center gap-2">
            {isOptional && (
              <span className="text-[7px] font-black uppercase tracking-widest text-blue-300">
                Optional Task
              </span>
            )}
            {isSkipped && (
              <span className="text-[7px] font-black uppercase tracking-widest text-amber-500">
                Skipped
              </span>
            )}
            {isCompleted && (
              <span className={cn(
                'text-[7px] font-black uppercase tracking-widest',
                theme === 'dark' ? 'text-emerald-300' : 'text-emerald-500'
              )}>
                Task Finished
              </span>
            )}
          </div>
        </div>

        <p className={cn(
          'mt-2 text-[11px] font-bold leading-relaxed transition-colors',
          isCompleted ? (theme === 'dark' ? 'text-slate-500' : 'text-slate-400') :
          isActive ? (theme === 'dark' ? 'text-slate-200' : 'text-slate-600') :
          (theme === 'dark' ? 'text-slate-300' : 'text-slate-500')
        )}>
          {description}
        </p>

        {isActive && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => {
              e.stopPropagation();
              onLaunchGuide?.();
            }}
            className="mt-4 flex w-full items-center justify-between rounded-xl bg-blue-600 px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-blue-900/40 transition-all hover:bg-blue-500 active:scale-95"
          >
            Start Implementation
            <ChevronRight className="h-3 w-3" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default StepItem;
