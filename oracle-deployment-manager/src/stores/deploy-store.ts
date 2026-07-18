import { create } from 'zustand';
import type { DeployJob, DeployStep, DeployProfile } from '@/types';

interface DeployState {
  currentJob: DeployJob | null;
  jobs: DeployJob[];
  profiles: DeployProfile[];
  isDeploying: boolean;
  setCurrentJob: (job: DeployJob | null) => void;
  addJob: (job: DeployJob) => void;
  updateJob: (id: string, updates: Partial<DeployJob>) => void;
  updateStep: (jobId: string, stepId: string, updates: Partial<DeployStep>) => void;
  setProfiles: (profiles: DeployProfile[]) => void;
  addProfile: (profile: DeployProfile) => void;
  updateProfile: (id: string, updates: Partial<DeployProfile>) => void;
  deleteProfile: (id: string) => void;
  setIsDeploying: (v: boolean) => void;
}

export const useDeployStore = create<DeployState>((set) => ({
  currentJob: null,
  jobs: [],
  profiles: [],
  isDeploying: false,
  setCurrentJob: (job) => set({ currentJob: job }),
  addJob: (job) => set((state) => ({ jobs: [job, ...state.jobs] })),
  updateJob: (id, updates) =>
    set((state) => ({
      jobs: state.jobs.map((j) => (j.id === id ? { ...j, ...updates } : j)),
      currentJob:
        state.currentJob?.id === id
          ? { ...state.currentJob, ...updates }
          : state.currentJob,
    })),
  updateStep: (jobId, stepId, updates) =>
    set((state) => {
      const updateSteps = (steps: DeployStep[]) =>
        steps.map((s) => (s.id === stepId ? { ...s, ...updates } : s));
      const jobs = state.jobs.map((j) =>
        j.id === jobId ? { ...j, steps: updateSteps(j.steps) } : j
      );
      const currentJob =
        state.currentJob?.id === jobId
          ? { ...state.currentJob, steps: updateSteps(state.currentJob.steps) }
          : state.currentJob;
      return { jobs, currentJob };
    }),
  setProfiles: (profiles) => set({ profiles }),
  addProfile: (profile) =>
    set((state) => ({ profiles: [...state.profiles, profile] })),
  updateProfile: (id, updates) =>
    set((state) => ({
      profiles: state.profiles.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),
  deleteProfile: (id) =>
    set((state) => ({
      profiles: state.profiles.filter((p) => p.id !== id),
    })),
  setIsDeploying: (v) => set({ isDeploying: v }),
}));
