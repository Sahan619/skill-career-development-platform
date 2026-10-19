import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CareerPaths.css';

interface CareerPath {
  _id: string;
  title: string;
  description: string;
  skills: string[];
}

const CareerPaths = () => {
  const navigate = useNavigate();
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCareerPaths = async () => {
      try {
        const token = localStorage.getItem('token');

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/career-paths`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setCareerPaths(response.data);
      } catch (error) {
        console.error('Failed to load career paths:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCareerPaths();
  }, []);

  if (loading) {
    return <p className="career-loading">Loading career paths...</p>;
  }

  return (
    <main className="career-page">
      <header className="career-page-header">
        <div>
          <p className="career-eyebrow">PLAN YOUR FUTURE</p>
          <h1>Explore Career Paths</h1>
          <p>
            Discover career options, identify essential skills, and plan your
            next learning steps.
          </p>
        </div>

        <div className="career-count">
          <strong>{careerPaths.length}</strong>
          <span>Career paths</span>
        </div>
      </header>

      {careerPaths.length === 0 ? (
        <section className="career-empty-state">
          <h2>No career paths available yet</h2>
          <p>Career paths will appear here when they are available.</p>
        </section>
      ) : (
        <section className="career-grid">
          {careerPaths.map((careerPath, index) => (
            <article className="career-card" key={careerPath._id}>
              <div className="career-card-top">
                <div className="career-icon">
                  {careerPath.title.charAt(0).toUpperCase()}
                </div>
                <span className="career-card-number">
                  PATH {String(index + 1).padStart(2, '0')}
                </span>
              </div>

              <h2>{careerPath.title}</h2>
              <p className="career-description">
                {careerPath.description}
              </p>

              <div className="career-skills-section">
                <h3>Skills to develop</h3>

                {careerPath.skills.length > 0 ? (
                  <div className="career-skill-tags">
                    {careerPath.skills.map((skill) => (
                      <span className="career-skill-tag" key={skill}>
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="career-no-skills">
                    No skills listed for this path yet.
                  </p>
                )}
              </div>

              <button
                className="career-roadmap-button"
                onClick={() =>
                  navigate('/roadmap', {
                    state: careerPath,
                  })
                }
              >
                View Roadmap <span aria-hidden="true">→</span>
              </button>
            </article>
          ))}
        </section>
      )}
    </main>
  );
};

export default CareerPaths;