import { useEffect, useState } from 'react';
import axios from 'axios';

interface Profile {
  name: string;
  email: string;
  university: string;
  degree: string;
  studyYear: number | null;
  careerGoal: string;
  github: string;
  linkedin: string;
}
interface Skill {
  _id: string;
  name: string;
  category: string;
  level: string;
}

const Portfolio = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem('token');

        const response = await axios.get(
          'http://localhost:5000/api/profile',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setProfile(response.data);
        const skillsResponse = await axios.get(
  'http://localhost:5000/api/skills',
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

setSkills(skillsResponse.data);
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return <p>Loading portfolio...</p>;
  }

  if (!profile) {
    return <p>Profile information not available.</p>;
  }

  return (
    <div>
      <h1>My Portfolio</h1>

      <h2>{profile.name}</h2>

      <p>{profile.email}</p>

      <h3>Education</h3>

      <p>{profile.degree}</p>
      <p>{profile.university}</p>

      {profile.studyYear && (
        <p>Year {profile.studyYear}</p>
      )}

      <h2>Career Goal</h2>

      <p>{profile.careerGoal || 'Not specified'}</p>

      <h2>Links</h2>

      {profile.github && (
        <p>GitHub: {profile.github}</p>
      )}

      {profile.linkedin && (
        <p>LinkedIn: {profile.linkedin}</p>
      )}

      <h2>Skills</h2>

{skills.length === 0 ? (
  <p>No skills added yet.</p>
) : (
  <ul>
    {skills.map((skill) => (
      <li key={skill._id}>
        {skill.name} - {skill.level}
      </li>
    ))}
  </ul>
)}

      <h2>Projects</h2>

      <p>My projects will appear here.</p>
    </div>
  );
};

export default Portfolio;