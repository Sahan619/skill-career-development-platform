
import { useEffect, useState } from 'react';
import axios from 'axios';
import './Skills.css';

const degreeSkills: Record<string, Record<string, string[]>> = {
  'Computer Engineering': {
    Programming: [
      'C Programming',
      'C++',
      'Java',
      'Python',
      'Go',
      'JavaScript',
      'TypeScript',
    ],
    'Computer Science': [
      'Data Structures & Algorithms',
      'Object-Oriented Programming',
      'Operating Systems',
      'Computer Networks',
      'Database Management',
      'Computer Architecture',
    ],
    'Software Development': [
      'Web Development',
      'React',
      'Node.js',
      'REST API Development',
      'Software Engineering',
      'Git & GitHub',
      'Docker',
      'DevOps',
      'Cloud Computing',
      'Cybersecurity',
    ],
    'Hardware & AI': [
      'Digital Logic Design',
      'Verilog HDL',
      'Embedded Systems',
      'Microprocessors',
      'Machine Learning',
      'PCB Design',
    ],
  },

  'Civil Engineering': {
    'Design & Drawing': [
      'AutoCAD',
      'Civil 3D',
      'Revit',
      'Building Information Modeling (BIM)',
    ],
    Engineering: [
      'Structural Analysis',
      'Geotechnical Engineering',
      'Transportation Engineering',
      'Hydraulics',
      'Surveying',
      'Concrete Technology',
      'Building Materials',
    ],
    Construction: [
      'Construction Management',
      'Estimation & Costing',
      'Project Management',
      'Quantity Surveying',
    ],
  },

  'Mechanical Engineering': {
    'Core Engineering': [
      'Engineering Mechanics',
      'Thermodynamics',
      'Fluid Mechanics',
      'Heat Transfer',
      'Machine Design',
      'Manufacturing Processes',
    ],
    'Design & Simulation': [
      'SolidWorks',
      'AutoCAD',
      'CATIA',
      'Finite Element Analysis',
      'Computational Fluid Dynamics',
    ],
    'Automation & Systems': [
      'Robotics',
      'Mechatronics',
      'CNC Machining',
      'HVAC Design',
      'MATLAB',
    ],
  },

  'Electrical Engineering': {
    'Core Engineering': [
      'Circuit Analysis',
      'Electrical Machines',
      'Power Systems',
      'Power Electronics',
      'Control Systems',
      'Signal Processing',
      'Instrumentation',
    ],
    'Software & Design': [
      'MATLAB',
      'PLC Programming',
      'AutoCAD Electrical',
      'Embedded Systems',
      'PCB Design',
    ],
    'Energy & Automation': [
      'Renewable Energy',
      'Electrical Installation',
      'Industrial Automation',
    ],
  },

  'Business & Commerce': {
    Accounting: [
      'Financial Accounting',
      'Management Accounting',
      'Auditing',
      'Taxation',
      'Financial Reporting',
    ],
    Management: [
      'Human Resource Management',
      'Project Management',
      'Supply Chain Management',
      'Operations Management',
      'Strategic Management',
    ],
    'Business & Finance': [
      'Business Economics',
      'Business Statistics',
      'Financial Management',
      'Business Law',
      'Entrepreneurship',
      'Business Communication',
    ],
    'Digital & Analytical Skills': [
      'Microsoft Excel',
      'Data Analysis',
      'Digital Marketing',
      'Marketing',
      'Power BI',
    ],
  },
};

type Level = 'Beginner' | 'Intermediate' | 'Advanced';

interface Skill {
  _id: string;
  name: string;
  category: string;
  level: Level;
}

const degrees = Object.keys(degreeSkills);

const getCategory = (degree: string, skillName: string) =>
  Object.entries(degreeSkills[degree] || {}).find(([, names]) =>
    names.includes(skillName)
  )?.[0] || '';

const Skills = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  const [degree, setDegree] = useState(degrees[0]);
  const [category, setCategory] = useState('');
  const [name, setName] = useState('');
  const [level, setLevel] = useState<Level>('Beginner');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDegree, setEditDegree] = useState(degrees[0]);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editLevel, setEditLevel] = useState<Level>('Beginner');

  const categories = Object.keys(degreeSkills[degree] || {});
  const availableSkills = degreeSkills[degree]?.[category] || [];

  const editCategories = Object.keys(degreeSkills[editDegree] || {});
  const editAvailableSkills =
    degreeSkills[editDegree]?.[editCategory] || [];

  useEffect(() => {
    const loadSkills = async () => {
      try {
        const token = localStorage.getItem('token');

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/skills`,
          {
            headers: { Authorization: `Bearer ${token}` },
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
    if (!degree || !category || !name) {
      alert('Please select a degree, category, and skill.');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/skills`,
        { name, category, level },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSkills((current) => [response.data.skill, ...current]);

      setCategory('');
      setName('');
      setLevel('Beginner');
    } catch (error) {
      console.error('Failed to add skill:', error);
      alert('Failed to add skill. Please try again.');
    }
  };

  const startEditing = (skill: Skill) => {
    const matchingDegree =
      degrees.find((item) => getCategory(item, skill.name)) ||
      degrees[0];

    const matchingCategory = getCategory(matchingDegree, skill.name);

    setEditingId(skill._id);
    setEditDegree(matchingDegree);
    setEditCategory(matchingCategory);
    setEditName(skill.name);
    setEditLevel(skill.level);
  };

  const handleEditSkill = async (id: string) => {
    if (!editDegree || !editCategory || !editName) {
      alert('Please select a degree, category, and skill.');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/skills/${id}`,
        {
          name: editName,
          category: editCategory,
          level: editLevel,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSkills((current) =>
        current.map((skill) =>
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
    if (!window.confirm('Are you sure you want to delete this skill?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');

      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/skills/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSkills((current) =>
        current.filter((skill) => skill._id !== id)
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
          <p>Track your skills and keep growing.</p>
        </div>

        <div className="skills-count">
          <strong>{skills.length}</strong>
          <span>Skills tracked</span>
        </div>
      </header>

      <section className="skills-panel">
        <h2>Add a Skill</h2>
        <p className="skills-panel-description">
          Select your degree and choose a relevant skill.
        </p>

        <div className="skills-form">
          <div className="skills-form-field">
            <label htmlFor="skill-degree">Degree / Discipline</label>
            <select
              id="skill-degree"
              value={degree}
              onChange={(e) => {
                setDegree(e.target.value);
                setCategory('');
                setName('');
              }}
            >
              {degrees.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          <div className="skills-form-field">
            <label htmlFor="skill-category">Skill category</label>
            <select
              id="skill-category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setName('');
              }}
            >
              <option value="">Choose a category</option>
              {categories.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          <div className="skills-form-field">
            <label htmlFor="skill-name">Skill</label>
            <select
              id="skill-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!category}
            >
              <option value="">Choose a skill</option>
              {availableSkills.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          <div className="skills-form-field">
            <label htmlFor="skill-level">Current level</label>
            <select
              id="skill-level"
              value={level}
              onChange={(e) => setLevel(e.target.value as Level)}
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

                    <label htmlFor={`edit-degree-${skill._id}`}>
                      Degree / Discipline
                    </label>
                    <select
                      id={`edit-degree-${skill._id}`}
                      value={editDegree}
                      onChange={(e) => {
                        setEditDegree(e.target.value);
                        setEditCategory('');
                        setEditName('');
                      }}
                    >
                      {degrees.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>

                    <label htmlFor={`edit-category-${skill._id}`}>
                      Category
                    </label>
                    <select
                      id={`edit-category-${skill._id}`}
                      value={editCategory}
                      onChange={(e) => {
                        setEditCategory(e.target.value);
                        setEditName('');
                      }}
                    >
                      <option value="">Choose a category</option>
                      {editCategories.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>

                    <label htmlFor={`edit-name-${skill._id}`}>
                      Skill
                    </label>
                    <select
                      id={`edit-name-${skill._id}`}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      disabled={!editCategory}
                    >
                      <option value="">Choose a skill</option>
                      {editAvailableSkills.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                      {editName && !editAvailableSkills.includes(editName) && (
                        <option value={editName}>{editName} (existing)</option>
                      )}
                    </select>

                    <label htmlFor={`edit-level-${skill._id}`}>
                      Level
                    </label>
                    <select
                      id={`edit-level-${skill._id}`}
                      value={editLevel}
                      onChange={(e) => setEditLevel(e.target.value as Level)}
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
