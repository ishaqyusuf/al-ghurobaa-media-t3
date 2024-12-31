import { create } from "zustand";

import { BlogPost } from "~/app/components/type";

export const useAudioStore = create((set) => ({
  blog: null as BlogPost["audio"], // Holds the current audio details
  isPlaying: false, // Playback state
  isLoading: false, // Playback state
  sound: null, // Audio.Sound instance
  currentTime: null,
  duration: null,
  seekPosition: null,
  progressPercentage: null,
  uri: null,
  size: null,
  toggleBlog: (blog) =>
    set((state) => {
      if (state.sound && state.blog.id == blog.id) {
        // pause
        // state.sound.pauseAsync();
        return {
          ...state,
        };
      }
      state.sound?.unloadAsync(); // Unload previous sound
      return {
        blog,
        sound: null,
        isFooterPlaying: false,
        seekPosition: null,
      };
    }),
  setIsFooterPlaying: (isPlaying) => set({ isPlaying: isPlaying }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setSound: (sound) =>
    set({
      sound,
      currentTime: null,
      progressPercentage: null,
      duration: null,
      uri: null,
      size: null,
    }),
  setData: (data) =>
    set((state) => ({
      ...state,
      ...data,
    })),
}));
