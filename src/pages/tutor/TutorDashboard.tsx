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
    <div className="min-h-screen bg-slate-950 p-8 font-sans text-slate-100">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Options */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Your Batches</h1>
            <p className="mt-1 text-sm text-slate-400">View your assigned batches and manage assignments.</p>
          </div>
        </div>

        {/* Batches Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 opacity-60">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-[200px] rounded-2xl bg-slate-800/50 animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center text-red-400">
            <p>Failed to load batches. {(error as Error).message}</p>
          </div>
        ) : batches.length === 0 ? (
          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/20 p-12 text-center flex flex-col items-center justify-center">
            <h3 className="text-xl font-semibold text-slate-200">No batches yet</h3>
            <p className="mt-2 text-sm text-slate-400 max-w-sm mx-auto">You have not been assigned to any batches yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {batches.map((batch: any) => (
              <Link 
                key={batch._id} 
                to={`/tutor/batch/${batch._id}`}
                className="group flex flex-col justify-between rounded-2xl bg-slate-800/50 p-6 border border-slate-700 hover:border-blue-500/50 hover:bg-slate-800 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-900/20 cursor-pointer text-left"
              >
                <div>
                  <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">{batch.name}</h3>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm text-slate-400">
                      <BookOpen className="mr-2 h-4 w-4 text-slate-500" />
                      {batch.course?.title || batch.course?.name || "Unknown Course"}
                    </div>
                    <div className="flex items-center text-sm text-slate-400">
                      <Users className="mr-2 h-4 w-4 text-slate-500" />
                      {batch.students?.length || 0} Students
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
