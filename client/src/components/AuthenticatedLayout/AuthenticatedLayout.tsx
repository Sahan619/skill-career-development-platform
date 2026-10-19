import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import './AuthenticatedLayout.css';

const navigationItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Profile', path: '/profile' },
  { label: 'Skills', path: '/skills' },
  { label: 'Progress', path: '/progress' },
  { label: 'Career Paths', path: '/career-paths' },
  { label: 'Roadmap', path: '/roadmap' },
  { label: 'Projects', path: '/projects' },
  { label: 'Portfolio', path: '/portfolio' },
];

const AuthenticatedLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="authenticated-layout">
      <aside className="authenticated-sidebar">
        <h2 className="authenticated-brand">SkillPath</h2>

        <nav className="authenticated-nav" aria-label="Main navigation">
          {navigationItems.map(({ label, path }) => (
            <NavLink
              key={path}
              to={path}
              end
              className={({ isActive }) =>
                isActive
                  ? 'authenticated-nav-link authenticated-nav-link-active'
                  : 'authenticated-nav-link'
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <button className="authenticated-logout" onClick={handleLogout}>
          Log out
        </button>
      </aside>

      <main className="authenticated-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AuthenticatedLayout;
