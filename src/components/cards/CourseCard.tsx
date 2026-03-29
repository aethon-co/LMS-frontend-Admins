import React from 'react';
import { Link } from 'react-router';
import { BookOpen, ChevronRight } from 'lucide-react';

interface CourseProps {
  course: {
    _id: string;
    name: string;
    description: string;
    thumbnail?: string;
  }
}

export const CourseCard: React.FC<CourseProps> = ({ course }) => {
  return (
    <Link to={`/admin/course/${course._id}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm transition-all hover:bg-slate-800 hover:border-indigo-500/50 hover:shadow-[0_0_20px_rgba(79,70,229,0.15)] flex flex-col h-full">
        {/* Placeholder Thumbnail */}
        <div className="h-40 w-full bg-slate-700/50 relative overflow-hidden">
          {course.thumbnail ? (
            <img src={course.thumbnail} alt={course.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="flex w-full h-full items-center justify-center bg-gradient-to-br from-indigo-900/40 to-purple-900/40">
              <BookOpen className="w-12 h-12 text-indigo-400/50 transition-transform duration-500 group-hover:scale-110 group-hover:text-indigo-400" />
            </div>
          )}
        </div>
        
        {/* Course Info */}
        <div className="p-6 flex flex-col flex-grow">
          <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">{course.name}</h3>
          <p className="mt-2 text-sm text-slate-400 line-clamp-2 flex-grow">{course.description}</p>
          
          <div className="mt-6 flex items-center justify-between text-indigo-400 font-medium text-sm">
            <span>Manage course</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  );
};