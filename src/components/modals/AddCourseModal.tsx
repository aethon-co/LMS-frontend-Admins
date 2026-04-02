import React, { useState } from 'react';
import { X, Loader2, BookOpen } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { createCourse } from '../../api';

interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddCourseModal: React.FC<AddCourseModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({ name: '', description: '' });
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const addCourseMutation = useMutation({
    mutationFn: () => createCourse(formData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setFormData({ name: '', description: '' });
      onClose();
      if (data?.course?._id) {
        navigate(`/admin/course/${data.course._id}`);
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCourseMutation.mutate();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm animate-in fade-in font-sans">
      <div className="w-full max-w-md bg-white dark:bg-[#1a1d24] rounded-2xl shadow-xl border border-slate-200 dark:border-[#242830] overflow-hidden relative animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-[#242830]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-[#1e2a3d] flex items-center justify-center border border-blue-100 dark:border-[#2d4a7a]">
              <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-[#f0f2f5]">Create New Course</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors rounded-lg hover:bg-slate-50 dark:hover:bg-[#242830]">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {addCourseMutation.isError && (
               <div className="p-3 bg-red-50 dark:bg-[#2d0f0f] border border-red-200 dark:border-[#7f1d1d] rounded-lg text-red-600 dark:text-[#ef4444] text-sm">
                 {addCourseMutation.error instanceof Error ? addCourseMutation.error.message : 'Error creating course'}
               </div>
            )}
            
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-[#8b95a2]">Course Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg border border-slate-300 dark:border-[#242830] bg-white dark:bg-[#13151a] px-3 py-2.5 text-slate-900 dark:text-[#f0f2f5] placeholder-slate-400 dark:placeholder-[#5a6474] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors text-sm"
                placeholder="e.g. Advanced Mathematics"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-[#8b95a2]">Description</label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-lg border border-slate-300 dark:border-[#242830] bg-white dark:bg-[#13151a] px-3 py-2.5 text-slate-900 dark:text-[#f0f2f5] placeholder-slate-400 dark:placeholder-[#5a6474] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors resize-none text-sm"
                placeholder="Course details..."
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-[#f0f2f5] border border-slate-300 dark:border-[#383e4a] hover:bg-slate-50 dark:hover:bg-[#242830] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addCourseMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addCourseMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Create Course
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
