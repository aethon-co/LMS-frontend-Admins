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
    <Link to={`/admin/batch/${batch._id}`} className="group block">
      <div className="bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm rounded-2xl p-6 transition-all hover:bg-slate-800 hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(79,70,229,0.15)] flex flex-col h-full">
        
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all">
            <BookOpen className="w-6 h-6 text-blue-400 group-hover:text-blue-300 transition-colors" />
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors mb-2 line-clamp-1">
          {batch.name}
        </h3>
        
        <div className="mt-auto flex items-center mt-6 text-slate-400 text-sm font-medium">
          <Users className="w-4 h-4 mr-2" />
          {batch.students?.length || 0} Students Enrolled
        </div>
        
      </div>
    </Link>
  );
};
