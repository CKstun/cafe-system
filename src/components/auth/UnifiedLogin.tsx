import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';

export const UnifiedLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { loginUnified, currentAuthSession, navigate } = useCafe();

  // If already authenticated, redirect automatically
  React.useEffect(() => {
    if (currentAuthSession) {
      if (currentAuthSession.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/staff/orders');
      }
    }
  }, [currentAuthSession, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await loginUnified(email, password);
      if (!res.success) {
        setError(res.error || 'Authentication failed. Please check your credentials.');
      }
      // If success, loginUnified automatically inspects role and redirects to /admin/dashboard or /staff/orders
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to sign in. Please try again.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm bg-white border border-[#EADBCE]/80 rounded-2xl p-8 shadow-xs">
        {/* Café Pepita Brand Mark */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-[#4A2E19] text-[#FDFBF7] flex items-center justify-center font-serif text-xl font-bold shadow-xs">
            P
          </div>
          <h1 className="text-2xl font-serif tracking-tight text-[#2C1D11]">
            Café Pepita
          </h1>
          <p className="text-xs text-[#8C7A6B] mt-1 font-sans">
            Employee Portal
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200/80 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#2C1D11] mb-1.5">
              Email Address
            </label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="employee@cafepepita.com"
              className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#EADBCE] rounded-xl text-sm text-[#2C1D11] placeholder-[#B5A597] focus:outline-none focus:ring-2 focus:ring-[#4A2E19] focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#2C1D11] mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#EADBCE] rounded-xl text-sm text-[#2C1D11] placeholder-[#B5A597] focus:outline-none focus:ring-2 focus:ring-[#4A2E19] focus:border-transparent transition"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-2.5 bg-[#4A2E19] hover:bg-[#382212] active:scale-[0.99] text-white text-sm font-medium rounded-xl transition disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Subtle inline helper text */}
        <p className="text-center text-[11px] text-[#8C7A6B] mt-6 leading-relaxed">
          Forgot your password? Please contact your System Administrator.
        </p>

        {/* Public customer menu return */}
        <div className="mt-6 pt-4 border-t border-[#EADBCE]/50 text-center">
          <button
            type="button"
            onClick={() => navigate('/menu')}
            className="text-xs text-[#8C7A6B] hover:text-[#4A2E19] transition underline underline-offset-2"
          >
            Return to Customer Menu
          </button>
        </div>
      </div>
    </div>
  );
};
