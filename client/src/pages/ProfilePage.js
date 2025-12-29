import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './ProfilePage.css';

function ProfilePage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`/api/users/${id}`);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container"><p>Loading profile...</p></div>;
  if (!user) return <div className="container"><p>User not found</p></div>;

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <div className="profile-avatar"></div>
          <div className="profile-info">
            <h1>{user.firstName} {user.lastName}</h1>
            <p className="profile-email">{user.email}</p>
            <p className="profile-type">{user.userType.replace('_', ' ').toUpperCase()}</p>
            {user.location && <p className="profile-location">{user.location}</p>}
          </div>
        </div>

        <div className="profile-content">
          {user.bio && (
            <div className="profile-section">
              <h2>About</h2>
              <p>{user.bio}</p>
            </div>
          )}

          {user.certifications && user.certifications.length > 0 && (
            <div className="profile-section">
              <h2>Certifications</h2>
              <ul>
                {user.certifications.map((cert, index) => (
                  <li key={index}>{cert}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="profile-section">
            <h2>Contact Information</h2>
            <div className="contact-info">
              {user.phone && <p><strong>Phone:</strong> {user.phone}</p>}
              <p><strong>Email:</strong> {user.email}</p>
              {user.location && <p><strong>Location:</strong> {user.location}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
