/**
 * Translation strings for ZimPharmHub
 * Fallback to English if translation not available
 */

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.jobs': 'Jobs',
    'nav.companies': 'Pharmacies',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',
    'nav.login': 'Login',
    'nav.register': 'Register',

    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.close': 'Close',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.confirm': 'Are you sure?',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.more': 'More',
    'common.language': 'Language',
    'common.timezone': 'Timezone',

    // Jobs
    'jobs.title': 'Find Jobs',
    'jobs.search_placeholder': 'Search jobs...',
    'jobs.no_results': 'No jobs found',
    'jobs.apply': 'Apply Now',
    'jobs.saved': 'Saved',
    'jobs.apply_success': 'Application submitted successfully',
    'jobs.already_applied': 'You have already applied for this job',
    'jobs.salary': 'Salary',
    'jobs.location': 'Location',
    'jobs.type': 'Employment Type',
    'jobs.posted': 'Posted',
    'jobs.deadline': 'Application Deadline',

    // Profile
    'profile.title': 'My Profile',
    'profile.edit': 'Edit Profile',
    'profile.about': 'About',
    'profile.email': 'Email',
    'profile.phone': 'Phone',
    'profile.location': 'Location',
    'profile.bio': 'Biography',
    'profile.certifications': 'Certifications',
    'profile.languages': 'Languages',
    'profile.preferences': 'Preferences',
    'profile.language_preference': 'Preferred Language',
    'profile.notifications': 'Notifications',
    'profile.privacy': 'Privacy Settings',
    'profile.account': 'Account Settings',
    'profile.updated': 'Profile updated successfully',

    // Auth
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.forgot_password': 'Forgot Password?',
    'auth.reset_password': 'Reset Password',
    'auth.email': 'Email Address',
    'auth.password': 'Password',
    'auth.confirm_password': 'Confirm Password',
    'auth.remember_me': 'Remember Me',
    'auth.agree_terms': 'I agree to the Terms of Service',
    'auth.login_success': 'Logged in successfully',
    'auth.logout_success': 'Logged out successfully',
    'auth.invalid_credentials': 'Invalid email or password',
    'auth.account_created': 'Account created successfully',

    // Validation
    'validation.required': 'This field is required',
    'validation.email': 'Please enter a valid email address',
    'validation.password_min': 'Password must be at least 8 characters',
    'validation.passwords_match': 'Passwords do not match',
    'validation.phone_invalid': 'Please enter a valid phone number',

    // Messages
    'messages.welcome': 'Welcome to ZimPharmHub',
    'messages.thank_you': 'Thank you!',
    'messages.saved_successfully': 'Saved successfully',
    'messages.deleted_successfully': 'Deleted successfully',
    'messages.error_occurred': 'An error occurred',
    'messages.try_again': 'Please try again',
    'messages.no_data': 'No data available',
    'messages.loading_data': 'Loading data...',
    'messages.confirm_delete': 'Are you sure you want to delete this item?',

    // Notifications
    'notifications.new_message': 'You have a new message',
    'notifications.new_job': 'New job matches your profile',
    'notifications.application_status': 'Your application status has changed',
    'notifications.enable': 'Enable Notifications',
    'notifications.disable': 'Disable Notifications',

    // Time
    'time.just_now': 'Just now',
    'time.minutes_ago': '{n} minutes ago',
    'time.hours_ago': '{n} hours ago',
    'time.days_ago': '{n} days ago',
    'time.weeks_ago': '{n} weeks ago',
    'time.months_ago': '{n} months ago',
    'time.years_ago': '{n} years ago',
  },

  es: {
    'nav.home': 'Inicio',
    'nav.jobs': 'Empleos',
    'nav.companies': 'Farmacias',
    'nav.profile': 'Perfil',
    'nav.settings': 'Configuración',
    'nav.logout': 'Cerrar sesión',
    'nav.login': 'Iniciar sesión',
    'nav.register': 'Registrarse',

    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.close': 'Cerrar',
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.confirm': '¿Estás seguro?',
    'common.search': 'Buscar',
    'common.filter': 'Filtrar',
    'common.sort': 'Ordenar',
    'common.language': 'Idioma',

    'jobs.title': 'Encontrar Empleos',
    'jobs.search_placeholder': 'Buscar empleos...',
    'jobs.no_results': 'No se encontraron empleos',
    'jobs.apply': 'Solicitar Ahora',
    'jobs.saved': 'Guardado',
    'jobs.salary': 'Salario',
    'jobs.location': 'Ubicación',
    'jobs.type': 'Tipo de Empleo',

    'profile.title': 'Mi Perfil',
    'profile.edit': 'Editar Perfil',
    'profile.about': 'Acerca de',
    'profile.email': 'Correo Electrónico',
    'profile.phone': 'Teléfono',
    'profile.location': 'Ubicación',
    'profile.language_preference': 'Idioma Preferido',

    'auth.login': 'Iniciar sesión',
    'auth.register': 'Registrarse',
    'auth.email': 'Correo Electrónico',
    'auth.password': 'Contraseña',
    'auth.login_success': 'Sesión iniciada correctamente',

    'common.confirm_delete': '¿Estás seguro de que deseas eliminar este elemento?',
    'messages.saved_successfully': 'Guardado correctamente',
    'messages.deleted_successfully': 'Eliminado correctamente',
  },

  fr: {
    'nav.home': 'Accueil',
    'nav.jobs': 'Emplois',
    'nav.companies': 'Pharmacies',
    'nav.profile': 'Profil',
    'nav.settings': 'Paramètres',
    'nav.logout': 'Déconnexion',
    'nav.login': 'Connexion',
    'nav.register': 'S\'inscrire',

    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.close': 'Fermer',
    'common.loading': 'Chargement...',
    'common.language': 'Langue',

    'jobs.title': 'Trouver des Emplois',
    'jobs.search_placeholder': 'Chercher des emplois...',
    'jobs.no_results': 'Aucun emploi trouvé',
    'jobs.apply': 'Postuler Maintenant',
    'jobs.saved': 'Enregistré',
    'jobs.salary': 'Salaire',
    'jobs.location': 'Localisation',

    'profile.title': 'Mon Profil',
    'profile.edit': 'Modifier le Profil',
    'profile.email': 'Adresse E-mail',
    'profile.phone': 'Téléphone',
    'profile.language_preference': 'Langue Préférée',

    'auth.login': 'Connexion',
    'auth.register': 'S\'inscrire',
    'auth.email': 'Adresse E-mail',
    'auth.password': 'Mot de passe',
    'auth.login_success': 'Connecté avec succès',

    'messages.saved_successfully': 'Enregistré avec succès',
  },

  pt: {
    'nav.home': 'Início',
    'nav.jobs': 'Empregos',
    'nav.companies': 'Farmácias',
    'nav.profile': 'Perfil',
    'nav.logout': 'Sair',
    'nav.login': 'Entrar',

    'common.save': 'Salvar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Deletar',
    'common.language': 'Idioma',

    'jobs.title': 'Encontrar Empregos',
    'jobs.apply': 'Candidatar Agora',
    'profile.title': 'Meu Perfil',
    'auth.login': 'Entrar',
    'auth.login_success': 'Conectado com sucesso',
  },

  sn: {
    'nav.home': 'Kumba',
    'nav.jobs': 'Mabasa',
    'nav.companies': 'Mafarimasi',
    'nav.profile': 'Pfungamzo',
    'nav.logout': 'Buda',
    'nav.login': 'Pinda',

    'common.save': 'Zviparadze',
    'common.cancel': 'Kanganisa',
    'common.delete': 'Bvisa',
    'common.language': 'Ruvanhu',

    'jobs.title': 'Tsvaga Mabasa',
    'jobs.apply': 'Zvikumbire Zvino',
    'profile.title': 'Pfungamzo Yangu',
    'auth.login': 'Pinda',
  },

  nd: {
    'nav.home': 'Ekhaya',
    'nav.jobs': 'Izindlu zokusebenza',
    'nav.companies': 'Amashophu ehulamezi',
    'nav.profile': 'Iprofayili',
    'nav.logout': 'Phuma',
    'nav.login': 'Ngena',

    'common.save': 'Gcina',
    'common.cancel': 'Yeka',
    'common.delete': 'Susa',
    'common.language': 'Ulwimi',

    'jobs.title': 'Funela Izindlu zokusebenza',
    'jobs.apply': 'Zisele Manje',
    'profile.title': 'Iprofayili Yami',
    'auth.login': 'Ngena',
  },
};

/**
 * Get translation for a key in a given locale
 * Falls back to English if key not found in requested locale
 * @param {string} key - Translation key (e.g., 'nav.home')
 * @param {string} locale - Locale code (e.g., 'en', 'es')
 * @param {object} params - Parameters to replace in template (e.g., {n: 5})
 * @returns {string} Translated string or fallback
 */
function t(key, locale = 'en', params = {}) {
  // Get translation from locale
  let translation = translations[locale]?.[key];

  // Fallback to English
  if (!translation) {
    translation = translations.en[key] || key;
  }

  // Replace parameters in template
  if (params && typeof translation === 'string') {
    Object.keys(params).forEach(param => {
      translation = translation.replace(`{${param}}`, params[param]);
    });
  }

  return translation;
}

/**
 * Get all translations for a locale
 * @param {string} locale - Locale code
 * @returns {object} All translations for that locale with English fallback
 */
function getLocaleStrings(locale = 'en') {
  if (!translations[locale]) {
    return translations.en;
  }

  // Merge with English as fallback
  return {
    ...translations.en,
    ...translations[locale],
  };
}

module.exports = {
  translations,
  t,
  getLocaleStrings,
};
