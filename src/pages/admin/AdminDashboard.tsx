import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { getCourses } from '../../api';
import { CourseCard } from '../../components/cards/CourseCard';
import { AddCourseModal } from '../../components/modals/AddCourseModal';

export const AdminDashboard: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['courses'],
    queryFn: getCourses,
  });

  // Extract the actual courses array. Depending on the backend route response, it might be in data.courses or just data.
  // Assuming data.courses based on Mongoose .find() norms.
  const courses = data?.courses || [];

  return (
    <div className="min-h-screen bg-slate-950 p-8 font-sans text-slate-100">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Options */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Courses</h1>
            <p className="mt-1 text-sm text-slate-400">Manage all application curriculum streams.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 transition-all hover:shadow-[0_0_15px_rgba(79,70,229,0.4)]"
          >
            <Plus className="h-5 w-5" />
            Add Course
          </button>
        </div>

        {/* Courses Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 opacity-60">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-[320px] rounded-2xl bg-slate-800/50 animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center text-red-400">
            <p>Failed to load courses. {(error as Error).message}</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/20 p-12 text-center flex flex-col items-center justify-center">
            <h3 className="text-xl font-semibold text-slate-200">No courses yet</h3>
            <p className="mt-2 text-sm text-slate-400 max-w-sm mx-auto">Get started by creating your first course and establishing the foundation for future batches.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((course: any) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        )}
      </div>

      <AddCourseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
