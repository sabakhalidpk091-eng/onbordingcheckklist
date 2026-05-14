import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

const ProgressBar = ({ total, completed, theme = 'dark' }) => {
  const percentage = (completed / total) * 100;

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center text-sm font-medium transition-colors">
        <span className={cn(
          theme === 'dark' ? "text-slate-400" : "text-slate-500"
        )}>Progress</span>
        <span className={cn(
          "px-2 py-0.5 rounded-full text-xs border transition-all",
          theme === 'dark' ? "text-white bg-blue-600/20 border-blue-500/30" : "text-blue-600 bg-blue-50 border-blue-100"
        )}>
          {completed} of {total} steps
        </span>
      </div>
      <div className={cn(
        "h-3 w-full rounded-full overflow-hidden border transition-all relative",
        theme === 'dark' ? "bg-slate-800/50 border-slate-700/30" : "bg-slate-100 border-slate-200"
      )}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "circOut" }}
          className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.3)] relative"
        >
          {/* Animated Shine Effect */}
          <motion.div 
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-1/2"
          />
        </motion.div>
      </div>
    </div>
  );
};

export default ProgressBar;
