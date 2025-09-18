import './App.css'
import Auth_page from './Pages/Auth/Auth_page';
import TodoApp from './Pages/Home_page/TodoApp';
import {RouterProvider, createBrowserRouter, Outlet} from 'react-router-dom'

function App() {

  const Dashboard = ()=>{
    return <Outlet />;
  }

  const router = createBrowserRouter([
    {
      path: '/',
      element: <Auth_page />
    },
    {
      path: '/home',
      element: <TodoApp />
    },
  ])

  return (
    <div className='App'>
      <RouterProvider router={router} />
    </div>
  )
}

export default App
