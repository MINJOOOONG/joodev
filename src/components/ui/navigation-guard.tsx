"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useRef, type ComponentProps } from "react";

const LEAVE_MESSAGE = "저장하지 않은 변경사항이 있습니다. 저장하지 않고 이동할까요?";
const NavigationGuardContext = createContext<{
  register: (blocker: () => boolean) => () => void;
  confirmLeave: () => boolean;
}>({
  register: (_blocker: () => boolean): (() => void) => () => {},
  confirmLeave: () => true,
});

export function NavigationGuardProvider({ children }: { children: React.ReactNode }) {
  const blockerRef = useRef<() => boolean>(() => false);
  const register = useCallback((blocker: () => boolean) => {
    blockerRef.current = blocker;
    return () => {
      if (blockerRef.current === blocker) blockerRef.current = () => false;
    };
  }, []);
  const confirmLeave = useCallback(
    () => !blockerRef.current() || window.confirm(LEAVE_MESSAGE), []
  );

  return (
    <NavigationGuardContext.Provider value={{ register, confirmLeave }}>
      {children}
    </NavigationGuardContext.Provider>
  );
}

export function useNavigationGuard(blocked: boolean) {
  const { register } = useContext(NavigationGuardContext);
  const blockedRef = useRef(blocked);
  blockedRef.current = blocked;

  useEffect(() => register(() => blockedRef.current), [register]);
  useEffect(() => {
    if (!blocked) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [blocked]);
}

export function useConfirmNavigation() {
  return useContext(NavigationGuardContext).confirmLeave;
}

export function GuardedLink({ onNavigate, ...props }: ComponentProps<typeof Link>) {
  const confirmLeave = useConfirmNavigation();
  return <Link {...props} onNavigate={(event) => {
    onNavigate?.(event);
    if (!confirmLeave()) event.preventDefault();
  }} />;
}
