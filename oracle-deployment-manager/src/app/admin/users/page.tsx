'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, XCircle, Shield, UserCog, Users,
  User as UserIcon, Clock, Search, Pencil, Key,
  ArrowUpDown, ArrowUp, ArrowDown, Filter, ChevronLeft, ChevronRight,
  RefreshCw, Database
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table';
import { useLocale } from '@/hooks/use-locale';
import { useAuthStore, loadAuthFromStorage } from '@/stores/auth-store';
import { cn } from '@/lib/utils';

type Tab = 'all' | 'pending' | 'active';
type SortField = 'username' | 'email' | 'role' | 'status';
type SortDir = 'asc' | 'desc';

type UserItem = {
  id: string;
  email: string;
  username: string;
  role: string;
  status: string;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
};

const PAGE_SIZE = 10;

export default function AdminUsersPage() {
  const router = useRouter();
  const { isRTL } = useLocale();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<Tab>('pending');
  const [search, setSearch] = useState('');
  const [searchField, setSearchField] = useState<'all' | 'email' | 'username'>('all');
  const [showSearchOptions, setShowSearchOptions] = useState(false);
  const [sortField, setSortField] = useState<SortField>('status');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(0);
  const [confirmAction, setConfirmAction] = useState<{ type: 'reject' | 'revoke'; id: string } | null>(null);
  const [items, setItems] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [editUser, setEditUser] = useState<UserItem | null>(null);
  const [editForm, setEditForm] = useState({ username: '', email: '', role: 'user' });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');

  const [pwUser, setPwUser] = useState<UserItem | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setItems(data.users || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = loadAuthFromStorage();
    if (stored.role) {
      useAuthStore.getState().login(stored.username, stored.role, stored.userId);
    }
    if (stored.role === 'admin') {
      setAuthorized(true);
      fetchUsers();
    } else {
      router.replace(stored.role ? '/dashboard' : '/login');
    }
    setChecking(false);
  }, [router, fetchUsers]);

  useEffect(() => {
    if (!authorized) return;
    const id = setInterval(fetchUsers, 5000);
    return () => clearInterval(id);
  }, [authorized, fetchUsers]);

  const approve = useCallback(async (id: string) => {
    try {
      await fetch(`/api/admin/users/${id}/approve`, { method: 'POST' });
      setConfirmAction(null);
      fetchUsers();
    } catch {}
  }, [fetchUsers]);

  const reject = useCallback(async (id: string) => {
    try {
      await fetch(`/api/admin/users/${id}/reject`, { method: 'POST' });
      setConfirmAction(null);
      fetchUsers();
    } catch {}
  }, [fetchUsers]);

  const openEdit = (user: UserItem) => {
    setEditUser(user);
    setEditForm({ username: user.username, email: user.email, role: user.role });
    setEditError('');
  };

  const saveEdit = async () => {
    if (!editUser) return;
    setEditSaving(true);
    setEditError('');
    try {
      const res = await fetch(`/api/admin/users/${editUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) { setEditError(data.error); return; }
      setEditUser(null);
      fetchUsers();
    } catch { setEditError('Connection error'); }
    finally { setEditSaving(false); }
  };

  const openPassword = (user: UserItem) => {
    setPwUser(user);
    setNewPassword('');
    setPwError('');
    setPwSuccess('');
  };

  const savePassword = async () => {
    if (!pwUser) return;
    if (newPassword.length < 4) { setPwError(isRTL ? '4 أحرف على الأقل' : 'Min 4 characters'); return; }
    setPwSaving(true);
    setPwError('');
    setPwSuccess('');
    try {
      const res = await fetch(`/api/admin/users/${pwUser.id}/password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setPwError(data.error); return; }
      setPwSuccess(isRTL ? 'تم تحديث كلمة المرور' : 'Password updated');
      setNewPassword('');
    } catch { setPwError('Connection error'); }
    finally { setPwSaving(false); }
  };

  const visible = useMemo(() => {
    let list = [...items];
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'username': cmp = a.username.localeCompare(b.username); break;
        case 'email': cmp = a.email.localeCompare(b.email); break;
        case 'role': cmp = a.role.localeCompare(b.role); break;
        case 'status': cmp = a.status.localeCompare(b.status); break;
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });
    if (tab === 'pending') list = list.filter((x) => x.status === 'pending');
    if (tab === 'active') list = list.filter((x) => x.status === 'active');
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) => {
        if (searchField === 'email') return r.email.toLowerCase().includes(q);
        if (searchField === 'username') return r.username.toLowerCase().includes(q);
        return r.email.toLowerCase().includes(q) || r.username.toLowerCase().includes(q);
      });
    }
    return list;
  }, [items, tab, search, searchField, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const paged = visible.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  useEffect(() => { setPage(0); }, [tab, search, searchField]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 text-slate-600" />;
    return sortDir === 'asc'
      ? <ArrowUp className="h-3 w-3 text-[#18B13A]" />
      : <ArrowDown className="h-3 w-3 text-[#18B13A]" />;
  };

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'pending', label: isRTL ? 'قيد الانتظار' : 'Pending', count: items.filter(i => i.status === 'pending').length },
    { key: 'active', label: isRTL ? 'معتمد' : 'Approved', count: items.filter(i => i.status === 'active').length },
    { key: 'all', label: isRTL ? 'الكل' : 'All', count: items.length },
  ];

  const searchOpts = [
    { key: 'all' as const, label: isRTL ? 'الكل' : 'All' },
    { key: 'email' as const, label: isRTL ? 'البريد' : 'Email' },
    { key: 'username' as const, label: isRTL ? 'الاسم' : 'Username' },
  ];

  if (checking || !authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F17]">
        <div className="h-8 w-8 border-2 border-[#18B13A]/30 border-t-[#18B13A] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white">{isRTL ? 'إدارة المستخدمين' : 'User Management'}</h1>
            <p className="text-sm text-slate-500 mt-0.5">{isRTL ? 'إدارة واعتماد طلبات التسجيل' : 'Manage and approve registration requests'}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={fetchUsers} className="h-8 text-xs text-slate-500 hover:text-slate-300">
              <RefreshCw className="h-3.5 w-3.5 me-1" />
              {isRTL ? 'تحديث' : 'Refresh'}
            </Button>
            <Badge variant="outline" className="text-xs text-[#18B13A] border-[#18B13A]/20 bg-[#18B13A]/5 py-1.5">
              <Shield className="h-3 w-3 ms-1.5" />
              {isRTL ? 'مدير النظام' : 'Administrator'}
            </Badge>
          </div>
        </div>

        <Card className="glass-card border-white/5">
          <CardHeader className="pb-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1 bg-white/[0.04] rounded-xl p-1">
                {tabs.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={cn(
                      'relative px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap',
                      tab === t.key
                        ? 'bg-[#18B13A]/10 text-[#18B13A] shadow-sm'
                        : 'text-slate-500 hover:text-slate-300'
                    )}
                  >
                    {t.label}
                    <span className={cn('ms-1.5 text-[10px] px-1.5 py-0.5 rounded-full', tab === t.key ? 'bg-[#18B13A]/15' : 'bg-white/[0.06]')}>
                      {t.count}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-600" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={searchField === 'all' ? (isRTL ? 'بحث...' : 'Search...') : searchField === 'email' ? (isRTL ? 'بحث بالبريد...' : 'Search email...') : (isRTL ? 'بحث بالاسم...' : 'Search name...')}
                    className="h-9 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-slate-600 text-xs rounded-xl ps-9 pe-8 min-w-[160px]"
                  />
                </div>
                <div className="relative">
                  <Button variant="ghost" size="sm" onClick={() => setShowSearchOptions(!showSearchOptions)} className={cn('h-9 w-9 p-0 rounded-xl', showSearchOptions && 'bg-white/[0.06]')}>
                    <Filter className="h-4 w-4 text-slate-500" />
                  </Button>
                  {showSearchOptions && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowSearchOptions(false)} />
                      <div className={cn('absolute top-full mt-1.5 z-20 bg-[#1a1f2e] border border-white/10 rounded-xl p-1.5 shadow-xl min-w-[140px]', isRTL ? 'start-0' : 'end-0')}>
                        {searchOpts.map((opt) => (
                          <button
                            key={opt.key}
                            onClick={() => { setSearchField(opt.key); setShowSearchOptions(false); }}
                            className={cn('w-full text-start px-3 py-1.5 text-xs rounded-lg', searchField === opt.key ? 'bg-[#18B13A]/10 text-[#18B13A]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]')}
                          >
                            <Filter className="h-3 w-3 ms-1.5 inline" />
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-16">
                <div className="h-6 w-6 border-2 border-[#18B13A]/30 border-t-[#18B13A] rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-slate-500">{isRTL ? 'جاري التحميل...' : 'Loading...'}</p>
              </div>
            ) : visible.length === 0 ? (
              <div className="text-center py-16">
                <Database className="h-8 w-8 text-slate-700 mx-auto mb-3" />
                <p className="text-sm text-slate-500">
                  {search
                    ? (isRTL ? 'لا توجد نتائج' : 'No results')
                    : (isRTL ? 'لا توجد طلبات بعد' : 'No registration requests yet')}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {[
                          { field: 'username' as SortField, label: isRTL ? 'المستخدم' : 'User' },
                          { field: 'email' as SortField, label: isRTL ? 'البريد' : 'Email' },
                          { field: 'role' as SortField, label: isRTL ? 'الدور' : 'Role' },
                          { field: 'status' as SortField, label: isRTL ? 'الحالة' : 'Status' },
                        ].map(({ field, label }) => (
                          <TableHead key={field} className={cn('cursor-pointer select-none py-3 px-4 text-xs font-medium text-slate-500', isRTL ? 'text-end' : 'text-start')} onClick={() => toggleSort(field)}>
                            <span className="inline-flex items-center gap-1">
                              {label}
                              <SortIcon field={field} />
                            </span>
                          </TableHead>
                        ))}
                        <TableHead className={cn('py-3 px-4 text-xs font-medium text-slate-500')}>
                          {isRTL ? 'الإجراءات' : 'Actions'}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {paged.map((item) => (
                          <motion.tr
                            key={item.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="border-b border-white/[0.03] hover:bg-white/[0.02]"
                          >
                            <TableCell className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', item.role === 'admin' ? 'bg-[#18B13A]/10' : 'bg-blue-400/10')}>
                                  {item.role === 'admin' ? <UserCog className="h-4 w-4 text-[#18B13A]" /> : <UserIcon className="h-4 w-4 text-blue-400" />}
                                </div>
                                <span className="text-sm font-medium text-white">{item.username}</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-3 px-4"><span className="text-sm text-slate-400">{item.email}</span></TableCell>
                            <TableCell className="py-3 px-4">
                              <Badge variant="outline" className={cn('text-[10px]', item.role === 'admin' ? 'text-[#18B13A] border-[#18B13A]/20 bg-[#18B13A]/5' : 'text-blue-400 border-blue-500/20 bg-blue-500/5')}>
                                {item.role === 'admin' ? (isRTL ? 'مدير' : 'Admin') : (isRTL ? 'مستخدم' : 'User')}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-3 px-4">
                              {item.status === 'pending' ? (
                                <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/20 bg-amber-500/5">
                                  <Clock className="h-3 w-3 inline me-1" />
                                  {isRTL ? 'قيد الانتظار' : 'Pending'}
                                </Badge>
                              ) : item.status === 'active' ? (
                                <Badge variant="outline" className="text-[10px] text-[#18B13A] border-[#18B13A]/20 bg-[#18B13A]/5">
                                  <CheckCircle className="h-3 w-3 inline me-1" />
                                  {isRTL ? 'معتمد' : 'Approved'}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-[10px] text-red-400 border-red-500/20 bg-red-500/5">
                                  <XCircle className="h-3 w-3 inline me-1" />
                                  {isRTL ? 'مرفوض' : 'Rejected'}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="py-3 px-4">
                              {item.status === 'pending' ? (
                                <div className="flex items-center gap-1">
                                  <Button size="sm" onClick={() => approve(item.id)} className="h-7 text-[11px] bg-[#18B13A]/10 hover:bg-[#18B13A]/20 text-[#18B13A] border border-[#18B13A]/20 rounded-lg px-2">
                                    <CheckCircle className="h-3 w-3 me-0.5" />
                                    {isRTL ? 'اعتماد' : 'Approve'}
                                  </Button>
                                  {confirmAction?.type === 'reject' && confirmAction.id === item.id ? (
                                    <div className="flex items-center gap-1">
                                      <Button size="sm" onClick={() => reject(item.id)} className="h-7 text-[11px] bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg px-2">{isRTL ? 'تأكيد' : 'Confirm'}</Button>
                                      <Button size="sm" variant="ghost" onClick={() => setConfirmAction(null)} className="h-7 text-[11px] text-slate-500 rounded-lg px-2">{isRTL ? 'إلغاء' : 'Cancel'}</Button>
                                    </div>
                                  ) : (
                                    <Button size="sm" variant="ghost" onClick={() => setConfirmAction({ type: 'reject', id: item.id })} className="h-7 text-[11px] text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg px-2">
                                      <XCircle className="h-3 w-3 me-0.5" />
                                      {isRTL ? 'رفض' : 'Reject'}
                                    </Button>
                                  )}
                                </div>
                              ) : item.status === 'active' ? (
                                <div className="flex items-center gap-1">
                                  <Button size="sm" variant="ghost" onClick={() => openEdit(item)} className="h-7 text-[11px] text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg px-2">
                                    <Pencil className="h-3 w-3 me-0.5" />
                                    {isRTL ? 'تعديل' : 'Edit'}
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => openPassword(item)} className="h-7 text-[11px] text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg px-2">
                                    <Key className="h-3 w-3 me-0.5" />
                                    {isRTL ? 'كلمة المرور' : 'Password'}
                                  </Button>
                                  {confirmAction?.type === 'revoke' && confirmAction.id === item.id ? (
                                    <div className="flex items-center gap-1">
                                      <Button size="sm" onClick={() => reject(item.id)} className="h-7 text-[11px] bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg px-2">{isRTL ? 'تأكيد' : 'Confirm'}</Button>
                                      <Button size="sm" variant="ghost" onClick={() => setConfirmAction(null)} className="h-7 text-[11px] text-slate-500 rounded-lg px-2">{isRTL ? 'إلغاء' : 'Cancel'}</Button>
                                    </div>
                                  ) : (
                                    <Button size="sm" variant="ghost" onClick={() => setConfirmAction({ type: 'revoke', id: item.id })} className="h-7 text-[11px] text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg">
                                      {isRTL ? 'إلغاء الاعتماد' : 'Revoke'}
                                    </Button>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[11px] text-slate-600">-</span>
                              )}
                            </TableCell>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06]">
                    <span className="text-xs text-slate-600">
                      {isRTL
                        ? `${safePage * PAGE_SIZE + 1}-${Math.min((safePage + 1) * PAGE_SIZE, visible.length)} من ${visible.length}`
                        : `${safePage * PAGE_SIZE + 1}-${Math.min((safePage + 1) * PAGE_SIZE, visible.length)} of ${visible.length}`}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" disabled={safePage <= 0} onClick={() => setPage(safePage - 1)} className="h-8 w-8 p-0 rounded-lg text-slate-500 disabled:text-slate-700">
                        <ChevronLeft className={cn('h-4 w-4', isRTL && 'rotate-180')} />
                      </Button>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <Button key={i} variant="ghost" size="sm" onClick={() => setPage(i)} className={cn('h-8 w-8 p-0 rounded-lg text-xs', i === safePage ? 'bg-[#18B13A]/10 text-[#18B13A]' : 'text-slate-500')}>{i + 1}</Button>
                      ))}
                      <Button variant="ghost" size="sm" disabled={safePage >= totalPages - 1} onClick={() => setPage(safePage + 1)} className="h-8 w-8 p-0 rounded-lg text-slate-500 disabled:text-slate-700">
                        <ChevronRight className={cn('h-4 w-4', isRTL && 'rotate-180')} />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!editUser} onOpenChange={(open) => { if (!open) setEditUser(null); }}>
        <DialogContent className="bg-[#111827] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">{isRTL ? 'تعديل المستخدم' : 'Edit User'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs text-slate-400">{isRTL ? 'اسم المستخدم' : 'Username'}</Label>
              <Input value={editForm.username} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} className="h-10 bg-white/[0.04] border-white/[0.08] text-white rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-slate-400">{isRTL ? 'البريد الإلكتروني' : 'Email'}</Label>
              <Input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="h-10 bg-white/[0.04] border-white/[0.08] text-white rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-slate-400">{isRTL ? 'الدور' : 'Role'}</Label>
              <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} className="h-10 w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-xl px-3 text-sm focus:outline-none focus:border-[#18B13A]/40">
                <option value="user" className="bg-[#1a1f2e]">{isRTL ? 'مستخدم' : 'User'}</option>
                <option value="admin" className="bg-[#1a1f2e]">{isRTL ? 'مدير' : 'Admin'}</option>
              </select>
            </div>
            {editError && <p className="text-xs text-red-400">{editError}</p>}
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setEditUser(null)} className="text-slate-400 hover:text-white">{isRTL ? 'إلغاء' : 'Cancel'}</Button>
            <Button size="sm" onClick={saveEdit} disabled={editSaving} className="bg-[#18B13A] hover:bg-[#15803D] text-white">
              {editSaving ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (isRTL ? 'حفظ' : 'Save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!pwUser} onOpenChange={(open) => { if (!open) setPwUser(null); }}>
        <DialogContent className="bg-[#111827] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">{isRTL ? 'تغيير كلمة المرور' : 'Change Password'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-xs text-slate-500">{isRTL ? `المستخدم: ${pwUser?.username}` : `User: ${pwUser?.username}`}</p>
            <div className="space-y-2">
              <Label className="text-xs text-slate-400">{isRTL ? 'كلمة المرور الجديدة' : 'New Password'}</Label>
              <Input type="password" value={newPassword} onChange={(e) => { setNewPassword(e.target.value); setPwError(''); setPwSuccess(''); }} placeholder={isRTL ? 'أدخل كلمة المرور الجديدة' : 'Enter new password'} className="h-10 bg-white/[0.04] border-white/[0.08] text-white rounded-xl" />
            </div>
            {pwError && <p className="text-xs text-red-400">{pwError}</p>}
            {pwSuccess && <p className="text-xs text-[#18B13A]">{pwSuccess}</p>}
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setPwUser(null)} className="text-slate-400 hover:text-white">{isRTL ? 'إلغاء' : 'Cancel'}</Button>
            <Button size="sm" onClick={savePassword} disabled={pwSaving} className="bg-amber-600 hover:bg-amber-700 text-white">
              {pwSaving ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (isRTL ? 'تحديث' : 'Update')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
