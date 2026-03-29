import React from 'react';
import { X, Loader2, UserCheck } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllTutors, addTutorToBatch } from '../../api';

interface AssignTutorModalProps {
  batchId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const AssignTutorModal: React.FC<AssignTutorModalProps> = ({ batchId, isOpen, onClose }) => {
  const queryClient = useQueryClient();

  const { data: tutorsData, isLoading: isLoadingTutors } = useQuery({
    queryKey: ['tutors'],
    queryFn: getAllTutors,
    enabled: isOpen,
  });

  const tutors = tutorsData?.tutors || [];

  const addTutorMutation = useMutation({
    mutationFn: (tutorId: string) => addTutorToBatch(batchId, tutorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batch', batchId] });
      onClose();
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-slate-900 rounded-2xl border border-slate-700/50 shadow-2xl relative animate-in zoom-in-95 flex flex-col max-h-[85vh]">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800 z-10">
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-6 sm:p-8 border-b border-slate-800">
          <h2 className="text-2xl font-bold text-white mb-2">Assign Tutor</h2>
          <p className="text-sm text-slate-400">Select a tutor to manage this batch.</p>
          
          {addTutorMutation.isError && (
             <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
               {addTutorMutation.error instanceof Error ? addTutorMutation.error.message : 'Error assigning tutor'}
             </div>
          )}
        </div>
        
        <div className="overflow-y-auto p-2">
          {isLoadingTutors ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            </div>
          ) : tutors.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No existing tutors found.
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {tutors.map((tutor: any) => (
                <div key={tutor._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-700/50 group">
                  <div>
                    <div className="font-medium text-slate-200 group-hover:text-white transition-colors">{tutor.name}</div>
                    <div className="text-xs text-slate-400">{tutor.email}</div>
                  </div>
                  <button
                    onClick={() => addTutorMutation.mutate(tutor._id)}
                    disabled={addTutorMutation.isPending}
                    className="flex px-3 py-1.5 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-colors font-medium text-sm border border-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed group-hover:shadow-[0_0_10px_rgba(79,70,229,0.3)] gap-2"
                  >
                     <UserCheck className="w-4 h-4" />
                     Assign
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
