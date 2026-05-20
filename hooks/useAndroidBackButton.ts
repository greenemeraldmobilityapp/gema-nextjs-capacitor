"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";

export function useAndroidBackButton() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!Capacitor.isNativePlatform()) return;

    let removeListener: (() => void) | null = null;

    App.addListener("backButton", () => {
      if (window.history.length > 1) {
        router.back();
      } else {
        App.exitApp();
      }
    }).then((listener) => {
      removeListener = listener.remove;
    });

    return () => {
      removeListener?.();
    };
  }, [router]);
}
