import { useEffect, useState } from 'react';
import axios from 'axios';


interface User {
  name: string;
  email: string;
  university: string;
  degree: string;
  studyYear: number | null;
  careerGoal: string;
  github: string;
  linkedin: string;
}

const Profile = () => {
 const [user, setUser] = useState<User | null>(null);
 const [loading, setLoading] = useState(true); 
 const [editing, setEditing] = useState(false);
 const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
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

        setUser(response.data);
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
  if (!user) return;

  try {
    setSaving(true);

    const token = localStorage.getItem('token');

    const response = await axios.put(
      'http://localhost:5000/api/profile',
      user,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setUser(response.data.user);
    setEditing(false);

    localStorage.setItem(
      'user',
      JSON.stringify(response.data.user)
    );
  } catch (error) {
    console.error('Failed to update profile:', error);
  } finally {
    setSaving(false);
  }
};

  if (loading) {
    return <p>Loading profile...</p>;
  }

  if (!user) {
    return <p>Failed to load profile.</p>;
  }

 
    
return (
  <div>
    <h1>Profile</h1>

    {!editing && (
      <button onClick={() => setEditing(true)}>
        Edit Profile
      </button>
    )}

    {editing ? (
      <div>
        <div>
          <label>Name</label>
          <input
            type="text"
            value={user.name}
            onChange={(e) =>
              setUser({ ...user, name: e.target.value })
            }
          />
        </div>

        <div>
          <label>Email</label>
          <input
            type="email"
            value={user.email}
            disabled
          />
        </div>

        <div>
          <label>University</label>
          <input
            type="text"
            value={user.university}
            onChange={(e) =>
              setUser({ ...user, university: e.target.value })
            }
          />
        </div>

        <div>
          <label>Degree</label>
          <input
            type="text"
            value={user.degree}
            onChange={(e) =>
              setUser({ ...user, degree: e.target.value })
            }
          />
        </div>

        <div>
          <label>Study Year</label>
          <input
            type="number"
            value={user.studyYear ?? ''}
            onChange={(e) =>
              setUser({
                ...user,
                studyYear: e.target.value
                  ? Number(e.target.value)
                  : null,
              })
            }
          />
        </div>

        <div>
          <label>Career Goal</label>
          <input
            type="text"
            value={user.careerGoal}
            onChange={(e) =>
              setUser({ ...user, careerGoal: e.target.value })
            }
          />
        </div>

        <div>
          <label>GitHub</label>
          <input
            type="text"
            value={user.github}
            onChange={(e) =>
              setUser({ ...user, github: e.target.value })
            }
          />
        </div>

        <div>
          <label>LinkedIn</label>
          <input
            type="text"
            value={user.linkedin}
            onChange={(e) =>
              setUser({ ...user, linkedin: e.target.value })
            }
          />
        </div>

        <button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>

        <button onClick={() => setEditing(false)}>
          Cancel
        </button>
      </div>
    ) : (
      <div>
        <p>
          <strong>Name:</strong> {user.name}
        </p>

        <p>
          <strong>Email:</strong> {user.email}
        </p>

        <p>
          <strong>University:</strong>{' '}
          {user.university || 'Not added'}
        </p>

        <p>
          <strong>Degree:</strong>{' '}
          {user.degree || 'Not added'}
        </p>

        <p>
          <strong>Study Year:</strong>{' '}
          {user.studyYear || 'Not added'}
        </p>

        <p>
          <strong>Career Goal:</strong>{' '}
          {user.careerGoal || 'Not added'}
        </p>

        <p>
          <strong>GitHub:</strong>{' '}
          {user.github || 'Not added'}
        </p>

        <p>
          <strong>LinkedIn:</strong>{' '}
          {user.linkedin || 'Not added'}
        </p>
      </div>
    )}
  </div>
);
};
export default Profile;