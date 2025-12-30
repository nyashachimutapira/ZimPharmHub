import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import ResumeStepForm from '../components/ResumeStepForm';
import ResumePreview from '../components/ResumePreview';
import './ResumeBuilderPage.css';

function ResumeBuilderPage() {
  const { resumeId } = useParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [resume, setResume] = useState({
    title: 'My Pharmacy Resume',
    template: 'modern',
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      summary: '',
    },
    experience: [],
    education: [],
    certifications: [],
    skills: [],
    languages: [],
    templateCustomization: {
      primaryColor: '#003366',
      secondaryColor: '#0066cc',
      accentColor: '#00bfff',
      fontFamily: 'Arial',
    },
    additionalSections: [],
  });

  const [loading, setLoading] = useState(resumeId ? true : false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [lastSaved, setLastSaved] = useState(null);
  const [userId] = useState(localStorage.getItem('userId'));

  const totalSteps = 9;

  // Load existing resume if editing
  useEffect(() => {
    if (resumeId) {
      fetchResume();
    }
  }, [resumeId]);

  // Auto-save resume every 10 seconds
  useEffect(() => {
    const autoSaveTimer = setInterval(() => {
      if (resume.personalInfo.fullName && userId) {
        saveResume(true);
      }
    }, 10000);

    return () => clearInterval(autoSaveTimer);
  }, [resume, userId]);

  const fetchResume = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/resumes/${resumeId}`, {
        headers: { 'user-id': userId },
      });
      if (response.data.success) {
        setResume(response.data.resume);
      }
    } catch (error) {
      console.error('Error loading resume:', error);
      alert('Error loading resume. Creating new one.');
    } finally {
      setLoading(false);
    }
  };

  const saveResume = async (isAutoSave = false) => {
    try {
      setSaving(true);
      setSaveStatus(isAutoSave ? 'Saving...' : 'Saving...');

      if (resumeId) {
        // Update existing resume
        await axios.put(`/api/resumes/${resumeId}`, resume, {
          headers: { 'user-id': userId },
        });
      } else {
        // Create new resume
        const response = await axios.post('/api/resumes', resume, {
          headers: { 'user-id': userId },
        });
        // Update URL if new resume was created
        if (response.data.resume._id && !resumeId) {
          // Optionally navigate to the edit page
          window.history.pushState({}, '', `/resume-builder/${response.data.resume._id}`);
        }
      }

      setLastSaved(new Date());
      setSaveStatus(isAutoSave ? 'Saved' : 'Saved successfully!');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (error) {
      console.error('Error saving resume:', error);
      setSaveStatus('Save failed');
      setTimeout(() => setSaveStatus(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleResumeChange = (updatedResume) => {
    setResume(updatedResume);
  };

  const handleDownloadPDF = async () => {
    try {
      // Track download
      if (resumeId) {
        await axios.post(`/api/resumes/${resumeId}/download`, {}, {
          headers: { 'user-id': userId },
        });
      }

      // Generate PDF (client-side or server-side)
      // For now, show a message
      alert('PDF download feature coming soon!');
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  if (loading) {
    return (
      <div className="resume-builder-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading resume...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="resume-builder-page">
      <div className="resume-builder-container">
        {/* Header */}
        <div className="builder-header">
          <div className="header-content">
            <h1>Resume Builder</h1>
            <p>Create a professional pharmacy resume</p>
          </div>
          <div className="header-actions">
            {lastSaved && (
              <span className="last-saved">
                Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            )}
            {saveStatus && (
              <span className={`save-status ${saveStatus.includes('failed') ? 'error' : ''}`}>
                {saveStatus}
              </span>
            )}
          </div>
        </div>

        <div className="builder-content">
          {/* Sidebar - Step Indicator */}
          <aside className="builder-sidebar">
            <div className="steps-container">
              <h3>Steps</h3>
              <div className="steps-list">
                {[
                  { num: 1, title: 'Personal Info' },
                  { num: 2, title: 'Experience' },
                  { num: 3, title: 'Education' },
                  { num: 4, title: 'Certifications' },
                  { num: 5, title: 'Skills' },
                  { num: 6, title: 'Languages' },
                  { num: 7, title: 'Additional' },
                  { num: 8, title: 'Template' },
                  { num: 9, title: 'Download' },
                ].map(step => (
                  <button
                    key={step.num}
                    className={`step-item ${currentStep === step.num ? 'active' : ''} ${
                      currentStep > step.num ? 'completed' : ''
                    }`}
                    onClick={() => setCurrentStep(step.num)}
                  >
                    <span className="step-number">
                      {currentStep > step.num ? '✓' : step.num}
                    </span>
                    <span className="step-title">{step.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="progress-section">
              <h4>Completion</h4>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                ></div>
              </div>
              <p className="progress-text">
                Step {currentStep} of {totalSteps}
              </p>
            </div>
          </aside>

          {/* Main Content - Form and Preview */}
          <main className="builder-main">
            <div className="builder-split">
              {/* Form Section */}
              <section className="form-section">
                <ResumeStepForm
                  step={currentStep}
                  resume={resume}
                  onResumeChange={handleResumeChange}
                />

                {/* Navigation Buttons */}
                <div className="form-navigation">
                  <button
                    className="btn btn-secondary"
                    onClick={handlePreviousStep}
                    disabled={currentStep === 1}
                  >
                    ← Previous
                  </button>

                  {currentStep < totalSteps ? (
                    <button className="btn btn-primary" onClick={handleNextStep}>
                      Next →
                    </button>
                  ) : (
                    <button
                      className="btn btn-success"
                      onClick={handleDownloadPDF}
                      disabled={saving}
                    >
                      📥 Download PDF
                    </button>
                  )}
                </div>

                {/* Save Button */}
                <button
                  className="save-button"
                  onClick={() => saveResume(false)}
                  disabled={saving || !resume.personalInfo.fullName}
                >
                  {saving ? 'Saving...' : 'Save Resume'}
                </button>
              </section>

              {/* Preview Section */}
              <section className="preview-section">
                <div className="preview-header">
                  <h3>Preview</h3>
                  <div className="preview-controls">
                    <label>
                      Template:
                      <select
                        value={resume.template}
                        onChange={(e) =>
                          setResume({ ...resume, template: e.target.value })
                        }
                      >
                        <option value="modern">Modern</option>
                        <option value="classic">Classic</option>
                        <option value="minimal">Minimal</option>
                        <option value="pharmacy">Pharmacy Pro</option>
                      </select>
                    </label>
                  </div>
                </div>
                <ResumePreview resume={resume} />
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default ResumeBuilderPage;
