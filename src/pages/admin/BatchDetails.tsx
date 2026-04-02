import React, { useState } from 'react';
import { useParams, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, UserPlus, Users, ClipboardList, GraduationCap, Mail, BarChart2, CheckCircle2, BookOpen, ChevronDown } from 'lucide-react';
import { getBatchById, getBatchStudentVideoProgress } from '../../api';
import { AddStudentModal } from '../../components/modals/AddStudentModal';
import { AssignTutorModal } from '../../components/modals/AssignTutorModal';

export const BatchDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'students' | 'assignments' | 'teacher' | 'progress'>('students');
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isAssignTutorOpen, setIsAssignTutorOpen] = useState(false);
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['batch', id],
    queryFn: () => getBatchById(id!),
    enabled: !!id,
  });

  const { data: progressData, isLoading: isLoadingProgress } = useQuery({
    queryKey: ['batch-student-video-progress', id],
    queryFn: () => getBatchStudentVideoProgress(id!),
    enabled: !!id && activeTab === 'progress',
  });

  const batch = data?.batch || null;
  const studentProgress = progressData?.studentProgress || [];
  const courseName = progressData?.courseName || '';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
          <p className="text-slate-500 dark:text-[#8b95a2] font-medium text-sm">Loading batch data...</p>
        </div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="flex items-center justify-center p-12 text-red-600 dark:text-[#ef4444] font-medium">
        Batch not found
      </div>
    );
  }

  const tabs = [
    { key: 'students' as const, label: 'Students', icon: Users },
    { key: 'assignments' as const, label: 'Assignments', icon: ClipboardList },
    { key: 'teacher' as const, label: 'Teacher', icon: GraduationCap },
    { key: 'progress' as const, label: 'Video Progress', icon: BarChart2 },
  ];

  return (
    <div className="font-sans text-slate-900 dark:text-[#f0f2f5] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border-b border-slate-200 dark:border-[#242830] pb-6 mb-8">
        <Link to={batch.course?._id ? `/admin/course/${batch.course._id}` : '/admin/dashboard'} className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Course
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-blue-50 dark:bg-[#1e2a3d] text-blue-600 dark:text-blue-400 rounded text-[10px] font-bold uppercase tracking-widest border border-blue-100 dark:border-[#2d4a7a]">
                Batch
              </span>
              <span className="text-slate-500 dark:text-[#8b95a2] text-xs font-medium">Included in: <span className="text-slate-700 dark:text-[#f0f2f5]">{batch.course?.name || 'Unknown Course'}</span></span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-[#f0f2f5]">{batch.name}</h1>
          </div>

          <div className="flex gap-3">
            {activeTab === 'students' && (
              <button
                onClick={() => setIsAddStudentOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-all dark:hover:bg-blue-500 whitespace-nowrap"
              >
                <UserPlus className="h-4 w-4" />
                Add Student
              </button>
            )}
            {activeTab === 'teacher' && (
              <button
                onClick={() => setIsAssignTutorOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 dark:bg-white px-4 py-2 text-sm font-medium text-white dark:text-slate-900 shadow-sm hover:bg-slate-800 dark:hover:bg-slate-200 transition-all whitespace-nowrap"
              >
                <GraduationCap className="h-4 w-4" />
                Assign Tutor
              </button>
            )}
          </div>
        </div>

        <div className="flex space-x-6">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-[#8b95a2] dark:hover:text-[#f0f2f5]'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.key === 'students' && (
                <span className="ml-1 bg-slate-100 dark:bg-[#1a1d24] text-slate-600 dark:text-[#8b95a2] py-0.5 px-2 rounded-md text-[10px] font-bold border border-slate-200 dark:border-[#242830]">
                  {batch.students?.length || 0}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div>
        {activeTab === 'students' && (
          <div>
            {!batch.students || batch.students.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 dark:border-[#242830] bg-slate-50 dark:bg-[#1a1d24] p-12 text-center flex flex-col items-center justify-center">
                <Users className="w-10 h-10 text-slate-400 dark:text-[#5a6474] mb-3" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-[#f0f2f5]">No students enrolled</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-[#8b95a2] max-w-sm mx-auto">Start building your class by adding students to this batch.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {batch.students.map((student: any) => (
                  <div key={student._id} className="bg-white dark:bg-[#13151a] border border-slate-200 dark:border-[#242830] rounded-xl p-4 flex flex-col hover:border-slate-300 dark:hover:border-[#5a6474] transition-colors group">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-[#1a1d24] border border-slate-200 dark:border-[#242830] flex items-center justify-center font-bold text-slate-500 dark:text-[#8b95a2] mb-3 transition-colors">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="font-medium text-sm text-slate-900 dark:text-[#f0f2f5] line-clamp-1">{student.name}</div>
                    <div className="text-xs text-slate-500 dark:text-[#8b95a2] flex items-center gap-1.5 mt-1 line-clamp-1">
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
          <div className="rounded-xl border border-dashed border-slate-300 dark:border-[#242830] bg-slate-50 dark:bg-[#1a1d24] p-12 text-center">
            <ClipboardList className="w-10 h-10 text-slate-400 dark:text-[#5a6474] mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-[#f0f2f5]">Assignment Board</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-[#8b95a2]">Assignment tracking coming soon.</p>
          </div>
        )}

        {activeTab === 'teacher' && (
          <div>
            {!batch.tutor ? (
              <div className="rounded-xl border border-dashed border-slate-300 dark:border-[#242830] bg-slate-50 dark:bg-[#1a1d24] p-12 text-center flex flex-col items-center justify-center">
                <GraduationCap className="w-10 h-10 text-slate-400 dark:text-[#5a6474] mb-3" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-[#f0f2f5]">No teacher assigned</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-[#8b95a2] max-w-sm mx-auto">Every batch needs a tutor. Assign one now to lead this class.</p>
                <button
                  onClick={() => setIsAssignTutorOpen(true)}
                  className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 dark:bg-white px-4 py-2 text-sm font-medium text-white dark:text-slate-900 shadow-sm hover:bg-slate-800 dark:hover:bg-slate-200 transition-components"
                >
                  Select Tutor
                </button>
              </div>
            ) : (
              <div className="bg-white dark:bg-[#13151a] border border-slate-200 dark:border-[#242830] rounded-xl p-6 max-w-2xl flex items-center gap-5">
                <div className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-[#1a1d24] border border-slate-200 dark:border-[#242830] flex items-center justify-center text-slate-500 dark:text-[#8b95a2] text-2xl font-bold">
                  {batch.tutor.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-[#5a6474] mb-1">Lead Tutor</div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-[#f0f2f5] mb-0.5">{batch.tutor.name}</h3>
                  <div className="text-slate-500 dark:text-[#8b95a2] flex items-center gap-1.5 text-sm">
                    <Mail className="w-3.5 h-3.5" />
                    {batch.tutor.email}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'progress' && (
          <div>
            {isLoadingProgress ? (
              <div className="space-y-4">
                {[1, 2, 3].map(n => <div key={n} className="h-20 rounded-xl bg-slate-100 dark:bg-[#13151a] border border-slate-200 dark:border-[#242830] animate-pulse" />)}
              </div>
            ) : studentProgress.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 dark:border-[#242830] bg-slate-50 dark:bg-[#1a1d24] p-12 text-center flex flex-col items-center justify-center">
                <BarChart2 className="w-10 h-10 text-slate-400 dark:text-[#5a6474] mb-3" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-[#f0f2f5]">No Progress Data Yet</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-[#8b95a2]">Students haven't started watching lectures yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {courseName && (
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="w-4 h-4 text-slate-500 dark:text-[#8b95a2]" />
                    <h2 className="text-sm font-medium text-slate-600 dark:text-[#8b95a2]">Course: <span className="text-slate-900 dark:text-[#f0f2f5]">{courseName}</span></h2>
                    <span className="text-slate-400 dark:text-[#5a6474] text-xs font-medium">— {studentProgress[0]?.totalLectures ?? 0} total lectures</span>
                  </div>
                )}
                {studentProgress.map((student: any) => {
                  const pct = student.completionPercentage;
                  const pctColor = pct === 100 ? 'text-emerald-600 dark:text-[#10b981]' : pct >= 50 ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-[#f59e0b]';
                  const barColor = pct === 100 ? 'bg-emerald-500 dark:bg-[#10b981]' : pct >= 50 ? 'bg-blue-500' : 'bg-amber-500 dark:bg-[#f59e0b]';
                  const isExpanded = expandedStudent === student.studentId;

                  return (
                    <div key={student.studentId} className="rounded-xl bg-white dark:bg-[#13151a] border border-slate-200 dark:border-[#242830] overflow-hidden transition-all hover:border-slate-300 dark:hover:border-[#5a6474]">
                      <button
                        className="w-full p-4 flex items-center gap-4 text-left"
                        onClick={() => setExpandedStudent(isExpanded ? null : student.studentId)}
                      >
                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-[#1a1d24] border border-slate-200 dark:border-[#242830] flex items-center justify-center text-slate-500 dark:text-[#8b95a2] font-semibold text-sm shrink-0">
                          {student.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-[#f0f2f5] truncate">{student.name}</h4>
                            <p className="text-xs text-slate-500 dark:text-[#8b95a2] truncate hidden sm:block">{student.email}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-slate-100 dark:bg-[#1a1d24] rounded-full h-1.5 overflow-hidden">
                              <div className={`${barColor} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs font-medium text-slate-500 dark:text-[#8b95a2] shrink-0">{student.completedLectures}/{student.totalLectures}</span>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <span className={`text-lg font-bold ${pctColor}`}>{pct}%</span>
                          {pct === 100 && <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold mt-0.5 justify-end"><CheckCircle2 className="w-3 h-3" /> Complete</div>}
                        </div>
                        <div className={`text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}><ChevronDown size={16} /></div>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-slate-100 dark:border-[#242830] p-4 bg-slate-50/50 dark:bg-[#1a1d24]/50 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {(student.lectureDetails || []).map((lec: any) => (
                            <div
                              key={lec.lectureId}
                              className={`flex items-center gap-3 p-3 rounded-lg border text-sm ${
                                lec.isCompleted
                                  ? 'bg-emerald-50 border-emerald-200 dark:bg-[#052e1e] dark:border-[#065f46]'
                                  : 'bg-white border-slate-200 dark:bg-[#13151a] dark:border-[#242830]'
                              }`}
                            >
                              <div className={`w-8 h-8 rounded shrink-0 flex items-center justify-center border ${
                                lec.isCompleted 
                                  ? 'bg-emerald-100 border-emerald-200 dark:bg-[#0a3f2b] dark:border-[#065f46]' 
                                  : 'bg-slate-50 border-slate-200 dark:bg-[#1a1d24] dark:border-[#242830]'
                              }`}>
                                {lec.isCompleted
                                  ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#10b981]" />
                                  : <span className="text-[10px] font-bold text-slate-500 dark:text-[#8b95a2]">#{lec.order}</span>
                                }
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className={`text-xs font-semibold truncate ${lec.isCompleted ? 'text-emerald-800 dark:text-[#a7f3d0]' : 'text-slate-700 dark:text-[#f0f2f5]'}`}>{lec.title}</p>
                                <p className={`text-[10px] uppercase font-bold mt-0.5 tracking-wider ${lec.isCompleted ? 'text-emerald-600 dark:text-[#10b981]' : 'text-slate-400 dark:text-[#5a6474]'}`}>
                                  {lec.isCompleted ? 'Completed' : lec.watchedSeconds > 0 ? `${Math.floor(lec.watchedSeconds)}s watched` : 'Not started'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
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
