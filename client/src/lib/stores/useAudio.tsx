import { create } from "zustand";

interface AudioState {
  backgroundMusic: HTMLAudioElement | null;
  hitSound: HTMLAudioElement | null;
  successSound: HTMLAudioElement | null;
  isMuted: boolean;
  audioPool: HTMLAudioElement[];
  poolSize: number;
  
  // Setter functions
  setBackgroundMusic: (music: HTMLAudioElement) => void;
  setHitSound: (sound: HTMLAudioElement) => void;
  setSuccessSound: (sound: HTMLAudioElement) => void;
  
  // Control functions
  toggleMute: () => void;
  playHit: () => void;
  playSuccess: () => void;
  cleanup: () => void;
}

export const useAudio = create<AudioState>((set, get) => ({
  backgroundMusic: null,
  hitSound: null,
  successSound: null,
  isMuted: true, // Start muted by default
  audioPool: [],
  poolSize: 5, // Limit audio pool to 5 instances
  
  setBackgroundMusic: (music) => set({ backgroundMusic: music }),
  setHitSound: (sound) => set({ hitSound: sound }),
  setSuccessSound: (sound) => set({ successSound: sound }),
  
  toggleMute: () => {
    const { isMuted } = get();
    const newMutedState = !isMuted;
    
    // Just update the muted state
    set({ isMuted: newMutedState });
    
    // Remove console.log for production
  },
  
  playHit: () => {
    const { hitSound, isMuted, audioPool, poolSize } = get();
    if (hitSound && !isMuted) {
      // Find available audio from pool or create new one
      let availableAudio = audioPool.find(audio => audio.paused || audio.ended);
      
      if (!availableAudio && audioPool.length < poolSize) {
        availableAudio = hitSound.cloneNode() as HTMLAudioElement;
        audioPool.push(availableAudio);
        set({ audioPool: [...audioPool] }); // Update state with new pool
      }
      
      if (availableAudio) {
        availableAudio.currentTime = 0;
        availableAudio.volume = 0.3;
        availableAudio.play().catch(() => {
          // Silently handle play errors in production
        });
      }
    }
  },
  
  playSuccess: () => {
    const { successSound, isMuted } = get();
    if (successSound && !isMuted) {
      successSound.currentTime = 0;
      successSound.play().catch(() => {
        // Silently handle play errors in production
      });
    }
  },
  
  cleanup: () => {
    const { audioPool } = get();
    audioPool.forEach(audio => {
      audio.pause();
      audio.src = '';
      audio.load();
    });
    set({ audioPool: [] });
  }
}));
