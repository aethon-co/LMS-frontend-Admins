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

  const courses = data?.courses || [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      {/* Header Options */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#242830] pb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-[#f0f2f5]">Courses</h1>
          <p className="mt-1 text-slate-500 dark:text-[#8b95a2]">Manage all application curriculum streams.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all dark:bg-blue-600 dark:hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          Add Course
        </button>
      </div>

      {/* Courses Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 opacity-50">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-[250px] rounded-xl bg-slate-100 dark:bg-[#13151a] border border-slate-200 dark:border-[#242830] animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-800 dark:border-[#7f1d1d] dark:bg-[#2d0f0f] dark:text-[#fecaca] text-sm font-medium">
          Failed to load courses. {(error as Error).message}
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 dark:border-[#242830] bg-slate-50 dark:bg-[#1a1d24] p-16 text-center flex flex-col items-center justify-center">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">No courses yet</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-[#8b95a2] max-w-sm mx-auto">Get started by creating your first course and establishing the foundation for future batches.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course: any) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      )}

      <AddCourseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
