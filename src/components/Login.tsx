import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider, User } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { QrCode } from 'lucide-react';

function getLoginErrorMessage(error: unknown): string {
  if (!(error instanceof FirebaseError)) {
    return 'Dang nhap that bai. Vui long thu lai.';
  }

  switch (error.code) {
    case 'auth/unauthorized-domain':
      return 'Domain hien tai chua duoc add trong Firebase Auth > Authorized domains.';
    case 'auth/operation-not-supported-in-this-environment':
      return 'Google login can HTTPS (hoac localhost). Domain HTTP cong khai se bi chan.';
    case 'auth/popup-blocked':
      return 'Popup dang nhap bi chan. Vui long cho phep popup trong trinh duyet.';
    case 'auth/popup-closed-by-user':
      return 'Ban da dong popup dang nhap truoc khi hoan tat.';
    case 'auth/network-request-failed':
      return 'Loi mang khi ket noi Firebase Auth. Vui long kiem tra internet/domain.';
    default:
      return `Dang nhap that bai (${error.code}).`;
  }
}

function goToDashboard() {
  window.location.replace('/dashboard');
}

export default function Login() {
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
        setError(getLoginErrorMessage(err));
      }
    })();
  }, []);

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
      const errorMsg = 'Moi truong dang nhap khong an toan (HTTPS/certificate). Vui long dung domain HTTPS hop le de dang nhap Google.';
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
        setError(getLoginErrorMessage(err));
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

      if (err instanceof FirebaseError && (err.code === 'auth/popup-blocked' || err.code === 'auth/operation-not-supported-in-this-environment' || err.code === 'auth/network-request-failed')) {
        try {
          console.log('[Google Login] Popup failed, trying redirect fallback...', err.code);
          await signInWithRedirect(auth, provider);
          return;
        } catch (redirectErr) {
          console.error('Google redirect fallback failed:', redirectErr);
          setError(getLoginErrorMessage(redirectErr));
        }
      } else {
        setError(getLoginErrorMessage(err));
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
            ← Quay về trang chủ
          </Link>
        </div>
        <div className="text-center mb-10">
          <div className="inline-flex bg-orange-500 p-3 rounded-2xl mb-4 shadow-lg shadow-orange-200">
            <QrCode className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Chào mừng trở lại</h1>
          <p className="text-gray-500 mt-2 leading-relaxed">Bắt đầu quản lý menu của bạn ngay hôm nay</p>
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
          {loading ? 'Đang xử lý...' : 'Đăng nhập với Google'}
        </button>

        <p className="text-center text-xs text-gray-400 mt-8">
          Bằng cách đăng nhập, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của chúng tôi.
        </p>
      </div>
    </div>
  );
}
