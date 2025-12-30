import React from 'react';
import './ResumeStepForm.css';

function ResumeStepForm({ step, resume, onResumeChange }) {
  const handleInputChange = (e, section, index = null, field = null) => {
    const { name, value } = e.target;
    let updated = { ...resume };

    if (section === 'personalInfo') {
      updated.personalInfo[name] = value;
    } else if (index !== null && field) {
      updated[section][index][field] = value;
    } else if (field) {
      updated[section][field] = value;
    }

    onResumeChange(updated);
  };

  const addItem = (section) => {
    let updated = { ...resume };
    const templates = {
      experience: {
        jobTitle: '',
        employer: '',
        location: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        description: '',
      },
      education: {
        degree: 'Bachelor',
        field: '',
        school: '',
        location: '',
        graduationDate: '',
        gpa: '',
      },
      certifications: {
        name: '',
        issuer: '',
        issueDate: '',
        expiryDate: '',
        credentialUrl: '',
      },
      skills: {
        category: 'Technical Skills',
        items: [],
      },
      languages: {
        language: '',
        proficiency: 'Fluent',
      },
      additionalSections: {
        title: '',
        content: '',
      },
    };

    updated[section].push(templates[section]);
    onResumeChange(updated);
  };

  const removeItem = (section, index) => {
    let updated = { ...resume };
    updated[section].splice(index, 1);
    onResumeChange(updated);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="form-step">
            <h2>Personal Information</h2>
            <p className="step-description">
              Let's start with your basic information
            </p>

            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="fullName"
                value={resume.personalInfo.fullName}
                onChange={(e) => handleInputChange(e, 'personalInfo')}
                placeholder="Your full name"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={resume.personalInfo.email}
                  onChange={(e) => handleInputChange(e, 'personalInfo')}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={resume.personalInfo.phone}
                  onChange={(e) => handleInputChange(e, 'personalInfo')}
                  placeholder="+263 123 456 789"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={resume.personalInfo.location}
                onChange={(e) => handleInputChange(e, 'personalInfo')}
                placeholder="City, Country"
              />
            </div>

            <div className="form-group">
              <label>Professional Summary</label>
              <textarea
                name="summary"
                value={resume.personalInfo.summary}
                onChange={(e) => handleInputChange(e, 'personalInfo')}
                placeholder="Brief summary of your professional background and goals (500 characters max)"
                maxLength="500"
                rows="4"
              />
              <small>{resume.personalInfo.summary.length} / 500</small>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="form-step">
            <h2>Work Experience</h2>
            <p className="step-description">Add your pharmacy work experience</p>

            {resume.experience.map((exp, idx) => (
              <div key={idx} className="form-section-item">
                <div className="item-header">
                  <h4>Experience {idx + 1}</h4>
                  <button
                    className="btn-remove"
                    onClick={() => removeItem('experience', idx)}
                  >
                    ✕
                  </button>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Job Title *</label>
                    <input
                      type="text"
                      value={exp.jobTitle}
                      onChange={(e) =>
                        handleInputChange(e, 'experience', idx, 'jobTitle')
                      }
                      placeholder="e.g., Hospital Pharmacist"
                    />
                  </div>
                  <div className="form-group">
                    <label>Employer *</label>
                    <input
                      type="text"
                      value={exp.employer}
                      onChange={(e) =>
                        handleInputChange(e, 'experience', idx, 'employer')
                      }
                      placeholder="e.g., Harare Central Hospital"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={exp.location}
                    onChange={(e) =>
                      handleInputChange(e, 'experience', idx, 'location')
                    }
                    placeholder="City, Country"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date *</label>
                    <input
                      type="month"
                      value={exp.startDate}
                      onChange={(e) =>
                        handleInputChange(e, 'experience', idx, 'startDate')
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="month"
                      value={exp.endDate}
                      onChange={(e) =>
                        handleInputChange(e, 'experience', idx, 'endDate')
                      }
                      disabled={exp.isCurrent}
                    />
                  </div>
                  <div className="form-group checkbox">
                    <input
                      type="checkbox"
                      checked={exp.isCurrent}
                      onChange={(e) => {
                        let updated = { ...resume };
                        updated.experience[idx].isCurrent = e.target.checked;
                        onResumeChange(updated);
                      }}
                      id={`current-${idx}`}
                    />
                    <label htmlFor={`current-${idx}`}>Currently working</label>
                  </div>
                </div>

                <div className="form-group">
                  <label>Job Description</label>
                  <textarea
                    value={exp.description}
                    onChange={(e) =>
                      handleInputChange(e, 'experience', idx, 'description')
                    }
                    placeholder="Describe your responsibilities and achievements"
                    rows="4"
                  />
                </div>
              </div>
            ))}

            <button className="btn-add" onClick={() => addItem('experience')}>
              + Add Experience
            </button>
          </div>
        );

      case 3:
        return (
          <div className="form-step">
            <h2>Education</h2>
            <p className="step-description">
              Add your educational qualifications
            </p>

            {resume.education.map((edu, idx) => (
              <div key={idx} className="form-section-item">
                <div className="item-header">
                  <h4>Education {idx + 1}</h4>
                  <button
                    className="btn-remove"
                    onClick={() => removeItem('education', idx)}
                  >
                    ✕
                  </button>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Degree *</label>
                    <select
                      value={edu.degree}
                      onChange={(e) =>
                        handleInputChange(e, 'education', idx, 'degree')
                      }
                    >
                      <option>High School</option>
                      <option>Diploma</option>
                      <option>Bachelor</option>
                      <option>Master</option>
                      <option>PhD</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Field of Study *</label>
                    <input
                      type="text"
                      value={edu.field}
                      onChange={(e) =>
                        handleInputChange(e, 'education', idx, 'field')
                      }
                      placeholder="e.g., Pharmacy"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>School/University *</label>
                    <input
                      type="text"
                      value={edu.school}
                      onChange={(e) =>
                        handleInputChange(e, 'education', idx, 'school')
                      }
                      placeholder="e.g., University of Zimbabwe"
                    />
                  </div>
                  <div className="form-group">
                    <label>Location</label>
                    <input
                      type="text"
                      value={edu.location}
                      onChange={(e) =>
                        handleInputChange(e, 'education', idx, 'location')
                      }
                      placeholder="City, Country"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Graduation Date *</label>
                    <input
                      type="month"
                      value={edu.graduationDate}
                      onChange={(e) =>
                        handleInputChange(e, 'education', idx, 'graduationDate')
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>GPA (optional)</label>
                    <input
                      type="text"
                      value={edu.gpa}
                      onChange={(e) =>
                        handleInputChange(e, 'education', idx, 'gpa')
                      }
                      placeholder="e.g., 3.5/4.0"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button className="btn-add" onClick={() => addItem('education')}>
              + Add Education
            </button>
          </div>
        );

      case 4:
        return (
          <div className="form-step">
            <h2>Certifications & Licenses</h2>
            <p className="step-description">
              Add your pharmacy certifications and licenses
            </p>

            {resume.certifications.map((cert, idx) => (
              <div key={idx} className="form-section-item">
                <div className="item-header">
                  <h4>Certification {idx + 1}</h4>
                  <button
                    className="btn-remove"
                    onClick={() => removeItem('certifications', idx)}
                  >
                    ✕
                  </button>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Certification Name *</label>
                    <input
                      type="text"
                      value={cert.name}
                      onChange={(e) =>
                        handleInputChange(e, 'certifications', idx, 'name')
                      }
                      placeholder="e.g., Pharmacy Board License"
                    />
                  </div>
                  <div className="form-group">
                    <label>Issuing Organization *</label>
                    <input
                      type="text"
                      value={cert.issuer}
                      onChange={(e) =>
                        handleInputChange(e, 'certifications', idx, 'issuer')
                      }
                      placeholder="e.g., Pharmacy Council of Zimbabwe"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Issue Date</label>
                    <input
                      type="date"
                      value={cert.issueDate}
                      onChange={(e) =>
                        handleInputChange(e, 'certifications', idx, 'issueDate')
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input
                      type="date"
                      value={cert.expiryDate}
                      onChange={(e) =>
                        handleInputChange(e, 'certifications', idx, 'expiryDate')
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Credential URL (optional)</label>
                  <input
                    type="url"
                    value={cert.credentialUrl}
                    onChange={(e) =>
                      handleInputChange(e, 'certifications', idx, 'credentialUrl')
                    }
                    placeholder="https://..."
                  />
                </div>
              </div>
            ))}

            <button className="btn-add" onClick={() => addItem('certifications')}>
              + Add Certification
            </button>
          </div>
        );

      case 5:
        return (
          <div className="form-step">
            <h2>Skills</h2>
            <p className="step-description">
              Organize your skills by category
            </p>

            {resume.skills.map((skillGroup, idx) => (
              <div key={idx} className="form-section-item">
                <div className="item-header">
                  <h4>{skillGroup.category}</h4>
                  <button
                    className="btn-remove"
                    onClick={() => removeItem('skills', idx)}
                  >
                    ✕
                  </button>
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <input
                    type="text"
                    value={skillGroup.category}
                    onChange={(e) =>
                      handleInputChange(e, 'skills', idx, 'category')
                    }
                    placeholder="e.g., Technical Skills"
                  />
                </div>

                <div className="form-group">
                  <label>Skills (comma-separated)</label>
                  <textarea
                    value={skillGroup.items.join(', ')}
                    onChange={(e) => {
                      let updated = { ...resume };
                      updated.skills[idx].items = e.target.value
                        .split(',')
                        .map(s => s.trim())
                        .filter(s => s);
                      onResumeChange(updated);
                    }}
                    placeholder="e.g., Pharmacology, Compounding, Patient Counseling"
                    rows="3"
                  />
                </div>
              </div>
            ))}

            <button className="btn-add" onClick={() => addItem('skills')}>
              + Add Skill Category
            </button>
          </div>
        );

      case 6:
        return (
          <div className="form-step">
            <h2>Languages</h2>
            <p className="step-description">Add languages you speak</p>

            {resume.languages.map((lang, idx) => (
              <div key={idx} className="form-section-item">
                <div className="item-header">
                  <h4>{lang.language || 'Language'}</h4>
                  <button
                    className="btn-remove"
                    onClick={() => removeItem('languages', idx)}
                  >
                    ✕
                  </button>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Language *</label>
                    <input
                      type="text"
                      value={lang.language}
                      onChange={(e) =>
                        handleInputChange(e, 'languages', idx, 'language')
                      }
                      placeholder="e.g., English, Shona"
                    />
                  </div>
                  <div className="form-group">
                    <label>Proficiency *</label>
                    <select
                      value={lang.proficiency}
                      onChange={(e) =>
                        handleInputChange(e, 'languages', idx, 'proficiency')
                      }
                    >
                      <option>Native</option>
                      <option>Fluent</option>
                      <option>Intermediate</option>
                      <option>Basic</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}

            <button className="btn-add" onClick={() => addItem('languages')}>
              + Add Language
            </button>
          </div>
        );

      case 7:
        return (
          <div className="form-step">
            <h2>Additional Sections</h2>
            <p className="step-description">
              Add any additional information (optional)
            </p>

            {resume.additionalSections.map((section, idx) => (
              <div key={idx} className="form-section-item">
                <div className="item-header">
                  <h4>{section.title || 'Custom Section'}</h4>
                  <button
                    className="btn-remove"
                    onClick={() => removeItem('additionalSections', idx)}
                  >
                    ✕
                  </button>
                </div>

                <div className="form-group">
                  <label>Section Title *</label>
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) =>
                      handleInputChange(e, 'additionalSections', idx, 'title')
                    }
                    placeholder="e.g., Publications, Awards"
                  />
                </div>

                <div className="form-group">
                  <label>Content *</label>
                  <textarea
                    value={section.content}
                    onChange={(e) =>
                      handleInputChange(e, 'additionalSections', idx, 'content')
                    }
                    placeholder="Content for this section"
                    rows="4"
                  />
                </div>
              </div>
            ))}

            <button className="btn-add" onClick={() => addItem('additionalSections')}>
              + Add Section
            </button>
          </div>
        );

      case 8:
        return (
          <div className="form-step">
            <h2>Template & Customization</h2>
            <p className="step-description">Choose a template and customize colors</p>

            <div className="form-group">
              <label>Template *</label>
              <div className="template-options">
                {['modern', 'classic', 'minimal', 'pharmacy'].map(tmpl => (
                  <button
                    key={tmpl}
                    className={`template-option ${resume.template === tmpl ? 'selected' : ''}`}
                    onClick={() => onResumeChange({ ...resume, template: tmpl })}
                  >
                    {tmpl.charAt(0).toUpperCase() + tmpl.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Primary Color</label>
                <input
                  type="color"
                  value={resume.templateCustomization.primaryColor}
                  onChange={(e) => {
                    let updated = { ...resume };
                    updated.templateCustomization.primaryColor = e.target.value;
                    onResumeChange(updated);
                  }}
                />
              </div>
              <div className="form-group">
                <label>Secondary Color</label>
                <input
                  type="color"
                  value={resume.templateCustomization.secondaryColor}
                  onChange={(e) => {
                    let updated = { ...resume };
                    updated.templateCustomization.secondaryColor = e.target.value;
                    onResumeChange(updated);
                  }}
                />
              </div>
              <div className="form-group">
                <label>Accent Color</label>
                <input
                  type="color"
                  value={resume.templateCustomization.accentColor}
                  onChange={(e) => {
                    let updated = { ...resume };
                    updated.templateCustomization.accentColor = e.target.value;
                    onResumeChange(updated);
                  }}
                />
              </div>
            </div>
          </div>
        );

      case 9:
        return (
          <div className="form-step">
            <h2>Ready to Download!</h2>
            <p className="step-description">
              Your resume is ready. Download it as PDF to use for job applications.
            </p>

            <div className="download-info">
              <div className="info-card">
                <h3>✓ Personal Information</h3>
                <p>{resume.personalInfo.fullName || 'Not filled'}</p>
              </div>
              {resume.experience.length > 0 && (
                <div className="info-card">
                  <h3>✓ Experience ({resume.experience.length})</h3>
                  <p>Included in resume</p>
                </div>
              )}
              {resume.education.length > 0 && (
                <div className="info-card">
                  <h3>✓ Education ({resume.education.length})</h3>
                  <p>Included in resume</p>
                </div>
              )}
              {resume.skills.length > 0 && (
                <div className="info-card">
                  <h3>✓ Skills</h3>
                  <p>Included in resume</p>
                </div>
              )}
            </div>

            <p className="note">
              <strong>Tip:</strong> You can always come back to edit your resume later.
              It's automatically saved!
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return <div className="resume-step-form">{renderStep()}</div>;
}

export default ResumeStepForm;
