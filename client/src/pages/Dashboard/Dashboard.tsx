
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
  const [displayedAverage, setDisplayedAverage] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [profileResponse, progressResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/profile`, { headers }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/progress`, { headers }),
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

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    mediaQuery.addEventListener('change', updatePreference);
    return () => mediaQuery.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const startTime = performance.now();
    let frameId = 0;

    const updateCount = (time: number) => {
      const progress = Math.min((time - startTime) / 800, 1);
      setDisplayedAverage(Math.round(averageProgress * progress));

      if (progress < 1) {
        frameId = requestAnimationFrame(updateCount);
      }
    };

    frameId = requestAnimationFrame(updateCount);
    return () => cancelAnimationFrame(frameId);
  }, [averageProgress, prefersReducedMotion]);

  const visibleAverage = prefersReducedMotion
    ? averageProgress
    : displayedAverage;

  if (loading) {
    return (
      <div className="dashboard-page">
        <p className="dashboard-loading">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
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
            <strong>{visibleAverage}%</strong>
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
                      style={{ transform: `scaleX(${item.progress / 100})` }}
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
    </div>
  );
};

export default Dashboard;
