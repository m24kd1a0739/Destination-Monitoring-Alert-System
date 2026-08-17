import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { MapPin, Navigation, BellRing, Share2, ArrowRight, Check } from 'lucide-react';

export const OnboardingModal: React.FC = () => {
  const { completeOnboarding } = useAuth();
  const { t } = useSettings();
  const [step, setStep] = useState<number>(0);

  const steps = [
    {
      icon: MapPin,
      title: t.onboardingStep1Title,
      desc: t.onboardingStep1Desc,
      color: 'from-blue-500 to-brand-500',
      badge: 'Step 1 of 4'
    },
    {
      icon: Navigation,
      title: t.onboardingStep2Title,
      desc: t.onboardingStep2Desc,
      color: 'from-emerald-500 to-teal-500',
      badge: 'Step 2 of 4'
    },
    {
      icon: BellRing,
      title: t.onboardingStep3Title,
      desc: t.onboardingStep3Desc,
      color: 'from-amber-500 to-orange-500',
      badge: 'Step 3 of 4'
    },
    {
      icon: Share2,
      title: t.onboardingStep4Title,
      desc: t.onboardingStep4Desc,
      color: 'from-purple-500 to-pink-500',
      badge: 'Step 4 of 4'
    }
  ];

  const current = steps[step];
  const Icon = current.icon;

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      completeOnboarding();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-bg/90 backdrop-blur-md">
      <div className="w-full max-w-md bg-dark-surface border border-dark-border rounded-3xl p-6 sm:p-8 shadow-2xl relative">
        
        {/* Step Badge */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-dark-card border border-dark-border text-brand-400">
            {current.badge}
          </span>
          <button
            onClick={completeOnboarding}
            className="text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            {t.skip}
          </button>
        </div>

        {/* Step Icon */}
        <div className="flex justify-center mb-6">
          <div className={`w-20 h-20 rounded-3xl bg-gradient-to-tr ${current.color} flex items-center justify-center text-white shadow-xl shadow-brand-500/20`}>
            <Icon className="w-10 h-10" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
            {current.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm mx-auto">
            {current.desc}
          </p>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center space-x-2 mb-6">
          {steps.map((_, idx) => (
            <span
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === step ? 'w-8 bg-brand-500' : 'w-2 bg-dark-border'
              }`}
            />
          ))}
        </div>

        {/* Actions */}
        <button
          onClick={handleNext}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
        >
          <span>{step === steps.length - 1 ? t.getStarted : t.next}</span>
          {step === steps.length - 1 ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
        </button>

      </div>
    </div>
  );
};
