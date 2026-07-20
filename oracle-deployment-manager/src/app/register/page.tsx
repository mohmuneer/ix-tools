'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Database, Mail, User, Lock, ArrowRight, CheckCircle, Shield, Server, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocale } from '@/hooks/use-locale';
import { useRegistrationStore } from '@/stores/registration-store';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { isRTL } = useLocale();
  const addRequest = useRegistrationStore((s) => s.addRequest);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError(isRTL ? 'يرجى إدخال البريد الإلكتروني' : 'Please enter email');
      return;
    }
    if (!username.trim()) {
      setError(isRTL ? 'يرجى إدخال اسم المستخدم' : 'Please enter username');
      return;
    }
    if (!password.trim()) {
      setError(isRTL ? 'يرجى إدخال كلمة المرور' : 'Please enter password');
      return;
    }
    if (password.length < 4) {
      setError(isRTL ? 'كلمة المرور قصيرة جداً (4 أحرف على الأقل)' : 'Password too short (min 4 characters)');
      return;
    }
    if (password !== confirmPassword) {
      setError(isRTL ? 'كلمة المرور غير متطابقة' : 'Passwords do not match');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      addRequest({ email: email.trim(), username: username.trim(), password, requestedRole: 'user' });
      setDone(true);
      setLoading(false);
    }, 600);
  };

  const features = [
    { icon: Server, title: isRTL ? 'إدارة الخوادم' : 'Server Management', desc: isRTL ? 'مراقبة وإدارة خوادم' : 'Monitor & manage servers' },
    { icon: Shield, title: isRTL ? 'صلاحيات متعددة' : 'Multi-level Roles', desc: isRTL ? 'مدير نظام ومستخدم عادي' : 'Admin and normal user' },
    { icon: Globe, title: isRTL ? 'منصة موحدة' : 'Unified Platform', desc: isRTL ? 'كل أدواتك في مكان واحد' : 'All tools in one place' },
  ];

  if (done) {
    return (
      <div className="min-h-screen us-login-bg flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#18B13A]/[0.03] blur-[100px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-[#3A3A96]/[0.05] blur-[80px]" />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="rounded-3xl bg-[#111827]/80 backdrop-blur-2xl border border-white/[0.06] shadow-2xl shadow-black/40 p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#18B13A]/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-[#18B13A]" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              {isRTL ? 'تم إرسال الطلب' : 'Request Submitted'}
            </h2>
            <p className="text-sm text-slate-400 mb-6">
              {isRTL
                ? 'سيتم مراجعة طلبك من قبل مدير النظام. سيتم تفعيل حسابك بعد الموافقة.'
                : 'Your request will be reviewed by the administrator. Your account will be activated upon approval.'}
            </p>
            <Button
              onClick={() => router.push('/login')}
              className="h-11 bg-gradient-to-r from-[#18B13A] to-[#15803D] hover:from-[#15803D] hover:to-[#14702F] text-white font-semibold rounded-xl shadow-lg shadow-[#18B13A]/25"
            >
              <span className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                {isRTL ? 'العودة لتسجيل الدخول' : 'Back to Sign In'}
                <ArrowRight className={cn('h-4 w-4', isRTL && 'rotate-180')} />
              </span>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen us-login-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#18B13A]/[0.03] blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-[#3A3A96]/[0.05] blur-[80px]" />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full bg-[#38BDF8]/[0.03] blur-[60px]" />
      </div>

      <div className={cn('w-full max-w-5xl flex items-center gap-12 relative z-10', isRTL && 'flex-row-reverse')}>
        <motion.div
          initial={{ opacity: 0, x: isRTL ? 40 : -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          className="hidden lg:flex flex-col flex-1 gap-10"
        >
          <div className={cn('space-y-4', isRTL && 'text-end')}>
            <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#18B13A] to-[#15803D] flex items-center justify-center shadow-xl shadow-[#18B13A]/20">
                <Database className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Onyx IX</h1>
                <p className="text-sm text-slate-500">{isRTL ? 'متطلبات التركيب' : 'Installation Requirements'}</p>
              </div>
            </div>
            <h2 className="text-4xl font-bold text-white leading-tight">
              {isRTL ? 'طلب تسجيل جديد' : 'New Registration'}
              <br />
              <span className="text-[#18B13A]">{isRTL ? 'إنشاء حساب جديد' : 'Create Account'}</span>
            </h2>
            <p className="text-slate-400 text-base max-w-md">
              {isRTL
                ? 'قم بإنشاء حساب جديد وسيتم تفعيله بعد موافقة مدير النظام.'
                : 'Create a new account. It will be activated after administrator approval.'}
            </p>
          </div>

          <div className="space-y-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                className={cn('flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm', isRTL && 'flex-row-reverse')}
              >
                <div className="w-10 h-10 rounded-xl bg-[#18B13A]/10 flex items-center justify-center shrink-0">
                  <f.icon className="h-5 w-5 text-[#18B13A]" />
                </div>
                <div className={cn('min-w-0', isRTL && 'text-end')}>
                  <p className="text-sm font-semibold text-white">{f.title}</p>
                  <p className="text-xs text-slate-500 truncate">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
          className="w-full max-w-md"
        >
          <div className={cn('flex lg:hidden items-center gap-3 mb-8', isRTL && 'flex-row-reverse')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#18B13A] to-[#15803D] flex items-center justify-center shadow-lg shadow-[#18B13A]/20">
              <Database className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white">Onyx IX</h1>
              <p className="text-[10px] text-slate-500">{isRTL ? 'متطلبات التركيب' : 'Requirements'}</p>
            </div>
          </div>

          <div className="rounded-3xl bg-[#111827]/80 backdrop-blur-2xl border border-white/[0.06] shadow-2xl shadow-black/40 p-8">
            <div className={cn('space-y-1 mb-6', isRTL && 'text-end')}>
              <h2 className="text-xl font-bold text-white">
                {isRTL ? 'إنشاء حساب' : 'Create Account'}
              </h2>
              <p className="text-sm text-slate-500">
                {isRTL ? 'أدخل بياناتك لإنشاء حساب جديد' : 'Enter your details to create a new account'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-400">
                  {isRTL ? 'البريد الإلكتروني' : 'Email'}
                </Label>
                <div className="relative">
                  <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={isRTL ? 'أدخل البريد الإلكتروني' : 'Enter email'}
                    className="h-11 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-slate-600 focus:border-[#18B13A]/40 focus:ring-[#18B13A]/20 rounded-xl ps-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-400">
                  {isRTL ? 'اسم المستخدم' : 'Username'}
                </Label>
                <div className="relative">
                  <User className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={isRTL ? 'أدخل اسم المستخدم' : 'Enter username'}
                    className="h-11 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-slate-600 focus:border-[#18B13A]/40 focus:ring-[#18B13A]/20 rounded-xl ps-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-400">
                  {isRTL ? 'كلمة المرور' : 'Password'}
                </Label>
                <div className="relative">
                  <Lock className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isRTL ? 'أدخل كلمة المرور' : 'Enter password'}
                    className="h-11 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-slate-600 focus:border-[#18B13A]/40 focus:ring-[#18B13A]/20 rounded-xl ps-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-400">
                  {isRTL ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                </Label>
                <div className="relative">
                  <Lock className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={isRTL ? 'أعد إدخال كلمة المرور' : 'Re-enter password'}
                    className="h-11 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-slate-600 focus:border-[#18B13A]/40 focus:ring-[#18B13A]/20 rounded-xl ps-10"
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-400 text-center">{error}</p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-[#18B13A] to-[#15803D] hover:from-[#15803D] hover:to-[#14702F] text-white font-semibold rounded-xl shadow-lg shadow-[#18B13A]/25 hover:shadow-[#18B13A]/40 transition-all duration-200"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                    {isRTL ? 'إرسال الطلب' : 'Submit Request'}
                    <ArrowRight className={cn('h-4 w-4', isRTL && 'rotate-180')} />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/[0.06] text-center">
              <p className="text-sm text-slate-500">
                {isRTL ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
                <Link href="/login" className="text-[#18B13A] hover:text-[#4ADE80] font-medium transition-colors">
                  {isRTL ? 'تسجيل الدخول' : 'Sign In'}
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
