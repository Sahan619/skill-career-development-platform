import { useEffect, useState } from 'react';
import axios from 'axios';

interface Skill {
  _id: string;
  name: string;
}

interface ProgressItem {
  _id: string;
  skill: Skill;
  progress: number;
}

const Progress = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [progressList, setProgressList] = useState<ProgressItem[]>([]);

  const averageProgress =
  progressList.length > 0
    ? Math.round(
        progressList.reduce((total, item) => total + item.progress, 0) /
          progressList.length
      )
    : 0;

  const [selectedSkill, setSelectedSkill] = useState('');
  const [progress, setProgress] = useState(0);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('token');

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [skillsResponse, progressResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/skills', { headers }),
          axios.get('http://localhost:5000/api/progress', { headers }),
        ]);

        setSkills(skillsResponse.data);
        setProgressList(progressResponse.data);
      } catch (error) {
        console.error('Failed to load progress:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAddProgress = async () => {
    if (!selectedSkill) {
      alert('Please select a skill');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const response = await axios.post(
        'http://localhost:5000/api/progress',
        {
          skillId: selectedSkill,
          progress: Number(progress),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProgressList([...progressList, response.data]);

      setSelectedSkill('');
      setProgress(0);
    }  catch (error) {
  if (axios.isAxiosError(error)) {
    alert(
      error.response?.data?.message || 'Failed to add progress'
    );
  } else {
    alert('Failed to add progress');
  }
}
  };

  const handleUpdate = async (id: string, value: number) => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.put(
        `http://localhost:5000/api/progress/${id}`,
        {
          progress: value,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProgressList(
        progressList.map((item) =>
          item._id === id
            ? { ...item, progress: response.data.progress }
            : item
        )
      );
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('token');

      await axios.delete(
        `http://localhost:5000/api/progress/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProgressList(
        progressList.filter((item) => item._id !== id)
      );
    } catch (error) {
      console.error('Failed to delete progress:', error);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Progress</h1>

      <h2>Add Skill Progress</h2>

      <select
        value={selectedSkill}
        onChange={(e) => setSelectedSkill(e.target.value)}
      >
        <option value="">Select a skill</option>

        {skills.map((skill) => (
          <option key={skill._id} value={skill._id}>
            {skill.name}
          </option>
        ))}
      </select>

      <input
        type="number"
        min="0"
        max="100"
        value={progress}
        onChange={(e) => setProgress(Number(e.target.value))}
      />

      <button onClick={handleAddProgress}>
        Add Progress
      </button>

      <hr />

      <h2>My Progress</h2>

      <h3>Overall Progress: {averageProgress}%</h3>

      {progressList.length === 0 ? (
        <p>No progress added yet.</p>
      ) : (
        progressList.map((item) => (
          <div key={item._id}>
            <h3>{item.skill.name}</h3>

            <input
              type="range"
              min="0"
              max="100"
              value={item.progress}
              onChange={(e) =>
                handleUpdate(item._id, Number(e.target.value))
              }
            />

            <span> {item.progress}%</span>

            <button onClick={() => handleDelete(item._id)}>
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default Progress;