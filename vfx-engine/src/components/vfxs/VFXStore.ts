import { create } from "zustand";

type EmitterFunction = (count: number, setup: () => void) => void;

interface VFXState {
  emitters: Record<string, EmitterFunction>;
  registerEmitter: (name: string, emitter: EmitterFunction) => void;
  unregisterEmitter: (name: string) => void;
  emit: (name: string, count: number, setup: () => void) => void;
}

export const useVFX = create<VFXState>((set, get) => ({
  emitters: {},
  registerEmitter: (name: string, emitter: EmitterFunction) => {
    if (get().emitters[name]) {
      console.warn(`Emitter ${name} already exists`);
      return;
    }
    set((state) => {
      state.emitters[name] = emitter;
      return state;
    });
  },
  unregisterEmitter: (name: string) => {
    set((state) => {
      delete state.emitters[name];
      return state;
    });
  },
  emit: (name: string, count: number, setup: () => any) => {
    const emitter = get().emitters[name];
    if (!emitter) {
      console.warn(`Emitter ${name} not found`);
      return;
    }
    emitter(count, setup);
  },
}));
