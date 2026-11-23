"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const SOUND_URL = "/sounds/민쥬쓰코딩쏭.mp3";
const VOLUME = 0.3;
const STORAGE_KEY = "musicEnabled";

function savePreference(enabled: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, String(enabled));
  } catch {
    // Playback still works when browser storage is unavailable.
  }
}

export function useMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const audio = new Audio(SOUND_URL);
    audio.loop = true;
    audio.volume = VOLUME;
    audio.preload = "none";
    audioRef.current = audio;
    setReady(true);

    const syncPlaying = () => setPlaying(!audio.paused);
    const onError = () => setPlaying(false);
    audio.addEventListener("play", syncPlaying);
    audio.addEventListener("pause", syncPlaying);
    audio.addEventListener("error", onError);

    let shouldPlay = false;
    try {
      shouldPlay = localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      // Default to silence if no preference can be read.
    }
    if (shouldPlay) void audio.play().catch(() => {});

    return () => {
      audio.removeEventListener("play", syncPlaying);
      audio.removeEventListener("pause", syncPlaying);
      audio.removeEventListener("error", onError);
      audio.pause();
      audio.src = "";
      if (audioRef.current === audio) audioRef.current = null;
    };
  }, []);

  const toggle = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audio.paused) {
      audio.pause();
      savePreference(false);
      return;
    }

    try {
      await audio.play();
      savePreference(true);
    } catch {
      if (audioRef.current === audio) setPlaying(false);
    }
  }, []);

  return { playing, toggle, ready };
}
