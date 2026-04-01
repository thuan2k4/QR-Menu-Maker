import { useEffect, useState } from 'react';
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
        const result = await getRedirectResult(auth);
        if (result?.user) {
          await ensureUserProfile(result.user);
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

    const ua = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const isSafari = /safari/.test(ua) && !/crios|fxios|edgios|chrome|android/.test(ua);

    if (isIOS && isSafari) {
      try {
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
      const result = await signInWithPopup(auth, provider);
      await ensureUserProfile(result.user);
    } catch (err) {
      console.error('Google login failed:', err);

      if (err instanceof FirebaseError && (err.code === 'auth/popup-blocked' || err.code === 'auth/operation-not-supported-in-this-environment')) {
        try {
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
        <div className="text-center mb-10">
          <div className="inline-flex bg-orange-500 p-3 rounded-2xl mb-4 shadow-lg shadow-orange-200">
            <QrCode className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Chào mừng trở lại</h1>
          <p className="text-gray-500 mt-2">Bắt đầu quản lý menu của bạn ngay hôm nay</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 font-bold py-4 px-6 rounded-2xl hover:bg-gray-50 transition-all disabled:opacity-50"
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
