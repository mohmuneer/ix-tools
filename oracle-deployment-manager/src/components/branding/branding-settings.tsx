'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Palette,
  Upload,
  Type,
  Paintbrush,
  RotateCcw,
  Save,
  Eye,
} from 'lucide-react';
import { useBrandingStore } from '@/stores/branding-store';
import { useAppStore } from '@/stores/app-store';
import { useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/utils';

const FONT_OPTIONS = [
  { value: 'Inter, system-ui, sans-serif', label: 'Inter' },
  { value: 'Roboto, system-ui, sans-serif', label: 'Roboto' },
  { value: 'Open Sans, system-ui, sans-serif', label: 'Open Sans' },
  { value: 'IBM Plex Sans Arabic, Cairo, Tajawal, system-ui, sans-serif', label: 'Arabic (IBM Plex)' },
  { value: 'Cairo, Tajawal, system-ui, sans-serif', label: 'Arabic (Cairo)' },
];

const THEME_PRESETS = [
  { id: 'ultimate', name: 'Ultimate Default', primary: '#16a34a', secondary: '#2563eb' },
  { id: 'corporate', name: 'Corporate Blue', primary: '#2563eb', secondary: '#0891b2' },
  { id: 'green', name: 'Green Professional', primary: '#059669', secondary: '#6366f1' },
  { id: 'dark', name: 'Dark Theme', primary: '#22c55e', secondary: '#3b82f6' },
  { id: 'light', name: 'Light Theme', primary: '#16a34a', secondary: '#2563eb' },
];

export function BrandingSettings() {
  const { config, setConfig } = useBrandingStore();
  const { addNotification } = useAppStore();
  const { t, isRTL } = useLocale();
  const [localConfig, setLocalConfig] = useState({ ...config });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleColorChange = (key: string, value: string) => {
    setLocalConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setConfig(localConfig);
    addNotification({ type: 'success', title: t('branding.changesSaved'), message: t('branding.changesSaved') });
  };

  const handleReset = () => {
    setLocalConfig({ ...config });
  };

  const applyTheme = (theme: typeof THEME_PRESETS[0]) => {
    setLocalConfig((prev) => ({
      ...prev,
      theme: theme.id,
      primaryColor: theme.primary,
      secondaryColor: theme.secondary,
    }));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Color Scheme */}
      <Card>
        <CardHeader>
           <CardTitle className={cn('flex items-center gap-2 text-sm', isRTL && 'flex-row-reverse')}>
             <Palette className="h-4 w-4" /> {t('branding.colorScheme')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { key: 'primaryColor', label: t('branding.primaryColor') },
              { key: 'secondaryColor', label: t('branding.secondaryColor') },
              { key: 'successColor', label: t('branding.successColor') },
              { key: 'warningColor', label: t('branding.warningColor') },
              { key: 'errorColor', label: t('branding.errorColor') },
              { key: 'backgroundColor', label: t('branding.background') },
              { key: 'headerColor', label: t('branding.headerColor') },
              { key: 'sidebarColor', label: t('branding.sidebarColor') },
            ].map(({ key, label }) => (
              <div key={key} className="space-y-2">
                <Label className="text-xs">{label}</Label>
                 <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                  <input
                    type="color"
                    value={(localConfig as any)[key]}
                    onChange={(e) => handleColorChange(key, e.target.value)}
                    className="w-8 h-8 rounded border cursor-pointer"
                  />
                  <Input
                    value={(localConfig as any)[key]}
                    onChange={(e) => handleColorChange(key, e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card>
        <CardHeader>
           <CardTitle className={cn('flex items-center gap-2 text-sm', isRTL && 'flex-row-reverse')}>
             <Type className="h-4 w-4" /> {t('branding.typography')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">{t('branding.fontFamily')}</Label>
              <select
                value={localConfig.fontFamily}
                onChange={(e) => setLocalConfig((p) => ({ ...p, fontFamily: e.target.value }))}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                {FONT_OPTIONS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">{t('branding.fontSize')}</Label>
              <Input
                value={localConfig.fontSize}
                onChange={(e) => setLocalConfig((p) => ({ ...p, fontSize: e.target.value }))}
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">{t('branding.borderRadius')}</Label>
              <Input
                value={localConfig.borderRadius}
                onChange={(e) => setLocalConfig((p) => ({ ...p, borderRadius: e.target.value }))}
                className="h-9"
              />
            </div>
          </div>
          <div className="p-4 border rounded-lg" style={{ fontFamily: localConfig.fontFamily, fontSize: localConfig.fontSize, borderRadius: localConfig.borderRadius }}>
            <p className="font-bold text-lg">Preview Text / نص المعاينة</p>
            <p className="text-muted-foreground">This is how your text will appear. هذا كيف سيظهر النص.</p>
          </div>
        </CardContent>
      </Card>

      {/* Themes */}
      <Card>
        <CardHeader>
           <CardTitle className={cn('flex items-center gap-2 text-sm', isRTL && 'flex-row-reverse')}>
             <Paintbrush className="h-4 w-4" /> {t('branding.themes')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {THEME_PRESETS.map((theme) => (
              <div
                key={theme.id}
                className={`p-3 border rounded-lg cursor-pointer transition-all hover:ring-2 hover:ring-primary ${
                  localConfig.theme === theme.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => applyTheme(theme)}
              >
                <div className="flex gap-1 mb-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.primary }} />
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.secondary }} />
                </div>
                <p className="text-xs font-medium">{theme.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Company Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{t('branding.logoManagement')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">System Name</Label>
              <Input
                value={localConfig.systemName}
                onChange={(e) => setLocalConfig((p) => ({ ...p, systemName: e.target.value }))}
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Company Name</Label>
              <Input
                value={localConfig.companyName}
                onChange={(e) => setLocalConfig((p) => ({ ...p, companyName: e.target.value }))}
                className="h-9"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">{t('branding.loginTitle')}</Label>
              <Input
                value={localConfig.loginTitle}
                onChange={(e) => setLocalConfig((p) => ({ ...p, loginTitle: e.target.value }))}
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">{t('branding.loginSubtitle')}</Label>
              <Input
                value={localConfig.loginSubtitle}
                onChange={(e) => setLocalConfig((p) => ({ ...p, loginSubtitle: e.target.value }))}
                className="h-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleReset}>
           <RotateCcw className={cn('h-4 w-4', isRTL ? 'ms-2' : 'me-2')} /> {t('branding.resetDefaults')}
        </Button>
        <Button onClick={handleSave}>
           <Save className={cn('h-4 w-4', isRTL ? 'ms-2' : 'me-2')} /> {t('branding.applyChanges')}
        </Button>
      </div>
    </div>
  );
}
