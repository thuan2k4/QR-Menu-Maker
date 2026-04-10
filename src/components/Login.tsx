import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider, User } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { QrCode } from 'lucide-react';
import { useTranslation } from '../i18n';
import GlobalLanguageSwitcher from './GlobalLanguageSwitcher';

type TranslationFn = (key: string, params?: Record<string, string>) => string;

function getLoginErrorMessage(error: unknown, t: TranslationFn): string {
  if (!(error instanceof FirebaseError)) {
    return t('login.error.failed', { code: 'unknown' });
  }

  switch (error.code) {
    case 'auth/unauthorized-domain':
      return t('login.error.unauthorizedDomain');
    case 'auth/operation-not-supported-in-this-environment':
      return t('login.error.unsupportedEnvironment');
    case 'auth/popup-blocked':
      return t('login.error.popupBlocked');
    case 'auth/user-cancelled':
    case 'auth/popup-closed-by-user':
      return t('login.error.popupClosed');
    case 'auth/network-request-failed':
      return t('login.error.networkFailed');
    default:
      return t('login.error.failed', { code: error.code });
  }
}

function goToDashboard() {
  window.location.replace('/dashboard');
}

export default function Login() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const ensureUserProfile = async (user: User) => {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: 'user',
        createdAt: new Date().toISOString()
      });
    }
  };

  useEffect(() => {
    void (async () => {
      try {
        // Debug: Check secure context
        console.log('[OAuth Debug]', {
          secureContext: window.isSecureContext,
          hostname: window.location.hostname,
          protocol: window.location.protocol,
          href: window.location.href,
        });

        const result = await getRedirectResult(auth);
        if (result?.user) {
          console.log('[OAuth] Redirect result received:', result.user.email);
          await ensureUserProfile(result.user);
          goToDashboard();
        } else {
          console.log('[OAuth] No redirect result (first visit or popup login)');
        }
      } catch (err) {
        console.error('Google redirect login failed:', err);
        setError(getLoginErrorMessage(err, t));
      }
    })();
  }, [t]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    // Debug: Check environment
    console.log('[Google Login] Starting OAuth', {
      isSecureContext: window.isSecureContext,
      isLocalhost: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
      hostname: window.location.hostname,
      protocol: window.location.protocol,
    });

    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!window.isSecureContext && !isLocalhost) {
      const errorMsg = t('login.error.unsupportedEnvironment');
      console.error('[Google Login] Blocked:', errorMsg);
      setError(errorMsg);
      setLoading(false);
      return;
    }

    const ua = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const isAndroid = /android/.test(ua);
    const isSafari = /safari/.test(ua) && !/crios|fxios|edgios|chrome|android/.test(ua);
    const isInAppBrowser = /fbav|fban|instagram|line|zalo|wv/.test(ua);

    const shouldUseRedirect = isInAppBrowser || isAndroid || (isIOS && isSafari);

    console.log('[Google Login] Device Detection', {
      ua: ua.substring(0, 60),
      isIOS,
      isAndroid,
      isSafari,
      isInAppBrowser,
      shouldUseRedirect,
    });

    if (shouldUseRedirect) {
      try {
        console.log('[Google Login] Using redirect flow...');
        await signInWithRedirect(auth, provider);
        return;
      } catch (err) {
        console.error('Google redirect start failed:', err);
        setError(getLoginErrorMessage(err, t));
        setLoading(false);
        return;
      }
    }

    try {
      console.log('[Google Login] Using popup flow...');
      const result = await signInWithPopup(auth, provider);
      console.log('[Google Login] Popup succeeded:', result.user.email);
      await ensureUserProfile(result.user);
      goToDashboard();
    } catch (err) {
      console.error('Google login failed:', err);

      // Check for user cancellation (popup closed or explicit cancel)
      const isCancellation = err instanceof FirebaseError && 
        (err.code === 'auth/user-cancelled' || err.code === 'auth/popup-closed-by-user');

      if (isCancellation) {
        console.log('[Google Login] User cancelled login process');
        setLoading(false);
        return;
      }

      if (err instanceof FirebaseError && (err.code === 'auth/popup-blocked' || err.code === 'auth/operation-not-supported-in-this-environment' || err.code === 'auth/network-request-failed')) {
        try {
          console.log('[Google Login] Popup failed, trying redirect fallback...', err.code);
          await signInWithRedirect(auth, provider);
          return;
        } catch (redirectErr) {
          console.error('Google redirect fallback failed:', redirectErr);
          setError(getLoginErrorMessage(redirectErr, t));
        }
      } else {
        setError(getLoginErrorMessage(err, t));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-orange-500 transition-colors rounded-lg focus-visible:ring-2 focus-visible:ring-orange-300"
          >
            {t('common.goBackHome')}
          </Link>
        </div>
        <div className="text-center mb-10">
          <div className="inline-flex bg-orange-500 p-3 rounded-2xl mb-4 shadow-lg shadow-orange-200">
            <QrCode className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{t('login.welcome')}</h1>
          <p className="text-gray-500 mt-2 leading-relaxed">{t('login.subtitle')}</p>
        </div>

        {error && (
          <div role="alert" className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full min-h-[44px] flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 font-bold py-4 px-6 rounded-2xl hover:bg-gray-50 transition-all disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-orange-300"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" referrerPolicy="no-referrer" />
          {loading ? t('login.processing') : t('login.button')}
        </button>

        <p className="text-center text-xs text-gray-400 mt-8">
          {t('common.termsAndPrivacy')}
        </p>
      </div>
    </div>
  );
}
