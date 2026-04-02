import React, { useState } from 'react';
import { useParams, Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getTutorBatchById, getTutorBatchAssignments, 
  getTutorBatchSessions, createTutorClassSession, updateTutorAttendance,
  getBatchStudentStats, updateTutorAssignment, deleteTutorAssignment,
  getTutorBatchStudentVideoProgress
} from '../../api';
import { ArrowLeft, Users, Calendar, Plus, FileText, CheckCircle2, ClipboardList, UserCheck, UserX, Loader2, Search, X, Pencil, Trash2, BarChart2, BookOpen, ChevronDown } from 'lucide-react';
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
      <div className="flex items-center justify-center p-12">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <div className="text-slate-500 dark:text-[#8b95a2] text-sm font-medium">Loading batch details...</div>
        </div>
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
      <div className="flex items-center justify-center p-12">
        <div className="text-red-600 dark:text-[#ef4444] font-medium">Batch not found.</div>
      </div>
    );
  }

  const tabs = [
    { key: 'assignments' as const, label: 'Assignments', icon: FileText },
    { key: 'students' as const, label: 'Students', icon: Users },
    { key: 'attendance' as const, label: 'Attendance', icon: ClipboardList },
    { key: 'progress' as const, label: 'Video Progress', icon: BarChart2 },
  ];

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
    <div className="font-sans text-slate-900 dark:text-[#f0f2f5] animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-[#242830] pb-6 mb-8">
        <Link to="/tutor/dashboard" className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors mb-4">
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-[#f0f2f5] mb-2">{batch.name}</h1>
            <p className="text-sm font-medium text-slate-500 dark:text-[#8b95a2] flex items-center gap-2">
              Course: <span className="text-slate-700 dark:text-slate-300">{batch.course?.title || batch.course?.name || "Unknown Course"}</span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <Users className="w-4 h-4 text-slate-400 dark:text-[#5a6474]" /> {batch.students?.length || 0} Students
            </p>
          </div>
          {activeTab === 'assignments' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 dark:hover:bg-blue-500 transition-all whitespace-nowrap"
            >
              <Plus className="h-4 w-4" /> Create Assignment
            </button>
          )}
          {activeTab === 'attendance' && (
            <button
              onClick={() => createSessionMutation.mutate()}
              disabled={createSessionMutation.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 dark:hover:bg-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {createSessionMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Start Today's Class
            </button>
          )}
        </div>

        {/* Tabs */}
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
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">

        {/* ─── Assignments Tab ─── */}
        {activeTab === 'assignments' && (
          <div>
            {isLoadingAssignments ? (
              <div className="grid grid-cols-1 gap-4 opacity-50">
                {[1, 2, 3].map(n => <div key={n} className="h-24 rounded-xl bg-slate-100 dark:bg-[#13151a] border border-slate-200 dark:border-[#242830] animate-pulse" />)}
              </div>
            ) : assignments.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 dark:border-[#242830] bg-slate-50 dark:bg-[#1a1d24] p-12 text-center">
                <FileText className="w-10 h-10 text-slate-400 dark:text-[#5a6474] mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-[#f0f2f5]">No Assignments Yet</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-[#8b95a2]">Click the button above to create the first assignment for this batch.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment: any) => (
                  <div key={assignment._id} className="group rounded-xl bg-white dark:bg-[#13151a] border border-slate-200 dark:border-[#242830] hover:border-slate-300 dark:hover:border-[#5a6474] transition-all overflow-hidden flex flex-col">
                    {editingAssignmentId === assignment._id ? (
                      /* ── Inline Edit Form ── */
                      <div className="p-5 space-y-4 bg-slate-50 dark:bg-[#1a1d24]">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-xs font-bold text-slate-500 dark:text-[#8b95a2] uppercase tracking-wider">Edit Assignment</h4>
                          <button onClick={() => setEditingAssignmentId(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="text-xs font-medium text-slate-700 dark:text-[#8b95a2] mb-1.5 block">Assignment Name</label>
                            <input
                              value={editName}
                              onChange={e => setEditName(e.target.value)}
                              className="w-full rounded-md bg-white dark:bg-[#13151a] border border-slate-300 dark:border-[#242830] px-3 py-2 text-sm text-slate-900 dark:text-[#f0f2f5] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-slate-700 dark:text-[#8b95a2] mb-1.5 block">Due Date</label>
                            <input
                              type="datetime-local"
                              value={editDueDate}
                              onChange={e => setEditDueDate(e.target.value)}
                              className="w-full rounded-md bg-white dark:bg-[#13151a] border border-slate-300 dark:border-[#242830] px-3 py-2 text-sm text-slate-900 dark:text-[#f0f2f5] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-slate-700 dark:text-[#8b95a2] mb-1.5 block">Max Marks</label>
                            <input
                              type="number"
                              value={editMaxMarks}
                              onChange={e => setEditMaxMarks(Number(e.target.value))}
                              className="w-full rounded-md bg-white dark:bg-[#13151a] border border-slate-300 dark:border-[#242830] px-3 py-2 text-sm text-slate-900 dark:text-[#f0f2f5] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-xs font-medium text-slate-700 dark:text-[#8b95a2] mb-1.5 block">Description</label>
                            <textarea
                              value={editDescription}
                              onChange={e => setEditDescription(e.target.value)}
                              rows={3}
                              className="w-full rounded-md bg-white dark:bg-[#13151a] border border-slate-300 dark:border-[#242830] px-3 py-2 text-sm text-slate-900 dark:text-[#f0f2f5] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end pt-2">
                          <button
                            onClick={() => setEditingAssignmentId(null)}
                            className="px-3 py-1.5 rounded-md text-sm font-medium border border-slate-300 dark:border-[#242830] text-slate-700 dark:text-[#f0f2f5] hover:bg-slate-50 dark:hover:bg-[#242830] transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={saveAssignmentEdit}
                            disabled={updateAssignmentMutation.isPending}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white transition-colors disabled:opacity-50"
                          >
                            {updateAssignmentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            Save
                          </button>
                        </div>
                      </div>
                    ) : deletingAssignmentId === assignment._id ? (
                      /* ── Delete Confirm ── */
                      <div className="p-5 flex items-center justify-between bg-red-50 dark:bg-[#2d0f0f] border-b border-red-100 dark:border-[#7f1d1d]">
                        <div>
                          <p className="font-medium text-sm text-red-900 dark:text-red-300 flex items-center gap-2">
                            <Trash2 className="w-4 h-4" /> Delete "{assignment.name}"?
                          </p>
                          <p className="text-xs text-red-700 dark:text-red-400/80 mt-1">This action cannot be undone.</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setDeletingAssignmentId(null)} className="px-3 py-1.5 rounded-md text-xs font-medium border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors">
                            Cancel
                          </button>
                          <button
                            onClick={() => deleteAssignmentMutation.mutate(assignment._id)}
                            disabled={deleteAssignmentMutation.isPending}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50"
                          >
                            {deleteAssignmentMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirm'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* ── Normal View ── */
                      <div className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-[15px] font-semibold text-slate-900 dark:text-[#f0f2f5] mb-1.5 flex items-center gap-2">
                            {assignment.name}
                            {assignment.dueDate && new Date(assignment.dueDate) > new Date() && (
                              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-emerald-100 text-emerald-700 dark:bg-[#064e3b] dark:text-[#34d399]">Active</span>
                            )}
                          </h3>
                          <p className="text-slate-500 dark:text-[#8b95a2] text-sm max-w-2xl line-clamp-2">{assignment.description}</p>
                        </div>
                        <div className="flex flex-col items-start sm:items-end gap-2 text-xs font-medium">
                          {assignment.dueDate && (
                            <div className="flex items-center text-slate-600 dark:text-[#8b95a2] bg-slate-50 dark:bg-[#1a1d24] px-2.5 py-1.5 rounded border border-slate-200 dark:border-[#242830]">
                              <Calendar className="mr-1.5 h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                              Due: {new Date(assignment.dueDate).toLocaleDateString()} {new Date(assignment.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                          <div className="flex items-center text-slate-600 dark:text-[#8b95a2] bg-slate-50 dark:bg-[#1a1d24] px-2.5 py-1.5 rounded border border-slate-200 dark:border-[#242830]">
                            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                            Marks: {assignment.maxMarks}
                          </div>
                          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                            <button
                              onClick={() => startEditAssignment(assignment)}
                              className="px-2.5 py-1.5 rounded text-slate-500 hover:bg-slate-100 hover:text-blue-600 dark:text-[#8b95a2] dark:hover:bg-[#242830] dark:hover:text-blue-400 border border-slate-200 dark:border-[#383e4a] text-xs font-semibold transition-colors flex items-center gap-1"
                            >
                              <Pencil className="w-3 h-3" /> Edit
                            </button>
                            <button
                              onClick={() => setDeletingAssignmentId(assignment._id)}
                              className="px-2.5 py-1.5 rounded text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-[#8b95a2] dark:hover:bg-[#2d0f0f] dark:hover:text-red-400 border border-slate-200 dark:border-[#383e4a] text-xs font-semibold transition-colors flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" /> Delete
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-50">
                {[1, 2, 3].map(n => <div key={n} className="h-20 rounded-xl bg-slate-100 dark:bg-[#13151a] border border-slate-200 dark:border-[#242830] animate-pulse" />)}
              </div>
            ) : studentStats.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 dark:border-[#242830] bg-slate-50 dark:bg-[#1a1d24] p-12 text-center">
                <Users className="w-10 h-10 text-slate-400 dark:text-[#5a6474] mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-[#f0f2f5]">No Students Enrolled</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-[#8b95a2]">An admin needs to add students to this batch first.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {studentStats.map((student: any) => {
                  const pctColor = student.percentage >= 75 ? 'text-emerald-600 dark:text-[#10b981]' : student.percentage >= 50 ? 'text-amber-600 dark:text-[#f59e0b]' : 'text-red-600 dark:text-[#ef4444]';
                  const barColor = student.percentage >= 75 ? 'bg-emerald-500 dark:bg-[#10b981]' : student.percentage >= 50 ? 'bg-amber-500 dark:bg-[#f59e0b]' : 'bg-red-500 dark:bg-[#ef4444]';
                  return (
                    <div key={student.studentId} className="rounded-xl bg-white dark:bg-[#13151a] border border-slate-200 dark:border-[#242830] p-4 hover:border-slate-300 dark:hover:border-[#5a6474] transition-all flex flex-col justify-between">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-[#1a1d24] flex items-center justify-center text-slate-500 dark:text-[#8b95a2] font-semibold text-sm shrink-0 border border-slate-200 dark:border-[#242830]">
                          {student.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-[#f0f2f5] truncate">{student.name}</h4>
                          <p className="text-xs text-slate-500 dark:text-[#8b95a2] truncate">{student.email}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`text-lg font-bold ${pctColor}`}>{student.percentage}%</span>
                          <p className="text-[10px] text-slate-500 dark:text-[#5a6474] uppercase font-semibold">{student.attendedClasses}/{student.totalClasses} classes</p>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-[#1a1d24] rounded-full h-1.5 overflow-hidden">
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
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-[#5a6474]" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-[#242830] bg-white dark:bg-[#13151a] text-slate-900 dark:text-[#f0f2f5] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors text-sm"
                />
              </div>
              {dateFilter && (
                <button
                  onClick={() => setDateFilter('')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-[#242830] bg-white dark:bg-[#13151a] text-slate-600 dark:text-[#8b95a2] hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#1a1d24] transition-colors text-sm font-medium"
                >
                  <X className="w-4 h-4" /> Clear
                </button>
              )}
            </div>

            {isLoadingSessions ? (
              <div className="space-y-4 opacity-50">
                {[1, 2].map(n => <div key={n} className="h-40 rounded-xl bg-slate-100 dark:bg-[#13151a] border border-slate-200 dark:border-[#242830] animate-pulse" />)}
              </div>
            ) : sessions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 dark:border-[#242830] bg-slate-50 dark:bg-[#1a1d24] p-12 text-center">
                <ClipboardList className="w-10 h-10 text-slate-400 dark:text-[#5a6474] mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-[#f0f2f5]">{dateFilter ? 'No Classes on This Date' : 'No Classes Recorded'}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-[#8b95a2]">
                  {dateFilter ? 'Try selecting a different date, or clear the filter.' : 'Click "Start Today\'s Class" to mark attendance.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session: any) => {
                  const presentCount = session.attendance.filter((a: any) => a.status === 'present').length;
                  const totalCount = session.attendance.length;
                  return (
                    <div key={session._id} className="rounded-xl bg-white dark:bg-[#13151a] border border-slate-200 dark:border-[#242830] overflow-hidden">
                      <div className="px-5 py-4 border-b border-slate-100 dark:border-[#242830] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-[#1a1d24]/50">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-[#064e3b]/30 flex items-center justify-center border border-emerald-100 dark:border-[#065f46]">
                            <Calendar className="w-4 h-4 text-emerald-600 dark:text-[#34d399]" />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-[#f0f2f5]">
                              {new Date(session.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                            </h3>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#5a6474]">
                              {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <div className="px-2.5 py-1 rounded bg-white dark:bg-[#13151a] border border-slate-200 dark:border-[#383e4a] text-xs font-medium text-slate-600 dark:text-[#8b95a2]">
                          <span className="text-emerald-600 dark:text-[#34d399] font-bold">{presentCount}</span> / {totalCount} Present
                        </div>
                      </div>
                      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                              className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all text-left ${
                                isPresent
                                  ? 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100 dark:bg-[#064e3b]/20 dark:border-[#065f46] dark:hover:bg-[#064e3b]/40'
                                  : 'bg-red-50 border-red-200 hover:bg-red-100 dark:bg-[#450a0a]/20 dark:border-[#7f1d1d] dark:hover:bg-[#450a0a]/40'
                              }`}
                            >
                              {isPresent ? (
                                <UserCheck className="w-4 h-4 text-emerald-600 dark:text-[#34d399] shrink-0" />
                              ) : (
                                <UserX className="w-4 h-4 text-red-600 dark:text-[#f87171] shrink-0" />
                              )}
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-900 dark:text-[#f0f2f5] truncate">{record.student?.name || 'Unknown'}</p>
                                <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${isPresent ? 'text-emerald-700 dark:text-[#6ee7b7]' : 'text-red-700 dark:text-[#fca5a5]'}`}>
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
                {[1, 2, 3].map(n => <div key={n} className="h-20 rounded-xl bg-slate-100 dark:bg-[#13151a] border border-slate-200 dark:border-[#242830] animate-pulse" />)}
              </div>
            ) : studentVideoProgress.length === 0 ? (
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
                    <span className="text-slate-400 dark:text-[#5a6474] text-xs font-medium">— {studentVideoProgress[0]?.totalLectures ?? 0} total lectures</span>
                  </div>
                )}
                {studentVideoProgress.map((student: any) => {
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

      <AddAssignmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} batchId={id as string} />
    </div>
  );
};
