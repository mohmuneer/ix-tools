'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Database, Eye, EyeOff, ArrowLeft, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocale } from '@/hooks/use-locale';
import { useAuthStore, loadAuthFromStorage } from '@/stores/auth-store';
import { useBrandingStore } from '@/stores/branding-store';
import { cn } from '@/lib/utils';
import Link from 'next/link';

function Particles() {
  const [particles, setParticles] = useState<Array<{ id: number; left: number; top: number; size: number; duration: number; delay: number; opacity: number }>>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 20 + 15,
        delay: Math.random() * 10,
        opacity: Math.random() * 0.3 + 0.05,
      }))
    );
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full animate-pulse"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: `rgba(37, 99, 235, ${p.opacity})`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

const RTL_INPUT_STYLE: React.CSSProperties = {
  fontFamily: "'Cairo', 'IBM Plex Sans Arabic', system-ui, sans-serif",
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  fontWeight: 600,
  unicodeBidi: 'plaintext',
};

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { isRTL } = useLocale();
  const { login } = useAuthStore();
  const config = useBrandingStore((s) => s.config);

  useEffect(() => {
    const stored = loadAuthFromStorage();
    if (stored.role) {
      login(stored.username, stored.role, stored.userId);
      router.replace('/dashboard');
    }
  }, [login, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError(isRTL ? 'يرجى إدخال اسم المستخدم' : 'Please enter username');
      return;
    }
    if (!password.trim()) {
      setError(isRTL ? 'يرجى إدخال كلمة المرور' : 'Please enter password');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      login(data.user.username, data.user.role as 'admin' | 'user', data.user.id);
      router.push('/dashboard');
    } catch {
      setError(isRTL ? 'حدث خطأ في الاتصال' : 'Connection error');
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="relative min-h-screen w-full overflow-hidden" style={{ background: '#020617' }}>

      {/* Background layers */}
      <div className="absolute inset-0">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(37,99,235,0.12), transparent 70%)',
        }} />
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 60% 50% at 30% 70%, rgba(7,27,52,0.8), transparent 60%)',
        }} />
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 50% 40% at 70% 20%, rgba(4,17,29,0.6), transparent 50%)',
        }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />
      </div>

      <Particles />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">

        {/* Logo */}
        <div className="flex flex-col items-center gap-4 mb-8 animate-fadeIn">
          <div className="relative">
            <div className="absolute inset-0 blur-2xl opacity-30" style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.5), transparent 70%)', transform: 'scale(2)' }} />
            {config.logo?.logoUrl ? (
              <img
                src={config.logo.logoUrl}
                alt="Onyx IX"
                className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-contain shadow-2xl"
                style={{ boxShadow: '0 0 40px rgba(37,99,235,0.25)' }}
              />
            ) : (
              <div
                className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center shadow-2xl"
                style={{
                  background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
                  boxShadow: '0 0 40px rgba(37,99,235,0.3)',
                }}
              >
                <Database className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
            )}
          </div>
          <div className="text-end">
            <h1 className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: "'Cairo', 'IBM Plex Sans Arabic', system-ui, sans-serif", fontWeight: 800 }}>
              {config.logo?.systemName || 'Onyx IX'}
            </h1>
            <p className="text-sm text-slate-400 mt-1" style={{ fontFamily: "'Cairo', 'IBM Plex Sans Arabic', system-ui, sans-serif", fontWeight: 600 }}>
              {config.logo?.companyName || 'Ultimate Solutions'}
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div
          className="w-full max-w-[480px] animate-fadeUp"
          style={{ animationDelay: '0.15s' }}
        >
          <div
            className="rounded-3xl p-8 sm:p-10"
            style={{
              background: 'rgba(10,15,35,0.75)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03) inset',
            }}
          >
            {/* Card header */}
            <div className="text-end mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-white" style={{ fontFamily: "'Cairo', 'IBM Plex Sans Arabic', system-ui, sans-serif", fontWeight: 700 }}>
                {isRTL ? 'تسجيل الدخول' : 'Sign In'}
              </h2>
              <p className="text-sm text-slate-400 mt-2" style={{ fontFamily: "'Cairo', 'IBM Plex Sans Arabic', system-ui, sans-serif", fontWeight: 600 }}>
                {isRTL ? 'أدخل اسم المستخدم وكلمة المرور للوصول إلى النظام' : 'Enter your username and password to access the system'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5" dir="rtl">
              {/* Username */}
              <div className="space-y-2">
                <Label
                  className="text-end block text-sm font-semibold text-slate-300"
                  style={{ fontFamily: "'Cairo', 'IBM Plex Sans Arabic', system-ui, sans-serif", fontWeight: 600 }}
                >
                  {isRTL ? 'اسم المستخدم أو البريد' : 'Username or Email'}
                </Label>
                <div className="relative">
                  <User className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={isRTL ? 'أدخل اسم المستخدم أو البريد' : 'Enter username or email'}
                    dir="rtl"
                    autoComplete="username"
                    className="h-14 text-end pe-11 ps-4 rounded-2xl text-white placeholder:text-slate-600 transition-all duration-200"
                    style={{ ...RTL_INPUT_STYLE, textAlign: 'right', direction: 'rtl' }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(37,99,235,0.5)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.15)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label
                  className="text-end block text-sm font-semibold text-slate-300"
                  style={{ fontFamily: "'Cairo', 'IBM Plex Sans Arabic', system-ui, sans-serif", fontWeight: 600 }}
                >
                  {isRTL ? 'كلمة المرور' : 'Password'}
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isRTL ? 'أدخل كلمة المرور' : 'Enter password'}
                    dir="rtl"
                    autoComplete="current-password"
                    className="h-14 text-end pe-11 ps-4 rounded-2xl text-white placeholder:text-slate-600 transition-all duration-200"
                    style={{ ...RTL_INPUT_STYLE, textAlign: 'right', direction: 'rtl' }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(37,99,235,0.5)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.15)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                    aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div
                  className="text-end py-2 px-4 rounded-xl text-sm text-red-400"
                  style={{
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.15)',
                    fontFamily: "'Cairo', 'IBM Plex Sans Arabic', system-ui, sans-serif",
                  }}
                >
                  {error}
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-2xl text-white font-bold text-base transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  fontFamily: "'Cairo', 'IBM Plex Sans Arabic', system-ui, sans-serif",
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
                  boxShadow: '0 4px 20px rgba(37,99,235,0.35), 0 0 0 1px rgba(37,99,235,0.2) inset',
                }}
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                ) : (
                  <span className={cn('flex items-center justify-center gap-2', isRTL && 'flex-row-reverse')}>
                    {isRTL ? 'دخول' : 'Sign In'}
                    <ArrowLeft className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 text-end" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-sm text-slate-500" style={{ fontFamily: "'Cairo', 'IBM Plex Sans Arabic', system-ui, sans-serif", fontWeight: 600 }}>
                {isRTL ? 'ليس لديك حساب؟' : "Don't have an account?"}{' '}
                <Link
                  href="/register"
                  className="font-bold transition-colors hover:underline"
                  style={{ color: '#3B82F6', fontFamily: "'Cairo', 'IBM Plex Sans Arabic', system-ui, sans-serif", fontWeight: 700 }}
                >
                  {isRTL ? 'تسجيل جديد' : 'Register'}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
