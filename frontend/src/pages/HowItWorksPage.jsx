import React from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench,
  Search,
  CheckCircle2,
  CreditCard,
  Star,
  ShieldCheck,
  Clock,
  ArrowRight,
  Headphones,
} from 'lucide-react';

const HowItWorksPage = () => {
  const steps = [
    {
      number: '01',
      title: 'Select Your Required Service',
      description:
        'Browse through our 10+ categorized services including plumbing, electrical, cleaning, carpentry, AC repair, and more. Review starting prices and service inclusions.',
      icon: Search,
    },
    {
      number: '02',
      title: 'Specify Requirement & Schedule',
      description:
        'Briefly describe the task, pick a preferred calendar date and time slot that fits your schedule, and provide your service address.',
      icon: Clock,
    },
    {
      number: '03',
      title: 'Choose a Verified Professional',
      description:
        'Compare verified workers by real customer ratings, total completed jobs, verified badges, and transparent hourly/flat rates.',
      icon: ShieldCheck,
    },
    {
      number: '04',
      title: 'Track, Pay & Review',
      description:
        'Watch your professional update statuses (On The Way, Started, Completed). Inspect the quality of work, settle payment easily with cash or online, and leave your honest review.',
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="px-3.5 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-bold uppercase tracking-wider inline-block mb-3">
          Seamless Service Delivery
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
          How Workzo Works For You
        </h1>
        <p className="text-base text-slate-600 mt-3 leading-relaxed">
          From a leaking tap to complete apartment deep cleaning, booking trusted help is effortless, safe, and transparent.
        </p>
      </div>

      {/* 4 Steps Detailed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.number}
              className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex space-x-6 items-start"
            >
              <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0 font-black text-xl shadow-inner">
                {step.number}
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900">{step.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Safety & Pricing Highlights */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center sm:text-left">
        <div className="space-y-2">
          <div className="w-10 h-10 rounded-xl bg-slate-800 text-emerald-400 flex items-center justify-center mb-4">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold">100% Background Vetted</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Every technician undergoes document verification, police background check, and technical evaluation.
          </p>
        </div>

        <div className="space-y-2">
          <div className="w-10 h-10 rounded-xl bg-slate-800 text-amber-400 flex items-center justify-center mb-4">
            <CreditCard className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold">Pay After Service Completed</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            No mandatory upfront payment required. Inspect the completed job first and pay cash or digital on site.
          </p>
        </div>

        <div className="space-y-2">
          <div className="w-10 h-10 rounded-xl bg-slate-800 text-brand-400 flex items-center justify-center mb-4">
            <Headphones className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold">Dedicated Customer Support</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Have questions during or after a booking? Our platform support team is always ready to assist.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-8">
        <Link
          to="/workers"
          className="inline-flex items-center px-8 py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-xl shadow-brand-500/25 transition hover:scale-105"
        >
          <span>Find a Professional Now</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    </div>
  );
};

export default HowItWorksPage;
