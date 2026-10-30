import { useEffect, useState } from 'react';
import axios from 'axios';
import './Progress.css';

interface Skill {
  _id: string;
  name: string;
}

interface ProgressItem {
  _id: string;
  skill: Skill | null;
  progress: number;
}

const Progress = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [progressList, setProgressList] = useState<ProgressItem[]>([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  const averageProgress =
    progressList.length > 0
      ? Math.round(
          progressList.reduce((total, item) => total + item.progress, 0) /
            progressList.length
        )
      : 0;

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [skillsResponse, progressResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/skills`, { headers }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/progress`, { headers }),
        ]);

        setSkills(skillsResponse.data);
        setProgressList(progressResponse.data);
      } catch (error) {
        console.error('Failed to load progress:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAddProgress = async () => {
    if (!selectedSkill) {
      alert('Please select a skill.');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/progress`,
        {
          skillId: selectedSkill,
          progress: Number(progress),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setProgressList((current) => [...current, response.data]);
      setSelectedSkill('');
      setProgress(0);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || 'Failed to add progress.');
      } else {
        alert('Failed to add progress.');
      }
    }
  };

  const handleUpdate = async (id: string, value: number) => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/progress/${id}`,
        { progress: value },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setProgressList((current) =>
        current.map((item) =>
          item._id === id
            ? { ...item, progress: response.data.progress }
            : item
        )
      );
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this progress entry?')) return;

    try {
      const token = localStorage.getItem('token');

      await axios.delete(`${import.meta.env.VITE_API_URL}/api/progress/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProgressList((current) =>
        current.filter((item) => item._id !== id)
      );
    } catch (error) {
      console.error('Failed to delete progress:', error);
      alert('Failed to delete progress.');
    }
  };

  if (loading) {
    return <p className="progress-loading">Loading your progress...</p>;
  }

  return (
    <main className="progress-page">
      <header className="progress-page-header">
        <div>
          <p className="progress-eyebrow">KEEP MOVING FORWARD</p>
          <h1>Learning Progress</h1>
          <p>Track how far you have come with each skill.</p>
        </div>

        <div className="progress-overview">
          <span>Overall progress</span>
          <strong>{averageProgress}%</strong>
          <div className="progress-overview-track">
            <div
              className="progress-overview-fill"
              style={{ transform: `scaleX(${averageProgress / 100})` }}
            />
          </div>
        </div>
      </header>

      <section className="progress-form-panel">
        <h2>Track a Skill</h2>
        <p className="progress-description">
          Choose a skill and record your current progress.
        </p>

        {skills.length === 0 ? (
          <p className="progress-notice">
            You have no skills yet. Add a skill on the Skills page first.
          </p>
        ) : (
          <div className="progress-form">
            <div className="progress-form-field">
              <label htmlFor="progress-skill">Skill</label>
              <select
                id="progress-skill"
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
              >
                <option value="">Select a skill</option>
                {skills.map((skill) => (
                  <option key={skill._id} value={skill._id}>
                    {skill.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="progress-form-field">
              <label htmlFor="new-progress">
                Current progress: {progress}%
              </label>
              <input
                id="new-progress"
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
              />
            </div>

            <button onClick={handleAddProgress}>+ Add Progress</button>
          </div>
        )}
      </section>

      <section className="progress-list-section">
        <div className="progress-list-header">
          <div>
            <h2>My Learning Goals</h2>
            <p>Update your progress as you learn.</p>
          </div>
          <span className="progress-total">
            {progressList.length}{' '}
            {progressList.length === 1 ? 'skill' : 'skills'}
          </span>
        </div>

        {progressList.length === 0 ? (
          <div className="progress-empty-state">
            <h3>No progress tracked yet</h3>
            <p>Add a skill above to start tracking your learning journey.</p>
          </div>
        ) : (
          <div className="progress-cards">
            {progressList.map((item) => (
              <article className="progress-card" key={item._id}>
                <div className="progress-card-heading">
                  <div className="progress-skill-icon">
                    {(item.skill?.name || 'S').charAt(0).toUpperCase()}
                  </div>
                  <div className="progress-skill-info">
                    <h3>{item.skill?.name || 'Skill'}</h3>
                    <p>
                      {item.progress === 100
                        ? 'Skill completed!'
                        : 'Keep up the good work'}
                    </p>
                  </div>
                  <strong className="progress-percentage">
                    {item.progress}%
                  </strong>
                </div>

                <div
                  className="progress-card-track"
                  role="progressbar"
                  aria-label={`${item.skill?.name || 'Skill'} progress`}
                  aria-valuenow={item.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="progress-card-fill"
                    style={{ transform: `scaleX(${item.progress / 100})` }}
                  />
                </div>

                <div className="progress-slider-row">
                  <label htmlFor={`slider-${item._id}`}>
                    Adjust progress
                  </label>
                  <input
                    id={`slider-${item._id}`}
                    type="range"
                    min="0"
                    max="100"
                    value={item.progress}
                    onChange={(e) =>
                      handleUpdate(item._id, Number(e.target.value))
                    }
                  />
                </div>

                <div className="progress-card-footer">
                  <span>
                    {item.progress === 100
                      ? 'Completed'
                      : `${100 - item.progress}% remaining`}
                  </span>
                  <button
                    className="progress-delete-button"
                    onClick={() => handleDelete(item._id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default Progress;