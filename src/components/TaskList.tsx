import { useMemo } from 'react';
import { TaskState } from '../types';
import { TaskItem } from './TaskItem';

export function TaskList({ tasks, globalThoughts }: { tasks: Map<string, TaskState>; globalThoughts: { thought: string; timestamp: number }[] }) {
  const taskGroups = useMemo(() => {
    const arrayTasks = Array.from(tasks.values());
    const groups: { type: 'sequential' | 'parallel'; items: TaskState[]; groupId?: string }[] = [];
    
    let currentParallelGroup: string | null = null;
    let currentGroupItems: TaskState[] = [];

    arrayTasks.forEach(task => {
      if (task.parallelGroup) {
        if (task.parallelGroup === currentParallelGroup) {
          currentGroupItems.push(task);
        } else {
          if (currentGroupItems.length > 0) {
            groups.push({ type: currentParallelGroup ? 'parallel' : 'sequential', items: currentGroupItems, groupId: currentParallelGroup || undefined });
          }
          currentParallelGroup = task.parallelGroup;
          currentGroupItems = [task];
        }
      } else {
        if (currentGroupItems.length > 0) {
          groups.push({ type: currentParallelGroup ? 'parallel' : 'sequential', items: currentGroupItems, groupId: currentParallelGroup || undefined });
        }
        groups.push({ type: 'sequential', items: [task] });
        currentParallelGroup = null;
        currentGroupItems = [];
      }
    });

    if (currentGroupItems.length > 0) {
      groups.push({ type: currentParallelGroup ? 'parallel' : 'sequential', items: currentGroupItems, groupId: currentParallelGroup || undefined });
    }

    return groups;
  }, [tasks]);

  return (
    <div className="flex flex-col items-center py-12 px-6 min-h-screen">
      {/* Global Coordinator Thoughts as Floating Note */}
      {globalThoughts.length > 0 && (
        <div className="w-full max-w-2xl mb-12 bg-slate-900/80 border border-indigo-500/20 rounded-xl p-4 shadow-xl backdrop-blur-sm">
          <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
            Orchestration Log
          </h3>
          <div className="space-y-2">
            {globalThoughts.map((t, idx) => (
              <p key={idx} className="text-sm italic text-slate-400 border-l border-slate-700 pl-3 py-1">
                {t.thought}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* The Tree Structure */}
      <div className="relative flex flex-col items-center w-full">
        {taskGroups.map((group, idx) => (
          <div key={idx} className="w-full flex flex-col items-center">
            {/* Horizontal Branching for Parallel Groups */}
            {group.type === 'parallel' ? (
              <div className="w-full flex flex-col items-center my-12">
                {/* Branch Header */}
                <div className="flex flex-col items-center mb-0">
                  <div className="h-12 w-px bg-slate-700"></div>
                  <div className="px-3 py-1 bg-slate-900 border border-slate-700 rounded-full mb-4 shadow-lg shadow-blue-500/5">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400/80">Concurrent Execution</span>
                  </div>
                </div>

                <div className="relative w-full p-8 bg-slate-900/20 border border-dashed border-slate-800 rounded-[3rem] backdrop-blur-[2px]">
                   <div className="flex justify-center gap-10 flex-wrap lg:flex-nowrap">
                     {group.items.map(task => (
                       <div key={task.id} className="relative flex flex-col items-center min-w-[320px] max-w-sm">
                         <TaskItem task={task} />
                       </div>
                     ))}
                   </div>
                </div>
                
                {/* Re-merge Footer */}
                <div className="h-12 w-px bg-slate-700"></div>
              </div>
            ) : (
              /* Sequential Item */
              <div className="flex flex-col items-center w-full">
                {idx > 0 && <div className="h-12 w-px bg-slate-700"></div>}
                <div className="max-w-2xl w-full">
                  <TaskItem task={group.items[0]} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
