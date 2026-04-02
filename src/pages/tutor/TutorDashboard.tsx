import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTutorBatches } from '../../api';
import { Link } from 'react-router';
import { Users, BookOpen } from 'lucide-react';

export const TutorDashboard: React.FC = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['tutor-batches'],
    queryFn: getTutorBatches,
  });

  const batches = data?.batches || [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      {/* Header Options */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#242830] pb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-[#f0f2f5]">Your Batches</h1>
          <p className="mt-1 text-slate-500 dark:text-[#8b95a2]">View your assigned batches and manage assignments.</p>
        </div>
      </div>

      {/* Batches Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 opacity-50">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-40 rounded-xl bg-slate-100 dark:bg-[#13151a] border border-slate-200 dark:border-[#242830] animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-800 dark:border-[#7f1d1d] dark:bg-[#2d0f0f] dark:text-[#fecaca] text-sm font-medium">
          Failed to load batches. {(error as Error).message}
        </div>
      ) : batches.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 dark:border-[#242830] bg-slate-50 dark:bg-[#1a1d24] p-16 text-center flex flex-col items-center justify-center">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">No batches yet</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-[#8b95a2] max-w-sm mx-auto">You have not been assigned to any batches yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {batches.map((batch: any) => (
            <Link 
              key={batch._id} 
              to={`/tutor/batch/${batch._id}`}
              className="group flex flex-col justify-between rounded-xl bg-white dark:bg-[#13151a] p-5 border border-slate-200 dark:border-[#242830] transition-all hover:shadow-md hover:border-slate-300 dark:hover:border-[#5a6474] text-left"
            >
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-[#f0f2f5] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{batch.name}</h3>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center text-sm text-slate-600 dark:text-[#8b95a2]">
                    <BookOpen className="mr-2 h-4 w-4 text-slate-400 dark:text-[#5a6474]" />
                    {batch.course?.title || batch.course?.name || "Unknown Course"}
                  </div>
                  <div className="flex items-center text-sm text-slate-600 dark:text-[#8b95a2]">
                    <Users className="mr-2 h-4 w-4 text-slate-400 dark:text-[#5a6474]" />
                    {batch.students?.length || 0} Students
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
