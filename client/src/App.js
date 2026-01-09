import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import JobsPage from './pages/JobsPage';
import JobAlertsPage from './pages/JobAlertsPage';
import JobDetailPage from './pages/JobDetailPage';
import ProductsPage from './pages/ProductsPage';
import PharmaciesPage from './pages/PharmaciesPage';
import ForumPage from './pages/ForumPage';
import ForumPostDetailPage from './pages/ForumPostDetailPage';
import ArticlesPage from './pages/ArticlesPage';
import EventsPage from './pages/EventsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';
import PharmacyDashboardPage from './pages/PharmacyDashboardPage';
import AnalyticsDashboardPage from './pages/AnalyticsDashboardPage';
import PostJobPage from './pages/PostJobPage';
import AdminPanelPage from './pages/AdminPanelPage';
import MessagesPage from './pages/MessagesPage';
import FAQPage from './pages/FAQPage';
import ContactPage from './pages/ContactPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import { ThemeContext } from './context/ThemeContext';
import './App.css';

function App() {
  const { isDarkMode } = useContext(ThemeContext);

  return (
    <Router>
      <div className={`min-h-screen flex flex-col ${isDarkMode ? 'dark' : ''}`}>
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/job-alerts" element={<JobAlertsPage />} />
            <Route path="/jobs/:id" element={<JobDetailPage />} />
            <Route path="/post-job" element={<PostJobPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/pharmacies" element={<PharmaciesPage />} />
            <Route path="/forum" element={<ForumPage />} />
            <Route path="/forum/:id" element={<ForumPostDetailPage />} />
            <Route path="/articles" element={<ArticlesPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/pharmacy-dashboard" element={<PharmacyDashboardPage />} />
            <Route path="/analytics" element={<AnalyticsDashboardPage />} />
            <Route path="/admin" element={<AdminPanelPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
