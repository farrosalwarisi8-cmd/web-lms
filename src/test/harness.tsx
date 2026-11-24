import { act, render } from "@testing-library/react";
import { vi } from "vitest";
import { DemoProvider, useDemo } from "@/context/demo-context";

type DemoApi = ReturnType<typeof useDemo>;

let current: DemoApi | null = null;

function Probe() {
  current = useDemo();
  return null;
}

export function demo(): DemoApi {
  if (!current) {
    throw new Error("DemoProvider belum dirender. Panggil setupDemo() terlebih dahulu.");
  }
  return current;
}

/** Render provider dan tunggu effect hidrasi selesai. */
export async function setupDemo() {
  const utils = render(
    <DemoProvider>
      <Probe />
    </DemoProvider>
  );
  await act(async () => {
    await Promise.resolve();
  });
  return utils;
}

/** Jalankan aksi sync (login, pilih anak, dsb.) di dalam act. */
export function actSync(fn: (api: DemoApi) => void) {
  act(() => {
    fn(demo());
  });
}

/**
 * Jalankan aksi async dengan memajukan fake timer melewati delay simulasi.
 * Delay aksi di DemoContext berkisar 300–700 ms.
 */
export async function runAction<T>(fn: (api: DemoApi) => Promise<T>): Promise<T> {
  let promise!: Promise<T>;
  await act(async () => {
    promise = fn(demo());
    await vi.advanceTimersByTimeAsync(1200);
  });
  await act(async () => {
    await promise;
  });
  return promise;
}

export function flushToast() {
  act(() => {
    vi.advanceTimersByTime(3500);
  });
}
