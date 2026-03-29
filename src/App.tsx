import './App.css'
import { createBrowserRouter, RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/authContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';

const queryClient = new QueryClient();

import { AdminDashboard } from './pages/admin/AdminDashboard';
import { CourseDetails } from './pages/admin/CourseDetails';
import { BatchDetails } from './pages/admin/BatchDetails';

const TutorDashboard = () => <div className="p-8 text-center text-2xl text-green-600">Tutor Dashboard - Protected</div>;
const Unauthorized = () => <div className="p-8 text-center text-2xl text-red-600">Unauthorized Access</div>;

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
    },
    // Tutor Routes
    {
      element: <ProtectedRoute allowedRoles={['tutor']} />,
      children: [
        {
          path: "/tutor/dashboard",
          element: <TutorDashboard />,
        }
      ]
    },
    // Shared Protected Routes
    {
      element: <ProtectedRoute />,
      children: [
        {
          path: "/",
          element: <div className="p-8 text-center text-2xl">Home - Must be logged in</div>,
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