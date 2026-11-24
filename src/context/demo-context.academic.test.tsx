import { beforeEach, describe, expect, it } from "vitest";
import { actSync, demo, runAction, setupDemo } from "@/test/harness";

describe("DemoContext — materi dan absensi", () => {
  beforeEach(async () => {
    await setupDemo();
    actSync((api) => api.loginAs("guru"));
  });

  it("membuat materi draft lalu mempublikasikannya", async () => {
    const before = demo().state.materials.length;
    await runAction((api) =>
      api.addMaterial({
        title: "Materi Uji Otomatis",
        description: "Ringkasan materi pengujian",
        content: "Isi materi pengujian otomatis.",
        subjectId: "sub-1",
        classId: "cls-7a",
        teacherId: "tch-1",
        status: "draft",
      })
    );
    expect(demo().state.materials.length).toBe(before + 1);
    const material = demo().state.materials.find((item) => item.title === "Materi Uji Otomatis");
    expect(material?.status).toBe("draft");

    await runAction((api) => api.publishMaterial(material!.id));
    expect(demo().state.materials.find((item) => item.id === material!.id)?.status).toBe("published");
  });

  it("menyimpan absensi dan menimpa data pada kelas/mapel/tanggal yang sama", async () => {
    const base = {
      date: "2026-11-24",
      classId: "cls-7a",
      subjectId: "sub-1",
      periodId: "per-2026-ganjil",
    };
    await runAction((api) =>
      api.saveAttendance([
        { ...base, studentId: "st-1", status: "hadir" },
        { ...base, studentId: "st-3", status: "izin" },
      ])
    );
    let records = demo().state.attendance.filter(
      (item) => item.date === base.date && item.classId === base.classId && item.subjectId === base.subjectId
    );
    expect(records).toHaveLength(2);

    await runAction((api) =>
      api.saveAttendance([{ ...base, studentId: "st-1", status: "alpa" }])
    );
    records = demo().state.attendance.filter(
      (item) => item.date === base.date && item.classId === base.classId && item.subjectId === base.subjectId
    );
    expect(records).toHaveLength(1);
    expect(records[0].studentId).toBe("st-1");
    expect(records[0].status).toBe("alpa");
    expect(demo().state.toast?.message).toBe("Absensi tersimpan");
  });
});

describe("DemoContext — ujian", () => {
  beforeEach(async () => {
    await setupDemo();
    actSync((api) => api.loginAs("guru"));
  });

  it("membuat, publikasi, mengerjakan, mengirim, dan menilai ujian", async () => {
    await runAction((api) =>
      api.addExam({
        title: "Ujian Uji Otomatis",
        description: "Ujian untuk pengujian otomatis.",
        subjectId: "sub-1",
        classId: "cls-7a",
        teacherId: "tch-1",
        durationMinutes: 30,
        scheduledAt: "2026-12-02T08:00",
        status: "akan_datang",
        published: false,
        questions: [
          {
            id: "auto-q1",
            type: "pilihan_ganda",
            text: "Pilih jawaban benar.",
            options: ["Salah", "Benar", "Salah", "Salah"],
            correctIndex: 1,
            score: 50,
          },
          {
            id: "auto-q2",
            type: "esai",
            text: "Tuliskan penjelasan singkat.",
            score: 50,
          },
        ],
      })
    );

    const exam = demo().state.exams.find((item) => item.title === "Ujian Uji Otomatis");
    expect(exam?.published).toBe(false);

    await runAction((api) => api.publishExam(exam!.id));
    expect(demo().state.exams.find((item) => item.id === exam!.id)?.status).toBe("aktif");

    await runAction((api) => api.startExam(exam!.id, "st-1"));
    const attempt = demo().state.examAttempts.find(
      (item) => item.examId === exam!.id && item.studentId === "st-1"
    );
    expect(attempt?.status).toBe("mengerjakan");

    actSync((api) => api.answerExamQuestion(exam!.id, "st-1", "auto-q1", "1"));
    actSync((api) =>
      api.answerExamQuestion(exam!.id, "st-1", "auto-q2", "Penjelasan jawaban esai.")
    );
    expect(
      demo().state.examAttempts.find((item) => item.id === attempt!.id)?.answers["auto-q1"]
    ).toBe("1");

    await runAction((api) => api.submitExam(exam!.id, "st-1"));
    const submitted = demo().state.examAttempts.find((item) => item.id === attempt!.id);
    expect(submitted?.status).toBe("terkirim");
    expect(submitted?.score).toBe(90);

    await runAction((api) => api.gradeExamAttempt(attempt!.id, 95));
    const graded = demo().state.examAttempts.find((item) => item.id === attempt!.id);
    expect(graded?.status).toBe("dinilai");
    expect(graded?.score).toBe(95);
  });
});

describe("DemoContext — nilai dan rapor", () => {
  beforeEach(async () => {
    await setupDemo();
    actSync((api) => api.loginAs("guru"));
  });

  it("memperbarui komponen nilai siswa", async () => {
    const grade = demo().state.grades[0];
    await runAction((api) =>
      api.updateGrade(grade.id, {
        assignmentScore: 99,
        examScore: 88,
        memorizationScore: 91,
        akhlakScore: 95,
        note: "Catatan pengujian",
      })
    );
    const updated = demo().state.grades.find((item) => item.id === grade.id);
    expect(updated?.assignmentScore).toBe(99);
    expect(updated?.note).toBe("Catatan pengujian");
  });

  it("menerbitkan rapor draft", async () => {
    const draft = demo().state.reportCards.find((card) => card.status === "draft");
    expect(draft).toBeDefined();
    await runAction((api) => api.publishReportCard(draft!.id));
    const published = demo().state.reportCards.find((card) => card.id === draft!.id);
    expect(published?.status).toBe("published");
    expect(published?.publishedAt).toBe("2026-11-24");
  });
});
