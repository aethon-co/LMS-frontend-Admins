import React, { useState, useRef } from 'react';
import { X, Loader2, UploadCloud, FileVideo } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getLectureUploadUrl, uploadFileToS3 } from '../../api';

interface AddVideoModalProps {
  courseId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const AddVideoModal: React.FC<AddVideoModalProps> = ({ courseId, isOpen, onClose }) => {
  const [formData, setFormData] = useState({ title: '', description: '', order: 0 });
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Please select a video file.");
      
      // 1. Get presigned URL and save metadata
      const { uploadUrl } = await getLectureUploadUrl({
        courseId,
        fileName: file.name,
        contentType: file.type,
        title: formData.title,
        description: formData.description,
        order: formData.order,
      });

      // 2. Upload to S3 directly
      await uploadFileToS3(uploadUrl, file, (pct) => setUploadProgress(pct));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-lectures', courseId] });
      setFormData({ title: '', description: '', order: 0 });
      setFile(null);
      setUploadProgress(0);
      onClose();
    },
    onError: () => {
        setUploadProgress(0); // reset on error
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
        alert("Please select a video file to upload.");
        return;
    }
    uploadMutation.mutate();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setFile(e.target.files[0]);
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-slate-900 rounded-2xl border border-slate-700/50 shadow-2xl relative animate-in zoom-in-95">
        {!uploadMutation.isPending && (
          <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        )}
        
        <div className="p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Upload Video Lecture</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {uploadMutation.isError && (
               <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                 {uploadMutation.error instanceof Error ? uploadMutation.error.message : 'Error uploading video'}
               </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Lecture Title</label>
              <input
                type="text"
                required
                disabled={uploadMutation.isPending}
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-50"
                placeholder="e.g. Introduction to Variables"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
              <textarea
                required
                rows={2}
                disabled={uploadMutation.isPending}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors resize-none disabled:opacity-50"
                placeholder="Brief summary of the video content..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Order Index (optional)</label>
              <input
                type="number"
                disabled={uploadMutation.isPending}
                value={formData.order}
                onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-50"
              />
            </div>

            {/* File Upload Zone */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Video File</label>
              <div 
                className={`w-full rounded-xl border-2 border-dashed ${file ? 'border-blue-500/50 bg-blue-500/5' : 'border-slate-700 bg-slate-800/20 hover:border-slate-500 cursor-pointer'} p-6 text-center transition-colors relative`}
                onClick={() => !uploadMutation.isPending && fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="video/*" 
                  className="hidden" 
                  disabled={uploadMutation.isPending}
                />
                
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileVideo className="w-10 h-10 text-blue-400" />
                    <p className="text-sm font-semibold text-slate-200 truncate w-full px-4">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <UploadCloud className="w-10 h-10 mb-1 opacity-70" />
                    <p className="text-sm font-medium">Click to select video</p>
                    <p className="text-xs">MP4, WebM, or OGG up to 2GB</p>
                  </div>
                )}
              </div>
            </div>

            {uploadMutation.isPending && (
                <div className="w-full bg-slate-800 rounded-full h-2.5 mt-4 overflow-hidden border border-slate-700">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out flex items-center justify-end"
                    style={{ width: `${uploadProgress}%` }}
                  >
                     {uploadProgress > 10 && <span className="text-[10px] text-white font-bold px-1.5">{uploadProgress}%</span>}
                  </div>
                </div>
            )}

            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={uploadMutation.isPending}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploadMutation.isPending || !file}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-sm font-medium text-white hover:bg-blue-500 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      Upload Video
                    </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
