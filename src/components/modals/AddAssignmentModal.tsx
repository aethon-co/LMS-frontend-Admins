import React, { useState } from 'react';
import { X, Loader2, Calendar } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTutorAssignment } from '../../api';

interface AddAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  batchId: string;
}

export const AddAssignmentModal: React.FC<AddAssignmentModalProps> = ({ isOpen, onClose, batchId }) => {
  const [formData, setFormData] = useState({ name: '', description: '', dueDate: '', maxMarks: 100 });
  const queryClient = useQueryClient();

  const addAssignmentMutation = useMutation({
    mutationFn: () => createTutorAssignment(batchId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tutor-batch-assignments', batchId] });
      setFormData({ name: '', description: '', dueDate: '', maxMarks: 100 });
      onClose();
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAssignmentMutation.mutate();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-slate-900 rounded-2xl border border-slate-700/50 shadow-2xl relative animate-in zoom-in-95">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800">
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Create New Assignment</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {addAssignmentMutation.isError && (
               <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                 {addAssignmentMutation.error instanceof Error ? addAssignmentMutation.error.message : 'Error creating assignment'}
               </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Assignment Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="e.g. Weekly Report 1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1 flex items-center gap-1">
                  Due Date <Calendar className="w-4 h-4 text-slate-400" />
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.dueDate}
                  onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Max Marks</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.maxMarks}
                  onChange={e => setFormData({ ...formData, maxMarks: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                placeholder="Assignment details..."
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
                disabled={addAssignmentMutation.isPending}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-sm font-medium text-white hover:bg-blue-500 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addAssignmentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Create Assignment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
