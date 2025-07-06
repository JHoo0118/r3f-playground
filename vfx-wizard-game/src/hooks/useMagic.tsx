import { Vector3 } from "three";
import {
  randFloat,
  randFloatSpread,
  randInt,
} from "three/src/math/MathUtils.js";
import { create } from "zustand";

export const spells = [
  {
    name: "void",
    emoji: "🪄",
    duration: 1000,
    colors: ["#d1beff", "white"],
  },
  {
    name: "ice",
    emoji: "❄️",
    duration: 500,
    colors: ["skyblue", "white"],
  },
  {
    name: "fire",
    emoji: "🔥",
    duration: 500,
    colors: ["orange", "red"],
  },
];

const generateOrc = (idx: number) => ({
  id: `orc-${idx}`, // Unique ID
  health: 100,
  position: new Vector3(randFloatSpread(-2), 0, randFloat(-15, -20)), // Randomized position
  speed: randFloat(1, 3),
  animation: "CharacterArmature|Walk",
  lastAttack: 0,
  lockedUntil: 0,
});

type Orc = {
  id: string;
  health: number;
  position: Vector3;
  speed: number;
  animation: string;
  lastAttack: number;
  lockedUntil: number;
};

type MagicState = {
  orcs: Orc[];
  isCasting: boolean;
  spell: (typeof spells)[number];
  spells: {
    id: string;
    time: number;
    name: string;
    position: Vector3;
  }[];
  gameStatus: "idle" | "playing" | "gameover";
  kills: number;
  health: number;
  lastSpawn: number;
  setSpell: (spell: (typeof spells)[number]) => void;
  addSpell: (spell: (typeof spells)[number] & { position: Vector3 }) => void;
  start: () => void;
  update: (delta: number) => void;
};

export const useMagic = create<MagicState>((set, get) => {
  let castingTimeout: ReturnType<typeof setTimeout> | null = null;
  return {
    isCasting: false,
    spell: spells[0],
    setSpell: (spell: (typeof spells)[number]) => {
      set(() => ({
        spell,
      }));
    },
    spells: [],
    addSpell: (spell: (typeof spells)[number] & { position: Vector3 }) => {
      set((state) => {
        return {
          isCasting: true,
          spells: [
            ...state.spells,
            {
              id: `${Date.now()}-${randInt(0, 100)}-${state.spells.length}`,
              name: spell.name,
              position: spell.position,
              time: Date.now(),
            },
          ],
        };
      });

      // Handle collision with orcs
      setTimeout(() => {
        get().orcs.forEach((orc: Orc) => {
          if (orc.position.distanceTo(spell.position) < 1 && orc.health > 0) {
            orc.health -= 40;
            orc.animation = "CharacterArmature|HitReact";
            orc.lockedUntil = Date.now() + 800;
            if (orc.health <= 0) {
              set((state) => ({
                kills: state.kills + 1,
              }));
              orc.animation = "CharacterArmature|Death";
              orc.health = 0;
              setTimeout(() => {
                orc.position.z = randFloat(-10, -20);
                orc.health = 100;
                orc.animation = "CharacterArmature|Walk";
              }, 1000);
            }
          }
        });
      }, spell.duration);

      // Cleaning spells
      setTimeout(() => {
        set((state) => ({
          spells: state.spells.filter(
            (spell) => Date.now() - spell.time < 4000
          ),
        }));
      }, spell.duration + 4000);

      // Stop casting
      castingTimeout = setTimeout(() => {
        set(() => ({
          isCasting: false,
        }));
      }, spell.duration);
    },
    gameStatus: "idle",
    kills: 0,
    health: 100,
    orcs: [],
    lastSpawn: 0,
    start: () => {
      set((state: MagicState) => ({
        orcs: [],
        gameStatus: "playing",
        health: 100,
        kills: 0,
        spells: [],
        isCasting: false,
      }));
    },
    update: (delta: number) => {
      if (get().gameStatus !== "playing") {
        return;
      }
      if (get().health <= 0) {
        set(() => ({
          gameStatus: "gameover",
          orcs: [],
        }));
        return;
      }
      if (get().lastSpawn < Date.now() - 5000 && get().orcs.length < 50) {
        set((state: MagicState) => ({
          orcs: [...state.orcs, generateOrc(state.orcs.length)],
          lastSpawn: Date.now(),
        }));
      }
      get().orcs.forEach((orc: Orc) => {
        if (orc.health <= 0) {
          return;
        }
        if (orc.lockedUntil > Date.now()) {
          return;
        } else {
          orc.animation = "CharacterArmature|Walk";
        }
        if (orc.position.z < 4) {
          orc.position.z += delta * orc.speed;
          orc.lastAttack = Date.now(); // Hack to prevent attacking as soon as they reach the wizard
        } else {
          orc.animation = "CharacterArmature|Weapon";
          if (orc.lastAttack < Date.now() - 1000) {
            orc.lastAttack = Date.now();
            set((state) => ({
              health: state.health - 10,
            }));
          }
        }
      });
    },
  };
});
