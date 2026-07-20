'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, XCircle, Shield, UserCog, Users,
  Mail, User as UserIcon, Clock, Search, ToggleRight,
  ArrowUpDown, ArrowUp, ArrowDown, Filter, ChevronLeft, ChevronRight,
  SlidersHorizontal, X
} from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table';
import { useLocale } from '@/hooks/use-locale';
import { useAuthStore, loadAuthFromStorage } from '@/stores/auth-store';
import { useRegistrationStore, type RegistrationRequest } from '@/stores/registration-store';
import { cn } from '@/lib/utils';

type Tab = 'all' | 'pending' | 'approved';
type SortField = 'username' | 'email' | 'role' | 'status';
type SortDir = 'asc' | 'desc';
type SearchField = 'all' | 'email' | 'username';

type Row = {
  id: string;
  email: string;
  username: string;
  role: string;
  status: 'pending' | 'approved';
  createdAt: number;
};

const PAGE_SIZE = 10;

export default function AdminUsersPage() {
  const router = useRouter();
  const { isRTL, formatDate } = useLocale();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<Tab>('pending');
  const [search, setSearch] = useState('');
  const [searchField, setSearchField] = useState<SearchField>('all');
  const [showSearchOptions, setShowSearchOptions] = useState(false);
  const [sortField, setSortField] = useState<SortField>('status');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(0);
  const [confirmAction, setConfirmAction] = useState<{ type: 'reject' | 'remove'; id: string } | null>(null);

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

  const rows: Row[] = useMemo(() => {
    const pending: Row[] = pendingRequests.map((r) => ({
      id: r.id,
      email: r.email,
      username: r.username,
      role: r.requestedRole,
      status: 'pending' as const,
      createdAt: r.createdAt,
    }));
    const approved: Row[] = approvedUsers.map((u) => ({
      id: u.email,
      email: u.email,
      username: u.username,
      role: u.role,
      status: 'approved' as const,
      createdAt: 0,
    }));
    return [...pending, ...approved];
  }, [pendingRequests, approvedUsers]);

  const sorted = useMemo(() => {
    const list = [...rows];
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
    return list;
  }, [rows, sortField, sortDir]);

  const filtered = useMemo(() => {
    let list = sorted;
    if (tab === 'pending') list = list.filter((r) => r.status === 'pending');
    if (tab === 'approved') list = list.filter((r) => r.status === 'approved');
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) => {
        if (searchField === 'email') return r.email.toLowerCase().includes(q);
        if (searchField === 'username') return r.username.toLowerCase().includes(q);
        return r.email.toLowerCase().includes(q) || r.username.toLowerCase().includes(q);
      });
    }
    return list;
  }, [sorted, tab, search, searchField]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const paged = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  useEffect(() => { setPage(0); }, [tab, search, searchField]);

  const toggleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }, [sortField]);

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'pending', label: isRTL ? 'قيد الانتظار' : 'Pending', count: pendingRequests.length },
    { key: 'approved', label: isRTL ? 'معتمد' : 'Approved', count: approvedUsers.length },
    { key: 'all', label: isRTL ? 'الكل' : 'All', count: rows.length },
  ];

  const searchOptions: { key: SearchField; label: string }[] = [
    { key: 'all', label: isRTL ? 'الكل' : 'All' },
    { key: 'email', label: isRTL ? 'البريد' : 'Email' },
    { key: 'username', label: isRTL ? 'الاسم' : 'Username' },
  ];

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 text-slate-600" />;
    return sortDir === 'asc'
      ? <ArrowUp className="h-3 w-3 text-[#18B13A]" />
      : <ArrowDown className="h-3 w-3 text-[#18B13A]" />;
  };

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
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white">
              {isRTL ? 'إدارة المستخدمين' : 'User Management'}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {isRTL ? 'إدارة واعتماد طلبات التسجيل' : 'Manage and approve registration requests'}
            </p>
          </div>
          <Badge variant="outline" className="text-xs text-[#18B13A] border-[#18B13A]/20 bg-[#18B13A]/5 py-1.5">
            <Shield className="h-3 w-3 ms-1.5" />
            {isRTL ? 'مدير النظام' : 'Administrator'}
          </Badge>
        </div>

        {/* Tabs + Search Bar */}
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
                    <span className={cn(
                      'ms-1.5 text-[10px] px-1.5 py-0.5 rounded-full',
                      tab === t.key ? 'bg-[#18B13A]/15 text-[#18B13A]' : 'bg-white/[0.06] text-slate-500'
                    )}>
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
                    placeholder={
                      searchField === 'all'
                        ? (isRTL ? 'بحث...' : 'Search...')
                        : searchField === 'email'
                          ? (isRTL ? 'بحث بالبريد...' : 'Search email...')
                          : (isRTL ? 'بحث بالاسم...' : 'Search name...')
                    }
                    className="h-9 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-slate-600 text-xs rounded-xl ps-9 pe-8 min-w-[180px]"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute end-2 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSearchOptions(!showSearchOptions)}
                    className={cn(
                      'h-9 w-9 p-0 rounded-xl',
                      showSearchOptions && 'bg-white/[0.06]'
                    )}
                  >
                    <SlidersHorizontal className="h-4 w-4 text-slate-500" />
                  </Button>
                  {showSearchOptions && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowSearchOptions(false)} />
                      <div className={cn(
                        'absolute top-full mt-1 z-20 bg-[#1a1f2e] border border-white/[0.08] rounded-xl p-1.5 shadow-xl min-w-[140px]',
                        isRTL ? 'start-0' : 'end-0'
                      )}>
                        {searchOptions.map((opt) => (
                          <button
                            key={opt.key}
                            onClick={() => { setSearchField(opt.key); setShowSearchOptions(false); }}
                            className={cn(
                              'w-full text-start px-3 py-1.5 text-xs rounded-lg transition-colors',
                              searchField === opt.key
                                ? 'bg-[#18B13A]/10 text-[#18B13A]'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                            )}
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

          <CardContent className="p-0 mt-3">
            {filtered.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-8 w-8 text-slate-700 mx-auto mb-3" />
                <p className="text-sm text-slate-500">
                  {search
                    ? (isRTL ? 'لا توجد نتائج للبحث' : 'No results found')
                    : (isRTL ? 'لا يوجد مستخدمون' : 'No users')
                  }
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead
                          className={cn(
                            'cursor-pointer select-none py-3 px-4 text-xs font-medium text-slate-500',
                            isRTL ? 'text-end' : 'text-start'
                          )}
                          onClick={() => toggleSort('username')}
                        >
                          <span className="inline-flex items-center gap-1.5">
                            {isRTL ? 'المستخدم' : 'User'}
                            <SortIcon field="username" />
                          </span>
                        </TableHead>
                        <TableHead
                          className={cn(
                            'cursor-pointer select-none py-3 px-4 text-xs font-medium text-slate-500',
                            isRTL ? 'text-end' : 'text-start'
                          )}
                          onClick={() => toggleSort('email')}
                        >
                          <span className="inline-flex items-center gap-1.5">
                            {isRTL ? 'البريد الإلكتروني' : 'Email'}
                            <SortIcon field="email" />
                          </span>
                        </TableHead>
                        <TableHead
                          className={cn(
                            'cursor-pointer select-none py-3 px-4 text-xs font-medium text-slate-500',
                            isRTL ? 'text-end' : 'text-start'
                          )}
                          onClick={() => toggleSort('role')}
                        >
                          <span className="inline-flex items-center gap-1.5">
                            {isRTL ? 'الدور' : 'Role'}
                            <SortIcon field="role" />
                          </span>
                        </TableHead>
                        <TableHead
                          className={cn(
                            'cursor-pointer select-none py-3 px-4 text-xs font-medium text-slate-500',
                            isRTL ? 'text-end' : 'text-start'
                          )}
                          onClick={() => toggleSort('status')}
                        >
                          <span className="inline-flex items-center gap-1.5">
                            {isRTL ? 'الحالة' : 'Status'}
                            <SortIcon field="status" />
                          </span>
                        </TableHead>
                        <TableHead className={cn(
                          'py-3 px-4 text-xs font-medium text-slate-500',
                          isRTL ? 'text-end' : 'text-start'
                        )}>
                          {isRTL ? 'الاعتماد' : 'Approval'}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence mode="popLayout">
                        {paged.map((row) => (
                          <motion.tr
                            key={row.id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.15 }}
                            className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                          >
                            <TableCell className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className={cn(
                                  'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                                  row.role === 'admin' ? 'bg-[#18B13A]/10' : 'bg-blue-500/10'
                                )}>
                                  {row.role === 'admin'
                                    ? <UserCog className="h-4 w-4 text-[#18B13A]" />
                                    : <UserIcon className="h-4 w-4 text-blue-400" />
                                  }
                                </div>
                                <span className="text-sm font-medium text-white">{row.username}</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-3 px-4">
                              <span className="text-sm text-slate-400">{row.email}</span>
                            </TableCell>
                            <TableCell className="py-3 px-4">
                              <Badge variant="outline" className={cn(
                                'text-[10px]',
                                row.role === 'admin'
                                  ? 'text-[#18B13A] border-[#18B13A]/20 bg-[#18B13A]/5'
                                  : 'text-blue-400 border-blue-500/20 bg-blue-500/5'
                              )}>
                                {row.role === 'admin'
                                  ? (isRTL ? 'مدير' : 'Admin')
                                  : (isRTL ? 'مستخدم' : 'User')
                                }
                              </Badge>
                            </TableCell>
                            <TableCell className="py-3 px-4">
                              {row.status === 'pending' ? (
                                <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/20 bg-amber-500/5">
                                  <Clock className="h-3 w-3 ms-1" />
                                  {isRTL ? 'قيد الانتظار' : 'Pending'}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-[10px] text-[#18B13A] border-[#18B13A]/20 bg-[#18B13A]/5">
                                  <CheckCircle className="h-3 w-3 ms-1" />
                                  {isRTL ? 'معتمد' : 'Approved'}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="py-3 px-4">
                              {row.status === 'pending' ? (
                                <div className="flex items-center gap-1.5">
                                  <Button
                                    size="sm"
                                    onClick={() => approveRequest(row.id)}
                                    className="h-7 text-[11px] bg-[#18B13A]/10 hover:bg-[#18B13A]/20 text-[#18B13A] border border-[#18B13A]/20 rounded-lg px-2.5"
                                  >
                                    <CheckCircle className="h-3 w-3 ms-1" />
                                    {isRTL ? 'اعتماد' : 'Approve'}
                                  </Button>
                                  {confirmAction?.type === 'reject' && confirmAction.id === row.id ? (
                                    <div className="flex items-center gap-1">
                                      <Button
                                        size="sm"
                                        onClick={() => { rejectRequest(row.id); setConfirmAction(null); }}
                                        className="h-7 text-[11px] bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg px-2"
                                      >
                                        {isRTL ? 'تأكيد' : 'Yes'}
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setConfirmAction(null)}
                                        className="h-7 text-[11px] text-slate-500 rounded-lg px-2"
                                      >
                                        {isRTL ? 'إلغاء' : 'No'}
                                      </Button>
                                    </div>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setConfirmAction({ type: 'reject', id: row.id })}
                                      className="h-7 text-[11px] text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg px-2"
                                    >
                                      <XCircle className="h-3 w-3 ms-1" />
                                      {isRTL ? 'رفض' : 'Reject'}
                                    </Button>
                                  )}
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  {confirmAction?.type === 'remove' && confirmAction.id === row.id ? (
                                    <div className="flex items-center gap-1">
                                      <Button
                                        size="sm"
                                        onClick={() => { removeUser(row.id); setConfirmAction(null); }}
                                        className="h-7 text-[11px] bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg px-2"
                                      >
                                        {isRTL ? 'تأكيد' : 'Yes'}
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setConfirmAction(null)}
                                        className="h-7 text-[11px] text-slate-500 rounded-lg px-2"
                                      >
                                        {isRTL ? 'إلغاء' : 'No'}
                                      </Button>
                                    </div>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setConfirmAction({ type: 'remove', id: row.id })}
                                      className="h-7 text-[11px] text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"
                                    >
                                      <ToggleRight className="h-4 w-4 ms-1" />
                                      {isRTL ? 'إلغاء الاعتماد' : 'Revoke'}
                                    </Button>
                                  )}
                                </div>
                              )}
                            </TableCell>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className={cn(
                    'flex items-center justify-between px-4 py-3 border-t border-white/[0.06]',
                    isRTL && 'flex-row-reverse'
                  )}>
                    <p className="text-xs text-slate-600">
                      {isRTL
                        ? `${safePage * PAGE_SIZE + 1}-${Math.min((safePage + 1) * PAGE_SIZE, filtered.length)} من ${filtered.length}`
                        : `${safePage * PAGE_SIZE + 1}-${Math.min((safePage + 1) * PAGE_SIZE, filtered.length)} of ${filtered.length}`
                      }
                    </p>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={safePage === 0}
                        onClick={() => setPage(safePage - 1)}
                        className="h-8 w-8 p-0 rounded-lg text-slate-500 disabled:text-slate-700"
                      >
                        <ChevronRight className={cn('h-4 w-4', isRTL && 'rotate-180')} />
                      </Button>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <Button
                          key={i}
                          variant="ghost"
                          size="sm"
                          onClick={() => setPage(i)}
                          className={cn(
                            'h-8 w-8 p-0 rounded-lg text-xs',
                            i === safePage
                              ? 'bg-[#18B13A]/10 text-[#18B13A]'
                              : 'text-slate-500 hover:text-slate-300'
                          )}
                        >
                          {i + 1}
                        </Button>
                      ))}
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={safePage >= totalPages - 1}
                        onClick={() => setPage(safePage + 1)}
                        className="h-8 w-8 p-0 rounded-lg text-slate-500 disabled:text-slate-700"
                      >
                        <ChevronLeft className={cn('h-4 w-4', isRTL && 'rotate-180')} />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
