import { JSDOM } from "jsdom";

// A DOM simulation for component tests; no browser or network resource loading.
const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "https://joodev.test/admin/posts/fixture/edit",
  pretendToBeVisual: true,
});
for (const key of ["window", "document", "navigator", "HTMLElement", "Element", "Node", "MutationObserver", "DOMParser", "getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame"] as const) {
  Object.defineProperty(globalThis, key, { configurable: true, writable: true, value: dom.window[key] });
}
Object.defineProperty(globalThis, "self", { configurable: true, value: dom.window });
Object.defineProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT", { configurable: true, writable: true, value: true });
Object.defineProperty(dom.window, "matchMedia", { value: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }) });
Object.defineProperty(globalThis, "confirm", { configurable: true, value: (message: string) => window.confirm(message) });
