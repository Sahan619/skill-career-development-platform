
import { useEffect, useState } from 'react';
import axios from 'axios';
import './Skills.css';

interface Skill {
  _id: string;
  name: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
}

const Skills = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] =
    useState<Skill['level']>('Beginner');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editLevel, setEditLevel] =
    useState<Skill['level']>('Beginner');

  useEffect(() => {
    const loadSkills = async () => {
      try {
        const token = localStorage.getItem('token');

        const response = await axios.get(
          'http://localhost:5000/api/skills',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setSkills(response.data);
      } catch (error) {
        console.error('Failed to load skills:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSkills();
  }, []);

  const handleAddSkill = async () => {
    if (!name.trim() || !category.trim()) {
      alert('Please enter both skill name and category.');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const response = await axios.post(
        'http://localhost:5000/api/skills',
        {
          name: name.trim(),
          category: category.trim(),
          level,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSkills((currentSkills) => [
        response.data.skill,
        ...currentSkills,
      ]);

      setName('');
      setCategory('');
      setLevel('Beginner');
    } catch (error) {
      console.error('Failed to add skill:', error);
      alert('Failed to add skill. Please try again.');
    }
  };

  const startEditing = (skill: Skill) => {
    setEditingId(skill._id);
    setEditName(skill.name);
    setEditCategory(skill.category);
    setEditLevel(skill.level);
  };

  const handleEditSkill = async (id: string) => {
    if (!editName.trim() || !editCategory.trim()) {
      alert('Please enter both skill name and category.');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const response = await axios.put(
        `http://localhost:5000/api/skills/${id}`,
        {
          name: editName.trim(),
          category: editCategory.trim(),
          level: editLevel,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSkills((currentSkills) =>
        currentSkills.map((skill) =>
          skill._id === id ? response.data.skill : skill
        )
      );

      setEditingId(null);
    } catch (error) {
      console.error('Failed to update skill:', error);
      alert('Failed to update skill. Please try again.');
    }
  };

  const handleDeleteSkill = async (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this skill?'
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem('token');

      await axios.delete(
        `http://localhost:5000/api/skills/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSkills((currentSkills) =>
        currentSkills.filter((skill) => skill._id !== id)
      );
    } catch (error) {
      console.error('Failed to delete skill:', error);
      alert('Failed to delete skill. Please try again.');
    }
  };

  if (loading) {
    return <p className="skills-loading">Loading skills...</p>;
  }

  return (
    <main className="skills-page">
      <header className="skills-page-header">
        <div>
          <p className="skills-eyebrow">YOUR DEVELOPMENT</p>
          <h1>My Skills</h1>
          <p>Track your technical abilities and keep growing.</p>
        </div>

        <div className="skills-count">
          <strong>{skills.length}</strong>
          <span>Skills tracked</span>
        </div>
      </header>

      <section className="skills-panel">
        <h2>Add a Skill</h2>
        <p className="skills-panel-description">
          Record a skill you are learning or already know.
        </p>

        <div className="skills-form">
          <div className="skills-form-field">
            <label htmlFor="skill-name">Skill name</label>
            <input
              id="skill-name"
              type="text"
              placeholder="e.g. Python"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="skills-form-field">
            <label htmlFor="skill-category">Category</label>
            <input
              id="skill-category"
              type="text"
              placeholder="e.g. Programming"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <div className="skills-form-field">
            <label htmlFor="skill-level">Current level</label>
            <select
              id="skill-level"
              value={level}
              onChange={(e) =>
                setLevel(e.target.value as Skill['level'])
              }
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <button
            className="skills-primary-button"
            onClick={handleAddSkill}
          >
            + Add Skill
          </button>
        </div>
      </section>

      <section className="skills-list-section">
        <div className="skills-list-header">
          <h2>Your Skills</h2>
          <span>{skills.length} total</span>
        </div>

        {skills.length === 0 ? (
          <div className="skills-empty-state">
            <h3>No skills yet</h3>
            <p>Add your first skill using the form above.</p>
          </div>
        ) : (
          <div className="skills-grid">
            {skills.map((skill) => (
              <article className="skill-card" key={skill._id}>
                {editingId === skill._id ? (
                  <div className="skill-edit-form">
                    <h3>Edit Skill</h3>

                    <label htmlFor={`edit-name-${skill._id}`}>
                      Skill name
                    </label>
                    <input
                      id={`edit-name-${skill._id}`}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />

                    <label htmlFor={`edit-category-${skill._id}`}>
                      Category
                    </label>
                    <input
                      id={`edit-category-${skill._id}`}
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                    />

                    <label htmlFor={`edit-level-${skill._id}`}>
                      Level
                    </label>
                    <select
                      id={`edit-level-${skill._id}`}
                      value={editLevel}
                      onChange={(e) =>
                        setEditLevel(e.target.value as Skill['level'])
                      }
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>

                    <div className="skill-card-actions">
                      <button
                        className="skills-primary-button"
                        onClick={() => handleEditSkill(skill._id)}
                      >
                        Save Changes
                      </button>

                      <button
                        className="skills-secondary-button"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="skill-card-top">
                      <div className="skill-icon">
                        {skill.name.charAt(0).toUpperCase()}
                      </div>

                      <span
                        className={`skill-level skill-level-${skill.level.toLowerCase()}`}
                      >
                        {skill.level}
                      </span>
                    </div>

                    <h3>{skill.name}</h3>
                    <p className="skill-category">{skill.category}</p>

                    <div className="skill-card-actions">
                      <button
                        className="skills-secondary-button"
                        onClick={() => startEditing(skill)}
                      >
                        Edit
                      </button>

                      <button
                        className="skills-delete-button"
                        onClick={() => handleDeleteSkill(skill._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default Skills;
