import './App.css'
import { createBrowserRouter, RouterProvider } from "react-router";

function App() {

  const router = createBrowserRouter([
    {
      path: "/",
      element: <div>Hello world!</div>,
    },
  ]);

  return (
    <RouterProvider router={router} />
  )
}

export default App