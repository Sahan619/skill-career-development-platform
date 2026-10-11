
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

interface ProgressItem {
  _id: string;
  progress: number;
  skill: {
    name: string;
  } | null;
}

const Dashboard = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [progressItems, setProgressItems] = useState<ProgressItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [profileResponse, progressResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/profile', { headers }),
          axios.get('http://localhost:5000/api/progress', { headers }),
        ]);

        setName(profileResponse.data.name);
        setProgressItems(progressResponse.data);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const averageProgress =
    progressItems.length > 0
      ? Math.round(
          progressItems.reduce(
            (total, item) => total + item.progress,
            0
          ) / progressItems.length
        )
      : 0;

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return <p className="dashboard-loading">Loading dashboard...</p>;
  }

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <h2 className="dashboard-brand">SkillPath</h2>

        <nav className="dashboard-nav">
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

        <button className="dashboard-logout" onClick={handleLogout}>
          Log out
        </button>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <h1>Dashboard</h1>
            <p>Your personal career development overview.</p>
          </div>
        </header>

        <section className="dashboard-welcome">
          <div>
            <p className="dashboard-eyebrow">YOUR LEARNING JOURNEY</p>
            <h2>Welcome back, {name || 'Student'}!</h2>
            <p>Keep learning, building, and moving toward your career goals.</p>
          </div>

          <button onClick={() => navigate('/skills')}>
            Manage Skills
          </button>
        </section>

        <section className="dashboard-stats">
          <article className="dashboard-stat-card">
            <span>Skills Tracked</span>
            <strong>{progressItems.length}</strong>
            <p>Skills with recorded progress</p>
          </article>

          <article className="dashboard-stat-card">
            <span>Average Progress</span>
            <strong>{averageProgress}%</strong>
            <p>Across your tracked skills</p>
          </article>

          <article className="dashboard-stat-card">
            <span>Completed Skills</span>
            <strong>
              {progressItems.filter((item) => item.progress === 100).length}
            </strong>
            <p>Skills at 100% progress</p>
          </article>
        </section>

        <section className="dashboard-content-card">
          <div className="dashboard-section-heading">
            <div>
              <h2>Learning Progress</h2>
              <p>Continue improving your technical skills.</p>
            </div>

            <button
              onClick={() => navigate('/progress')}
            >
              View All
            </button>
          </div>

          {progressItems.length === 0 ? (
            <p>No learning progress yet. Add skills and track your progress to get started.</p>
          ) : (
            <div className="dashboard-progress-list">
              {progressItems.map((item) => (
                <div className="dashboard-progress-item" key={item._id}>
                  <div className="dashboard-progress-label">
                    <span>{item.skill?.name || 'Skill'}</span>
                    <strong>{item.progress}%</strong>
                  </div>

                  <div className="dashboard-progress-track">
                    <div
                      className="dashboard-progress-fill"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-content-card">
          <h2>Quick Actions</h2>

          <div className="dashboard-quick-actions">
            <button onClick={() => navigate('/skills')}>
              Manage Skills
            </button>
            <button onClick={() => navigate('/career-paths')}>
              Explore Careers
            </button>
            <button onClick={() => navigate('/projects')}>
              My Projects
            </button>
            <button onClick={() => navigate('/portfolio')}>
              View Portfolio
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
