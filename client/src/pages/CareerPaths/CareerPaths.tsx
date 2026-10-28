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

interface CareerRecommendation {
  title: string;
  description: string;
  reasons: string[];
  matchingSkills: string[];
  skillsToLearn: string[];
}

const CareerPaths = () => {
  const navigate = useNavigate();

  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const loadCareerPaths = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/career-paths`,
          {
            headers: { Authorization: `Bearer ${token}` },
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
  }, [token]);

  const generateRecommendations = async () => {
    setGenerating(true);
    setError('');

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/career-paths/recommendations`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setRecommendations(response.data.recommendations);
    } catch (error) {
      console.error('Failed to generate career recommendations:', error);

      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ||
            'Could not generate recommendations. Please try again.'
        );
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setGenerating(false);
    }
  };

  const chooseCareer = (career: CareerRecommendation) => {
    navigate('/roadmap', {
      state: {
        title: career.title,
        description: career.description,
        skills: career.skillsToLearn,
      },
    });
  };

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

      <section className="ai-career-section">
        <div className="ai-career-header">
          <div>
            <p className="career-eyebrow">PERSONALIZED FOR YOU</p>
            <h2>AI Career Recommendations</h2>
            <p>
              Discover careers that match your degree and the skills you have
              developed.
            </p>
          </div>

          <button
            className="ai-generate-button"
            onClick={generateRecommendations}
            disabled={generating}
          >
            {generating
              ? 'Generating recommendations...'
              : recommendations.length > 0
                ? 'Regenerate recommendations'
                : 'Generate recommendations'}
          </button>
        </div>

        {error && <p className="career-error">{error}</p>}

        {generating && (
          <p className="career-loading">
            AI is analyzing your degree and skills. This may take a moment...
          </p>
        )}

        {recommendations.length > 0 && (
          <div className="career-grid">
            {recommendations.map((career, index) => (
              <article className="career-card" key={career.title}>
                <div className="career-card-top">
                  <div className="career-icon">
                    {career.title.charAt(0).toUpperCase()}
                  </div>
                  <span className="career-card-number">
                    AI MATCH {String(index + 1).padStart(2, '0')}
                  </span>
                </div>

                <h2>{career.title}</h2>
                <p className="career-description">{career.description}</p>

                <div className="career-skills-section">
                  <h3>Why this career?</h3>
                  <ul className="career-reasons">
                    {career.reasons.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                </div>

                <div className="career-skills-section">
                  <h3>Your matching skills</h3>
                  <div className="career-skill-tags">
                    {career.matchingSkills.length > 0 ? (
                      career.matchingSkills.map((skill) => (
                        <span className="career-skill-tag" key={skill}>
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="career-no-skills">
                        No matching skills identified yet.
                      </p>
                    )}
                  </div>
                </div>

                <div className="career-skills-section">
                  <h3>Skills to learn</h3>
                  <div className="career-skill-tags">
                    {career.skillsToLearn.map((skill) => (
                      <span className="career-skill-tag" key={skill}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  className="career-roadmap-button"
                  onClick={() => chooseCareer(career)}
                >
                  Choose this career <span aria-hidden="true">→</span>
                </button>
              </article>
            ))}
          </div>
        )}

        {!generating && recommendations.length === 0 && !error && (
          <p className="career-ai-hint">
            Select Generate recommendations to explore career options tailored
            to your profile.
          </p>
        )}
      </section>

      <section className="existing-careers-section">
        <h2>Explore All Career Paths</h2>
        <p className="career-section-description">
          Browse the career paths already available on the platform.
        </p>

        {careerPaths.length === 0 ? (
          <section className="career-empty-state">
            <h2>No career paths available yet</h2>
            <p>Existing career paths will appear here when available.</p>
          </section>
        ) : (
          <div className="career-grid">
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
                    navigate('/roadmap', { state: careerPath })
                  }
                >
                  View Roadmap <span aria-hidden="true">→</span>
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default CareerPaths;