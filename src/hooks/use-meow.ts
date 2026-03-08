"use client";

import { useCallback, useRef } from "react";

const SOUND_URL = "/sounds/meowsound.wav";
const VOLUME = 0.35;
const COOLDOWN_MS = 200; // prevent overlapping sounds

let audioPool: HTMLAudioElement[] = [];
let poolReady = false;

function ensurePool() {
  if (poolReady) return;
  poolReady = true;
  // Pre-create 3 audio elements for pool
  for (let i = 0; i < 3; i++) {
    const audio = new Audio(SOUND_URL);
    audio.volume = VOLUME;
    audio.preload = "auto";
    audioPool.push(audio);
  }
}

export function playMeow() {
  ensurePool();

  // Find an idle audio element or use the first one
  const idle = audioPool.find((a) => a.paused || a.ended);
  const audio = idle ?? audioPool[0];

  audio.currentTime = 0;
  audio.volume = VOLUME;
  audio.play().catch(() => {
    // Silently fail if autoplay blocked
  });
}

export function useMeow() {
  const lastPlayRef = useRef(0);

  const meow = useCallback(() => {
    const now = Date.now();
    if (now - lastPlayRef.current < COOLDOWN_MS) return;
    lastPlayRef.current = now;
    playMeow();
  }, []);

  return meow;
}
