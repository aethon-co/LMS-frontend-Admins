import './App.css'
import { createBrowserRouter, RouterProvider, Navigate } from "react-router";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/authContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';

const queryClient = new QueryClient();

import { AdminDashboard } from './pages/admin/AdminDashboard';
import { CourseDetails } from './pages/admin/CourseDetails';
import { BatchDetails } from './pages/admin/BatchDetails';
import { TutorDashboard } from './pages/tutor/TutorDashboard';
import { TutorBatchDetails } from './pages/tutor/TutorBatchDetails';
import { DashboardLayout } from './components/layout/DashboardLayout';

const Unauthorized = () => <div className="p-8 text-center text-2xl text-red-600">Unauthorized Access</div>;

const HomeRedirect = () => {
  const { role } = useAuth();
  if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (role === 'tutor') return <Navigate to="/tutor/dashboard" replace />;
  return <div className="p-8 text-center text-2xl">Must be logged in</div>;
};

function App() {

  const router = createBrowserRouter([
    {
      path: "/signup",
      element: <Signup />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/unauthorized",
      element: <Unauthorized />,
    },
    // Admin Routes
    {
      element: <ProtectedRoute allowedRoles={['admin']} />,
      children: [
        {
          element: <DashboardLayout />,
          children: [
            {
              path: "/admin/dashboard",
              element: <AdminDashboard />,
            },
            {
              path: "/admin/course/:id",
              element: <CourseDetails />,
            },
            {
              path: "/admin/batch/:id",
              element: <BatchDetails />,
            }
          ]
        }
      ]
    },
    // Tutor Routes
    {
      element: <ProtectedRoute allowedRoles={['tutor']} />,
      children: [
        {
          element: <DashboardLayout />,
          children: [
            {
              path: "/tutor/dashboard",
              element: <TutorDashboard />,
            },
            {
              path: "/tutor/batch/:id",
              element: <TutorBatchDetails />,
            }
          ]
        }
      ]
    },
    // Shared Protected Routes
    {
      element: <ProtectedRoute />,
      children: [
        {
          path: "/",
          element: <HomeRedirect />,
        }
      ]
    }
  ]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App