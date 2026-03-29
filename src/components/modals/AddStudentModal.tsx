import React, { useState, useMemo } from 'react';
import { X, Loader2, Search, UserPlus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllStudents, addStudentToBatch } from '../../api';

interface AddStudentModalProps {
  batchId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({ batchId, isOpen, onClose }) => {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: studentsData, isLoading: isLoadingStudents } = useQuery({
    queryKey: ['students'],
    queryFn: getAllStudents,
    enabled: isOpen,
  });

  const students = studentsData?.students || [];

  const addStudentMutation = useMutation({
    mutationFn: (studentId: string) => addStudentToBatch(batchId, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batch', batchId] });
      setSearch('');
      onClose();
    }
  });

  const filteredStudents = useMemo(() => {
    if (!search) return students;
    const lower = search.toLowerCase();
    return students.filter((s: any) => 
      s.name.toLowerCase().includes(lower) || s.email.toLowerCase().includes(lower)
    );
  }, [search, students]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-slate-900 rounded-2xl border border-slate-700/50 shadow-2xl relative animate-in zoom-in-95 flex flex-col max-h-[85vh]">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800 z-10">
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-6 sm:p-8 border-b border-slate-800">
          <h2 className="text-2xl font-bold text-white mb-2">Add Student to Batch</h2>
          <p className="text-sm text-slate-400 mb-6">Search and select a student to enroll them.</p>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full rounded-xl border border-slate-700 bg-slate-800/50 px-3 py-3 pl-10 text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all sm:text-sm"
              placeholder="Search by name or email..."
            />
          </div>
          
          {addStudentMutation.isError && (
             <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
               {addStudentMutation.error instanceof Error ? addStudentMutation.error.message : 'Error adding student'}
             </div>
          )}
        </div>
        
        <div className="overflow-y-auto p-2">
          {isLoadingStudents ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No students found matching your search.
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredStudents.map((student: any) => (
                <div key={student._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-700/50 group">
                  <div>
                    <div className="font-medium text-slate-200 group-hover:text-white transition-colors">{student.name}</div>
                    <div className="text-xs text-slate-400">{student.email}</div>
                  </div>
                  <button
                    onClick={() => addStudentMutation.mutate(student._id)}
                    disabled={addStudentMutation.isPending}
                    className="flex p-2 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-colors border border-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Add to Batch"
                  >
                     <UserPlus className="w-4 h-4" />
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
