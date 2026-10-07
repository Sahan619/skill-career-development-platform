import { useEffect, useState } from 'react';
import axios from 'axios';

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
            headers: {
              Authorization: `Bearer ${token}`,
            },
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

  const handleAddProject = async () => {
    if (!title.trim()) {
      alert('Project title is required');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const response = await axios.post(
        'http://localhost:5000/api/projects',
        {
          title,
          description,
          technologies: technologies
            .split(',')
            .map((technology) => technology.trim())
            .filter(Boolean),
          github,
          liveDemo,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProjects([response.data, ...projects]);

      setTitle('');
      setDescription('');
      setTechnologies('');
      setGithub('');
      setLiveDemo('');
    } catch (error) {
      console.error('Failed to add project:', error);

      if (axios.isAxiosError(error)) {
        alert(
          error.response?.data?.message || 'Failed to add project'
        );
      }
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const token = localStorage.getItem('token');

      await axios.delete(
        `http://localhost:5000/api/projects/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProjects(
        projects.filter((project) => project._id !== id)
      );
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };
  const handleUpdateProject = async (id: string) => {
  try {
    const token = localStorage.getItem('token');

    const response = await axios.put(
      `http://localhost:5000/api/projects/${id}`,
      {
        title,
        description,
        technologies: technologies
          .split(',')
          .map((technology) => technology.trim())
          .filter(Boolean),
        github,
        liveDemo,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setProjects(
      projects.map((project) =>
        project._id === id ? response.data : project
      )
    );

    setEditingId(null);

    setTitle('');
    setDescription('');
    setTechnologies('');
    setGithub('');
    setLiveDemo('');
  } catch (error) {
    console.error('Failed to update project:', error);
  }
};

  if (loading) {
    return <p>Loading projects...</p>;
  }

  return (
    <div>
      <h1>My Projects</h1>

      <h2>Add Project</h2>

      <input
        type="text"
        placeholder="Project title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <br />

      <textarea
        placeholder="Project description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <br />

      <input
        type="text"
        placeholder="Technologies (comma separated)"
        value={technologies}
        onChange={(e) => setTechnologies(e.target.value)}
      />

      <br />

      <input
        type="text"
        placeholder="GitHub URL"
        value={github}
        onChange={(e) => setGithub(e.target.value)}
      />

      <br />

      <input
        type="text"
        placeholder="Live Demo URL"
        value={liveDemo}
        onChange={(e) => setLiveDemo(e.target.value)}
      />

      <br />

      <button
  onClick={() =>
    editingId
      ? handleUpdateProject(editingId)
      : handleAddProject()
  }
>
  {editingId ? 'Update Project' : 'Add Project'}
</button>

      <hr />

      <h2>My Projects</h2>

      {projects.length === 0 ? (
        <p>No projects added yet.</p>
      ) : (
        projects.map((project) => (
          <div key={project._id}>
            <h2>{project.title}</h2>

            <p>{project.description}</p>

            <h3>Technologies</h3>

            <ul>
              {project.technologies.map((technology) => (
                <li key={technology}>{technology}</li>
              ))}
            </ul>

            {project.github && (
              <p>GitHub: {project.github}</p>
            )}

            {project.liveDemo && (
              <p>Live Demo: {project.liveDemo}</p>
            )}

            <button
  onClick={() => {
    setEditingId(project._id);
    setTitle(project.title);
    setDescription(project.description);
    setTechnologies(project.technologies.join(', '));
    setGithub(project.github);
    setLiveDemo(project.liveDemo);
  }}
>
  Edit
</button>

<button
  onClick={() => handleDeleteProject(project._id)}
>
  Delete
</button>
          </div>
        ))
      )}
    </div>
  );
};

export default Projects;