import React, { useState } from 'react';
import { useParams, Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, PlayCircle, Users, Video, Pencil, Trash2, X, Check, Loader2 } from 'lucide-react';
import { getCourseById, getBatchByCourse, getCourseLectures, updateCourseLecture, deleteCourseLecture } from '../../api';
import { AddBatchModal } from '../../components/modals/AddBatchModal';
import { AddVideoModal } from '../../components/modals/AddVideoModal';
import { BatchCard } from '../../components/cards/BatchCard';

export const CourseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'batches' | 'videos'>('batches');
  const [isAddBatchOpen, setIsAddBatchOpen] = useState(false);
  const [isAddVideoOpen, setIsAddVideoOpen] = useState(false);

  // Edit state
  const [editingLectureId, setEditingLectureId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editOrder, setEditOrder] = useState<number>(0);

  // Delete state  
  const [deletingLectureId, setDeletingLectureId] = useState<string | null>(null);

  const { data: courseData, isLoading: isLoadingCourse } = useQuery({
    queryKey: ['course', id],
    queryFn: () => getCourseById(id!),
    enabled: !!id,
  });

  const { data: batchesData, isLoading: isLoadingBatches } = useQuery({
    queryKey: ['batches', id],
    queryFn: () => getBatchByCourse(id!),
    enabled: !!id,
  });

  const { data: lecturesData, isLoading: isLoadingLectures } = useQuery({
    queryKey: ['course-lectures', id],
    queryFn: () => getCourseLectures(id!),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: ({ lectureId, data }: { lectureId: string; data: any }) => updateCourseLecture(lectureId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-lectures', id] });
      setEditingLectureId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (lectureId: string) => deleteCourseLecture(lectureId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-lectures', id] });
      setDeletingLectureId(null);
    },
  });

  const course = courseData?.course || null;
  const batches = batchesData?.batches || [];
  const lectures = lecturesData?.lectures || [];

  const startEdit = (lecture: any) => {
    setEditingLectureId(lecture._id);
    setEditTitle(lecture.title);
    setEditDescription(lecture.description || '');
    setEditOrder(lecture.order ?? 0);
  };

  const saveEdit = () => {
    if (!editingLectureId) return;
    updateMutation.mutate({
      lectureId: editingLectureId,
      data: { title: editTitle, description: editDescription, order: editOrder },
    });
  };

  if (isLoadingCourse) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin" />
          <p className="text-slate-400 font-medium tracking-wide">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 flex items-center justify-center text-red-400">
        Course not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100">
      {/* Header section */}
      <div className="bg-slate-900 border-b border-slate-800 px-8 pt-8 pb-0">
        <div className="max-w-7xl mx-auto">
          <Link to="/admin/dashboard" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-blue-400 transition-colors mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">{course.name}</h1>
              <p className="text-lg text-slate-400 max-w-2xl">{course.description}</p>
            </div>
            {activeTab === 'batches' && (
              <button
                onClick={() => setIsAddBatchOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all hover:shadow-[0_0_15px_rgba(79,70,229,0.4)] whitespace-nowrap"
              >
                <Plus className="h-5 w-5" />
                Create Batch
              </button>
            )}
            {activeTab === 'videos' && (
              <button
                onClick={() => setIsAddVideoOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all hover:shadow-[0_0_15px_rgba(79,70,229,0.4)] whitespace-nowrap"
              >
                <Plus className="h-5 w-5" />
                Upload Video
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('batches')}
              className={`pb-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'batches'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-700'
              }`}
            >
              <Users className="w-4 h-4" />
              Batches
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`pb-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'videos'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-700'
              }`}
            >
              <PlayCircle className="w-4 h-4" />
              Videos
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-8">
        {activeTab === 'videos' ? (
          <div>
            {isLoadingLectures ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60">
                {[1, 2, 3].map(n => (
                  <div key={n} className="h-[120px] rounded-2xl bg-slate-800/50 animate-pulse" />
                ))}
              </div>
            ) : lectures.length === 0 ? (
              <div className="rounded-2xl border border-slate-700/50 bg-slate-800/20 p-12 text-center flex flex-col items-center justify-center">
                <Video className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-200">No videos uploaded</h3>
                <p className="mt-2 text-sm text-slate-400 max-w-sm mx-auto">Click "Upload Video" to add your first lecture to this course.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {lectures.map((lecture: any) => (
                  <div key={lecture._id} className="group rounded-2xl bg-slate-800/50 border border-slate-700/50 transition-all hover:border-blue-500/30 overflow-hidden">
                    {editingLectureId === lecture._id ? (
                      /* ── Inline Edit Form ── */
                      <div className="p-6 space-y-4 bg-slate-900/60">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Edit Lecture</h4>
                          <button onClick={() => setEditingLectureId(null)} className="text-slate-500 hover:text-slate-200 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="md:col-span-2">
                            <label className="text-xs font-medium text-slate-400 mb-1 block">Title</label>
                            <input
                              value={editTitle}
                              onChange={e => setEditTitle(e.target.value)}
                              className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-slate-400 mb-1 block">Order</label>
                            <input
                              type="number"
                              value={editOrder}
                              onChange={e => setEditOrder(Number(e.target.value))}
                              className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-400 mb-1 block">Description</label>
                          <textarea
                            value={editDescription}
                            onChange={e => setEditDescription(e.target.value)}
                            rows={2}
                            className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                          />
                        </div>
                        <div className="flex gap-3 justify-end">
                          <button
                            onClick={() => setEditingLectureId(null)}
                            className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={saveEdit}
                            disabled={updateMutation.isPending}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50"
                          >
                            {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            Save
                          </button>
                        </div>
                      </div>
                    ) : deletingLectureId === lecture._id ? (
                      /* ── Delete Confirm ── */
                      <div className="p-6 flex items-center justify-between bg-red-950/30 border-red-500/20">
                        <div>
                          <p className="font-semibold text-red-300">Delete "{lecture.title}"?</p>
                          <p className="text-xs text-red-400/70 mt-0.5">This action cannot be undone.</p>
                        </div>
                        <div className="flex gap-3">
                          <button onClick={() => setDeletingLectureId(null)} className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors">
                            Cancel
                          </button>
                          <button
                            onClick={() => deleteMutation.mutate(lecture._id)}
                            disabled={deleteMutation.isPending}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-50"
                          >
                            {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            Delete
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* ── Normal View ── */
                      <div className="p-5 flex items-start gap-4">
                        <div className="w-12 h-12 shrink-0 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                          <PlayCircle className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            {lecture.order !== undefined && (
                              <span className="text-xs font-bold text-slate-500">#{lecture.order}</span>
                            )}
                            <h4 className="text-lg font-semibold text-slate-200 truncate group-hover:text-white transition-colors">{lecture.title}</h4>
                          </div>
                          <p className="mt-1 text-sm text-slate-400 line-clamp-2">{lecture.description}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEdit(lecture)}
                            className="p-2 rounded-lg bg-slate-700/50 hover:bg-blue-500/20 hover:text-blue-400 text-slate-400 transition-colors border border-slate-600/50"
                            title="Edit lecture"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingLectureId(lecture._id)}
                            className="p-2 rounded-lg bg-slate-700/50 hover:bg-red-500/20 hover:text-red-400 text-slate-400 transition-colors border border-slate-600/50"
                            title="Delete lecture"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {isLoadingBatches ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60">
                {[1, 2, 3].map(n => (
                  <div key={n} className="h-[200px] rounded-2xl bg-slate-800/50 animate-pulse" />
                ))}
              </div>
            ) : batches.length === 0 ? (
              <div className="rounded-2xl border border-slate-700/50 bg-slate-800/20 p-12 text-center flex flex-col items-center justify-center">
                <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-200">No batches created</h3>
                <p className="mt-2 text-sm text-slate-400 max-w-sm mx-auto">Create a batch to start organizing students and tutors for this course.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {batches.map((batch: any) => (
                  <BatchCard key={batch._id} batch={batch} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <AddBatchModal courseId={id!} isOpen={isAddBatchOpen} onClose={() => setIsAddBatchOpen(false)} />
      <AddVideoModal courseId={id!} isOpen={isAddVideoOpen} onClose={() => setIsAddVideoOpen(false)} />
    </div>
  );
};
