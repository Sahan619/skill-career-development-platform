import { useEffect, useState } from 'react';
import axios from 'axios';
import './Projects.css';

interface Project {
  _id: string;
  title: string;
  description: string;
  technologies: string[];
  github: string;
  liveDemo: string;
}

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [technologies, setTechnologies] = useState('');
  const [github, setGithub] = useState('');
  const [liveDemo, setLiveDemo] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const token = localStorage.getItem('token');

        const response = await axios.get(
          'http://localhost:5000/api/projects',
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setProjects(response.data);
      } catch (error) {
        console.error('Failed to load projects:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTechnologies('');
    setGithub('');
    setLiveDemo('');
    setEditingId(null);
  };

  const getProjectData = () => ({
    title: title.trim(),
    description: description.trim(),
    technologies: technologies
      .split(',')
      .map((technology) => technology.trim())
      .filter(Boolean),
    github: github.trim(),
    liveDemo: liveDemo.trim(),
  });

  const handleSaveProject = async () => {
    if (!title.trim()) {
      alert('Project title is required.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const projectData = getProjectData();
      const headers = { Authorization: `Bearer ${token}` };

      if (editingId) {
        const response = await axios.put(
          `http://localhost:5000/api/projects/${editingId}`,
          projectData,
          { headers }
        );

        setProjects((current) =>
          current.map((project) =>
            project._id === editingId ? response.data : project
          )
        );
      } else {
        const response = await axios.post(
          'http://localhost:5000/api/projects',
          projectData,
          { headers }
        );

        setProjects((current) => [response.data, ...current]);
      }

      resetForm();
    } catch (error) {
      console.error('Failed to save project:', error);

      if (axios.isAxiosError(error)) {
        alert(
          error.response?.data?.message || 'Failed to save project.'
        );
      } else {
        alert('Failed to save project.');
      }
    }
  };

  const handleEdit = (project: Project) => {
    setEditingId(project._id);
    setTitle(project.title);
    setDescription(project.description);
    setTechnologies(project.technologies.join(', '));
    setGithub(project.github || '');
    setLiveDemo(project.liveDemo || '');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');

      await axios.delete(`http://localhost:5000/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProjects((current) =>
        current.filter((project) => project._id !== id)
      );

      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project.');
    }
  };

  if (loading) {
    return <p className="projects-loading">Loading projects...</p>;
  }

  return (
    <main className="projects-page">
      <header className="projects-page-header">
        <div>
          <p className="projects-eyebrow">BUILD YOUR PORTFOLIO</p>
          <h1>My Projects</h1>
          <p>Showcase what you build, the technologies you use, and what you learn.</p>
        </div>

        <div className="projects-count">
          <strong>{projects.length}</strong>
          <span>Projects</span>
        </div>
      </header>

      <section className="projects-form-panel">
        <h2>{editingId ? 'Edit Project' : 'Add a Project'}</h2>
        <p className="projects-description">
          {editingId
            ? 'Update the details of your project.'
            : 'Add a project you have built or are currently working on.'}
        </p>

        <div className="projects-form">
          <div className="projects-field">
            <label htmlFor="project-title">Project title *</label>
            <input
              id="project-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Skill Development Platform"
            />
          </div>

          <div className="projects-field">
            <label htmlFor="project-description">Description</label>
            <textarea
              id="project-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does your project do?"
              rows={4}
            />
          </div>

          <div className="projects-field">
            <label htmlFor="project-technologies">Technologies</label>
            <input
              id="project-technologies"
              value={technologies}
              onChange={(e) => setTechnologies(e.target.value)}
              placeholder="React, TypeScript, Node.js"
            />
            <span className="projects-field-hint">
              Separate technologies with commas.
            </span>
          </div>

          <div className="projects-field">
            <label htmlFor="project-github">GitHub URL</label>
            <input
              id="project-github"
              type="url"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              placeholder="https://github.com/username/project"
            />
          </div>

          <div className="projects-field">
            <label htmlFor="project-demo">Live demo URL</label>
            <input
              id="project-demo"
              type="url"
              value={liveDemo}
              onChange={(e) => setLiveDemo(e.target.value)}
              placeholder="https://your-project.example"
            />
          </div>

          <div className="projects-form-actions">
            <button onClick={handleSaveProject}>
              {editingId ? 'Save Changes' : '+ Add Project'}
            </button>

            {editingId && (
              <button
                className="projects-cancel-button"
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="projects-list-section">
        <div className="projects-list-header">
          <h2>Your Work</h2>
          <span>
            {projects.length} {projects.length === 1 ? 'project' : 'projects'}
          </span>
        </div>

        {projects.length === 0 ? (
          <div className="projects-empty-state">
            <h3>No projects yet</h3>
            <p>Add your first project using the form above.</p>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map((project, index) => (
              <article className="project-card" key={project._id}>
                <div className="project-card-top">
                  <div className="project-icon">
                    {project.title.charAt(0).toUpperCase()}
                  </div>
                  <span className="project-number">
                    PROJECT {String(index + 1).padStart(2, '0')}
                  </span>
                </div>

                <h3>{project.title}</h3>

                <p className="project-card-description">
                  {project.description || 'No description provided yet.'}
                </p>

                <div className="project-technologies">
                  <h4>Technologies</h4>
                  {project.technologies.length > 0 ? (
                    <div className="project-tech-tags">
                      {project.technologies.map((technology, techIndex) => (
                        <span
                          className="project-tech-tag"
                          key={`${technology}-${techIndex}`}
                        >
                          {technology}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="project-no-tech">No technologies listed.</p>
                  )}
                </div>

                {(project.github || project.liveDemo) && (
                  <div className="project-links">
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
                )}

                <div className="project-card-actions">
                  <button
                    className="project-edit-button"
                    onClick={() => handleEdit(project)}
                  >
                    Edit
                  </button>

                  <button
                    className="project-delete-button"
                    onClick={() => handleDeleteProject(project._id)}
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

export default Projects;