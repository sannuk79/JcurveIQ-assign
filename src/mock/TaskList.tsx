import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Brain } from 'lucide-react';
import { Task, RunStatus } from '../types';
import TaskCard from './TaskCard';

interface TaskListProps {
  tasks: Map<string, Task>;
  status: RunStatus;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      type: 'spring' as const,
      stiffness: 100,
      damping: 15
    }
  },
};

export default function TaskList({ tasks }: TaskListProps) {
  const taskArray = Array.from(tasks.values());

  // Separate synthesis tasks
  const synthesisTasks = taskArray.filter((task) =>
    task.agent === 'synthesizer' || task.label.toLowerCase().includes('synthes')
  );

  const nonSynthesisTasks = taskArray.filter((task) =>
    task.agent !== 'synthesizer' && !task.label.toLowerCase().includes('synthes')
  );

  // Group by parallel_group
  const groupedTasks = new Map<string | null, Task[]>();
  nonSynthesisTasks.forEach((task) => {
    const key = task.parallel_group;
    const existing = groupedTasks.get(key) || [];
    groupedTasks.set(key, [...existing, task]);
  });

  const sequentialTasks = groupedTasks.get(null) || [];
  const parallelGroups = Array.from(groupedTasks.entries())
    .filter(([key]) => key !== null);

  return (
    <div className="space-y-8 relative">
      {/* Vertical trunk line (Visual only) */}
      <div className="absolute left-[27px] top-4 bottom-4 w-px bg-gradient-to-b from-white/10 via-white/5 to-transparent pointer-events-none" />

      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {/* Sequential Tasks */}
          {sequentialTasks.length > 0 && (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {sequentialTasks.map((task) => (
                <motion.div 
                  key={task.task_id} 
                  variants={itemVariants}
                  layout
                  className="relative pl-12"
                >
                  {/* Connector dot */}
                  <div className="absolute left-[25px] top-6 w-1.5 h-1.5 rounded-full bg-slate-700 border border-black z-10" />
                  <TaskCard task={task} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Parallel Task Groups */}
          {parallelGroups.map(([groupId, groupTasks]) => (
            <motion.div 
              key={groupId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              layout
              className="space-y-4 relative pl-12"
            >
              {/* Trunk connector to group */}
              <div className="absolute left-[25px] top-0 bottom-0 w-px bg-white/10" />
              
              {/* Group Header */}
              <div className="flex items-center gap-3 relative">
                 <div className="absolute -left-[23px] w-5 h-px bg-white/10" />
                 <div className="flex items-center gap-2 bg-white/[0.03] border border-white/5 py-1 px-3 rounded-full">
                    <Zap size={10} className="text-cyan-400 fill-cyan-400/20" />
                    <span className="text-[10px] font-bold text-cyan-400/80 tracking-widest uppercase italic">
                      Parallel Batch
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">
                      {groupId}
                    </span>
                 </div>
              </div>

              {/* Horizontal layout for parallel tasks */}
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2"
              >
                {groupTasks.map((task) => (
                  <motion.div key={task.task_id} variants={itemVariants} layout className="h-full">
                    <TaskCard task={task} />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          ))}

          {/* Synthesis Tasks */}
          {synthesisTasks.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              layout
              className="space-y-6 pt-4"
            >
              <div className="flex items-center gap-4 pl-12">
                <div className="h-px flex-1 bg-gradient-to-r from-purple-500/30 to-transparent" />
                <div className="flex items-center gap-2 text-purple-400">
                  <Brain size={14} />
                  <span className="text-[10px] font-bold tracking-widest uppercase">Process Synthesis</span>
                </div>
                <div className="h-px flex-1 bg-gradient-to-l from-purple-500/30 to-transparent" />
              </div>
              
              <div className="space-y-4">
                {synthesisTasks.map((task) => (
                  <div key={task.task_id} className="pl-12">
                     <TaskCard task={task} />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
