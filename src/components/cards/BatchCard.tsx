import React from 'react';
import { Link } from 'react-router';
import { Users, BookOpen } from 'lucide-react';

interface BatchProps {
  batch: {
    _id: string;
    name: string;
    students: string[];
    course: string;
  }
}

export const BatchCard: React.FC<BatchProps> = ({ batch }) => {
  return (
    <Link to={`/admin/batch/${batch._id}`} className="group block h-full">
      <div className="bg-white dark:bg-[#13151a] border border-slate-200 dark:border-[#242830] rounded-xl p-5 transition-all hover:shadow-md hover:border-slate-300 dark:hover:border-[#5a6474] flex flex-col h-full">
        
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-[#1e2a3d] flex items-center justify-center border border-blue-100 dark:border-[#2d4a7a] transition-all">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400 font-medium" />
          </div>
        </div>
        
        <h3 className="text-base font-semibold text-slate-900 dark:text-[#f0f2f5] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1 line-clamp-1">
          {batch.name}
        </h3>
        
        <div className="mt-auto flex items-center pt-4 text-slate-500 dark:text-[#8b95a2] text-xs font-semibold uppercase tracking-widest">
          <Users className="w-3.5 h-3.5 mr-1.5" />
          {batch.students?.length || 0} Students
        </div>
        
      </div>
    </Link>
  );
};
