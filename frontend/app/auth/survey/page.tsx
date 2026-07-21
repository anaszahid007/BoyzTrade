"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, ChevronRight, ArrowLeft, TrendingUp, BarChart3, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/auth";

const experienceOptions = [
  { value: "beginner", label: "Beginner", desc: "New to trading, looking to learn the basics" },
  { value: "intermediate", label: "Intermediate", desc: "Have some experience, want to improve" },
  { value: "advanced", label: "Advanced", desc: "Experienced trader refining strategies" },
  { value: "professional", label: "Professional", desc: "Professional or full-time trader" },
];

const sourceOptions = [
  { value: "social_media", label: "Social Media" },
  { value: "friend", label: "Friend or Colleague" },
  { value: "google", label: "Google Search" },
  { value: "youtube", label: "YouTube" },
  { value: "other", label: "Other" },
];

const goalOptions = [
  { value: "learn_trading", label: "Learn How to Trade" },
  { value: "grow_portfolio", label: "Grow a Portfolio" },
  { value: "practice_strategies", label: "Practice Strategies" },
  { value: "other", label: "Other" },
];

export default function SurveyPage() {
  const router = useRouter();
  const { user, loading, setUser } = useAuth();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState({
    experienceLevel: "",
    referralSource: "",
    tradingGoals: "",
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    } else if (!loading && user && user.surveyCompleted) {
      const home = user.role === 'admin' ? '/admin' : user.role === 'instructor' ? '/instructor' : '/dashboard';
      router.push(home);
    }
  }, [user, loading, router]);

  const updateAnswer = (key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (step < 2) setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const updatedUser = await authService.submitSurvey(answers);
      setUser(updatedUser);
      router.push("/dashboard");
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  };

  const canProceed = () => {
    if (step === 0) return !!answers.experienceLevel;
    if (step === 1) return !!answers.referralSource;
    if (step === 2) return !!answers.tradingGoals;
    return false;
  };

  if (loading || !user || user.surveyCompleted) return null;

  const steps = [
    {
      title: "Trading Experience",
      subtitle: "What best describes your trading experience?",
      options: experienceOptions,
      key: "experienceLevel" as const,
    },
    {
      title: "How Did You Find Us?",
      subtitle: "Where did you hear about BoyzTrade?",
      options: sourceOptions,
      key: "referralSource" as const,
    },
    {
      title: "Your Trading Goals",
      subtitle: "What are you hoping to achieve?",
      options: goalOptions,
      key: "tradingGoals" as const,
    },
  ];

  const current = steps[step];

  return (
    <div className="min-h-screen flex bg-bg-dark">
      {/* Left - Survey Panel */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-success/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-primary/5 blur-[100px] rounded-full" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg z-10"
        >
          {/* Progress */}
          <div className="flex items-center gap-2 mb-8">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-500 ${
                  i <= step ? "bg-success flex-1" : "bg-white/10 flex-1"
                }`}
              />
            ))}
          </div>

          {/* Step indicator */}
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-2">
            Step {step + 1} of 3
          </p>

          {/* Title */}
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-2">
              {current.title}
            </h1>
            <p className="text-muted-foreground text-sm">{current.subtitle}</p>
          </motion.div>

          {/* Options */}
          <motion.div
            key={`options-${step}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2.5 mb-8"
          >
            {current.options.map((opt) => {
              const isSelected = answers[current.key] === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => updateAnswer(current.key, opt.value)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                    isSelected
                      ? "bg-success/10 border-success/30 text-success"
                      : "bg-white/[0.02] border-white/[0.06] text-muted-foreground hover:border-white/20 hover:text-foreground"
                  }`}
                >
                  <span className="text-sm font-bold block">{opt.label}</span>
                  {"desc" in opt && (
                    <span className={`text-[10px] block mt-0.5 ${isSelected ? "text-success/70" : "text-muted-foreground/60"}`}>
                      {(opt as any).desc}
                    </span>
                  )}
                </button>
              );
            })}
          </motion.div>

          {/* Navigation */}
          <div className="flex items-center gap-3">
            {step > 0 && (
              <Button variant="ghost" onClick={handleBack} className="px-4 h-11 rounded-xl text-sm">
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Back
              </Button>
            )}
            <div className="flex-1" />
            {step < 2 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="px-6 h-11 rounded-xl text-sm shadow-lg shadow-success/10"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1.5" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                isLoading={submitting}
                disabled={!canProceed()}
                className="px-6 h-11 rounded-xl text-sm shadow-lg shadow-success/10"
              >
                Complete Setup
                <Sparkles className="w-4 h-4 ml-1.5" />
              </Button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Right - Visual Panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-success/[0.08] via-transparent to-primary/[0.04] relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-success/10 blur-[150px] rounded-full" />
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-primary/10 blur-[120px] rounded-full" />
        </div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative z-10 w-full max-w-lg space-y-8"
        >
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-success/10 border border-success/20 rounded-full text-success text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              Quick Setup
            </div>
            <h2 className="text-3xl font-bold tracking-tight leading-tight">
              Help Us Personalize<br />
              <span className="text-success">Your Experience</span>
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Tell us a bit about yourself so we can tailor the platform to match your skill level and goals.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { icon: TrendingUp, title: "Personalized Content", desc: "Lessons and challenges matched to your level." },
              { icon: BarChart3, title: "Smart Recommendations", desc: "Asset suggestions based on your goals." },
              { icon: Shield, title: "Better Insights", desc: "Track progress with benchmarks relevant to you." },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/5 border border-white/5">
                  <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center text-success shrink-0 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{item.title}</p>
                    <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
