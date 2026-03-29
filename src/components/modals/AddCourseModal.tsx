import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCourse } from '../../api';

interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddCourseModal: React.FC<AddCourseModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({ name: '', description: '' });
  const queryClient = useQueryClient();

  const addCourseMutation = useMutation({
    mutationFn: () => createCourse(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setFormData({ name: '', description: '' });
      onClose();
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCourseMutation.mutate();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-slate-900 rounded-2xl border border-slate-700/50 shadow-2xl relative animate-in zoom-in-95">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800">
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Create New Course</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {addCourseMutation.isError && (
               <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                 {addCourseMutation.error instanceof Error ? addCourseMutation.error.message : 'Error creating course'}
               </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Course Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="e.g. Advanced Mathematics"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                placeholder="Course details..."
              />
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addCourseMutation.isPending}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-sm font-medium text-white hover:bg-blue-500 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
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
