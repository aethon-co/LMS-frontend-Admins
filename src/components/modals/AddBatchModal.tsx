import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBatch } from '../../api';

interface AddBatchModalProps {
  courseId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const AddBatchModal: React.FC<AddBatchModalProps> = ({ courseId, isOpen, onClose }) => {
  const [formData, setFormData] = useState({ name: '' });
  const queryClient = useQueryClient();

  const addBatchMutation = useMutation({
    mutationFn: () => createBatch({ ...formData, course: courseId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches', courseId] });
      setFormData({ name: '' });
      onClose();
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addBatchMutation.mutate();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-slate-900 rounded-2xl border border-slate-700/50 shadow-2xl relative animate-in zoom-in-95">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800">
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Create New Batch</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {addBatchMutation.isError && (
               <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                 {addBatchMutation.error instanceof Error ? addBatchMutation.error.message : 'Error creating batch'}
               </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Batch Name / Identifier</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="e.g. Fall 2026 Morning"
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
                disabled={addBatchMutation.isPending}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-sm font-medium text-white hover:bg-blue-500 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addBatchMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Create Batch
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
