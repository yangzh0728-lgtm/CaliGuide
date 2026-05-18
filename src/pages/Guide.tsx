import { Info, CheckCircle2, FileText, Star, ClipboardCheck, UserPlus, Calendar, Eye, HelpCircle, Car, MapPin, ChevronDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Guide() {
  const { t } = useLanguage();
  const steps = [
    { icon: UserPlus, title: t('guide.step1.title'), desc: t('guide.step1.desc') },
    { icon: Calendar, title: t('guide.step2.title'), desc: t('guide.step2.desc') },
    { icon: Eye, title: t('guide.step3.title'), desc: t('guide.step3.desc') },
    { icon: HelpCircle, title: t('guide.step4.title'), desc: t('guide.step4.desc') },
    { icon: Car, title: t('guide.step5.title'), desc: t('guide.step5.desc') },
  ];

  const documents = [
    { title: t('guide.doc1.title'), desc: t('guide.doc1.desc') },
    { title: t('guide.doc2.title'), desc: t('guide.doc2.desc') },
    { title: t('guide.doc3.title'), desc: t('guide.doc3.desc') },
    { title: t('guide.doc4.title'), desc: t('guide.doc4.desc'), special: true },
  ];

  const faqs = [
    { q: t('guide.faq1.q'), a: t('guide.faq1.a') },
    { q: t('guide.faq2.q'), a: t('guide.faq2.a') },
  ];

  return (
    <div className="pt-20 pb-24 max-w-lg mx-auto px-4">
      {/* Hero */}
      <section className="mb-6">
        <h1 className="text-3xl font-bold text-on-surface mb-3">{t('guide.title')}</h1>
        <p className="text-on-surface-variant leading-relaxed">
          {t('guide.hero')}
        </p>
      </section>

      {/* Overview Card */}
      <section className="mb-6 bg-white border border-outline-variant p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 mb-3 text-primary">
          <Info size={24} />
          <h3 className="text-xl font-bold">{t('guide.overview')}</h3>
        </div>
        <p className="text-sm mb-4 leading-relaxed">
          {t('guide.overviewText')}
        </p>
        <div className="p-3 bg-surface-container rounded-xl">
          <p className="text-xs font-bold text-primary mb-1">{t('guide.keyFee')}</p>
          <p className="font-semibold">{t('guide.fee')}</p>
        </div>
      </section>

      {/* Required Documents */}
      <section className="mb-6 bg-white border border-outline-variant p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-primary">
          <FileText size={24} />
          <h3 className="text-xl font-bold">{t('guide.docs')}</h3>
        </div>
        <div className="space-y-3">
          {documents.map((doc, i) => (
            <div key={i} className={`flex gap-3 p-3 border border-outline-variant rounded-xl ${doc.special ? 'bg-surface-container-low' : ''}`}>
              {doc.special ? <Star size={20} className="text-primary flex-shrink-0" fill="currentColor" /> : <CheckCircle2 size={20} className="text-secondary flex-shrink-0" />}
              <div>
                <p className="text-sm font-bold">{doc.title}</p>
                <p className="text-xs text-on-surface-variant mt-0.5">{doc.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5-Step Process */}
      <section className="mb-6 bg-white border border-outline-variant p-5 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 text-primary">
            <ClipboardCheck size={24} />
            <h3 className="text-xl font-bold">{t('guide.process')}</h3>
          </div>
          <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-[10px] font-bold">{t('guide.estimated')}</span>
        </div>

        <div className="flex flex-col gap-8">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-4 relative">
              {i < steps.length - 1 && (
                <div className="absolute left-6 top-10 bottom-[-32px] w-0.5 bg-outline-variant" />
              )}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 z-10 shadow-sm ${i === 0 ? 'bg-secondary text-white' : i === 1 ? 'bg-primary text-white' : 'bg-surface-container-highest border-2 border-outline-variant text-on-surface-variant'}`}>
                <step.icon size={24} />
              </div>
              <div className="pt-1">
                <p className="font-bold text-sm mb-1">{step.title}</p>
                <p className="text-xs text-on-surface-variant">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mb-6">
        <div className="bg-primary text-white p-6 rounded-2xl relative overflow-hidden flex flex-col gap-4">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-2">{t('guide.ready')}</h3>
            <p className="text-white/80 text-sm">
              {t('guide.readyText')}
            </p>
          </div>
          <button className="relative z-10 bg-secondary-container text-on-secondary-container px-6 py-4 rounded-full font-bold flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-lg">
            <MapPin size={20} />
            {t('guide.findDmv')}
          </button>
          
          <div className="absolute right-0 top-0 h-full w-1/2 opacity-30 pointer-events-none">
            <img 
              alt="California" 
              className="h-full w-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCnR53aN2XtLOOHcVmHzy8rYbJqJLbkeOJDnsvX0N9Na3aco9sBsl2mNb4bOVdjj5F_HVczRqMHF5LTUO_tq_o7Fg6O7lI4FKivEpJZhyvc3Z_x-FRVvcp5yGjNwelhVJu2vkRM3bFroIi0uUR6Ip1sl98KomNWpC0Sr_QuafnivPpVJnsL7CMTSs9iLQHw_nWlbEVwFaI1zP2LXTmU-BDq-L53mcWJ-OH8225vRhh8b7_sFglnd5coUHH-lSUL1uvxtGB6_h1HrjU"
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-8">
        <h4 className="text-xl font-bold mb-4">{t('guide.faq')}</h4>
        <div className="space-y-3">
          {faqs.map((item, i) => (
            <details key={i} className="group bg-surface-container p-4 rounded-xl border border-transparent hover:border-outline-variant transition-colors cursor-pointer">
              <summary className="flex justify-between items-center font-bold text-sm list-none">
                {item.q}
                <ChevronDown size={20} className="group-open:rotate-180 transition-transform" />
              </summary>
              <p className="mt-3 text-sm text-on-surface-variant leading-relaxed">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
