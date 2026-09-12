import { lazy, Suspense, useEffect, useState } from "react";
import { playIntro } from "@/lib/experience/camera";
import { isMobileViewport } from "@/lib/experience/quality";
import { useExperienceStore } from "@/lib/experience/store";
import { BottomBar, HoverTip, MobileMenu, StoryRail, TopBar } from "./chrome";
import { LoadingScreen } from "./loading-screen";
import { AzStatus, MetricsHud } from "./metrics";
import { MotionTrackingHud } from "./motion-tracker";
import {
  AboutPanel,
  ArchitectureDrawer,
  ComponentPanel,
  HelpPanel,
  StoryCaption,
  TitleOverlay,
  TransactionConsole,
} from "./panels";

const CanvasRoot = lazy(() => import("@/components/experience/canvas-root"));

export function AppShell() {
  const [mounted, setMounted] = useState(false);
  const phase = useExperienceStore((s) => s.phase);

  useEffect(() => {
    setMounted(true);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const store = useExperienceStore.getState();
    if (reduced) store.setReducedMotion(true);
    if (isMobileViewport()) store.setPerformanceMode(true);
    const currentTheme = store.theme;
    document.documentElement.setAttribute("data-theme", currentTheme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", currentTheme === "light" ? "#f6f8fb" : "#05070c");
  }, []);

  useEffect(() => {
    if (phase !== "intro") return;
    const reduced = useExperienceStore.getState().reducedMotion;
    playIntro(reduced, () => {
      useExperienceStore.getState().setPhase("title");
    });
  }, [phase]);

  useEffect(() => {
    if (phase !== "title") return;
    const reduced = useExperienceStore.getState().reducedMotion;
    const t = window.setTimeout(
      () => {
        const s = useExperienceStore.getState();
        if (s.phase !== "title") return;
        s.setPhase("ready");
        s.setUiRevealed(true);
        s.setExplore(true);
      },
      reduced ? 400 : 2800,
    );
    return () => window.clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = useExperienceStore.getState();
      if (e.key === "Escape") {
        s.select(null);
        s.setHelpOpen(false);
        s.setMobileMenu(false);
        if (s.nav === "about") s.setNav("explore");
        return;
      }
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space") {
        e.preventDefault();
        if (s.simMode === "payment" || s.simMode === "trace") {
          s.toggleSimPaused();
        } else {
          s.setSim("payment");
        }
      }
      if (e.key === "l" || e.key === "L") s.toggleTheme();
      if (e.key === "m" || e.key === "M") s.toggleMotionTracking();
      if (e.key === "[" || e.key === "{") {
        const speeds = [0.25, 0.5, 1, 2, 4];
        const idx = speeds.indexOf(s.simSpeed);
        if (idx > 0) s.setSimSpeed(speeds[idx - 1]);
      }
      if (e.key === "]" || e.key === "}") {
        const speeds = [0.25, 0.5, 1, 2, 4];
        const idx = speeds.indexOf(s.simSpeed);
        if (idx < speeds.length - 1) s.setSimSpeed(speeds[idx + 1]);
      }
      if (e.key === "h" || e.key === "H") s.setSim("high-traffic");
      if (e.key === "f" || e.key === "F") s.setSim("failure");
      if (e.key === "t" || e.key === "T") s.setSim("trace");
      if (e.key === "c" || e.key === "C") s.toggleCost();
      if (e.key === "p" || e.key === "P") s.togglePerf();
      if (e.key === "r" || e.key === "R") s.resetView();
      if (e.key === "?") s.setHelpOpen(!s.helpOpen);
      if (e.key === "ArrowDown") s.advanceStory(1);
      if (e.key === "ArrowUp") s.advanceStory(-1);
      const viewMap: Record<string, Parameters<typeof s.setView>[0]> = {
        "1": "overview",
        "2": "payment",
        "3": "security",
        "4": "data",
        "5": "observability",
        "6": "ha",
      };
      if (viewMap[e.key]) s.setView(viewMap[e.key]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    let acc = 0;
    const onWheel = (e: WheelEvent) => {
      const s = useExperienceStore.getState();
      if (!s.uiRevealed) return;
      if (s.exploreEnabled && s.storyIndex === 0) return;
      if (s.exploreEnabled && s.nav !== "architecture") return;
      const t = e.target as HTMLElement | null;
      if (t?.closest?.(".hit") && t.closest("aside")) return;
      acc += e.deltaY;
      if (Math.abs(acc) < 90) return;
      const dir = acc > 0 ? 1 : -1;
      acc = 0;
      s.advanceStory(dir);
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-bg text-fg">
      <h1 className="sr-only">UPI on AWS — If UPI Were Built Entirely on AWS</h1>
      {mounted ? (
        <Suspense fallback={null}>
          <CanvasRoot />
        </Suspense>
      ) : (
        <div className="absolute inset-0 bg-bg" />
      )}
      <div className="overlay-root absolute inset-0 z-10">
        <LoadingScreen />
        <TitleOverlay />
        <TopBar />
        <MobileMenu />
        <StoryRail />
        <MetricsHud />
        <AzStatus />
        <HoverTip />
        <MotionTrackingHud />
        <ComponentPanel />
        <AboutPanel />
        <ArchitectureDrawer />
        <TransactionConsole />
        <HelpPanel />
        <StoryCaption />
        <BottomBar />
      </div>
    </main>
  );
}
