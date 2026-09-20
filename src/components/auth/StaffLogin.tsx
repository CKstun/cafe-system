import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { Coffee, Lock, KeyRound, AlertCircle, Sparkles, ChefHat, CheckCircle2 } from 'lucide-react';

export const StaffLogin: React.FC = () => {
  const { loginStaff, authRedirectNotice, setAuthRedirectNotice } = useCafe();
  const [username, setUsername] = useState('barista@cafepita.com');
  const [password, setPassword] = useState('barista123');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const result = await loginStaff(username, password);
      if (!result.success) {
        setErrorMessage(result.error || 'Authentication failed. Please check your credentials.');
      }
    } catch {
      setErrorMessage('Unexpected server connection error while contacting authentication API.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-center items-center p-4 sm:p-6 selection:bg-amber-500/30">
      {/* Decorative ambient background */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-600 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-orange-700 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md space-y-6">
        {/* Terminal Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-inner">
            <ChefHat className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-100">
            Café Pepita — Staff Portal
          </h1>
          <p className="text-sm text-stone-400">
            Barista & Kitchen Display System (KDS) Terminal
          </p>
        </div>

        {/* Auth Notice if redirected */}
        {authRedirectNotice && (
          <div className="p-3.5 bg-amber-950/40 border border-amber-700/50 rounded-xl flex items-start gap-3 text-left">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-amber-300">Access Restricted</p>
              <p className="text-xs text-amber-200/80 leading-relaxed">{authRedirectNotice}</p>
            </div>
            <button
              onClick={() => setAuthRedirectNotice(null)}
              className="text-amber-400 hover:text-amber-200 text-xs ml-auto"
            >
              ×
            </button>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="p-3.5 bg-red-950/50 border border-red-800/60 rounded-xl flex items-start gap-3 text-left animate-shake">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-200">{errorMessage}</p>
          </div>
        )}

        {/* Login Form Card */}
        <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-2xl p-6 shadow-2xl space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="staff-username" className="block text-xs font-medium text-stone-300">
                Staff Username / Email
              </label>
              <div className="relative">
                <Coffee className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
                <input
                  id="staff-username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. barista@cafepita.com"
                  className="w-full min-h-[44px] pl-10 pr-3 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-stone-100 placeholder-stone-500 text-base focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="staff-password" className="block text-xs font-medium text-stone-300">
                Password / Staff PIN
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
                <input
                  id="staff-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full min-h-[44px] pl-10 pr-3 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-stone-100 placeholder-stone-500 text-base focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                id="staff-submit-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-[46px] py-3 px-4 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-stone-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg text-sm disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="inline-block w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Sign In to Staff KDS
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="pt-4 border-t border-stone-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-400 font-medium">Quick Demo Accounts:</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-400">
                role:staff
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                id="demo-barista-fill-btn"
                onClick={() => handleQuickFill('barista@cafepita.com', 'barista123')}
                className="min-h-[44px] p-2 text-left bg-stone-800/60 hover:bg-stone-800 border border-stone-700/60 rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-1.5 text-xs font-medium text-amber-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  Barista (Cheska)
                </div>
                <div className="text-[11px] text-stone-400 truncate">barista@cafepita.com</div>
              </button>

              <button
                type="button"
                id="demo-kitchen-fill-btn"
                onClick={() => handleQuickFill('marco@cafepita.com', 'staff123')}
                className="min-h-[44px] p-2 text-left bg-stone-800/60 hover:bg-stone-800 border border-stone-700/60 rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-1.5 text-xs font-medium text-orange-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  Kitchen (Marco)
                </div>
                <div className="text-[11px] text-stone-400 truncate">marco@cafepita.com</div>
              </button>
            </div>
          </div>
        </div>

        {/* Security & Isolation Notes */}
        <div className="p-3 bg-stone-900/40 border border-stone-800/50 rounded-xl text-center space-y-1">
          <p className="text-xs text-stone-400 flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Protected by Laravel Sanctum token ability enforcement
          </p>
          <p className="text-[11px] text-stone-400">
            Session is isolated from customer carts and admin controls.
          </p>
        </div>
      </div>
    </div>
  );
};
