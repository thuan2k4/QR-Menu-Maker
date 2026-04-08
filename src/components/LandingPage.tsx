import React, { ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { QrCode, Utensils, Smartphone, CheckCircle } from 'lucide-react';
import { useTranslation } from '../i18n';
import GlobalLanguageSwitcher from './GlobalLanguageSwitcher';

export default function LandingPage() {
  const { t } = useTranslation();
  const demoImages = [
    { src: '/preview_1.png', altKey: 'landing.demoImageAlt1' },
    { src: '/preview_2.png', altKey: 'landing.demoImageAlt2' },
    { src: '/preview_3.png', altKey: 'landing.demoImageAlt3' },
    { src: '/preview_4.png', altKey: 'landing.demoImageAlt4' },
  ];
  const [activeDemoIndex, setActiveDemoIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="bg-orange-500 p-2 rounded-lg">
            <QrCode className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">{t('landing.brand')}</span>
        </div>
        <div className="flex items-center gap-3">
          <GlobalLanguageSwitcher />
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <Link to="/login" className="inline-flex min-h-[44px] items-center bg-orange-500 text-white px-5 py-2 rounded-full hover:bg-orange-600 transition-colors focus-visible:ring-2 focus-visible:ring-orange-400">{t('landing.ctaFreeMenu')}</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-20 md:py-32 max-w-7xl mx-auto text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[clamp(2.25rem,7vw,4.75rem)] font-extrabold tracking-tight leading-[1.1] mb-6"
        >
          {t('landing.heroTitleLine1')} <br />
          <span className="text-orange-500">{t('landing.heroTitleLine2')}</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-gray-500 max-w-[65ch] leading-relaxed mx-auto mb-10"
        >
          {t('landing.heroDescription')}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/login" className="w-full sm:w-auto inline-flex min-h-[44px] items-center justify-center bg-orange-500 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 focus-visible:ring-2 focus-visible:ring-orange-400">
            {t('landing.ctaFreeMenu')}
          </Link>
          <a href="#demo" className="w-full sm:w-auto inline-flex min-h-[44px] items-center justify-center border border-gray-200 text-gray-600 px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-50 transition-all focus-visible:ring-2 focus-visible:ring-orange-300">
            {t('landing.ctaViewDemo')}
          </a>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="bg-gray-50 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">{t('landing.whyChooseHeading')}</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <FeatureCard
              icon={<Utensils className="w-8 h-8 text-orange-500" />}
              title={t('landing.featureEasyManageTitle')}
              description={t('landing.featureEasyManageDescription')}
            />
            <FeatureCard
              icon={<Smartphone className="w-8 h-8 text-orange-500" />}
              title={t('landing.featureOptimizeMobileTitle')}
              description={t('landing.featureOptimizeMobileDescription')}
            />
            <FeatureCard
              icon={<CheckCircle className="w-8 h-8 text-orange-500" />}
              title={t('landing.featureAutoQrTitle')}
              description={t('landing.featureAutoQrDescription')}
            />
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">{t('landing.demoHeading')}</h2>
        <p className="text-center text-gray-500 max-w-3xl mx-auto mb-8">
          {t('landing.demoDescription')}
        </p>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-stretch">
          <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-lg h-full min-h-[560px] xl:min-h-[700px] bg-white">
            <div className="w-full h-full flex items-center justify-center bg-white p-4">
              <img
                src={demoImages[activeDemoIndex].src}
                alt={t(demoImages[activeDemoIndex].altKey)}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>

          <div className="space-y-5 min-h-[560px] xl:min-h-[700px]">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <p className="text-gray-500 text-sm mb-2">{t('landing.screenshotDetails')}</p>
              <p className="text-lg font-semibold text-gray-900">{t(demoImages[activeDemoIndex].altKey)}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <p className="text-gray-600 leading-relaxed mb-4">
                {t('landing.demoCaption')}
              </p>
              <button
                type="button"
                onClick={() => setIsImageModalOpen(true)}
                className="w-full justify-center inline-flex min-h-[44px] items-center gap-2 bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-all focus-visible:ring-2 focus-visible:ring-orange-400"
              >
                {t('landing.viewLargeImage')}
              </button>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <p className="text-gray-500 text-sm mb-2">{t('landing.selectAnotherImage')}</p>
              <div className="grid grid-cols-3 gap-3">
                {demoImages.map((image, index) => (
                  <button
                    key={image.src}
                    type="button"
                    onClick={() => setActiveDemoIndex(index)}
                    aria-label={`${t('landing.ctaViewDemo')} ${t(image.altKey)}`}
                    className={`rounded-lg overflow-hidden border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 ${index === activeDemoIndex
                      ? 'border-orange-500 shadow-md ring-2 ring-orange-300'
                      : 'border-gray-200 hover:border-orange-300 hover:shadow-sm'
                      }`}
                  >
                    <img src={image.src} alt={t(image.altKey)} className="w-full h-24 xl:h-28 object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

      </section>

      {isImageModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6"
          role="dialog"
          aria-modal="true"
          aria-label={t('landing.modalTitle')}
          onClick={() => setIsImageModalOpen(false)}
        >
          <div
            className="relative w-full max-w-6xl rounded-3xl bg-white shadow-2xl overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <p className="text-base font-semibold text-gray-900">{t('landing.modalTitle')}</p>
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="text-gray-500 hover:text-gray-900 rounded-full p-2 focus-visible:ring-2 focus-visible:ring-orange-300"
                aria-label={t('landing.closeModal')}
              >
                ✕
              </button>
            </div>
            <div className="bg-white p-4 max-h-[85vh] overflow-auto">
              <img
                src={demoImages[activeDemoIndex].src}
                alt={t(demoImages[activeDemoIndex].altKey)}
                className="w-full h-full max-h-[75vh] object-contain bg-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-100 text-center text-gray-400 text-sm">
        <p>{t('landing.footer')}</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}
