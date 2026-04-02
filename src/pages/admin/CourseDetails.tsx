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
      <div className="flex items-center justify-center p-12">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-slate-500 dark:text-[#8b95a2] font-medium">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center p-12 text-red-600 dark:text-[#ef4444] font-medium">
        Course not found
      </div>
    );
  }

  return (
    <div className="font-sans text-slate-900 dark:text-[#f0f2f5] animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header section */}
      <div className="border-b border-slate-200 dark:border-[#242830] pb-6 mb-8">
        <Link to="/admin/dashboard" className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Dashboard
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-[#f0f2f5] mb-2">{course.name}</h1>
            <p className="text-base text-slate-500 dark:text-[#8b95a2] max-w-2xl">{course.description}</p>
          </div>
          {activeTab === 'batches' && (
            <button
              onClick={() => setIsAddBatchOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-all dark:hover:bg-blue-500 whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              Create Batch
            </button>
          )}
          {activeTab === 'videos' && (
            <button
              onClick={() => setIsAddVideoOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-all dark:hover:bg-blue-500 whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              Upload Video
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex space-x-6 h-full">
          <button
            onClick={() => setActiveTab('batches')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'batches'
                ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-[#8b95a2] dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            Batches
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'videos'
                ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-[#8b95a2] dark:hover:text-white'
            }`}
          >
            <PlayCircle className="w-4 h-4" />
            Videos
          </button>
        </div>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'videos' ? (
          <div>
            {isLoadingLectures ? (
              <div className="grid grid-cols-1 gap-4 opacity-50">
                {[1, 2, 3].map(n => (
                  <div key={n} className="h-24 rounded-xl bg-slate-100 dark:bg-[#13151a] border border-slate-200 dark:border-[#242830] animate-pulse" />
                ))}
              </div>
            ) : lectures.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 dark:border-[#242830] bg-slate-50 dark:bg-[#1a1d24] p-12 text-center flex flex-col items-center justify-center">
                <Video className="w-10 h-10 text-slate-400 dark:text-[#5a6474] mb-3" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">No videos uploaded</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-[#8b95a2] max-w-sm mx-auto">Click "Upload Video" to add your first lecture to this course.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {lectures.map((lecture: any) => (
                  <div key={lecture._id} className="group rounded-xl bg-white dark:bg-[#13151a] border border-slate-200 dark:border-[#242830] transition-all hover:border-slate-300 dark:hover:border-[#5a6474] flex flex-col overflow-hidden">
                    {editingLectureId === lecture._id ? (
                      /* ── Inline Edit Form ── */
                      <div className="p-5 space-y-4 bg-slate-50 dark:bg-[#1a1d24]">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-xs font-bold text-slate-500 dark:text-[#8b95a2] uppercase tracking-wider">Edit Lecture</h4>
                          <button onClick={() => setEditingLectureId(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="md:col-span-2">
                            <label className="text-xs font-medium text-slate-700 dark:text-[#8b95a2] mb-1.5 block">Title</label>
                            <input
                              value={editTitle}
                              onChange={e => setEditTitle(e.target.value)}
                              className="w-full rounded-md bg-white dark:bg-[#13151a] border border-slate-300 dark:border-[#242830] px-3 py-2 text-sm text-slate-900 dark:text-[#f0f2f5] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-slate-700 dark:text-[#8b95a2] mb-1.5 block">Order</label>
                            <input
                              type="number"
                              value={editOrder}
                              onChange={e => setEditOrder(Number(e.target.value))}
                              className="w-full rounded-md bg-white dark:bg-[#13151a] border border-slate-300 dark:border-[#242830] px-3 py-2 text-sm text-slate-900 dark:text-[#f0f2f5] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-700 dark:text-[#8b95a2] mb-1.5 block">Description</label>
                          <textarea
                            value={editDescription}
                            onChange={e => setEditDescription(e.target.value)}
                            rows={2}
                            className="w-full rounded-md bg-white dark:bg-[#13151a] border border-slate-300 dark:border-[#242830] px-3 py-2 text-sm text-slate-900 dark:text-[#f0f2f5] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                          />
                        </div>
                        <div className="flex gap-2 justify-end pt-2">
                          <button
                            onClick={() => setEditingLectureId(null)}
                            className="px-3 py-1.5 rounded-md text-sm font-medium border border-slate-300 dark:border-[#242830] text-slate-700 dark:text-[#f0f2f5] hover:bg-slate-50 dark:hover:bg-[#242830] transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={saveEdit}
                            disabled={updateMutation.isPending}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white transition-colors disabled:opacity-50"
                          >
                            {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            Save
                          </button>
                        </div>
                      </div>
                    ) : deletingLectureId === lecture._id ? (
                      /* ── Delete Confirm ── */
                      <div className="p-5 flex items-center justify-between bg-red-50 dark:bg-[#2d0f0f] border-b border-red-100 dark:border-[#7f1d1d]">
                        <div>
                          <p className="font-medium text-sm text-red-900 dark:text-red-300 flex items-center gap-2">
                            <Trash2 className="w-4 h-4" /> Delete "{lecture.title}"?
                          </p>
                          <p className="text-xs text-red-700 dark:text-red-400/80 mt-1">This action cannot be undone and will remove video from storage.</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setDeletingLectureId(null)} className="px-3 py-1.5 rounded-md text-xs font-medium border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors">
                            Cancel
                          </button>
                          <button
                            onClick={() => deleteMutation.mutate(lecture._id)}
                            disabled={deleteMutation.isPending}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50"
                          >
                            {deleteMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirm'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* ── Normal View ── */
                      <div className="p-4 flex items-start gap-4">
                        <div className="w-10 h-10 shrink-0 rounded-lg bg-slate-100 dark:bg-[#1a1d24] flex items-center justify-center">
                          <PlayCircle className="w-5 h-5 text-slate-400 dark:text-[#5a6474]" />
                        </div>
                        <div className="min-w-0 flex-1 pt-0.5">
                          <div className="flex items-center gap-2 mb-1">
                            {lecture.order !== undefined && (
                              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-[#1a1d24] dark:text-[#8b95a2] px-1.5 py-0.5 rounded">#{lecture.order}</span>
                            )}
                            <h4 className="text-sm font-medium text-slate-900 dark:text-[#f0f2f5] truncate">{lecture.title}</h4>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-[#8b95a2] line-clamp-1">{lecture.description}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEdit(lecture)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-[#1e2a3d] transition-colors"
                            title="Edit lecture"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingLectureId(lecture._id)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-[#2d0f0f] transition-colors"
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-50">
                {[1, 2, 3].map(n => (
                  <div key={n} className="h-40 rounded-xl bg-slate-100 dark:bg-[#13151a] border border-slate-200 dark:border-[#242830] animate-pulse" />
                ))}
              </div>
            ) : batches.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 dark:border-[#242830] bg-slate-50 dark:bg-[#1a1d24] p-12 text-center flex flex-col items-center justify-center">
                <Users className="w-10 h-10 text-slate-400 dark:text-[#5a6474] mb-3" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-[#f0f2f5]">No batches created</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-[#8b95a2] max-w-sm mx-auto">Create a batch to start organizing students and tutors for this course.</p>
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
