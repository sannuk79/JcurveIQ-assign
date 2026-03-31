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
            {/* Group Header */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                ⚡ Parallel Group: {groupId} ({groupTasks.length} tasks)
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
            </div>

            {/* Horizontal layout for parallel tasks */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {groupTasks.map((task) => (
                <TaskCard key={task.task_id} task={task} isParallel={true} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
