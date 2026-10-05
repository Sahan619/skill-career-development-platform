import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
          'http://localhost:5000/api/career-paths',
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
    return <p>Loading career paths...</p>;
  }

  return (
    <div>
      <h1>Career Paths</h1>

      {careerPaths.length === 0 ? (
        <p>No career paths available.</p>
      ) : (
        careerPaths.map((careerPath) => (
          <div key={careerPath._id}>
            <h2>{careerPath.title}</h2>

            <p>{careerPath.description}</p>

            <h3>Required Skills</h3>

            <ul>
                <button
  onClick={() =>
    navigate('/roadmap', {
      state: careerPath,
    })
  }
>
  View Roadmap
</button>
              {careerPath.skills.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
};

export default CareerPaths;