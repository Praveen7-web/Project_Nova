import { create } from 'zustand';
import type { ChallengeConfig, DomainEntity } from '../types';
import { challengeConfig, challengeEntities as initialChallengeEntities, demoEntities as initialDemoEntities } from '../config/challengeConfig';
import { deriveStatus, validateThresholds } from '../services/ai';

interface AppState {
  config: ChallengeConfig;
  mode: 'challenge' | 'demo';
  challengeEntities: DomainEntity[];
  demoEntities: DomainEntity[];
  activeEntityId: string;
  setMode: (mode: 'challenge' | 'demo') => void;
  setActiveEntityId: (id: string) => void;
  updateEntityMetric: (id: string, newMetric: number) => void;
  updateConfig: (newConfig: ChallengeConfig) => void;
}

export const useStore = create<AppState>((set, get) => ({
  config: challengeConfig,
  mode: 'challenge',
  challengeEntities: initialChallengeEntities,
  demoEntities: initialDemoEntities,
  activeEntityId: initialChallengeEntities[0].id,

  setMode: (newMode) => {
    const { challengeEntities, demoEntities, activeEntityId } = get();
    const targetDataset = newMode === 'challenge' ? challengeEntities : demoEntities;
    const exists = targetDataset.some(e => e.id === activeEntityId);
    set({
      mode: newMode,
      activeEntityId: exists ? activeEntityId : targetDataset[0]?.id || ''
    });
  },

  setActiveEntityId: (id) => set({ activeEntityId: id }),

  updateEntityMetric: (id, newMetric) => {
    const { config } = get();
    const updateDataset = (entities: DomainEntity[]) =>
      entities.map(e => {
        if (e.id !== id) return e;
        const updatedHistorical = [
          ...e.historicalData,
          { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), value: newMetric }
        ];
        return {
          ...e,
          primaryMetric: newMetric,
          status: deriveStatus(newMetric, config),
          historicalData: updatedHistorical
        };
      });

    set(state => ({
      challengeEntities: updateDataset(state.challengeEntities),
      demoEntities: updateDataset(state.demoEntities)
    }));
  },

  updateConfig: (newConfig) => {
    validateThresholds(newConfig);
    set(state => ({
      config: newConfig,
      challengeEntities: state.challengeEntities.map(e => ({
        ...e,
        status: deriveStatus(e.primaryMetric, newConfig)
      })),
      demoEntities: state.demoEntities.map(e => ({
        ...e,
        status: deriveStatus(e.primaryMetric, newConfig)
      }))
    }));
  }
}));
