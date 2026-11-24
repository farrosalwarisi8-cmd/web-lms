import { beforeEach, describe, expect, it } from "vitest";
import { actSync, demo, runAction, setupDemo } from "@/test/harness";
import { attendanceSummary } from "@/lib/utils";

describe("DemoContext — tagihan dan pembayaran", () => {
  beforeEach(async () => {
    await setupDemo();
    actSync((api) => api.loginAs("admin_keuangan"));
  });

  it("membuat tagihan, mengunggah bukti, lalu memverifikasi pembayaran", async () => {
    const before = demo().state.invoices.length;
    await runAction((api) =>
      api.createInvoice({
        studentId: "st-1",
        type: "spp",
        periodLabel: "Desember 2026",
        description: "SPP Desember 2026",
        amount: 450000,
        dueDate: "2026-12-10",
      })
    );
    expect(demo().state.invoices.length).toBe(before + 1);
    const invoice = demo().state.invoices.find((item) => item.description === "SPP Desember 2026");
    expect(invoice?.status).toBe("belum_bayar");

    await runAction((api) =>
      api.uploadPaymentProof({
        invoiceId: invoice!.id,
        amount: 450000,
        method: "Transfer BSI",
        fileName: "bukti-desember.jpg",
      })
    );
    const paidInvoice = demo().state.invoices.find((item) => item.id === invoice!.id);
    expect(paidInvoice?.paidAmount).toBe(450000);
    expect(paidInvoice?.status).toBe("menunggu_verifikasi");

    const payment = demo().state.payments.find((item) => item.invoiceId === invoice!.id);
    expect(payment?.status).toBe("menunggu");

    await runAction((api) => api.verifyPayment(payment!.id, true));
    expect(demo().state.payments.find((item) => item.id === payment!.id)?.status).toBe("diverifikasi");
    expect(demo().state.invoices.find((item) => item.id === invoice!.id)?.status).toBe("lunas");
  });

  it("menolak bukti pembayaran mengembalikan sisa tagihan", async () => {
    await runAction((api) =>
      api.createInvoice({
        studentId: "st-2",
        type: "spp",
        periodLabel: "Desember 2026",
        description: "SPP Desember (uji tolak)",
        amount: 500000,
        dueDate: "2026-12-10",
      })
    );
    const invoice = demo().state.invoices.find((item) => item.description === "SPP Desember (uji tolak)");
    await runAction((api) =>
      api.uploadPaymentProof({
        invoiceId: invoice!.id,
        amount: 500000,
        method: "Transfer Mandiri",
        fileName: "bukti-tidak-jelas.jpg",
      })
    );
    const payment = demo().state.payments.find((item) => item.invoiceId === invoice!.id);
    await runAction((api) => api.verifyPayment(payment!.id, false, "Bukti tidak terbaca"));

    expect(demo().state.payments.find((item) => item.id === payment!.id)?.status).toBe("ditolak");
    const rejectedInvoice = demo().state.invoices.find((item) => item.id === invoice!.id);
    expect(rejectedInvoice?.status).toBe("ditolak");
    expect(rejectedInvoice?.paidAmount).toBe(0);
  });

  it("mencatat pembayaran tunai kasir dan transaksi keuangan", async () => {
    const trxBefore = demo().state.transactions.length;
    await runAction((api) =>
      api.createInvoice({
        studentId: "st-3",
        type: "spp",
        periodLabel: "Desember 2026",
        description: "SPP kasir",
        amount: 450000,
        dueDate: "2026-12-10",
      })
    );
    const invoice = demo().state.invoices.find((item) => item.description === "SPP kasir");
    await runAction((api) => api.recordCashPayment(invoice!.id, 200000));
    const updated = demo().state.invoices.find((item) => item.id === invoice!.id);
    expect(updated?.paidAmount).toBe(200000);
    expect(updated?.status).toBe("dibayar_sebagian");
    expect(demo().state.transactions.length).toBe(trxBefore + 1);

    await runAction((api) =>
      api.addTransaction({
        type: "keluar",
        category: "Operasional",
        description: "Pembelian perlengkapan uji",
        amount: 125000,
        method: "Tunai",
      })
    );
    expect(demo().state.transactions[0].description).toBe("Pembelian perlengkapan uji");
    expect(demo().state.transactions[0].type).toBe("keluar");
  });
});

describe("DemoContext — berkas dan pendaftaran", () => {
  beforeEach(async () => {
    await setupDemo();
  });

  it("mengunggah dan menghapus dokumen siswa", async () => {
    expect(
      demo().state.documents.some((doc) => doc.studentId === "st-1" && doc.name === "Akta Kelahiran")
    ).toBe(false);

    await runAction((api) => api.uploadDocument("st-1", "Akta Kelahiran", "akta-fauzan.pdf"));
    const doc = demo().state.documents.find(
      (item) => item.studentId === "st-1" && item.name === "Akta Kelahiran"
    );
    expect(doc?.fileName).toBe("akta-fauzan.pdf");
    expect(doc?.status).toBe("lengkap");

    actSync((api) => api.deleteDocument(doc!.id));
    expect(
      demo().state.documents.some((item) => item.id === doc!.id)
    ).toBe(false);
  });

  it("memperbarui status pendaftaran dan memverifikasi pembayaran PPDB", async () => {
    await runAction((api) => api.updateRegistrationStatus("reg-3", "diterima", "Berkas sudah lengkap"));
    const registration = demo().state.registrations.find((item) => item.id === "reg-3");
    expect(registration?.status).toBe("diterima");
    expect(registration?.notes).toContain("lengkap");

    await runAction((api) => api.verifyRegistrationPayment("reg-2"));
    const paid = demo().state.registrations.find((item) => item.id === "reg-2");
    expect(paid?.paymentStatus).toBe("lunas");
    expect(paid?.status).toBe("menunggu_verifikasi");
  });
});

describe("DemoContext — data master dan skenario", () => {
  beforeEach(async () => {
    await setupDemo();
    actSync((api) => api.loginAs("admin_akademik"));
  });

  it("menambah siswa, guru, kelas, mapel, dan memproses kenaikan kelas", async () => {
    const studentsBefore = demo().state.students.length;
    await runAction((api) =>
      api.addStudent({
        name: "Santri Uji Otomatis",
        classId: "cls-7a",
        gender: "putra",
        parentName: "Wali Uji",
        parentPhone: "081200001111",
      })
    );
    expect(demo().state.students.length).toBe(studentsBefore + 1);
    const student = demo().state.students.find((item) => item.name === "Santri Uji Otomatis");
    expect(student?.classId).toBe("cls-7a");

    await runAction((api) =>
      api.addTeacher({
        name: "Guru Uji Otomatis",
        email: "guru.uji@demo.local",
        phone: "081299998888",
        subjectIds: ["sub-1"],
        classIds: ["cls-7a"],
      })
    );
    expect(demo().state.teachers.some((item) => item.name === "Guru Uji Otomatis")).toBe(true);

    await runAction((api) =>
      api.addJenjang({ name: "MA Uji", description: "Jenjang untuk pengujian." })
    );
    const jenjangBaru = demo().state.jenjang.find((item) => item.name === "MA Uji");
    expect(jenjangBaru).toBeTruthy();

    await runAction((api) =>
      api.addClass({
        name: "10U",
        jenjangId: jenjangBaru!.id,
        level: 10,
        homeroomTeacherId: "tch-1",
        room: "Ruang Uji",
      })
    );
    const kelasBaru = demo().state.classes.find((item) => item.name === "10U");
    expect(kelasBaru?.jenjangId).toBe(jenjangBaru!.id);
    expect(kelasBaru?.level).toBe(10);

    await runAction((api) =>
      api.addSubject({ code: "UJI", name: "Mapel Uji", category: "Umum" })
    );
    expect(demo().state.subjects.some((item) => item.name === "Mapel Uji")).toBe(true);

    await runAction((api) => api.promoteStudents([student!.id], "cls-8a"));
    expect(demo().state.students.find((item) => item.id === student!.id)?.classId).toBe("cls-8a");
  });

  it("mengelola akun keuangan, biaya PPDB, dan mengirim ulang email gagal", async () => {
    await runAction((api) =>
      api.addFinanceAdmin({ name: "Kasir Uji", email: "kasir.uji@demo.local", role: "Kasir" })
    );
    const financeAdmin = demo().state.financeAdmins.find((item) => item.email === "kasir.uji@demo.local");
    expect(financeAdmin?.status).toBe("aktif");

    actSync((api) => api.updateFinanceAdminStatus(financeAdmin!.id, "nonaktif"));
    expect(
      demo().state.financeAdmins.find((item) => item.id === financeAdmin!.id)?.status
    ).toBe("nonaktif");

    await runAction((api) => api.updatePpdbFee("fee-1", 175000));
    expect(demo().state.ppdbFees.find((item) => item.id === "fee-1")?.amount).toBe(175000);

    await runAction((api) => api.retryEmail("mail-3"));
    const email = demo().state.outboxEmails.find((item) => item.id === "mail-3");
    expect(email?.status).toBe("terkirim");
    expect(email?.error).toBeUndefined();
  });

  it("memuat Skenario A, B, C dan reset demo", () => {
    actSync((api) => api.seedScenario("wali_attention"));
    expect(demo().state.scenario).toBe("wali_attention");
    expect(demo().state.activeRole).toBe("orang_tua");
    const child = demo().state.students.find((item) => item.id === "st-1")!;
    const pendingTasks = demo().state.tasks.filter((task) => {
      if (task.classId !== child.classId || task.status !== "published") return false;
      const submission = demo().state.submissions.find(
        (item) => item.taskId === task.id && item.studentId === child.id
      );
      return !submission || submission.status === "draft" || submission.status === "perlu_revisi";
    });
    expect(pendingTasks).toHaveLength(2);
    const attendance = attendanceSummary(
      demo().state.attendance.filter((item) => item.studentId === child.id)
    );
    expect(attendance.percentage).toBe(82);
    expect(attendance.alpa).toBe(1);
    expect(
      demo().state.documents.some(
        (doc) => doc.studentId === "st-1" && doc.name === "Akta Kelahiran"
      )
    ).toBe(false);
    expect(
      demo().state.invoices.some(
        (invoice) =>
          invoice.studentId === "st-1" &&
          invoice.periodLabel.startsWith("November") &&
          invoice.status === "belum_bayar"
      )
    ).toBe(true);

    actSync((api) => api.seedScenario("guru_work"));
    const teacherTasks = demo().state.tasks.filter((task) => task.teacherId === "tch-1");
    const ungraded = demo().state.submissions.filter(
      (submission) =>
        teacherTasks.some((task) => task.id === submission.taskId) &&
        (submission.status === "terkirim" || submission.status === "terlambat")
    );
    expect(ungraded.length).toBeGreaterThanOrEqual(5);
    expect(
      demo().state.exams.some((exam) => exam.teacherId === "tch-1" && !exam.published)
    ).toBe(true);

    actSync((api) => api.seedScenario("keuangan_queue"));
    expect(
      demo().state.payments.filter((payment) => payment.status === "menunggu")
    ).toHaveLength(8);

    actSync((api) => api.resetDemo());
    expect(demo().state.scenario).toBe("default");
    expect(demo().state.isLoggedIn).toBe(true);
    expect(demo().state.tasks).toHaveLength(12);
    expect(demo().state.registrations).toHaveLength(10);
  });
});
