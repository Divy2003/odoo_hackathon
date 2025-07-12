import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../redux/slices/authSlice';
import { FaUser, FaSignOutAlt, FaPlus } from 'react-icons/fa';
import NotificationDropdown from '../notifications/NotificationDropdown';
import Avatar from '../common/Avatar';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };



  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <h1>StackIt</h1>
        </Link>

        <div className="nav-menu">
          <Link to="/" className="nav-link">
            Questions
          </Link>
          <Link to="/tags" className="nav-link">
            Tags
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/ask" className="btn btn-primary nav-btn">
                <FaPlus /> Ask Question
              </Link>
              
              <div className="nav-user-menu">
                <NotificationDropdown />
                
                <div className="user-dropdown">
                  <button className="user-btn">
                    <Avatar
                      src={user?.avatar}
                      name={user?.name || 'User'}
                      size="small"
                    />
                    <span>{user?.name}</span>
                  </button>
                  
                  <div className="dropdown-content">
                    <Link to="/profile" className="dropdown-item">
                      <FaUser /> Profile
                    </Link>
                    {user?.role === 'admin' && (
                      <Link to="/admin" className="dropdown-item">
                        Admin Dashboard
                      </Link>
                    )}
                    <button onClick={handleLogout} className="dropdown-item">
                      <FaSignOutAlt /> Logout
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="nav-auth">
              <Link to="/login" className="btn btn-outline">
                Sign In
              </Link>
              <Link to="/signup" className="btn btn-primary">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
