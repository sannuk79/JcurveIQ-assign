// ============================================
// TASK LIST COMPONENT
// Groups parallel tasks and renders sequential ones
// ============================================

import { Task, RunStatus } from '../types';
import TaskCard from './TaskCard';

interface TaskListProps {
  tasks: Map<string, Task>;
  status: RunStatus;
}

export default function TaskList({ tasks }: TaskListProps) {
  // Convert Map to array
  const taskArray = Array.from(tasks.values());

  // Group tasks by parallel_group
  const groupedTasks = new Map<string | null, Task[]>();

  taskArray.forEach((task) => {
    const key = task.parallel_group;
    const existing = groupedTasks.get(key) || [];
    groupedTasks.set(key, [...existing, task]);
  });

  // Separate sequential (null group) from parallel groups
  const sequentialTasks = groupedTasks.get(null) || [];
  const parallelGroups = Array.from(groupedTasks.entries())
    .filter(([key]) => key !== null);

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
        Task Execution ({taskArray.length} tasks)
      </h2>

      <div className="space-y-4">
        {/* Sequential Tasks */}
        {sequentialTasks.map((task) => (
          <TaskCard key={task.task_id} task={task} isParallel={false} />
        ))}

        {/* Parallel Task Groups */}
        {parallelGroups.map(([groupId, groupTasks]) => (
          <div key={groupId} className="space-y-2">
            {/* Group Header with visual indicator of simultaneity */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
              <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-1.5 rounded-full border border-blue-300 shadow-sm">
                <span className="text-lg">⚡</span>
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">
                  Parallel Execution
                </span>
                <span className="text-xs font-mono text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                  {groupId}
                </span>
                <span className="text-xs text-blue-600">
                  ({groupTasks.length} tasks running simultaneously)
                </span>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
            </div>

            {/* Visual connector lines for parallel tasks */}
            <div className="relative">
              {/* Background connector */}
              <div className="absolute inset-0 flex items-start justify-center pointer-events-none">
                <div className="w-px h-8 bg-gradient-to-b from-blue-300 to-transparent"></div>
              </div>

              {/* Horizontal layout for parallel tasks */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-4">
                {groupTasks.map((task) => (
                  <div key={task.task_id} className="relative">
                    {/* Individual connector dot */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-400 rounded-full border-2 border-white shadow"></div>
                    <TaskCard task={task} isParallel={true} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
