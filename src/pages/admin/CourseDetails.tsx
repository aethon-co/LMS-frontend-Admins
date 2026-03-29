import React, { useState } from 'react';
import { useParams, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Plus, PlayCircle, Users } from 'lucide-react';
import { getCourseById, getBatchByCourse } from '../../api';
import { AddBatchModal } from '../../components/modals/AddBatchModal';
import { BatchCard } from '../../components/cards/BatchCard';

export const CourseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'batches' | 'videos'>('batches');
  const [isAddBatchOpen, setIsAddBatchOpen] = useState(false);

  const { data: courseData, isLoading: isLoadingCourse } = useQuery({
    queryKey: ['course', id],
    queryFn: () => getCourseById(id!),
    enabled: !!id,
  });

  const { data: batchesData, isLoading: isLoadingBatches } = useQuery({
    queryKey: ['batches', id],
    queryFn: () => getBatchByCourse(id!),
    enabled: !!id,
  });

  const course = courseData?.course || null;
  const batches = batchesData?.batches || [];

  if (isLoadingCourse) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin" />
          <p className="text-slate-400 font-medium tracking-wide">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 flex items-center justify-center text-red-400">
        Course not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100">
      {/* Header section */}
      <div className="bg-slate-900 border-b border-slate-800 px-8 pt-8 pb-0">
        <div className="max-w-7xl mx-auto">
          <Link to="/admin/dashboard" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-blue-400 transition-colors mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">{course.name}</h1>
              <p className="text-lg text-slate-400 max-w-2xl">{course.description}</p>
            </div>
            {activeTab === 'batches' && (
              <button
                onClick={() => setIsAddBatchOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all hover:shadow-[0_0_15px_rgba(79,70,229,0.4)] whitespace-nowrap"
              >
                <Plus className="h-5 w-5" />
                Create Batch
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('batches')}
              className={`pb-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'batches'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-700'
              }`}
            >
              <Users className="w-4 h-4" />
              Batches
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`pb-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'videos'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-700'
              }`}
            >
              <PlayCircle className="w-4 h-4" />
              Videos
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-8">
        {activeTab === 'videos' ? (
          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/20 p-12 text-center">
            <PlayCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-200">Video Content</h3>
            <p className="mt-2 text-sm text-slate-400">Video management coming soon.</p>
          </div>
        ) : (
          <div>
            {isLoadingBatches ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60">
                {[1, 2, 3].map(n => (
                  <div key={n} className="h-[200px] rounded-2xl bg-slate-800/50 animate-pulse" />
                ))}
              </div>
            ) : batches.length === 0 ? (
              <div className="rounded-2xl border border-slate-700/50 bg-slate-800/20 p-12 text-center flex flex-col items-center justify-center">
                <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-200">No batches created</h3>
                <p className="mt-2 text-sm text-slate-400 max-w-sm mx-auto">Create a batch to start organizing students and tutors for this course.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {batches.map((batch: any) => (
                  <BatchCard key={batch._id} batch={batch} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <AddBatchModal courseId={id!} isOpen={isAddBatchOpen} onClose={() => setIsAddBatchOpen(false)} />
    </div>
  );
};
