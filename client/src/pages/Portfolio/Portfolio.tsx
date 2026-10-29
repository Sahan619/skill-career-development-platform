
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Portfolio.css';

interface Profile {
  name: string;
  email: string;
  university: string;
  degree: string;
  studyYear: number | null;
  careerGoal: string;
  github: string;
  linkedin: string;
  profilePhoto: string;
}

interface Skill {
  _id: string;
  name: string;
  category: string;
  level: string;
}

interface Project {
  _id: string;
  title: string;
  description: string;
  technologies: string[];
  github: string;
  liveDemo: string;
  imageUrl?: string;
}

const Portfolio = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadPortfolio = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [profileResponse, skillsResponse, projectsResponse] =
          await Promise.all([
            axios.get(`${import.meta.env.VITE_API_URL}/api/profile`, { headers }),
            axios.get(`${import.meta.env.VITE_API_URL}/api/skills`, { headers }),
            axios.get(`${import.meta.env.VITE_API_URL}/api/projects`, { headers }),
          ]);

        setProfile(profileResponse.data);
        setSkills(skillsResponse.data);
        setProjects(projectsResponse.data);
      } catch (error) {
        console.error('Failed to load portfolio:', error);
        setError('Could not load your portfolio. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadPortfolio();
  }, []);

  if (loading) {
    return (
      <div className="portfolio-page">
        <p className="portfolio-message">Loading your portfolio...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="portfolio-page">
        <h1>My Portfolio</h1>
        <p className="portfolio-error">
          {error || 'Profile information is not available.'}
        </p>
        <button onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const initials = profile.name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="portfolio-page">
      <div className="portfolio-topbar">
        <div>
          <p className="portfolio-eyebrow">YOUR PROFESSIONAL PROFILE</p>
          <h1>My Portfolio</h1>
        </div>

        <button
          className="portfolio-back-button"
          onClick={() => navigate('/dashboard')}
        >
          ← Dashboard
        </button>
      </div>

      <header className="portfolio-header">
        <div className="portfolio-banner" />

        <div className="portfolio-profile">
          <div className="portfolio-avatar">
  {profile.profilePhoto ? (
    <img
      src={profile.profilePhoto}
      alt={`${profile.name}'s profile`}
    />
  ) : (
    initials || '?'
  )}
</div>

          <div className="portfolio-intro">
            <h2>{profile.name || 'Your Name'}</h2>
            <p>{profile.careerGoal || 'Aspiring Professional'}</p>
            <span>{profile.email}</span>
          </div>

          <div className="portfolio-social-links">
            {profile.github && (
              <a href={profile.github} target="_blank" rel="noopener noreferrer">
                GitHub ↗
              </a>
            )}

            {profile.linkedin && (
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn ↗
              </a>
            )}
          </div>
        </div>

        <div className="portfolio-education">
          <div>
            <span>University</span>
            <strong>{profile.university || 'Not added'}</strong>
          </div>
          <div>
            <span>Degree</span>
            <strong>{profile.degree || 'Not added'}</strong>
          </div>
          <div>
            <span>Study Year</span>
            <strong>
              {profile.studyYear ? `Year ${profile.studyYear}` : 'Not added'}
            </strong>
          </div>
        </div>
      </header>

      <section className="portfolio-section">
        <div className="portfolio-section-heading">
          <div>
            <p className="portfolio-eyebrow">DIRECTION</p>
            <h2>Career Goal</h2>
          </div>
        </div>
        <p className="portfolio-career-goal">
          {profile.careerGoal || 'Add a career goal in your profile.'}
        </p>
      </section>

      <section className="portfolio-section">
        <div className="portfolio-section-heading">
          <div>
            <p className="portfolio-eyebrow">WHAT I CAN DO</p>
            <h2>Skills</h2>
          </div>
          <span className="portfolio-count">{skills.length} skills</span>
        </div>

        {skills.length === 0 ? (
          <p className="portfolio-empty">
            No skills added yet. Add your skills to build your portfolio.
          </p>
        ) : (
          <div className="portfolio-skills">
            {skills.map((skill) => (
              <article className="portfolio-skill" key={skill._id}>
                <div>
                  <strong>{skill.name}</strong>
                  <span>{skill.category || 'General'}</span>
                </div>
                <span className="portfolio-skill-level">{skill.level}</span>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="portfolio-section">
        <div className="portfolio-section-heading">
          <div>
            <p className="portfolio-eyebrow">WORK & EXPERIENCE</p>
            <h2>Projects</h2>
          </div>
          <span className="portfolio-count">{projects.length} projects</span>
        </div>

        {projects.length === 0 ? (
          <p className="portfolio-empty">
            No projects added yet. Your projects will appear here.
          </p>
        ) : (
          <div className="portfolio-projects">
            <div className="portfolio-projects">
  {projects.map((project) => (
    <article className="portfolio-project" key={project._id}>
      {project.imageUrl && (
        <img
          className="project-image"
          src={project.imageUrl}
          alt={`${project.title} screenshot`}
          loading="lazy"
        />
      )}

      <div className="portfolio-project-icon" aria-hidden="true">
        {'</>'}
      </div>

      <h3>{project.title}</h3>

      <p className="portfolio-project-description">
        {project.description || 'No description provided.'}
      </p>

      {project.technologies.length > 0 && (
        <div className="portfolio-technologies">
          {project.technologies.map((technology) => (
            <span key={technology}>{technology}</span>
          ))}
        </div>
      )}

      <div className="portfolio-project-links">
        {project.github && (
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub ↗
          </a>
        )}

        {project.liveDemo && (
          <a
            href={project.liveDemo}
            target="_blank"
            rel="noopener noreferrer"
          >
            Live Demo ↗
          </a>
        )}
      </div>
    </article>
  ))}
</div>
            
            {projects.map((project) => (
              <article className="portfolio-project" key={project._id}>
                <div className="portfolio-project-icon" aria-hidden="true">
                  {'</>'}
                </div>

                <h3>{project.title}</h3>
                <p className="portfolio-project-description">
                  {project.description || 'No description provided.'}
                </p>

                {project.technologies.length > 0 && (
                  <div className="portfolio-technologies">
                    {project.technologies.map((technology) => (
                      <span key={technology}>{technology}</span>
                    ))}
                  </div>
                )}

                <div className="portfolio-project-links">
                  {project.github && (
                    <a href={project.github} target="_blank" rel="noopener noreferrer">
                      GitHub ↗
                    </a>
                  )}

                  {project.liveDemo && (
                    <a href={project.liveDemo} target="_blank" rel="noopener noreferrer">
                      Live Demo ↗
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default Portfolio;
