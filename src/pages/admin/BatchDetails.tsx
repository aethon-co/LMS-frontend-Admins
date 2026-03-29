import React, { useState } from 'react';
import { useParams, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, UserPlus, Users, ClipboardList, GraduationCap, Mail } from 'lucide-react';
import { getBatchById } from '../../api';
import { AddStudentModal } from '../../components/modals/AddStudentModal';
import { AssignTutorModal } from '../../components/modals/AssignTutorModal';

export const BatchDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'students' | 'assignments' | 'teacher'>('students');
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isAssignTutorOpen, setIsAssignTutorOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['batch', id],
    queryFn: () => getBatchById(id!),
    enabled: !!id,
  });

  const batch = data?.batch || null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin" />
          <p className="text-slate-400 font-medium tracking-wide">Loading batch data...</p>
        </div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 flex items-center justify-center text-red-400">
        Batch not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100">
      <div className="bg-slate-900 border-b border-slate-800 px-8 pt-8 pb-0">
        <div className="max-w-7xl mx-auto">
          {/* Using batch.course?._id if populated, else falling back to dashboard */}
          <Link to={batch.course?._id ? `/admin/course/${batch.course._id}` : '/admin/dashboard'} className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-indigo-400 transition-colors mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-md text-xs font-semibold uppercase tracking-wider border border-indigo-500/20">
                  Batch
                </span>
                <span className="text-slate-400 text-sm font-medium">Included in: <span className="text-slate-300">{batch.course?.title || 'Unknown Course'}</span></span>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-white">{batch.title}</h1>
            </div>
            
            <div className="flex gap-3">
              {activeTab === 'students' && (
                <button
                  onClick={() => setIsAddStudentOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all hover:shadow-[0_0_15px_rgba(79,70,229,0.4)] whitespace-nowrap"
                >
                  <UserPlus className="h-4 w-4" />
                  Add Student
                </button>
              )}
              {activeTab === 'teacher' && (
                <button
                  onClick={() => setIsAssignTutorOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 transition-all hover:shadow-[0_0_15px_rgba(147,51,234,0.4)] whitespace-nowrap"
                >
                  <GraduationCap className="h-4 w-4" />
                  Assign Tutor
                </button>
              )}
            </div>
          </div>

          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('students')}
              className={`pb-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'students'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-700'
              }`}
            >
              <Users className="w-4 h-4" />
              Students <span className="ml-1 bg-slate-800 text-slate-300 py-0.5 px-2 rounded-full text-xs">{batch.students?.length || 0}</span>
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`pb-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'assignments'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-700'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              Assignments
            </button>
            <button
              onClick={() => setActiveTab('teacher')}
              className={`pb-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'teacher'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-700'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Teacher
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        {activeTab === 'students' && (
          <div>
            {!batch.students || batch.students.length === 0 ? (
              <div className="rounded-2xl border border-slate-700/50 bg-slate-800/20 p-12 text-center flex flex-col items-center justify-center">
                <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-200">No students enrolled</h3>
                <p className="mt-2 text-sm text-slate-400 max-w-sm mx-auto">Start building your class by adding students to this batch.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {batch.students.map((student: any) => (
                  <div key={student._id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 flex flex-col hover:border-indigo-500/30 transition-colors group">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-300 mb-3 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="font-semibold text-slate-200 line-clamp-1">{student.name}</div>
                    <div className="text-sm text-slate-400 flex items-center gap-2 mt-1 line-clamp-1">
                      <Mail className="w-3 h-3" />
                      {student.email}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/20 p-12 text-center">
            <ClipboardList className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-200">Assignment Board</h3>
            <p className="mt-2 text-sm text-slate-400">Assignment tracking coming soon.</p>
          </div>
        )}

        {activeTab === 'teacher' && (
          <div>
            {!batch.tutor ? (
               <div className="rounded-2xl border border-slate-700/50 bg-slate-800/20 p-12 text-center flex flex-col items-center justify-center">
                 <GraduationCap className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                 <h3 className="text-xl font-semibold text-slate-200">No teacher assigned</h3>
                 <p className="mt-2 text-sm text-slate-400 max-w-sm mx-auto">Every batch needs a great tutor. Assign one now to lead this class.</p>
                 <button
                    onClick={() => setIsAssignTutorOpen(true)}
                    className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 transition-all border border-slate-700"
                  >
                    Select Tutor
                  </button>
               </div>
            ) : (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 max-w-2xl flex items-center gap-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-colors" />
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold font-serif shadow-lg">
                  {batch.tutor.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-1">Lead Tutor</div>
                  <h3 className="text-2xl font-bold text-slate-100 mb-1">{batch.tutor.name}</h3>
                  <div className="text-slate-400 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {batch.tutor.email}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <AddStudentModal batchId={id!} isOpen={isAddStudentOpen} onClose={() => setIsAddStudentOpen(false)} />
      <AssignTutorModal batchId={id!} isOpen={isAssignTutorOpen} onClose={() => setIsAssignTutorOpen(false)} />
    </div>
  );
};
