import React from 'react';

const ResumePreview = ({ resume, resumeData }) => {
  // Support both resume and resumeData props for backward compatibility
  const data = resumeData || resume;

  // If no data, show placeholder
  if (!data) {
    return (
      <div className="resume-preview">
        <h2>Resume Preview</h2>
        <p>No resume data to display</p>
      </div>
    );
  }

  // Extract personal info - handle both flat and nested structures
  const personalInfo = data.personalInfo || data;
  const fullName = personalInfo.fullName || '';
  const email = personalInfo.email || '';
  const phone = personalInfo.phone || '';
  const location = personalInfo.location || '';
  const summary = personalInfo.summary || data.summary || '';

  return (
    <div className="resume-preview">
      <h2>Resume Preview</h2>
      
      {/* Header */}
      <section className="preview-section">
        <h3>{fullName || '(Your Name)'}</h3>
        {email && <p>{email}</p>}
        {phone && <p>{phone}</p>}
        {location && <p>{location}</p>}
      </section>

      {/* Summary */}
      {summary && (
        <section className="preview-section">
          <h4>Professional Summary</h4>
          <p>{summary}</p>
        </section>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <section className="preview-section">
          <h4>Experience</h4>
          {data.experience.map((exp, idx) => (
            <div key={idx} className="preview-item">
              <h5>{exp.jobTitle || '(Job Title)'}</h5>
              <p className="company">{exp.company || ''} | {exp.startDate || ''} - {exp.endDate || ''}</p>
              {exp.description && <p>{exp.description}</p>}
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <section className="preview-section">
          <h4>Education</h4>
          {data.education.map((edu, idx) => (
            <div key={idx} className="preview-item">
              <h5>{edu.degree || '(Degree)'}</h5>
              <p className="school">{edu.school || ''} | {edu.graduationYear || ''}</p>
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <section className="preview-section">
          <h4>Skills</h4>
          <div className="skills-list">
            {data.skills.map((skill, idx) => (
              <span key={idx} className="skill-tag">{skill}</span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ResumePreview;
