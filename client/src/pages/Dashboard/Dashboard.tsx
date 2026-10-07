import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


interface ProgressItem {
  _id: string;
  skill: {
    name: string;
  };
  progress: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [progressList, setProgressList] = useState<ProgressItem[]>([]);
  const averageProgress =
  progressList.length > 0
    ? Math.round(
        progressList.reduce((total, item) => total + item.progress, 0) /
          progressList.length
      )
    : 0;

  const user = JSON.parse(localStorage.getItem('user') || 'null');
  useEffect(() => {
  const loadProgress = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.get(
        'http://localhost:5000/api/progress',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProgressList(response.data);
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  };

  loadProgress();
}, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    navigate('/login');
  };

  return (
    <div>
      <h1>Dashboard</h1>

      <nav>
  <button onClick={() => navigate('/dashboard')}>
    Dashboard
  </button>

  <button onClick={() => navigate('/profile')}>
    Profile
  </button>

  <button onClick={() => navigate('/skills')}>
    Skills
  </button>

  <button onClick={() => navigate('/progress')}>
    Progress
  </button>

  <button onClick={() => navigate('/career-paths')}>
    Career Paths
  </button>

  <button onClick={() => navigate('/roadmap')}>
  Roadmap
</button>
<button onClick={() => navigate('/projects')}>
  Projects
</button>
<button onClick={() => navigate('/portfolio')}>
  Portfolio
</button>
</nav>

      {user && (
        <div>
          <h2>Welcome, {user.name}!</h2>
          <p>Email: {user.email}</p>
        </div>
      )}
      <h2>My Progress</h2>
<h3>Overall Progress: {averageProgress}%</h3>
<p>Total Skills: {progressList.length}</p>

{progressList.length === 0 ? (
  <p>No progress added yet.</p>
) : (
  progressList.map((item) => (
    <div key={item._id}>
      <p>
        {item.skill.name}: {item.progress}%
      </p>
    </div>
  ))
)}

      <button onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default Dashboard;