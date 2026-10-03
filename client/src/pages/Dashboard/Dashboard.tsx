import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    navigate('/login');
  };

  return (
    <div>
      <h1>Dashboard</h1>

      {user && (
        <div>
          <h2>Welcome, {user.name}!</h2>
          <p>Email: {user.email}</p>
        </div>
      )}

      <button onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default Dashboard;