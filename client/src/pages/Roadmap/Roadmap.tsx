
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Roadmap.css';

interface CareerPath {
  title: string;
  description?: string;
  skills: string[];
}

interface Resource {
  title: string;
  provider?: string;
  url?: string;
  description?: string;
}

interface LearningResources {
  courses: Resource[];
  books: Resource[];
  duration: string;
  practicalTask: string;
}

interface RoadmapState {
  careerPath: CareerPath | null;
  completedSteps: string[];
}

const API = import.meta.env.VITE_API_URL;

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
  const [resources, setResources] = useState<Record<string, LearningResources>>({});
  const [loadingSkills, setLoadingSkills] = useState<string[]>([]);
  const [expandedSkills, setExpandedSkills] = useState<string[]>([]);
  const [resourceErrors, setResourceErrors] = useState<Record<string, string>>({});

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
          `${API}/api/career-paths/selected`,
          {
            headers: { Authorization: `Bearer ${token}` },
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
          setRoadmap({ careerPath: null, completedSteps: [] });
        }
      } finally {
        if (!cancelled) setLoadingCareer(false);
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

  const toggleResources = async (skill: string) => {
    if (expandedSkills.includes(skill)) {
      setExpandedSkills((current) =>
        current.filter((item) => item !== skill)
      );
      return;
    }

    setExpandedSkills((current) => [...current, skill]);

    if (resources[skill] || loadingSkills.includes(skill)) return;

    setLoadingSkills((current) => [...current, skill]);
    setResourceErrors((current) => {
      const next = { ...current };
      delete next[skill];
      return next;
    });

    try {
      const token = localStorage.getItem('token');

      const response = await axios.post(
        `${API}/api/roadmap/resources`,
        {
          careerTitle: careerPath?.title,
          careerDescription: careerPath?.description || '',
          skill,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setResources((current) => ({
        ...current,
        [skill]: response.data.resources,
      }));
    } catch (error) {
      console.error('Failed to generate learning resources:', error);

      setResourceErrors((current) => ({
        ...current,
        [skill]: 'Could not generate recommendations. Please try again.',
      }));
    } finally {
      setLoadingSkills((current) =>
        current.filter((item) => item !== skill)
      );
    }
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

  const completionPercentage = totalSteps
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
          Learn each skill, explore recommended resources, and practise
          your knowledge as you progress.
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
            style={{ transform: `scaleX(${completionPercentage / 100})` }}
          />
        </div>

        <div className="roadmap-summary-footer">
          <span>{completedCount} of {totalSteps} steps completed</span>
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
              const isExpanded = expandedSkills.includes(skill);
              const isLoading = loadingSkills.includes(skill);
              const learningResources = resources[skill];

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

                    <button
                      type="button"
                      className="roadmap-resources-button"
                      onClick={() => toggleResources(skill)}
                    >
                      {isExpanded ? 'Hide Resources' : 'Find Courses & Books'}
                    </button>

                    {isExpanded && (
                      <div className="roadmap-learning-resources">
                        {isLoading && <p>Generating AI recommendations...</p>}

                        {resourceErrors[skill] && (
                          <div>
                            <p>{resourceErrors[skill]}</p>
                            <button
                              type="button"
                              onClick={() => {
                                setExpandedSkills((current) =>
                                  current.filter((item) => item !== skill)
                                );
                                void toggleResources(skill);
                              }}
                            >
                              Try Again
                            </button>
                          </div>
                        )}

                        {learningResources && (
                          <>
                            <h4>Recommended Courses</h4>
                            {learningResources.courses.length ? (
                              <ul>
                                {learningResources.courses.map((course, i) => (
                                  <li key={`${course.title}-${i}`}>
                                    {course.url ? (
                                      <a
                                        href={course.url}
                                        target="_blank"
                                        rel="noreferrer"
                                      >
                                        {course.title}
                                      </a>
                                    ) : (
                                      <strong>{course.title}</strong>
                                    )}
                                    {course.provider && ` — ${course.provider}`}
                                    {course.description && (
                                      <p>{course.description}</p>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p>No courses were recommended.</p>
                            )}

                            <h4>Reference Books</h4>
                            {learningResources.books.length ? (
                              <ul>
                                {learningResources.books.map((book, i) => (
                                  <li key={`${book.title}-${i}`}>
                                    <strong>{book.title}</strong>
                                    {book.provider && ` — ${book.provider}`}
                                    {book.description && (
                                      <p>{book.description}</p>
                                    )}
                                    {book.url && (
                                      <a
                                        href={book.url}
                                        target="_blank"
                                        rel="noreferrer"
                                      >
                                        View book
                                      </a>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p>No books were recommended.</p>
                            )}

                            <h4>Estimated Learning Time</h4>
                            <p>{learningResources.duration}</p>

                            <h4>Practical Task</h4>
                            <p>{learningResources.practicalTask}</p>
                          </>
                        )}
                      </div>
                    )}
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
