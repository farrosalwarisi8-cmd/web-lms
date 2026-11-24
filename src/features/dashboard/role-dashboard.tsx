"use client";

import { useDemo } from "@/context/demo-context";
import { ParentDashboard } from "./parent-dashboard";
import { StudentDashboard } from "./student-dashboard";
import { TeacherDashboard } from "./teacher-dashboard";
import { AcademicDashboard } from "./academic-dashboard";
import { FinanceDashboard } from "./finance-dashboard";
import { SuperDashboard } from "./super-dashboard";
import { ApplicantDashboard } from "./applicant-dashboard";

export function RoleDashboard() {
  const { state } = useDemo();

  switch (state.activeRole) {
    case "orang_tua":
      return <ParentDashboard />;
    case "siswa":
      return <StudentDashboard />;
    case "guru":
      return <TeacherDashboard />;
    case "admin_akademik":
      return <AcademicDashboard />;
    case "admin_keuangan":
      return <FinanceDashboard />;
    case "super_admin":
      return <SuperDashboard />;
    case "calon_wali":
      return <ApplicantDashboard />;
    default:
      return <ParentDashboard />;
  }
}
