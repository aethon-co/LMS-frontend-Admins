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
    <Link to={`/admin/course/${course._id}`} className="group block h-full">
      <div className="overflow-hidden rounded-xl bg-white dark:bg-[#13151a] border border-slate-200 dark:border-[#242830] transition-all hover:shadow-md hover:border-slate-300 dark:hover:border-[#5a6474] flex flex-col h-full">
        {/* Placeholder Thumbnail */}
        <div className="h-32 w-full bg-slate-100 dark:bg-[#1a1d24] relative overflow-hidden border-b border-slate-200 dark:border-[#242830]">
          {course.thumbnail ? (
            <img src={course.thumbnail} alt={course.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="flex w-full h-full items-center justify-center">
              <BookOpen className="w-10 h-10 text-slate-300 dark:text-[#5a6474] transition-transform duration-500 group-hover:scale-110" />
            </div>
          )}
        </div>
        
        {/* Course Info */}
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-[#f0f2f5] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">{course.name}</h3>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-[#8b95a2] line-clamp-2 flex-grow">{course.description}</p>
          
          <div className="mt-5 flex items-center justify-between text-blue-600 dark:text-blue-400 font-medium text-sm">
            <span>Manage course</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  );
};