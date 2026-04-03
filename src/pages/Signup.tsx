import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import { useAuth, type Role } from '../context/authContext';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';

export const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin' as Role
  });
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const signupMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const endpoint = data.role === 'admin' 
        ? 'http://localhost:3000/api/admin/auth/signup'
        : 'http://localhost:3000/api/tutor/auth/signup';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
      });

      const respData = await response.json();

      if (!response.ok) {
        throw new Error(respData.message || 'Signup failed');
      }

      return { userObj: data.role === 'admin' ? respData.admin : respData.tutor, token: respData.token, role: data.role };
    },
    onSuccess: ({ userObj, token, role }) => {
      login(userObj, token, role);
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/tutor/dashboard');
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signupMutation.mutate(formData);
  };

  const handleRoleSelect = (roleSelection: Role) => {
    setFormData(prev => ({ ...prev, role: roleSelection }));
  };

  return (
    <div className="flex min-h-screen bg-slate-900 font-sans text-slate-100">
      {/* Visual Left Side */}
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-blue-600 via-sky-700 to-slate-900 p-12 lg:flex relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
        <div className="z-10">
          <div className="flex items-center gap-2 text-2xl font-bold tracking-tight text-white">
            <img src="/logo.svg" alt="LogicBox LMS" className="h-10 w-auto" />
          </div>
        </div>
        <div className="z-10 max-w-lg">
          <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight text-white">
            Start shaping the future of education.
          </h1>
          <p className="text-lg text-blue-100/80">
            Join the platform built for seamless administration and powerful tutoring experiences. Create your account today.
          </p>
        </div>
        <div className="z-10 text-sm font-medium text-blue-200">
          &copy; {new Date().getFullYear()} LogicBox. All rights reserved.
        </div>
      </div>

      {/* Form Right Side */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-white">Create an account</h2>
            <p className="mt-2 text-sm text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {signupMutation.isError && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 backdrop-blur-sm animate-in fade-in slide-in-from-top-2">
                {signupMutation.error instanceof Error ? signupMutation.error.message : 'An error occurred'}
              </div>
            )}
            
            <div className="space-y-4">
              {/* Role Selection Tabs */}
              <div className="flex p-1 space-x-1 bg-slate-800/50 rounded-xl backdrop-blur-sm border border-slate-700/50">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('admin')}
                  className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all duration-200 ${
                    formData.role === 'admin'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
                  }`}
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSelect('tutor')}
                  className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all duration-200 ${
                    formData.role === 'tutor'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
                  }`}
                >
                  Tutor
                </button>
              </div>

              {/* Name Input */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 group-focus-within:text-blue-400 transition-colors">
                  <User className="h-5 w-5" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="block w-full rounded-xl border border-slate-700 bg-slate-800/50 px-3 py-3 pl-10 text-slate-200 placeholder-slate-400 focus:border-blue-500 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all sm:text-sm"
                  placeholder="Full name"
                />
              </div>

              {/* Email Input */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 group-focus-within:text-blue-400 transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="block w-full rounded-xl border border-slate-700 bg-slate-800/50 px-3 py-3 pl-10 text-slate-200 placeholder-slate-400 focus:border-blue-500 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all sm:text-sm"
                  placeholder="Email address"
                />
              </div>

              {/* Password Input */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 group-focus-within:text-blue-400 transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="block w-full rounded-xl border border-slate-700 bg-slate-800/50 px-3 py-3 pl-10 text-slate-200 placeholder-slate-400 focus:border-blue-500 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all sm:text-sm"
                  placeholder="Password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={signupMutation.isPending}
                className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:bg-blue-600/50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(79,70,229,0.5)] hover:shadow-[0_0_25px_rgba(79,70,229,0.7)]"
              >
                {signupMutation.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
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
