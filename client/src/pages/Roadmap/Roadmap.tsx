
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Roadmap.css';

interface CareerPath {
  title: string;
  description?: string;
  skills: string[];
}

interface RoadmapState {
  careerPath: CareerPath | null;
  completedSteps: string[];
}

const loadRoadmapProgress = (title: string): string[] => {
  try {
    const saved = localStorage.getItem(`roadmap-${title}`);
    const parsed: unknown = saved ? JSON.parse(saved) : [];

    return Array.isArray(parsed)
      ? parsed.filter((step): step is string => typeof step === 'string')
      : [];
  } catch {
    return [];
  }
};

const Roadmap = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [roadmap, setRoadmap] = useState<RoadmapState>({
    careerPath: (location.state as CareerPath | null) ?? null,
    completedSteps: location.state
      ? loadRoadmapProgress((location.state as CareerPath).title)
      : [],
  });

  const [loadingCareer, setLoadingCareer] = useState(!location.state);

  const careerPath = roadmap.careerPath;
  const completedSteps = roadmap.completedSteps;

  useEffect(() => {
    let cancelled = false;

    const loadSelectedCareer = async () => {
      if (location.state) {
        const selectedCareer = location.state as CareerPath;

        if (!cancelled) {
          setRoadmap({
            careerPath: selectedCareer,
            completedSteps: loadRoadmapProgress(selectedCareer.title),
          });
          setLoadingCareer(false);
        }
        return;
      }

      try {
        const token = localStorage.getItem('token');

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/career-paths/selected`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const selectedCareer: CareerPath | null =
          response.data.selectedCareer?.title
            ? response.data.selectedCareer
            : null;

        if (!cancelled) {
          setRoadmap({
            careerPath: selectedCareer,
            completedSteps: selectedCareer
              ? loadRoadmapProgress(selectedCareer.title)
              : [],
          });
        }
      } catch (error) {
        console.error('Failed to load selected career:', error);

        if (!cancelled) {
          setRoadmap({
            careerPath: null,
            completedSteps: [],
          });
        }
      } finally {
        if (!cancelled) {
          setLoadingCareer(false);
        }
      }
    };

    loadSelectedCareer();

    return () => {
      cancelled = true;
    };
  }, [location.state]);

  useEffect(() => {
    if (!careerPath) return;

    localStorage.setItem(
      `roadmap-${careerPath.title}`,
      JSON.stringify(completedSteps)
    );
  }, [completedSteps, careerPath]);

  const toggleStep = (skill: string) => {
    setRoadmap((current) => ({
      ...current,
      completedSteps: current.completedSteps.includes(skill)
        ? current.completedSteps.filter((item) => item !== skill)
        : [...current.completedSteps, skill],
    }));
  };

  if (loadingCareer) {
    return <p className="career-loading">Loading your roadmap...</p>;
  }

  if (!careerPath) {
    return (
      <main className="roadmap-page">
        <section className="roadmap-empty-state">
          <h1>No career path selected</h1>
          <p>Choose a career path first to view your learning roadmap.</p>
          <button onClick={() => navigate('/career-paths')}>
            Explore Career Paths
          </button>
        </section>
      </main>
    );
  }

  const totalSteps = careerPath.skills.length;

  const completedCount = careerPath.skills.filter((skill) =>
    completedSteps.includes(skill)
  ).length;

  const completionPercentage =
    totalSteps > 0
      ? Math.round((completedCount / totalSteps) * 100)
      : 0;

  return (
    <main className="roadmap-page">
      <button
        className="roadmap-back-button"
        onClick={() => navigate('/career-paths')}
      >
        ← Back to Career Paths
      </button>

      <header className="roadmap-header">
        <p className="roadmap-eyebrow">YOUR LEARNING JOURNEY</p>
        <h1>{careerPath.title} Roadmap</h1>
        <p>
          Build your skills one step at a time. Track each milestone as you go.
        </p>
      </header>

      <section className="roadmap-summary">
        <div className="roadmap-summary-top">
          <div>
            <h2>Your Progress</h2>
            <p>Keep going — every step counts.</p>
          </div>
          <strong className="roadmap-percentage">
            {completionPercentage}%
          </strong>
        </div>

        <div
          className="roadmap-progress-track"
          role="progressbar"
          aria-label="Roadmap completion"
          aria-valuenow={completionPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="roadmap-progress-fill"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        <div className="roadmap-summary-footer">
          <span>
            {completedCount} of {totalSteps} steps completed
          </span>
          <span>
            {completionPercentage === 100
              ? 'All steps completed!'
              : `${totalSteps - completedCount} remaining`}
          </span>
        </div>
      </section>

      <section className="roadmap-steps-section">
        <div className="roadmap-section-heading">
          <h2>Learning Path</h2>
          <span>{totalSteps} steps</span>
        </div>

        {totalSteps === 0 ? (
          <div className="roadmap-empty-state">
            <h3>No learning steps yet</h3>
            <p>This career path does not have any listed skills yet.</p>
          </div>
        ) : (
          <div className="roadmap-steps">
            {careerPath.skills.map((skill, index) => {
              const isCompleted = completedSteps.includes(skill);

              return (
                <article
                  className={`roadmap-step ${
                    isCompleted ? 'roadmap-step-completed' : ''
                  }`}
                  key={`${skill}-${index}`}
                >
                  <div className="roadmap-step-number">
                    {isCompleted ? '✓' : index + 1}
                  </div>

                  <div className="roadmap-step-content">
                    <span className="roadmap-step-label">
                      STEP {String(index + 1).padStart(2, '0')}
                    </span>
                    <h3>{skill}</h3>
                    <p>
                      {isCompleted
                        ? 'You have completed this learning milestone.'
                        : 'Learn and practise this skill to move forward.'}
                    </p>
                  </div>

                  <button
                    className={
                      isCompleted
                        ? 'roadmap-incomplete-button'
                        : 'roadmap-complete-button'
                    }
                    onClick={() => toggleStep(skill)}
                  >
                    {isCompleted ? 'Undo' : 'Mark Complete'}
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
};

export default Roadmap;
