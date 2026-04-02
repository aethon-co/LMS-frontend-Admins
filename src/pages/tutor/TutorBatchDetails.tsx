import React, { useState } from 'react';
import { useParams, Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getTutorBatchById, getTutorBatchAssignments, 
  getTutorBatchSessions, createTutorClassSession, updateTutorAttendance,
  getBatchStudentStats, updateTutorAssignment, deleteTutorAssignment,
  getTutorBatchStudentVideoProgress
} from '../../api';
import { ArrowLeft, Users, Calendar, Plus, FileText, CheckCircle2, ClipboardList, UserCheck, UserX, Loader2, Search, X, Pencil, Trash2, BarChart2, BookOpen } from 'lucide-react';
import { AddAssignmentModal } from '../../components/modals/AddAssignmentModal';

export const TutorBatchDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'assignments' | 'students' | 'attendance' | 'progress'>('assignments');
  const [dateFilter, setDateFilter] = useState('');
  const queryClient = useQueryClient();

  // Assignment edit/delete state
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editMaxMarks, setEditMaxMarks] = useState(0);
  const [deletingAssignmentId, setDeletingAssignmentId] = useState<string | null>(null);

  // Video progress expand
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

  const { data: batchData, isLoading: isLoadingBatch } = useQuery({
    queryKey: ['tutor-batch', id],
    queryFn: () => getTutorBatchById(id as string),
    enabled: !!id,
  });

  const { data: assignmentsData, isLoading: isLoadingAssignments } = useQuery({
    queryKey: ['tutor-batch-assignments', id],
    queryFn: () => getTutorBatchAssignments(id as string),
    enabled: !!id,
  });

  const { data: sessionsData, isLoading: isLoadingSessions } = useQuery({
    queryKey: ['tutor-batch-sessions', id, dateFilter],
    queryFn: () => getTutorBatchSessions(id as string, dateFilter || undefined),
    enabled: !!id,
  });

  const { data: studentStatsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ['tutor-batch-student-stats', id],
    queryFn: () => getBatchStudentStats(id as string),
    enabled: !!id,
  });

  const { data: videoProgressData, isLoading: isLoadingVideoProgress } = useQuery({
    queryKey: ['tutor-batch-video-progress', id],
    queryFn: () => getTutorBatchStudentVideoProgress(id as string),
    enabled: !!id && activeTab === 'progress',
  });

  const createSessionMutation = useMutation({
    mutationFn: () => createTutorClassSession(id as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tutor-batch-sessions', id] });
      queryClient.invalidateQueries({ queryKey: ['tutor-batch-student-stats', id] });
    },
  });

  const updateAttendanceMutation = useMutation({
    mutationFn: ({ sessionId, studentId, status }: { sessionId: string; studentId: string; status: string }) =>
      updateTutorAttendance(id as string, sessionId, studentId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tutor-batch-sessions', id] });
      queryClient.invalidateQueries({ queryKey: ['tutor-batch-student-stats', id] });
    },
  });

  const updateAssignmentMutation = useMutation({
    mutationFn: ({ assignmentId, data }: { assignmentId: string; data: any }) =>
      updateTutorAssignment(id as string, assignmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tutor-batch-assignments', id] });
      setEditingAssignmentId(null);
    },
  });

  const deleteAssignmentMutation = useMutation({
    mutationFn: (assignmentId: string) => deleteTutorAssignment(id as string, assignmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tutor-batch-assignments', id] });
      setDeletingAssignmentId(null);
    },
  });

  if (isLoadingBatch) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Loading batch details...</div>
      </div>
    );
  }

  const batch = batchData?.batch;
  const assignments = assignmentsData?.assignments || [];
  const sessions = sessionsData?.sessions || [];
  const studentStats = studentStatsData?.studentStats || [];
  const studentVideoProgress = videoProgressData?.studentProgress || [];
  const courseName = videoProgressData?.courseName || '';

  if (!batch) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 flex items-center justify-center">
        <div className="text-red-400 text-xl">Batch not found.</div>
      </div>
    );
  }

  const tabs = [
    { key: 'assignments' as const, label: 'Assignments', icon: FileText },
    { key: 'students' as const, label: 'Students', icon: Users },
    { key: 'attendance' as const, label: 'Attendance', icon: ClipboardList },
    { key: 'progress' as const, label: 'Video Progress', icon: BarChart2 },
  ];

  const statsMap: Record<string, any> = {};
  for (const s of studentStats) {
    statsMap[s.studentId] = s;
  }

  const startEditAssignment = (a: any) => {
    setEditingAssignmentId(a._id);
    setEditName(a.name);
    setEditDescription(a.description);
    setEditDueDate(a.dueDate ? new Date(a.dueDate).toISOString().slice(0, 16) : '');
    setEditMaxMarks(a.maxMarks);
  };

  const saveAssignmentEdit = () => {
    if (!editingAssignmentId) return;
    updateAssignmentMutation.mutate({
      assignmentId: editingAssignmentId,
      data: { name: editName, description: editDescription, dueDate: editDueDate, maxMarks: editMaxMarks },
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-8 pt-8 pb-0">
        <div className="max-w-7xl mx-auto">
          <Link to="/tutor/dashboard" className="inline-flex items-center text-sm font-medium text-blue-400 hover:text-blue-300 mb-6 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">{batch.name}</h1>
              <p className="text-lg text-slate-400 flex items-center gap-2">
                Course: {batch.course?.title || batch.course?.name || "Unknown Course"}
                <span className="text-slate-600">|</span>
                <Users className="w-5 h-5 text-slate-500" /> {batch.students?.length || 0} Students Enrolled
              </p>
            </div>
            {activeTab === 'assignments' && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all hover:shadow-[0_0_15px_rgba(79,70,229,0.4)]"
              >
                <Plus className="h-5 w-5" /> Create Assignment
              </button>
            )}
            {activeTab === 'attendance' && (
              <button
                onClick={() => createSessionMutation.mutate()}
                disabled={createSessionMutation.isPending}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 transition-all hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createSessionMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                Start Today's Class
              </button>
            )}
          </div>

          {/* Tabs */}
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
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-8">

        {/* ─── Assignments Tab ─── */}
        {activeTab === 'assignments' && (
          <div>
            {isLoadingAssignments ? (
              <div className="grid grid-cols-1 gap-4 opacity-60">
                {[1, 2, 3].map(n => <div key={n} className="h-[100px] rounded-2xl bg-slate-800/50 animate-pulse" />)}
              </div>
            ) : assignments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-700/50 bg-slate-800/20 p-12 text-center">
                <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-200">No Assignments Yet</h3>
                <p className="mt-2 text-sm text-slate-400">Click the button above to create the first assignment for this batch.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment: any) => (
                  <div key={assignment._id} className="group rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-all overflow-hidden">
                    {editingAssignmentId === assignment._id ? (
                      /* ── Inline Edit Form ── */
                      <div className="p-6 space-y-4 bg-slate-900/60">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Edit Assignment</h4>
                          <button onClick={() => setEditingAssignmentId(null)} className="text-slate-500 hover:text-slate-200 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="text-xs font-medium text-slate-400 mb-1 block">Assignment Name</label>
                            <input
                              value={editName}
                              onChange={e => setEditName(e.target.value)}
                              className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-slate-400 mb-1 block">Due Date</label>
                            <input
                              type="datetime-local"
                              value={editDueDate}
                              onChange={e => setEditDueDate(e.target.value)}
                              className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-slate-400 mb-1 block">Max Marks</label>
                            <input
                              type="number"
                              value={editMaxMarks}
                              onChange={e => setEditMaxMarks(Number(e.target.value))}
                              className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-xs font-medium text-slate-400 mb-1 block">Description</label>
                            <textarea
                              value={editDescription}
                              onChange={e => setEditDescription(e.target.value)}
                              rows={3}
                              className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                            />
                          </div>
                        </div>
                        <div className="flex gap-3 justify-end">
                          <button
                            onClick={() => setEditingAssignmentId(null)}
                            className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={saveAssignmentEdit}
                            disabled={updateAssignmentMutation.isPending}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50"
                          >
                            {updateAssignmentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            Save Changes
                          </button>
                        </div>
                      </div>
                    ) : deletingAssignmentId === assignment._id ? (
                      /* ── Delete Confirm ── */
                      <div className="p-6 flex items-center justify-between bg-red-950/30">
                        <div>
                          <p className="font-semibold text-red-300">Delete "{assignment.name}"?</p>
                          <p className="text-xs text-red-400/70 mt-0.5">This action cannot be undone.</p>
                        </div>
                        <div className="flex gap-3">
                          <button onClick={() => setDeletingAssignmentId(null)} className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors">
                            Cancel
                          </button>
                          <button
                            onClick={() => deleteAssignmentMutation.mutate(assignment._id)}
                            disabled={deleteAssignmentMutation.isPending}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-50"
                          >
                            {deleteAssignmentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            Delete
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* ── Normal View ── */
                      <div className="p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                            {assignment.name}
                            {assignment.dueDate && new Date(assignment.dueDate) > new Date() && (
                              <span className="px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-400 text-xs font-semibold border border-green-500/20">Active</span>
                            )}
                          </h3>
                          <p className="text-slate-400 text-sm max-w-2xl">{assignment.description}</p>
                        </div>
                        <div className="flex flex-col items-start sm:items-end gap-2 text-sm">
                          {assignment.dueDate && (
                            <div className="flex items-center text-slate-300 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700/50">
                              <Calendar className="mr-2 h-4 w-4 text-blue-400" />
                              Due: {new Date(assignment.dueDate).toLocaleDateString()} {new Date(assignment.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                          <div className="flex items-center text-slate-300 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700/50">
                            <CheckCircle2 className="mr-2 h-4 w-4 text-purple-400" />
                            Marks: {assignment.maxMarks}
                          </div>
                          <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => startEditAssignment(assignment)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700/50 hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 border border-slate-600/50 text-xs font-medium transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                              onClick={() => setDeletingAssignmentId(assignment._id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700/50 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-600/50 text-xs font-medium transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── Students Tab (with attendance %) ─── */}
        {activeTab === 'students' && (
          <div>
            {isLoadingStats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
                {[1, 2, 3].map(n => <div key={n} className="h-[80px] rounded-2xl bg-slate-800/50 animate-pulse" />)}
              </div>
            ) : studentStats.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-700/50 bg-slate-800/20 p-12 text-center">
                <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-200">No Students Enrolled</h3>
                <p className="mt-2 text-sm text-slate-400">An admin needs to add students to this batch first.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {studentStats.map((student: any) => {
                  const pctColor = student.percentage >= 75 ? 'text-emerald-400' : student.percentage >= 50 ? 'text-amber-400' : 'text-red-400';
                  const barColor = student.percentage >= 75 ? 'bg-emerald-500' : student.percentage >= 50 ? 'bg-amber-500' : 'bg-red-500';
                  return (
                    <div key={student.studentId} className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-5 hover:border-slate-600 transition-all">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {student.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-semibold text-white truncate">{student.name}</h4>
                          <p className="text-xs text-slate-400 truncate">{student.email}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`text-xl font-extrabold ${pctColor}`}>{student.percentage}%</span>
                          <p className="text-[10px] text-slate-500">{student.attendedClasses}/{student.totalClasses} classes</p>
                        </div>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                        <div className={`${barColor} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${student.percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── Attendance Tab ─── */}
        {activeTab === 'attendance' && (
          <div>
            <div className="mb-6 flex items-center gap-3">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/50 text-slate-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors text-sm"
                  placeholder="Filter by date..."
                />
              </div>
              {dateFilter && (
                <button
                  onClick={() => setDateFilter('')}
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800/50 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors text-sm"
                >
                  <X className="w-4 h-4" /> Clear
                </button>
              )}
            </div>

            {isLoadingSessions ? (
              <div className="space-y-4 opacity-60">
                {[1, 2].map(n => <div key={n} className="h-[180px] rounded-2xl bg-slate-800/50 animate-pulse" />)}
              </div>
            ) : sessions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-700/50 bg-slate-800/20 p-12 text-center">
                <ClipboardList className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-200">{dateFilter ? 'No Classes on This Date' : 'No Classes Recorded'}</h3>
                <p className="mt-2 text-sm text-slate-400">
                  {dateFilter ? 'Try selecting a different date, or clear the filter to see all sessions.' : 'Click "Start Today\'s Class" to create a new session and mark attendance.'}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {sessions.map((session: any) => {
                  const presentCount = session.attendance.filter((a: any) => a.status === 'present').length;
                  const totalCount = session.attendance.length;
                  return (
                    <div key={session._id} className="rounded-2xl bg-slate-800/50 border border-slate-700/50 overflow-hidden">
                      <div className="p-5 border-b border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-900/40">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                            <Calendar className="w-5 h-5 text-emerald-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {new Date(session.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </h3>
                            <p className="text-xs text-slate-400">
                              {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <div className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700/50 text-sm text-slate-300">
                          <span className="text-emerald-400 font-semibold">{presentCount}</span> / {totalCount} Present
                        </div>
                      </div>
                      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {session.attendance.map((record: any) => {
                          const isPresent = record.status === 'present';
                          return (
                            <button
                              key={record.student?._id || record._id}
                              onClick={() => updateAttendanceMutation.mutate({
                                sessionId: session._id,
                                studentId: record.student?._id,
                                status: isPresent ? 'absent' : 'present',
                              })}
                              className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                                isPresent
                                  ? 'bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10'
                                  : 'bg-red-500/5 border-red-500/20 hover:bg-red-500/10'
                              }`}
                            >
                              {isPresent ? (
                                <UserCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                              ) : (
                                <UserX className="w-5 h-5 text-red-400 shrink-0" />
                              )}
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-white truncate">{record.student?.name || 'Unknown'}</p>
                                <p className={`text-xs font-semibold ${isPresent ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {isPresent ? 'Present' : 'Absent'}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── Video Progress Tab ─── */}
        {activeTab === 'progress' && (
          <div>
            {isLoadingVideoProgress ? (
              <div className="space-y-4">
                {[1, 2, 3].map(n => <div key={n} className="h-24 rounded-2xl bg-slate-800/50 animate-pulse" />)}
              </div>
            ) : studentVideoProgress.length === 0 ? (
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
                    <span className="text-slate-500 text-sm">— {studentVideoProgress[0]?.totalLectures ?? 0} total lectures</span>
                  </div>
                )}
                {studentVideoProgress.map((student: any) => {
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

      <AddAssignmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} batchId={id as string} />
    </div>
  );
};
