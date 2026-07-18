'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  UserCircle2,
  Plus,
  Pencil,
  Trash2,
  Rocket,
  Calendar,
} from 'lucide-react';
import { useDeployStore } from '@/stores/deploy-store';
import { useAppStore } from '@/stores/app-store';
import { useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/utils';
import { DEPLOY_VARIABLES } from '@/lib/constants';
import type { DeployProfile } from '@/types';
import { useRouter } from 'next/navigation';

export function ProfileManager() {
  const { profiles, setProfiles, addProfile, updateProfile, deleteProfile } = useDeployStore();
  const { addNotification } = useAppStore();
  const { t, isRTL } = useLocale();
  const router = useRouter();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<DeployProfile | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [settings, setSettings] = useState<Record<string, string>>({});

  const loadProfiles = useCallback(async () => {
    try {
      const res = await fetch('/api/profiles');
      const data = await res.json();
      setProfiles(data.profiles || []);
    } catch {}
  }, [setProfiles]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const openNewDialog = () => {
    setEditingProfile(null);
    setName('');
    setDescription('');
    setCustomerName('');
    setSettings({});
    setDialogOpen(true);
  };

  const openEditDialog = (profile: DeployProfile) => {
    setEditingProfile(profile);
    setName(profile.name);
    setDescription(profile.description);
    setCustomerName(profile.customerName);
    setSettings({ ...profile.settings });
    setDialogDialog(true);
  };

  const setDialogDialog = (open: boolean) => setDialogOpen(open);

  const handleSave = async () => {
    const profileData = {
      name,
      description,
      customerName,
      settings,
      ...(editingProfile ? { id: editingProfile.id } : {}),
    };

    try {
      const res = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: editingProfile ? 'update' : 'create',
          ...profileData,
        }),
      });
      const data = await res.json();

      if (editingProfile) {
        updateProfile(editingProfile.id, { ...profileData, updatedAt: new Date().toISOString() } as any);
      } else {
        addProfile({
          ...profileData,
          id: data.id || crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as DeployProfile);
      }

      addNotification({
        type: 'success',
        title: editingProfile ? 'Profile Updated' : 'Profile Created',
        message: `"${name}" has been ${editingProfile ? 'updated' : 'created'} successfully`,
      });

      setDialogOpen(false);
      loadProfiles();
    } catch {
      addNotification({ type: 'error', title: 'Error', message: 'Failed to save profile' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id }),
      });
      deleteProfile(id);
      setDeleteConfirm(null);
      addNotification({ type: 'success', title: 'Deleted', message: 'Profile deleted' });
    } catch {
      addNotification({ type: 'error', title: 'Error', message: 'Failed to delete profile' });
    }
  };

  const handleDeploy = (profileId: string) => {
    router.push('/deployment');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Installation Profiles</h2>
          <p className="text-sm text-muted-foreground">Manage deployment profiles for each customer</p>
        </div>
        <Button onClick={openNewDialog}>
           <Plus className={cn('h-4 w-4', isRTL ? 'ms-2' : 'me-2')} /> New Profile
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {profiles.map((profile) => (
          <Card key={profile.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                  <UserCircle2 className="h-5 w-5 text-orange-500" />
                  <CardTitle className="text-sm">{profile.name}</CardTitle>
                </div>
                <Badge variant="outline">{profile.customerName}</Badge>
              </div>
              <CardDescription className="text-xs">{profile.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                {DEPLOY_VARIABLES.slice(0, 6).map((v) => (
                  <div key={v.key}>
                    <span className="text-muted-foreground">{v.label}:</span>
                    <span className="ms-1 font-mono">
                      {(profile.settings as any)[v.key] || '-'}
                    </span>
                  </div>
                ))}
              </div>
              <div className={cn('flex items-center gap-1 text-xs text-muted-foreground', isRTL && 'flex-row-reverse')}>
                <Calendar className="h-3 w-3" />
                {new Date(profile.createdAt).toLocaleDateString()}
              </div>
              <div className={cn('flex gap-2', isRTL && 'flex-row-reverse')}>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => handleDeploy(profile.id)}
                >
                   <Rocket className={cn('h-3 w-3', isRTL ? 'ms-1' : 'me-1')} /> Deploy
                </Button>
                <Button size="sm" variant="outline" onClick={() => openEditDialog(profile)}>
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive"
                  onClick={() => setDeleteConfirm(profile.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {profiles.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <UserCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No profiles yet</p>
              <Button onClick={openNewDialog}>
                 <Plus className={cn('h-4 w-4', isRTL ? 'ms-2' : 'me-2')} /> Create First Profile
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProfile ? 'Edit Profile' : 'New Profile'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Profile Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Customer A" />
              </div>
              <div className="space-y-2">
                <Label>Customer Name</Label>
                <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Company Name" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
            </div>
            <Separator />
            <h4 className="text-sm font-medium">Deployment Settings</h4>
            <div className="grid grid-cols-2 gap-3">
              {DEPLOY_VARIABLES.map((v) => (
                <div key={v.key} className="space-y-1">
                  <Label className="text-xs">{v.label}</Label>
                  <Input
                    value={settings[v.key] || ''}
                    onChange={(e) => setSettings((prev) => ({ ...prev, [v.key]: e.target.value }))}
                    placeholder={v.placeholder}
                    className="h-8 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!name}>{editingProfile ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Profile</DialogTitle>
          </DialogHeader>
          <p className="py-4 text-muted-foreground">Are you sure you want to delete this profile? This cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
