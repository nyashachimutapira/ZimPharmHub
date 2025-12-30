import React, { useState } from 'react';
import axios from 'axios';
import './LanguageSelector.css';

function LanguageSelector({ userId, currentLocale = 'en', onLanguageChange }) {
  const [selectedLocale, setSelectedLocale] = useState(currentLocale);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Supported locales with metadata
  const locales = {
    en: { name: 'English', flag: '🇺🇸', nativeName: 'English' },
    es: { name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
    fr: { name: 'French', flag: '🇫🇷', nativeName: 'Français' },
    pt: { name: 'Portuguese', flag: '🇵🇹', nativeName: 'Português' },
    sn: { name: 'Shona', flag: '🇿🇼', nativeName: 'Shona' },
    nd: { name: 'Ndebele', flag: '🇿🇼', nativeName: 'Ndebele' },
    zu: { name: 'Zulu', flag: '🇿🇦', nativeName: 'Zulu' },
    sw: { name: 'Swahili', flag: '🇰🇪', nativeName: 'Kiswahili' },
    de: { name: 'German', flag: '🇩🇪', nativeName: 'Deutsch' },
    ar: { name: 'Arabic', flag: '🇸🇦', nativeName: 'العربية' },
  };

  const handleLanguageChange = async (newLocale) => {
    try {
      setLoading(true);
      setMessage('');

      // Update in database
      const response = await axios.put(
        `/api/users/${userId}`,
        { locale: newLocale },
        {
          headers: { 'user-id': userId },
        }
      );

      if (response.data.success) {
        setSelectedLocale(newLocale);
        setMessage('Language preference saved');
        
        // Store in localStorage for immediate UI updates
        localStorage.setItem('userLocale', newLocale);
        
        // Notify parent component
        if (onLanguageChange) {
          onLanguageChange(newLocale);
        }

        // Clear message after 3 seconds
        setTimeout(() => setMessage(''), 3000);

        // Optionally reload page to apply new language
        // window.location.reload();
      }
    } catch (error) {
      console.error('Error changing language:', error);
      setMessage('Failed to save language preference');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="language-selector">
      <div className="language-header">
        <h3>Language Preference</h3>
        {message && (
          <div className={`language-message ${message.includes('Failed') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}
      </div>

      <div className="language-grid">
        {Object.entries(locales).map(([code, locale]) => (
          <button
            key={code}
            className={`language-option ${selectedLocale === code ? 'selected' : ''} ${
              loading ? 'disabled' : ''
            }`}
            onClick={() => handleLanguageChange(code)}
            disabled={loading || selectedLocale === code}
            title={locale.nativeName}
          >
            <span className="language-flag">{locale.flag}</span>
            <span className="language-name">{locale.name}</span>
            <span className="language-native">{locale.nativeName}</span>
            {selectedLocale === code && <span className="language-check">✓</span>}
          </button>
        ))}
      </div>

      <div className="language-info">
        <p>
          <strong>Current Language:</strong> {locales[selectedLocale]?.name || 'English'}
        </p>
        <p>
          Your language preference is saved to your profile and will be used for emails and
          notifications.
        </p>
      </div>
    </div>
  );
}

export default LanguageSelector;
