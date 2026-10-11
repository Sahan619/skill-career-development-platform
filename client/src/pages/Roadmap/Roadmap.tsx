import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './Roadmap.css';

interface CareerPath {
  title: string;
  skills: string[];
}

const Roadmap = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const careerPath = location.state as CareerPath | null;

  const [completedSteps, setCompletedSteps] = useState<string[]>(() => {
    if (!careerPath) return [];

    try {
      const savedSteps = localStorage.getItem(
        `roadmap-${careerPath.title}`
      );

      return savedSteps ? JSON.parse(savedSteps) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (!careerPath) return;

    localStorage.setItem(
      `roadmap-${careerPath.title}`,
      JSON.stringify(completedSteps)
    );
  }, [completedSteps, careerPath]);

  if (!careerPath) {
    return (
      <main className="roadmap-page">
        <section className="roadmap-empty-state">
          <h1>No career path selected</h1>
          <p>Choose a career path first to view its learning roadmap.</p>
          <button onClick={() => navigate('/career-paths')}>
            Explore Career Paths
          </button>
        </section>
      </main>
    );
  }

  const totalSteps = careerPath.skills.length;

  const completionPercentage =
    totalSteps > 0
      ? Math.round((completedSteps.length / totalSteps) * 100)
      : 0;

  const toggleStep = (skill: string) => {
    setCompletedSteps((current) =>
      current.includes(skill)
        ? current.filter((item) => item !== skill)
        : [...current, skill]
    );
  };

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
        <p>Build your skills one step at a time. Track each milestone as you go.</p>
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
            {completedSteps.length} of {totalSteps} steps completed
          </span>
          <span>
            {completionPercentage === 100
              ? 'All steps completed!'
              : `${totalSteps - completedSteps.length} remaining`}
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