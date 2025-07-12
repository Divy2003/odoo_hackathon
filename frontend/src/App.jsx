import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './redux/store'
import './styles/App.css'

// Components
import Navbar from './components/layout/Navbar'
import Home from './components/questions/Home'
import Login from './components/auth/Login'
import Signup from './components/auth/Signup'
import ProtectedRoute from './components/auth/ProtectedRoute'

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected Routes */}
              <Route
                path="/ask"
                element={
                  <ProtectedRoute>
                    <div>Ask Question Page (Coming Soon)</div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <div>Profile Page (Coming Soon)</div>
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly>
                    <div>Admin Dashboard (Coming Soon)</div>
                  </ProtectedRoute>
                }
              />

              {/* 404 Route */}
              <Route path="*" element={<div>Page Not Found</div>} />
            </Routes>
          </main>
        </div>
      </Router>
    </Provider>
  )
}

export default App
