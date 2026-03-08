"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const SOUND_URL = "/sounds/민쥬쓰코딩쏭.mp3";
const VOLUME = 0.3;
const STORAGE_KEY = "musicEnabled";

export function useMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const audio = new Audio(SOUND_URL);
    audio.loop = true;
    audio.volume = VOLUME;
    audio.preload = "auto";
    audioRef.current = audio;
    setReady(true);

    // 사용자가 명시적으로 정지한 적이 있으면 자동재생 안 함
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "false") return;

    // 자동 재생 시도
    audio
      .play()
      .then(() => {
        setPlaying(true);
        localStorage.setItem(STORAGE_KEY, "true");
      })
      .catch(() => {
        // 브라우저 정책으로 차단됨 — 사용자 인터랙션 대기
        setPlaying(false);
      });

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
      localStorage.setItem(STORAGE_KEY, "false");
    } else {
      audio.play().then(() => {
        setPlaying(true);
        localStorage.setItem(STORAGE_KEY, "true");
      });
    }
  }, [playing]);

  return { playing, toggle, ready };
}
