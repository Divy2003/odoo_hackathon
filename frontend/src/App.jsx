import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './redux/store'
import './styles/App.css'

// Components
import Navbar from './components/layout/Navbar'
import ProtectedRoute from './components/auth/ProtectedRoute'

// Pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import AskQuestionPage from './pages/AskQuestionPage'
import QuestionDetailPage from './pages/QuestionDetailPage'
import TagsPage from './pages/TagsPage'
import ProfilePage from './pages/ProfilePage'
import EditProfilePage from './pages/EditProfilePage'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/tags" element={<TagsPage />} />
              <Route path="/questions/:id" element={<QuestionDetailPage />} />

              {/* Protected Routes */}
              <Route
                path="/ask"
                element={
                  <ProtectedRoute>
                    <AskQuestionPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/edit"
                element={
                  <ProtectedRoute>
                    <EditProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
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
