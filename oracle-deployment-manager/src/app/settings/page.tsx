'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
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
    <AppLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
          <p className="text-muted-foreground">{t('settings.subtitle')}</p>
        </div>

        <Card>
          <CardHeader>
             <CardTitle className={cn('flex items-center gap-2 text-sm', isRTL && 'flex-row-reverse')}>
               <Palette className="h-4 w-4" /> {t('settings.appearance')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>{t('settings.darkMode')}</Label>
                <p className="text-xs text-muted-foreground">{t('settings.darkModeDesc')}</p>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>{t('settings.language')}</Label>
                <p className="text-xs text-muted-foreground">{t('settings.languageDesc')}</p>
              </div>
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value as any)}
                className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                <option value="ar">🇸🇦 العربية</option>
                <option value="en">🇺🇸 English</option>
                <option value="fr">🇫🇷 Français</option>
                <option value="de">🇩🇪 Deutsch</option>
                <option value="es">🇪🇸 Español</option>
                <option value="tr">🇹🇷 Türkçe</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
             <CardTitle className={cn('flex items-center gap-2 text-sm', isRTL && 'flex-row-reverse')}>
               <Bell className="h-4 w-4" /> {t('settings.notifications')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>{t('settings.enableNotifications')}</Label>
                <p className="text-xs text-muted-foreground">{t('settings.enableNotificationsDesc')}</p>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>{t('settings.autoBackup')}</Label>
                <p className="text-xs text-muted-foreground">{t('settings.autoBackupDesc')}</p>
              </div>
              <Switch checked={autoBackup} onCheckedChange={setAutoBackup} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
             <CardTitle className={cn('flex items-center gap-2 text-sm', isRTL && 'flex-row-reverse')}>
               <Shield className="h-4 w-4" /> {t('settings.security')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>{t('settings.currentRole')}</Label>
                <p className="text-xs text-muted-foreground">{t('settings.yourAccessLevel')}</p>
              </div>
              <Badge>Admin</Badge>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>{t('settings.changePassword')}</Label>
              <Input type="password" placeholder={t('settings.newPassword')} className="max-w-sm" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave}>
             <Save className={cn('h-4 w-4', isRTL ? 'ms-2' : 'me-2')} />
            {saved ? t('settings.saved') : t('settings.saveSettings')}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
