import React, { useState, useEffect } from 'react';

const SkillsManager = () => {
  const [skills, setSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [proficiency, setProficiency] = useState('intermediate');
  const [experience, setExperience] = useState(1);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/skills', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSkills(data.skills);
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;

    try {
      const response = await fetch('/api/ai/skills/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          skillName: newSkill,
          proficiencyLevel: proficiency,
          yearsOfExperience: experience,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSkills([...skills, data.skill]);
        setNewSkill('');
        setProficiency('intermediate');
        setExperience(1);
      } else {
        const error = await response.json();
        alert(error.error);
      }
    } catch (error) {
      console.error('Error adding skill:', error);
    }
  };

  const handleDeleteSkill = async (skillId) => {
    if (!window.confirm('Delete this skill?')) return;

    try {
      const response = await fetch(`/api/ai/skills/${skillId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });

      if (response.ok) {
        setSkills(skills.filter(s => s.id !== skillId));
      }
    } catch (error) {
      console.error('Error deleting skill:', error);
    }
  };

  const getProficiencyColor = (level) => {
    switch (level) {
      case 'beginner':
        return 'bg-yellow-100 text-yellow-800';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800';
      case 'advanced':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
          <h2 className="text-2xl font-bold">Your Skills</h2>
          <p className="text-blue-100 mt-1">
            Build your skills profile to get better job recommendations
          </p>
        </div>

        {/* Add Skill Form */}
        <div className="p-6 bg-blue-50 border-b border-blue-200">
          <form onSubmit={handleAddSkill} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Skill name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <select
                  value={proficiency}
                  onChange={(e) => setProficiency(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={experience}
                  onChange={(e) => setExperience(parseInt(e.target.value))}
                  placeholder="Years"
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
                >
                  Add Skill
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Skills List */}
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : skills.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">No skills yet</p>
              <p className="text-sm">Add your first skill above to get started</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {skills.map((skill) => (
                <div
                  key={skill.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900 capitalize">
                        {skill.skillName}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getProficiencyColor(
                          skill.proficiencyLevel
                        )}`}
                      >
                        {skill.proficiencyLevel}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {skill.yearsOfExperience} year{skill.yearsOfExperience !== 1 ? 's' : ''} of experience
                      {skill.endorsements > 0 && ` • ${skill.endorsements} endorsement${skill.endorsements !== 1 ? 's' : ''}`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteSkill(skill.id)}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        {skills.length > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{skills.length}</p>
                <p className="text-sm text-gray-600">Skills</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {skills.filter(s => s.proficiencyLevel === 'advanced').length}
                </p>
                <p className="text-sm text-gray-600">Advanced</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {skills.reduce((sum, s) => sum + s.yearsOfExperience, 0)}
                </p>
                <p className="text-sm text-gray-600">Total Years</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillsManager;
