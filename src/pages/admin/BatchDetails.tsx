import React, { useState } from 'react';
import { useParams, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, UserPlus, Users, ClipboardList, GraduationCap, Mail, BarChart2, CheckCircle2, BookOpen } from 'lucide-react';
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
      <div className="min-h-screen bg-slate-950 p-8 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin" />
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

  const tabs = [
    { key: 'students' as const, label: 'Students', icon: Users },
    { key: 'assignments' as const, label: 'Assignments', icon: ClipboardList },
    { key: 'teacher' as const, label: 'Teacher', icon: GraduationCap },
    { key: 'progress' as const, label: 'Video Progress', icon: BarChart2 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100">
      <div className="bg-slate-900 border-b border-slate-800 px-8 pt-8 pb-0">
        <div className="max-w-7xl mx-auto">
          <Link to={batch.course?._id ? `/admin/course/${batch.course._id}` : '/admin/dashboard'} className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-blue-400 transition-colors mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-md text-xs font-semibold uppercase tracking-wider border border-blue-500/20">
                  Batch
                </span>
                <span className="text-slate-400 text-sm font-medium">Included in: <span className="text-slate-300">{batch.course?.name || 'Unknown Course'}</span></span>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-white">{batch.name}</h1>
            </div>

            <div className="flex gap-3">
              {activeTab === 'students' && (
                <button
                  onClick={() => setIsAddStudentOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all hover:shadow-[0_0_15px_rgba(79,70,229,0.4)] whitespace-nowrap"
                >
                  <UserPlus className="h-4 w-4" />
                  Add Student
                </button>
              )}
              {activeTab === 'teacher' && (
                <button
                  onClick={() => setIsAssignTutorOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 transition-all hover:shadow-[0_0_15px_rgba(147,51,234,0.4)] whitespace-nowrap"
                >
                  <GraduationCap className="h-4 w-4" />
                  Assign Tutor
                </button>
              )}
            </div>
          </div>

          <div className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.key === 'students' && (
                  <span className="ml-1 bg-slate-800 text-slate-300 py-0.5 px-2 rounded-full text-xs">{batch.students?.length || 0}</span>
                )}
              </button>
            ))}
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
                  <div key={student._id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 flex flex-col hover:border-blue-500/30 transition-colors group">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-300 mb-3 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
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
                <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-3xl group-hover:bg-sky-500/10 transition-colors" />
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold font-serif shadow-lg">
                  {batch.tutor.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-sky-400 mb-1">Lead Tutor</div>
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

        {activeTab === 'progress' && (
          <div>
            {isLoadingProgress ? (
              <div className="space-y-4">
                {[1, 2, 3].map(n => <div key={n} className="h-24 rounded-2xl bg-slate-800/50 animate-pulse" />)}
              </div>
            ) : studentProgress.length === 0 ? (
              <div className="rounded-2xl border border-slate-700/50 bg-slate-800/20 p-12 text-center flex flex-col items-center justify-center">
                <BarChart2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-200">No Progress Data Yet</h3>
                <p className="mt-2 text-sm text-slate-400">Students haven't started watching lectures yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {courseName && (
                  <div className="flex items-center gap-2 mb-6">
                    <BookOpen className="w-5 h-5 text-blue-400" />
                    <h2 className="text-lg font-semibold text-slate-300">Course: <span className="text-white">{courseName}</span></h2>
                    <span className="text-slate-500 text-sm">— {studentProgress[0]?.totalLectures ?? 0} total lectures</span>
                  </div>
                )}
                {studentProgress.map((student: any) => {
                  const pct = student.completionPercentage;
                  const pctColor = pct === 100 ? 'text-emerald-400' : pct >= 50 ? 'text-blue-400' : 'text-amber-400';
                  const barColor = pct === 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-blue-500' : 'bg-amber-500';
                  const isExpanded = expandedStudent === student.studentId;

                  return (
                    <div key={student.studentId} className="rounded-2xl bg-slate-800/50 border border-slate-700/50 overflow-hidden transition-all hover:border-slate-600">
                      <button
                        className="w-full p-5 flex items-center gap-4 text-left"
                        onClick={() => setExpandedStudent(isExpanded ? null : student.studentId)}
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {student.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-semibold text-white truncate">{student.name}</h4>
                            <p className="text-xs text-slate-400 truncate hidden sm:block">{student.email}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-slate-700 rounded-full h-1.5 overflow-hidden">
                              <div className={`${barColor} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-slate-400 shrink-0">{student.completedLectures}/{student.totalLectures}</span>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <span className={`text-2xl font-extrabold ${pctColor}`}>{pct}%</span>
                          {pct === 100 && <div className="flex items-center gap-1 text-xs text-emerald-400 font-semibold mt-0.5 justify-end"><CheckCircle2 className="w-3 h-3" /> Complete</div>}
                        </div>
                        <div className={`text-slate-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>▾</div>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-slate-700/50 p-5 pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {(student.lectureDetails || []).map((lec: any) => (
                            <div
                              key={lec.lectureId}
                              className={`flex items-center gap-3 p-3 rounded-xl border text-sm ${
                                lec.isCompleted
                                  ? 'bg-emerald-500/5 border-emerald-500/20'
                                  : 'bg-slate-800/60 border-slate-700/50'
                              }`}
                            >
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${lec.isCompleted ? 'bg-emerald-500/20' : 'bg-slate-700'}`}>
                                {lec.isCompleted
                                  ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                  : <span className="text-xs font-bold text-slate-500">#{lec.order}</span>
                                }
                              </div>
                              <div className="min-w-0">
                                <p className={`font-medium truncate ${lec.isCompleted ? 'text-emerald-300' : 'text-slate-300'}`}>{lec.title}</p>
                                <p className="text-xs text-slate-500">
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
