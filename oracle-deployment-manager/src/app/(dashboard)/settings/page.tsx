'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Save,
  Bell,
  Palette,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { t, locale, setLocale, isRTL } = useLocale();
  const [notifications, setNotifications] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="us-page-bg min-h-screen">
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">{t('settings.title')}</h1>
        <p className="text-slate-500">{t('settings.subtitle')}</p>
      </div>

      <Card className="bg-[#111827] border-white/[0.06]">
        <CardHeader>
           <CardTitle className={cn('flex items-center gap-2 text-sm text-white', isRTL && 'flex-row-reverse')}>
             <Palette className="h-4 w-4 text-[#18B13A]" /> {t('settings.appearance')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-slate-300">{t('settings.darkMode')}</Label>
              <p className="text-xs text-slate-500">{t('settings.darkModeDesc')}</p>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            />
          </div>
          <Separator className="bg-white/[0.06]" />
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-slate-300">{t('settings.language')}</Label>
              <p className="text-xs text-slate-500">{t('settings.languageDesc')}</p>
            </div>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as any)}
              className="flex h-9 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-sm text-slate-300"
            >
              <option value="ar">العربية</option>
              <option value="en">English</option>
              <option value="fr">Francais</option>
              <option value="de">Deutsch</option>
              <option value="es">Espanol</option>
              <option value="tr">Turkce</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#111827] border-white/[0.06]">
        <CardHeader>
           <CardTitle className={cn('flex items-center gap-2 text-sm text-white', isRTL && 'flex-row-reverse')}>
             <Bell className="h-4 w-4 text-[#38BDF8]" /> {t('settings.notifications')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-slate-300">{t('settings.enableNotifications')}</Label>
              <p className="text-xs text-slate-500">{t('settings.enableNotificationsDesc')}</p>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>
          <Separator className="bg-white/[0.06]" />
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-slate-300">{t('settings.autoBackup')}</Label>
              <p className="text-xs text-slate-500">{t('settings.autoBackupDesc')}</p>
            </div>
            <Switch checked={autoBackup} onCheckedChange={setAutoBackup} />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#111827] border-white/[0.06]">
        <CardHeader>
           <CardTitle className={cn('flex items-center gap-2 text-sm text-white', isRTL && 'flex-row-reverse')}>
             <Shield className="h-4 w-4 text-[#FF9800]" /> {t('settings.security')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-slate-300">{t('settings.currentRole')}</Label>
              <p className="text-xs text-slate-500">{t('settings.yourAccessLevel')}</p>
            </div>
            <Badge className="bg-[#18B13A]/10 text-[#4ADE80] border-[#18B13A]/20">Admin</Badge>
          </div>
          <Separator className="bg-white/[0.06]" />
          <div className="space-y-2">
            <Label className="text-slate-300">{t('settings.changePassword')}</Label>
            <Input type="password" placeholder={t('settings.newPassword')} className="max-w-sm bg-white/[0.04] border-white/[0.08] text-white placeholder:text-slate-600 rounded-xl" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-gradient-to-r from-[#18B13A] to-[#15803D] hover:from-[#15803D] hover:to-[#14702F] text-white rounded-xl shadow-lg shadow-[#18B13A]/20">
           <Save className={cn('h-4 w-4', isRTL ? 'ms-2' : 'me-2')} />
          {saved ? t('settings.saved') : t('settings.saveSettings')}
        </Button>
      </div>
    </div>
    </div>
  );
}
