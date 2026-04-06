import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { UserProfile } from './types';

// Components (to be created)
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import PublicMenu from './components/PublicMenu';
import LandingPage from './components/LandingPage';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authWarning, setAuthWarning] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      void (async () => {
        setUser(currentUser);

        if (!currentUser) {
          setProfile(null);
          setAuthWarning(null);
          setLoading(false);
          return;
        }

        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setProfile(userDoc.data() as UserProfile);
          } else {
            setProfile({
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'User',
              role: 'user',
            });
          }
          setAuthWarning(null);
        } catch (error) {
          console.error('Failed to read user profile from Firestore:', error);
          setProfile({
            uid: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || 'User',
            role: 'user',
          });
          setAuthWarning('Khong doc duoc profile Firestore (thieu quyen). Vui long kiem tra Firestore Rules cho collection users.');
        } finally {
          setLoading(false);
        }
      })();
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <a href="#main-content" className="skip-link">
        Bỏ qua điều hướng và đến nội dung chính
      </a>
      {authWarning && user && (
        <div role="status" aria-live="polite" className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm shadow-sm">
          {authWarning}
        </div>
      )}
      <main id="main-content" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/dashboard/*" element={user ? <Dashboard user={user} profile={profile} /> : <Navigate to="/login" />} />
          <Route path="/m/:slug" element={<PublicMenu />} />
        </Routes>
      </main>
    </Router>
  );
}
