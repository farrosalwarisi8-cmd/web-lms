import { beforeEach, describe, expect, it } from "vitest";
import { actSync, demo, runAction, setupDemo } from "@/test/harness";

describe("DemoContext — sesi dan peran", () => {
  beforeEach(async () => {
    await setupDemo();
  });

  it("login, ganti anak, ganti peran, dan logout", () => {
    expect(demo().state.isLoggedIn).toBe(false);
    expect(demo().state.activeRole).toBeNull();

    actSync((api) => api.loginAs("orang_tua"));
    expect(demo().state.isLoggedIn).toBe(true);
    expect(demo().state.activeRole).toBe("orang_tua");
    expect(demo().state.activeChildId).toBe("st-1");
    expect(demo().state.toast?.message).toContain("Masuk sebagai");

    actSync((api) => api.selectChild("st-2"));
    expect(demo().state.activeChildId).toBe("st-2");

    actSync((api) => api.switchRole("guru"));
    expect(demo().state.activeRole).toBe("guru");
    expect(demo().state.activeTeacherId).toBe("tch-1");

    actSync((api) => api.selectPeriod("per-2025-genap"));
    expect(demo().state.activePeriodId).toBe("per-2025-genap");

    actSync((api) => api.logout());
    expect(demo().state.isLoggedIn).toBe(false);
    expect(demo().state.activeRole).toBeNull();
  });

  it("loginWithEmail menolak email/password yang salah dan menerima akun demo", () => {
    let result: { ok: boolean; error?: string } = { ok: false, error: "" };
    actSync((api) => {
      result = api.loginWithEmail("bukan@demo.local", "demo123");
    });
    expect(result.ok).toBe(false);
    expect(result.error).toContain("tidak ditemukan");

    actSync((api) => {
      result = api.loginWithEmail("wali@demo.local", "salah");
    });
    expect(result.ok).toBe(false);
    expect(result.error).toContain("Password");

    actSync((api) => {
      result = api.loginWithEmail("siswa@demo.local", "demo123");
    });
    expect(result.ok).toBe(true);
    expect(demo().state.activeRole).toBe("siswa");
  });
});

describe("DemoContext — tugas", () => {
  beforeEach(async () => {
    await setupDemo();
    actSync((api) => api.loginAs("guru"));
  });

  it("membuat draft, publikasi, menyimpan draft siswa, mengirim, dan menilai", async () => {
    const before = demo().state.tasks.length;

    await runAction((api) =>
      api.addTask({
        title: "Tugas Pengujian Otomatis",
        description: "Deskripsi tugas uji",
        instructions: "Kerjakan dengan teliti.",
        subjectId: "sub-1",
        classId: "cls-7a",
        teacherId: "tch-1",
        deadline: "2026-12-01",
        maxScore: 100,
        allowRevision: true,
        status: "draft",
      })
    );

    expect(demo().state.tasks.length).toBe(before + 1);
    const task = demo().state.tasks.find((item) => item.title === "Tugas Pengujian Otomatis");
    expect(task?.status).toBe("draft");

    await runAction((api) => api.publishTask(task!.id));
    expect(demo().state.tasks.find((item) => item.id === task!.id)?.status).toBe("published");

    await runAction((api) => api.saveTaskDraft(task!.id, "st-1", "Draft jawaban siswa"));
    const draft = demo().state.submissions.find(
      (item) => item.taskId === task!.id && item.studentId === "st-1"
    );
    expect(draft?.status).toBe("draft");
    expect(draft?.content).toContain("Draft jawaban");

    await runAction((api) => api.submitTask(task!.id, "st-1", "Jawaban final", "lampiran.pdf"));
    const submitted = demo().state.submissions.find(
      (item) => item.taskId === task!.id && item.studentId === "st-1"
    );
    expect(submitted?.status).toBe("terkirim");
    expect(submitted?.fileName).toBe("lampiran.pdf");

    await runAction((api) => api.gradeSubmission(submitted!.id, 92, "Pekerjaan sangat baik"));
    const graded = demo().state.submissions.find((item) => item.id === submitted!.id);
    expect(graded?.status).toBe("dinilai");
    expect(graded?.score).toBe(92);
    expect(graded?.feedback).toContain("sangat baik");
  });

  it("menandai pengumpulan sebagai terlambat jika melewati tenggat", async () => {
    await runAction((api) =>
      api.addTask({
        title: "Tugas Lewat Tenggat",
        description: "Tenggat sudah lewat",
        instructions: "Kumpulkan.",
        subjectId: "sub-2",
        classId: "cls-7a",
        teacherId: "tch-2",
        deadline: "2026-11-01",
        maxScore: 100,
        allowRevision: false,
        status: "published",
      })
    );
    const task = demo().state.tasks.find((item) => item.title === "Tugas Lewat Tenggat");
    await runAction((api) => api.submitTask(task!.id, "st-3", "Terlambat"));
    const submission = demo().state.submissions.find(
      (item) => item.taskId === task!.id && item.studentId === "st-3"
    );
    expect(submission?.status).toBe("terlambat");
    expect(demo().state.toast?.message).toContain("terlambat");
  });
});
