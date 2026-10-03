import { useEffect, useState } from 'react';
import axios from 'axios';

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
  const [level, setLevel] = useState<
    'Beginner' | 'Intermediate' | 'Advanced'
  >('Beginner');

  const [editingId, setEditingId] = useState<string | null>(null);
const [editName, setEditName] = useState('');
const [editCategory, setEditCategory] = useState('');
const [editLevel, setEditLevel] = useState<
  'Beginner' | 'Intermediate' | 'Advanced'
>('Beginner');

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
    if (!name || !category) {
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const response = await axios.post(
        'http://localhost:5000/api/skills',
        {
          name,
          category,
          level,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSkills([response.data.skill, ...skills]);

      setName('');
      setCategory('');
      setLevel('Beginner');
    } catch (error) {
      console.error('Failed to add skill:', error);
    }
  };
  const startEditing = (skill: Skill) => {
  setEditingId(skill._id);
  setEditName(skill.name);
  setEditCategory(skill.category);
  setEditLevel(skill.level);
};

  const handleEditSkill = async (id: string) => {
  try {
    const token = localStorage.getItem('token');

    const response = await axios.put(
      `http://localhost:5000/api/skills/${id}`,
      {
        name: editName,
        category: editCategory,
        level: editLevel,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setSkills(
      skills.map((skill) =>
        skill._id === id ? response.data.skill : skill
      )
    );

    setEditingId(null);
  } catch (error) {
    console.error('Failed to update skill:', error);
  }
};

  const handleDeleteSkill = async (id: string) => {
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

      setSkills(
        skills.filter((skill) => skill._id !== id)
      );
    } catch (error) {
      console.error('Failed to delete skill:', error);
    }
  };

  if (loading) {
    return <p>Loading skills...</p>;
  }

  return (
    <div>
      <h1>Skills</h1>

      <h2>Add Skill</h2>

      <div>
        <input
          type="text"
          placeholder="Skill name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <select
          value={level}
          onChange={(e) =>
            setLevel(
              e.target.value as
                | 'Beginner'
                | 'Intermediate'
                | 'Advanced'
            )
          }
        >
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>

        <button onClick={handleAddSkill}>
          Add Skill
        </button>
      </div>

      <h2>My Skills</h2>

      {skills.length === 0 ? (
        <p>No skills added yet.</p>
      ) : (
        <div>
          {skills.map((skill) => (
  <div key={skill._id}>
    {editingId === skill._id ? (
      <div>
        <input
          type="text"
          value={editName}
          onChange={(e) =>
            setEditName(e.target.value)
          }
        />

        <input
          type="text"
          value={editCategory}
          onChange={(e) =>
            setEditCategory(e.target.value)
          }
        />

        <select
          value={editLevel}
          onChange={(e) =>
            setEditLevel(
              e.target.value as
                | 'Beginner'
                | 'Intermediate'
                | 'Advanced'
            )
          }
        >
          <option value="Beginner">
            Beginner
          </option>

          <option value="Intermediate">
            Intermediate
          </option>

          <option value="Advanced">
            Advanced
          </option>
        </select>

        <button
          onClick={() =>
            handleEditSkill(skill._id)
          }
        >
          Save
        </button>

        <button
          onClick={() => setEditingId(null)}
        >
          Cancel
        </button>
      </div>
    ) : (
      <div>
        <h3>{skill.name}</h3>

        <p>
          Category: {skill.category}
        </p>

        <p>
          Level: {skill.level}
        </p>

        <button
          onClick={() => startEditing(skill)}
        >
          Edit
        </button>

        <button
          onClick={() =>
            handleDeleteSkill(skill._id)
          }
        >
          Delete
        </button>
      </div>
    )}
  </div>
))}
        </div>
      )}
    </div>
  );
};

export default Skills;