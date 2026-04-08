import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { useTranslation } from '../i18n';

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 text-center">
      <div className="bg-white p-12 rounded-3xl border border-gray-100 shadow-sm max-w-lg w-full">
        <h1 className="text-9xl font-extrabold text-orange-500 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('notFound.title')}</h2>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
          {t('notFound.description')}
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 bg-orange-500 text-white px-8 py-4 rounded-full font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-200"
        >
          <Home size={20} /> {t('notFound.goHome')}
        </Link>
      </div>
    </div>
  );
}
