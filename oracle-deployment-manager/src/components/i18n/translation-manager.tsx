'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Globe,
  Search,
  Save,
  Download,
  Upload,
  CheckCircle2,
  XCircle,
  Languages,
} from 'lucide-react';
import { useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/utils';
import { LOCALES, type Locale } from '@/lib/i18n';
import { useAppStore } from '@/stores/app-store';

interface TranslationEntry {
  key: string;
  value: string;
}

export function TranslationManager() {
  const { locale, translations, t, isRTL } = useLocale();
  const { addNotification } = useAppStore();
  const [selectedLang, setSelectedLang] = useState<Locale>('en');
  const [sourceLang, setSourceLang] = useState<Locale>('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [activeSection, setActiveSection] = useState('common');

  const sections = ['common', 'dashboard', 'fileManager', 'configManager', 'editor', 'deployment', 'profiles', 'templates', 'rollback', 'logs', 'settings', 'translations', 'branding', 'login'];

  const flattenObject = (obj: any, prefix = ''): TranslationEntry[] => {
    const entries: TranslationEntry[] = [];
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'object' && value !== null) {
        entries.push(...flattenObject(value, fullKey));
      } else {
        entries.push({ key: fullKey, value: String(value) });
      }
    }
    return entries;
  };

  const sourceTranslations = translations[sourceLang] || {};
  const targetTranslations = translations[selectedLang] || {};

  const allEntries = flattenObject(sourceTranslations);
  const filteredEntries = allEntries.filter(
    (e) =>
      e.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const translatedCount = filteredEntries.filter((e) => {
    const targetVal = getNestedValue(targetTranslations, e.key);
    return targetVal && targetVal !== e.key;
  }).length;

  const untranslatedCount = filteredEntries.length - translatedCount;
  const completionRate = filteredEntries.length > 0 ? Math.round((translatedCount / filteredEntries.length) * 100) : 0;

  function getNestedValue(obj: any, path: string): string | undefined {
    const keys = path.split('.');
    let current = obj;
    for (const key of keys) {
      if (current === null || current === undefined) return undefined;
      current = current[key];
    }
    return typeof current === 'string' ? current : undefined;
  }

  const handleSaveTranslation = (key: string) => {
    addNotification({ type: 'success', title: t('translations.translationSaved'), message: `${key} → ${selectedLang}` });
    setEditingKey(null);
  };

  const handleExport = () => {
    const data = JSON.stringify(targetTranslations, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedLang}-translations.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-semibold">{t('translations.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('translations.subtitle')}</p>
        </div>
         <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
           <Button variant="outline" size="sm" onClick={handleExport}>
             <Download className={cn('h-4 w-4', isRTL ? 'ms-1' : 'me-1')} /> {t('translations.exportTranslations')}
           </Button>
           <Button variant="outline" size="sm">
             <Upload className={cn('h-4 w-4', isRTL ? 'ms-1' : 'me-1')} /> {t('translations.importTranslations')}
          </Button>
        </div>
      </div>

       <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="py-3">
          <CardContent className={cn('flex items-center gap-2 px-4', isRTL && 'flex-row-reverse')}>
            <Languages className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-lg font-bold">{Object.keys(LOCALES).length}</p>
              <p className="text-xs text-muted-foreground">{t('translations.totalKeys')}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="py-3">
          <CardContent className={cn('flex items-center gap-2 px-4', isRTL && 'flex-row-reverse')}>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-lg font-bold text-green-500">{translatedCount}</p>
              <p className="text-xs text-muted-foreground">{t('translations.translated')}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="py-3">
          <CardContent className={cn('flex items-center gap-2 px-4', isRTL && 'flex-row-reverse')}>
            <XCircle className="h-4 w-4 text-red-500" />
            <div>
              <p className="text-lg font-bold text-red-500">{untranslatedCount}</p>
              <p className="text-xs text-muted-foreground">{t('translations.untranslated')}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="py-3">
          <CardContent className={cn('flex items-center gap-2 px-4', isRTL && 'flex-row-reverse')}>
            <Globe className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-lg font-bold text-blue-500">{completionRate}%</p>
              <p className="text-xs text-muted-foreground">{t('translations.completionRate')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

       <div className={cn('flex items-center gap-3 flex-wrap', isRTL && 'flex-row-reverse')}>
        <div className="space-y-1">
          <Label className="text-xs">Source Language</Label>
          <Select value={sourceLang} onValueChange={(v) => setSourceLang(v ?? 'en')}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(LOCALES) as Locale[]).map((code) => (
                <SelectItem key={code} value={code}>
                  {LOCALES[code].flag} {LOCALES[code].nativeName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Target Language</Label>
          <Select value={selectedLang} onValueChange={(v) => setSelectedLang(v ?? 'en')}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(LOCALES) as Locale[]).map((code) => (
                <SelectItem key={code} value={code}>
                  {LOCALES[code].flag} {LOCALES[code].nativeName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-[200px] space-y-1">
          <Label className="text-xs">{t('translations.searchTranslations')}</Label>
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('translations.searchTranslations')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ps-9"
            />
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-380px)]">
            <table className="w-full">
              <thead className="sticky top-0 bg-card border-b">
                <tr className="text-start text-xs font-medium text-muted-foreground">
                  <th className="p-3 w-1/3">{t('translations.key')}</th>
                  <th className="p-3 w-1/3">{t('translations.originalText')}</th>
                  <th className="p-3 w-1/3">{t('translations.translatedText')}</th>
                  <th className="p-3 w-20"></th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry) => {
                  const targetVal = getNestedValue(targetTranslations, entry.key) || '';
                  const isTranslated = targetVal && targetVal !== entry.key;
                  const isEditing = editingKey === entry.key;
                  return (
                    <tr key={entry.key} className="border-b hover:bg-accent/50">
                      <td className="p-3">
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{entry.key}</code>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">{entry.value}</td>
                      <td className="p-3">
                        {isEditing ? (
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="h-8 text-sm"
                            autoFocus
                          />
                        ) : (
                          <span className={`text-sm ${isTranslated ? '' : 'text-muted-foreground italic'}`}>
                            {targetVal || '(not translated)'}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {isEditing ? (
                          <Button size="sm" variant="ghost" onClick={() => handleSaveTranslation(entry.key)}>
                            <Save className="h-3 w-3" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingKey(entry.key);
                              setEditValue(targetVal || entry.value);
                            }}
                          >
                            <Globe className="h-3 w-3" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
