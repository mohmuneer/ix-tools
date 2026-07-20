'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Palette,
  Upload,
  Type,
  Paintbrush,
  RotateCcw,
  Save,
  Eye,
  EyeOff,
  Building2,
  Monitor,
  Check,
  Image,
  Loader2,
} from 'lucide-react';
import {
  useBrandingStore,
  THEME_PRESETS,
  FONT_PRESETS,
  type BrandingColors,
  type BrandingConfig,
} from '@/stores/branding-store';
import { useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/utils';

const COLOR_FIELDS: { key: keyof BrandingColors; label: string; labelAr: string }[] = [
  { key: 'primary', label: 'Primary', labelAr: 'الأساسي' },
  { key: 'secondary', label: 'Secondary', labelAr: 'الثانوي' },
  { key: 'success', label: 'Success', labelAr: 'النجاح' },
  { key: 'warning', label: 'Warning', labelAr: 'التحذير' },
  { key: 'danger', label: 'Danger', labelAr: 'الخطأ' },
  { key: 'sidebarActive', label: 'Sidebar Active', labelAr: 'القائمة الجانبية' },
  { key: 'background', label: 'Background', labelAr: 'الخلفية' },
  { key: 'surface', label: 'Surface', labelAr: 'الترويسة' },
];

export function BrandingSettings() {
  const { config, setConfig, applyColors, saveBranding, resetBranding, uploadLogo } = useBrandingStore();
  const { t, isRTL } = useLocale();
  const [local, setLocal] = useState<BrandingConfig>(() => JSON.parse(JSON.stringify(config)));
  const [previewActive, setPreviewActive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocal(JSON.parse(JSON.stringify(config)));
  }, [config.updatedAt]);

  const updateLocal = useCallback((path: string, value: any) => {
    setLocal((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let obj: any = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  }, []);

  const handlePreview = () => {
    if (previewActive) {
      applyColors(config.colors);
      document.documentElement.style.setProperty('--brand-font', config.font.family);
      document.documentElement.style.setProperty('--brand-font-size', config.font.size);
      document.documentElement.style.setProperty('--brand-radius', config.font.borderRadius);
      setPreviewActive(false);
    } else {
      applyColors(local.colors);
      document.documentElement.style.setProperty('--brand-font', local.font.family);
      document.documentElement.style.setProperty('--brand-font-size', local.font.size);
      document.documentElement.style.setProperty('--brand-radius', local.font.borderRadius);
      setPreviewActive(true);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setConfig(local);
    const ok = await saveBranding();
    setSaving(false);
    if (ok) {
      setSaved(true);
      setPreviewActive(false);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleReset = async () => {
    setSaving(true);
    const ok = await resetBranding();
    setSaving(false);
    if (ok) {
      const fresh = useBrandingStore.getState().config;
      setLocal(JSON.parse(JSON.stringify(fresh)));
      setPreviewActive(false);
    }
  };

  const handleThemeSelect = (preset: typeof THEME_PRESETS[0]) => {
    updateLocal('theme', preset.id);
    updateLocal('colors', preset.colors);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadLogo(file);
    if (url) {
      updateLocal('logo.logoUrl', url);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const currentTheme = THEME_PRESETS.find((p) => p.id === local.theme);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* LEFT: Settings Form */}
      <div className="xl:col-span-2 space-y-5">

        {/* Theme Presets */}
        <Card className="bg-[#111827]/80 border-white/[0.06]">
          <CardHeader className="pb-3">
            <CardTitle className={cn('flex items-center gap-2 text-sm text-white', isRTL && 'flex-row-reverse')}>
              <Paintbrush className="h-4 w-4 text-[#18B13A]" />
              {t('branding.themes')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {THEME_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleThemeSelect(preset)}
                  className={cn(
                    'p-3 rounded-xl border text-start transition-all hover:scale-[1.02]',
                    local.theme === preset.id
                      ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/10 ring-1 ring-[var(--brand-primary)]/40'
                      : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'
                  )}
                >
                  <div className="flex gap-1 mb-2">
                    <div className="w-5 h-5 rounded-full border border-white/10" style={{ backgroundColor: preset.colors.primary }} />
                    <div className="w-5 h-5 rounded-full border border-white/10" style={{ backgroundColor: preset.colors.secondary }} />
                    <div className="w-5 h-5 rounded-full border border-white/10" style={{ backgroundColor: preset.colors.background }} />
                  </div>
                  <p className="text-xs font-medium text-white">{isRTL ? preset.nameAr : preset.name}</p>
                  {local.theme === preset.id && (
                    <Check className="h-3 w-3 text-[var(--brand-primary)] mt-1" />
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Color Scheme */}
        <Card className="bg-[#111827]/80 border-white/[0.06]">
          <CardHeader className="pb-3">
            <CardTitle className={cn('flex items-center gap-2 text-sm text-white', isRTL && 'flex-row-reverse')}>
              <Palette className="h-4 w-4 text-[#18B13A]" />
              {t('branding.colorScheme')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {COLOR_FIELDS.map(({ key, label, labelAr }) => (
                <div key={key} className="space-y-2">
                  <Label className="text-xs text-slate-400">{isRTL ? labelAr : label}</Label>
                  <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                    <input
                      type="color"
                      value={local.colors[key]}
                      onChange={(e) => updateLocal(`colors.${key}`, e.target.value)}
                      className="w-9 h-9 rounded-lg border border-white/10 cursor-pointer bg-transparent shrink-0"
                    />
                    <Input
                      value={local.colors[key]}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^#[0-9a-fA-F]{0,6}$/.test(val)) updateLocal(`colors.${key}`, val);
                      }}
                      onBlur={(e) => {
                        if (!/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
                          updateLocal(`colors.${key}`, local.colors[key]);
                        }
                      }}
                      className="h-9 text-xs font-mono bg-white/[0.04] border-white/[0.08] text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Typography */}
        <Card className="bg-[#111827]/80 border-white/[0.06]">
          <CardHeader className="pb-3">
            <CardTitle className={cn('flex items-center gap-2 text-sm text-white', isRTL && 'flex-row-reverse')}>
              <Type className="h-4 w-4 text-[#18B13A]" />
              {t('branding.typography')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-slate-400">{t('branding.fontFamily')}</Label>
                <select
                  value={local.font.family}
                  onChange={(e) => updateLocal('font.family', e.target.value)}
                  className="flex h-9 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-sm text-white"
                >
                  {FONT_PRESETS.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-slate-400">{t('branding.fontSize')}</Label>
                <Input
                  value={local.font.size}
                  onChange={(e) => updateLocal('font.size', e.target.value)}
                  className="h-9 bg-white/[0.04] border-white/[0.08] text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-slate-400">{t('branding.borderRadius')}</Label>
                <Input
                  value={local.font.borderRadius}
                  onChange={(e) => updateLocal('font.borderRadius', e.target.value)}
                  className="h-9 bg-white/[0.04] border-white/[0.08] text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company & Login */}
        <Card className="bg-[#111827]/80 border-white/[0.06]">
          <CardHeader className="pb-3">
            <CardTitle className={cn('flex items-center gap-2 text-sm text-white', isRTL && 'flex-row-reverse')}>
              <Building2 className="h-4 w-4 text-[#18B13A]" />
              {isRTL ? 'بيانات الشركة وتسجيل الدخول' : 'Company & Login'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-slate-400">{isRTL ? 'اسم النظام' : 'System Name'}</Label>
                <Input
                  value={local.logo.systemName}
                  onChange={(e) => updateLocal('logo.systemName', e.target.value)}
                  className="h-9 bg-white/[0.04] border-white/[0.08] text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-slate-400">{isRTL ? 'اسم الشركة' : 'Company Name'}</Label>
                <Input
                  value={local.logo.companyName}
                  onChange={(e) => updateLocal('logo.companyName', e.target.value)}
                  className="h-9 bg-white/[0.04] border-white/[0.08] text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-slate-400">{t('branding.loginTitle')}</Label>
                <Input
                  value={local.login.title}
                  onChange={(e) => updateLocal('login.title', e.target.value)}
                  className="h-9 bg-white/[0.04] border-white/[0.08] text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-slate-400">{t('branding.loginSubtitle')}</Label>
                <Input
                  value={local.login.subtitle}
                  onChange={(e) => updateLocal('login.subtitle', e.target.value)}
                  className="h-9 bg-white/[0.04] border-white/[0.08] text-white"
                />
              </div>
            </div>

            {/* Logo Upload */}
            <div className="space-y-2">
              <Label className="text-xs text-slate-400">{t('branding.mainLogo')}</Label>
              <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="border-white/[0.08] bg-white/[0.04] text-white hover:bg-white/[0.08]"
                >
                  {uploading ? (
                    <Loader2 className={cn('h-4 w-4 animate-spin', isRTL ? 'ms-2' : 'me-2')} />
                  ) : (
                    <Upload className={cn('h-4 w-4', isRTL ? 'ms-2' : 'me-2')} />
                  )}
                  {t('branding.uploadLogo')}
                </Button>
                {local.logo.logoUrl && (
                  <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                    <img src={local.logo.logoUrl} alt="Logo" className="h-8 w-8 object-contain rounded" />
                    <button
                      onClick={() => updateLocal('logo.logoUrl', null)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      {isRTL ? 'إزالة' : 'Remove'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={saving}
            className="border-white/[0.08] bg-white/[0.04] text-white hover:bg-white/[0.08]"
          >
            <RotateCcw className={cn('h-4 w-4', isRTL ? 'ms-2' : 'me-2')} />
            {t('branding.resetDefaults')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-[#18B13A] to-[#15803D] hover:from-[#15803D] hover:to-[#14702F] text-white"
          >
            {saving ? (
              <Loader2 className={cn('h-4 w-4 animate-spin', isRTL ? 'ms-2' : 'me-2')} />
            ) : saved ? (
              <Check className={cn('h-4 w-4', isRTL ? 'ms-2' : 'me-2')} />
            ) : (
              <Save className={cn('h-4 w-4', isRTL ? 'ms-2' : 'me-2')} />
            )}
            {saved ? (isRTL ? 'تم الحفظ' : 'Saved!') : t('branding.applyChanges')}
          </Button>
          <Button
            variant={previewActive ? 'default' : 'outline'}
            onClick={handlePreview}
            className={cn(
              previewActive
                ? 'bg-[var(--brand-primary)] text-white'
                : 'border-white/[0.08] bg-white/[0.04] text-white hover:bg-white/[0.08]'
            )}
          >
            {previewActive ? (
              <EyeOff className={cn('h-4 w-4', isRTL ? 'ms-2' : 'me-2')} />
            ) : (
              <Eye className={cn('h-4 w-4', isRTL ? 'ms-2' : 'me-2')} />
            )}
            {previewActive ? (isRTL ? 'إخفاء المعاينة' : 'Hide Preview') : t('branding.preview')}
          </Button>
        </div>
      </div>

      {/* RIGHT: Live Preview Panel */}
      <div className="xl:col-span-1">
        <div className="sticky top-20 space-y-4">
          <h3 className={cn('flex items-center gap-2 text-sm font-medium text-white', isRTL && 'flex-row-reverse')}>
            <Monitor className="h-4 w-4 text-[#18B13A]" />
            {isRTL ? 'معاينة حيّة' : 'Live Preview'}
          </h3>

          {/* Mini Preview Card */}
          <div
            className="rounded-2xl overflow-hidden border border-white/[0.06] shadow-xl"
            style={{ backgroundColor: local.colors.background }}
          >
            {/* Fake Sidebar */}
            <div
              className="h-8 flex items-center gap-2 px-3 border-b"
              style={{ backgroundColor: local.colors.surface, borderColor: 'rgba(255,255,255,0.06)' }}
            >
              <div className="w-4 h-4 rounded" style={{ backgroundColor: local.colors.primary }} />
              <span className="text-[10px] font-bold" style={{ color: 'white' }}>{local.logo.systemName}</span>
            </div>

            {/* Fake Sidebar Items */}
            <div className="flex">
              <div className="w-16 p-2 space-y-1.5" style={{ backgroundColor: local.colors.surface }}>
                {['item1', 'item2', 'item3'].map((_, i) => (
                    <div
                      key={i}
                      className="h-1.5 rounded-full"
                      style={{
                        backgroundColor: i === 0 ? local.colors.sidebarActive : 'rgba(255,255,255,0.08)',
                        width: i === 0 ? '80%' : '60%',
                        marginInlineStart: i === 0 ? 0 : 'auto',
                        marginInlineEnd: i === 0 ? 'auto' : 0,
                      }}
                    />
                ))}
              </div>

              {/* Fake Content */}
              <div className="flex-1 p-3 space-y-2">
                <div className="h-2 rounded-full bg-white/[0.06]" style={{ width: '50%' }} />
                <div className="h-1.5 rounded-full bg-white/[0.04]" style={{ width: '80%' }} />

                {/* Fake Stat Cards */}
                <div className="grid grid-cols-2 gap-1.5 mt-2">
                  {[
                    { color: local.colors.primary },
                    { color: local.colors.secondary },
                    { color: local.colors.success },
                    { color: local.colors.warning },
                  ].map((s, i) => (
                    <div
                      key={i}
                      className="p-1.5 rounded-lg border"
                      style={{ backgroundColor: local.colors.surface, borderColor: 'rgba(255,255,255,0.06)' }}
                    >
                      <div className="w-2 h-2 rounded-full mb-1" style={{ backgroundColor: s.color }} />
                      <div className="h-1 rounded-full bg-white/[0.06]" style={{ width: '60%' }} />
                    </div>
                  ))}
                </div>

                {/* Fake Button */}
                <div className="mt-2">
                  <div
                    className="h-4 rounded-lg w-1/2"
                    style={{ backgroundColor: local.colors.primary }}
                  />
                </div>
              </div>
            </div>

            {/* Fake Footer */}
            <div
              className="px-3 py-2 border-t flex items-center justify-between"
              style={{ backgroundColor: local.colors.surface, borderColor: 'rgba(255,255,255,0.06)' }}
            >
              <span className="text-[8px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{local.logo.companyName}</span>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: local.colors.success }} />
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: local.colors.warning }} />
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: local.colors.danger }} />
              </div>
            </div>
          </div>

          {/* Color Swatches */}
          <div className="rounded-xl border border-white/[0.06] bg-[#111827]/80 p-3">
            <p className="text-[10px] font-medium text-slate-500 mb-2 uppercase tracking-wider">
              {isRTL ? 'الألوان' : 'Colors'}
            </p>
            <div className="grid grid-cols-4 gap-2">
              {COLOR_FIELDS.map(({ key }) => (
                <div key={key} className="text-center">
                  <div
                    className="w-full aspect-square rounded-lg border border-white/10 mb-1"
                    style={{ backgroundColor: local.colors[key] }}
                  />
                  <span className="text-[8px] text-slate-600 block truncate">{local.colors[key]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Font Preview */}
          <div className="rounded-xl border border-white/[0.06] bg-[#111827]/80 p-3">
            <p className="text-[10px] font-medium text-slate-500 mb-2 uppercase tracking-wider">
              {isRTL ? 'الخط' : 'Font'}
            </p>
            <div
              className="rounded-lg bg-white/[0.03] p-2"
              style={{ fontFamily: local.font.family, fontSize: local.font.size }}
            >
              <p className="text-white font-bold text-sm">Onyx IX / أونيكس</p>
              <p className="text-slate-500 text-xs mt-0.5">System Requirements / المتطلبات</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
