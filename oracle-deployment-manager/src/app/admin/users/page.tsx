'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, XCircle, Trash2, Mail, User as UserIcon, Clock, Shield,
  UserCog, Users, ArrowRight, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLocale } from '@/hooks/use-locale';
import { useAuthStore, loadAuthFromStorage } from '@/stores/auth-store';
import { useRegistrationStore, type RegistrationRequest } from '@/stores/registration-store';
import { cn } from '@/lib/utils';

export default function AdminUsersPage() {
  const router = useRouter();
  const { isRTL, formatDate } = useLocale();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [confirmReject, setConfirmReject] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  const role = useAuthStore((s) => s.role);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const login = useAuthStore((s) => s.login);

  const pendingRequests = useRegistrationStore((s) => s.pendingRequests);
  const approvedUsers = useRegistrationStore((s) => s.approvedUsers);
  const loadFromStorage = useRegistrationStore((s) => s.loadFromStorage);
  const approveRequest = useRegistrationStore((s) => s.approveRequest);
  const rejectRequest = useRegistrationStore((s) => s.rejectRequest);
  const removeUser = useRegistrationStore((s) => s.removeUser);

  useEffect(() => {
    loadFromStorage();
    const stored = loadAuthFromStorage();
    if (stored.role) {
      login(stored.username, stored.role);
    }
    if (stored.role === 'admin') {
      setAuthorized(true);
    }
    setChecking(false);
  }, [loadFromStorage, login]);

  useEffect(() => {
    if (!checking && !authorized && isLoggedIn) {
      router.replace('/dashboard');
    }
    if (!checking && !authorized && !isLoggedIn) {
      router.replace('/login');
    }
  }, [checking, authorized, isLoggedIn, router]);

  if (checking || !authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F17]">
        <div className="h-8 w-8 border-2 border-[#18B13A]/30 border-t-[#18B13A] rounded-full animate-spin" />
      </div>
    );
  }

  const renderRequest = (req: RegistrationRequest) => (
    <motion.div
      key={req.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      layout
      className={cn(
        'flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl',
        'bg-white/[0.03] border border-white/[0.06]'
      )}
    >
      <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
          <Clock className="h-5 w-5 text-amber-500" />
        </div>
        <div className={cn('min-w-0', isRTL && 'text-end')}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-white">{req.username}</span>
            <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/20 bg-amber-500/5">
              {isRTL ? 'قيد الانتظار' : 'Pending'}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 truncate">{req.email}</p>
          <p className="text-[10px] text-slate-600 mt-0.5">
            {formatDate(new Date(req.createdAt))}
          </p>
        </div>
      </div>
      <div className={cn('flex items-center gap-2 w-full sm:w-auto', isRTL && 'flex-row-reverse')}>
        <Button
          size="sm"
          onClick={() => approveRequest(req.id)}
          className="h-8 text-xs bg-[#18B13A]/10 hover:bg-[#18B13A]/20 text-[#18B13A] border border-[#18B13A]/20 rounded-xl"
        >
          <CheckCircle className="h-3.5 w-3.5 ms-1" />
          {isRTL ? 'اعتماد' : 'Approve'}
        </Button>
        {confirmReject === req.id ? (
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              onClick={() => { rejectRequest(req.id); setConfirmReject(null); }}
              className="h-8 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl"
            >
              {isRTL ? 'تأكيد' : 'Confirm'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setConfirmReject(null)}
              className="h-8 text-xs text-slate-500 rounded-xl"
            >
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setConfirmReject(req.id)}
            className="h-8 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl"
          >
            <XCircle className="h-3.5 w-3.5 ms-1" />
            {isRTL ? 'رفض' : 'Reject'}
          </Button>
        )}
      </div>
    </motion.div>
  );

  const renderUser = (user: { email: string; username: string; role: string }) => (
    <motion.div
      key={user.email}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      layout
      className={cn(
        'flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl',
        'bg-white/[0.03] border border-white/[0.06]'
      )}
    >
      <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
          user.role === 'admin' ? 'bg-[#18B13A]/10' : 'bg-blue-500/10'
        )}>
          {user.role === 'admin'
            ? <UserCog className="h-5 w-5 text-[#18B13A]" />
            : <UserIcon className="h-5 w-5 text-blue-400" />
          }
        </div>
        <div className={cn('min-w-0', isRTL && 'text-end')}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-white">{user.username}</span>
            <Badge variant="outline" className={cn(
              'text-[10px]',
              user.role === 'admin'
                ? 'text-[#18B13A] border-[#18B13A]/20 bg-[#18B13A]/5'
                : 'text-blue-400 border-blue-500/20 bg-blue-500/5'
            )}>
              {user.role === 'admin'
                ? (isRTL ? 'مدير' : 'Admin')
                : (isRTL ? 'مستخدم' : 'User')
              }
            </Badge>
          </div>
          <p className="text-xs text-slate-500 truncate">{user.email}</p>
        </div>
      </div>
      {confirmRemove === user.email ? (
        <div className={cn('flex items-center gap-1 w-full sm:w-auto', isRTL && 'flex-row-reverse')}>
          <Button
            size="sm"
            onClick={() => { removeUser(user.email); setConfirmRemove(null); }}
            className="h-8 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl"
          >
            {isRTL ? 'تأكيد الحذف' : 'Confirm'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setConfirmRemove(null)}
            className="h-8 text-xs text-slate-500 rounded-xl"
          >
            {isRTL ? 'إلغاء' : 'Cancel'}
          </Button>
        </div>
      ) : (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setConfirmRemove(user.email)}
          className="h-8 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl shrink-0"
        >
          <Trash2 className="h-3.5 w-3.5 ms-1" />
          {isRTL ? 'حذف' : 'Remove'}
        </Button>
      )}
    </motion.div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isRTL ? 'إدارة المستخدمين' : 'User Management'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isRTL ? 'اعتماد طلبات التسجيل وإدارة المستخدمين' : 'Approve registration requests and manage users'}
          </p>
        </div>
        <Badge variant="outline" className="text-xs text-[#18B13A] border-[#18B13A]/20 bg-[#18B13A]/5">
          <Shield className="h-3 w-3 ms-1" />
          {isRTL ? 'مدير النظام' : 'Administrator'}
        </Badge>
      </div>

      {/* Pending Requests */}
      <Card className="glass-card border-white/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <CardTitle className="text-sm font-semibold">
                {isRTL ? 'طلبات التسجيل' : 'Registration Requests'}
              </CardTitle>
            </div>
            <Badge variant="outline" className={cn(
              'text-[10px]',
              pendingRequests.length > 0 ? 'text-amber-500 border-amber-500/20 bg-amber-500/5' : 'text-slate-600'
            )}>
              {pendingRequests.length} {isRTL ? 'طلب' : 'pending'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-8 w-8 text-slate-700 mx-auto mb-3" />
              <p className="text-sm text-slate-500">
                {isRTL ? 'لا توجد طلبات تسجيل جديدة' : 'No pending registration requests'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {pendingRequests.map(renderRequest)}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approved Users */}
      <Card className="glass-card border-white/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <CardTitle className="text-sm font-semibold">
                {isRTL ? 'المستخدمون المعتمدون' : 'Approved Users'}
              </CardTitle>
            </div>
            <Badge variant="outline" className="text-[10px] text-blue-400 border-blue-500/20 bg-blue-500/5">
              {approvedUsers.length} {isRTL ? 'مستخدم' : 'users'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {approvedUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-8 w-8 text-slate-700 mx-auto mb-3" />
              <p className="text-sm text-slate-500">
                {isRTL ? 'لا يوجد مستخدمون معتمدون بعد' : 'No approved users yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {approvedUsers.map(renderUser)}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
