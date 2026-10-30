
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import './Profile.css';

interface User {
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

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [originalUser, setOriginalUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUser(response.data);
        setOriginalUser(response.data);
      } catch (error) {
        console.error('Failed to load profile:', error);
        setError('Could not load your profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handlePhotoChange = async (
  event: React.ChangeEvent<HTMLInputElement>
) => {
  const file = event.target.files?.[0];
  event.target.value = '';

  if (!file) return;

  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    setPhotoError('Choose a JPG, PNG, or WebP image.');
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    setPhotoError('Image must be 5 MB or smaller.');
    return;
  }

  try {
    setUploadingPhoto(true);
    setPhotoError('');

    const formData = new FormData();
    formData.append('photo', file);

    const token = localStorage.getItem('token');

    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/profile/photo`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const updatedUser = {
      ...user!,
      profilePhoto: response.data.profilePhoto,
    };

    setUser(updatedUser);
    setOriginalUser(updatedUser);

    localStorage.setItem('user', JSON.stringify(updatedUser));
  } catch (error) {
    console.error('Photo upload failed:', error);
    setPhotoError('Could not upload your photo. Please try again.');
  } finally {
    setUploadingPhoto(false);
  }
}; 


  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);
      setError('');

      const token = localStorage.getItem('token');

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/profile`,
        user,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser(response.data.user);
      setOriginalUser(response.data.user);
      setEditing(false);

      localStorage.setItem(
        'user',
        JSON.stringify(response.data.user)
      );
    } catch (error) {
      console.error('Failed to update profile:', error);
      setError('Could not save your changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setUser(originalUser);
    setEditing(false);
    setError('');
  };

  if (loading) {
    return (
      <div className="profile-page">
        <p className="profile-message">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page">
        <h1>My Profile</h1>
        <p className="profile-error">
          {error || 'Failed to load profile.'}
        </p>
      </div>
    );
  }

  const initials = user.name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="profile-page">
      <div className="profile-heading">
        <div>
          <h1>My Profile</h1>
          <p>Manage your personal and career information.</p>
        </div>

        {!editing && (
          <button onClick={() => setEditing(true)}>
            Edit Profile
          </button>
        )}
      </div>

      {error && (
        <p className="profile-error" role="alert">
          {error}
        </p>
      )}

      <section className="profile-card">
        <div className="profile-banner" />

        <div className="profile-identity">
          <div className="profile-avatar">
  {user.profilePhoto ? (
    <img
      src={user.profilePhoto}
      alt="Profile"
      onLoad={(event) => event.currentTarget.classList.add('media-loaded')}
      onError={(event) => event.currentTarget.classList.add('media-loaded')}
    />
  ) : (
    initials || '?'
  )}
</div>

<input
  ref={fileInputRef}
  type="file"
  accept="image/jpeg,image/png,image/webp"
  hidden
  onChange={handlePhotoChange}
/>

<button
  type="button"
  onClick={() => fileInputRef.current?.click()}
  disabled={uploadingPhoto}
>
  {uploadingPhoto ? 'Uploading...' : 'Change Photo'}
</button>

{photoError && (
  <p className="profile-error" role="alert">
    {photoError}
  </p>
)}

          <div className="profile-identity-info">
            <h2>{user.name || 'Your Name'}</h2>
            <p>{user.email}</p>
            <span className="profile-badge">
              Student Profile
            </span>
          </div>
        </div>

        {editing ? (
          <form
            className="profile-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            <h3>Edit Information</h3>

            <div className="profile-form-grid">
              <div className="profile-field">
                <label htmlFor="profile-name">Full Name</label>
                <input
                  id="profile-name"
                  type="text"
                  value={user.name}
                  onChange={(e) =>
                    setUser({ ...user, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="profile-field">
                <label htmlFor="profile-email">Email</label>
                <input
                  id="profile-email"
                  type="email"
                  value={user.email}
                  disabled
                />
              </div>

              <div className="profile-field">
                <label htmlFor="profile-university">University</label>
                <input
                  id="profile-university"
                  type="text"
                  value={user.university || ''}
                  onChange={(e) =>
                    setUser({ ...user, university: e.target.value })
                  }
                />
              </div>

              <div className="profile-field">
                <label htmlFor="profile-degree">Degree</label>
                <input
                  id="profile-degree"
                  type="text"
                  value={user.degree || ''}
                  onChange={(e) =>
                    setUser({ ...user, degree: e.target.value })
                  }
                />
              </div>

              <div className="profile-field">
                <label htmlFor="profile-year">Study Year</label>
                <input
                  id="profile-year"
                  type="number"
                  min="1"
                  max="4"
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

              <div className="profile-field">
                <label htmlFor="profile-goal">Career Goal</label>
                <input
                  id="profile-goal"
                  type="text"
                  value={user.careerGoal || ''}
                  onChange={(e) =>
                    setUser({ ...user, careerGoal: e.target.value })
                  }
                  placeholder="e.g. Software Engineer"
                />
              </div>

              <div className="profile-field">
                <label htmlFor="profile-github">GitHub URL</label>
                <input
                  id="profile-github"
                  type="url"
                  value={user.github || ''}
                  onChange={(e) =>
                    setUser({ ...user, github: e.target.value })
                  }
                  placeholder="https://github.com/username"
                />
              </div>

              <div className="profile-field">
                <label htmlFor="profile-linkedin">LinkedIn URL</label>
                <input
                  id="profile-linkedin"
                  type="url"
                  value={user.linkedin || ''}
                  onChange={(e) =>
                    setUser({ ...user, linkedin: e.target.value })
                  }
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            </div>

            <div className="profile-actions">
              <button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>

              <button
                type="button"
                className="profile-cancel-button"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-details">
            <h3>Personal & Career Information</h3>

            <div className="profile-details-grid">
              <div className="profile-detail">
                <span>Full Name</span>
                <strong>{user.name || 'Not added'}</strong>
              </div>

              <div className="profile-detail">
                <span>Email Address</span>
                <strong>{user.email || 'Not added'}</strong>
              </div>

              <div className="profile-detail">
                <span>University</span>
                <strong>{user.university || 'Not added'}</strong>
              </div>

              <div className="profile-detail">
                <span>Degree</span>
                <strong>{user.degree || 'Not added'}</strong>
              </div>

              <div className="profile-detail">
                <span>Study Year</span>
                <strong>{user.studyYear ?? 'Not added'}</strong>
              </div>

              <div className="profile-detail">
                <span>Career Goal</span>
                <strong>{user.careerGoal || 'Not added'}</strong>
              </div>

              <div className="profile-detail">
                <span>GitHub</span>
                {user.github ? (
                  <a href={user.github} target="_blank" rel="noopener noreferrer">
                    View GitHub Profile
                  </a>
                ) : (
                  <strong>Not added</strong>
                )}
              </div>

              <div className="profile-detail">
                <span>LinkedIn</span>
                {user.linkedin ? (
                  <a href={user.linkedin} target="_blank" rel="noopener noreferrer">
                    View LinkedIn Profile
                  </a>
                ) : (
                  <strong>Not added</strong>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Profile;
