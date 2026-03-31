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
      <div className="relative flex flex-col items-center w-full max-w-6xl">
        {taskGroups.map((group, idx) => (
          <div key={idx} className="w-full flex flex-col items-center">
            {/* Horizontal Branching for Parallel Groups */}
            {group.type === 'parallel' ? (
              <div className="w-full flex flex-col items-center">
                {/* Branch Line */}
                <div className="h-10 w-px bg-slate-700 mb-0"></div>
                <div className="relative w-full flex justify-center">
                   <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-px bg-slate-700"></div>
                   <div className="flex justify-center gap-8 pt-4 pb-12 overflow-x-auto w-full px-4">
                     {group.items.map(task => (
                       <div key={task.id} className="relative flex flex-col items-center min-w-[280px]">
                         <div className="absolute top-0 w-px h-4 bg-slate-700 -translate-y-4"></div>
                         <TaskItem task={task} />
                       </div>
                     ))}
                   </div>
                </div>
                {/* Re-merge Line */}
                <div className="relative w-full flex justify-center mb-10">
                   <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-px bg-slate-700"></div>
                   <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-10 bg-slate-700 translate-y-full"></div>
                </div>
              </div>
            ) : (
              /* Sequential Item */
              <div className="flex flex-col items-center mb-10">
                {idx > 0 && <div className="h-10 w-px bg-slate-700"></div>}
                <div className="max-w-xl w-full">
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
