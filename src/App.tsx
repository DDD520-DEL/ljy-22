import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import ChildInfo from "@/pages/ChildInfo";
import VaccineSchedulePage from "@/pages/VaccineSchedule";
import CheckupSchedulePage from "@/pages/CheckupSchedule";
import TemperatureRecordPage from "@/pages/TemperatureRecord";
import ReactionDiaryPage from "@/pages/ReactionDiary";
import RemindersPage from "@/pages/Reminders";
import RecordsPage from "@/pages/Records";
import ExportPrintPage from "@/pages/ExportPrint";
import VaccineCertificatePage from "@/pages/VaccineCertificate";
import CheckupComparePage from "@/pages/CheckupCompare";
import MedicationRemindersPage from "@/pages/MedicationReminders";
import SleepRecordPage from "@/pages/SleepRecord";
import AllergyRecordPage from "@/pages/AllergyRecord";
import BabyTimelinePage from "@/pages/BabyTimeline";
import ExpenseTrackerPage from "@/pages/ExpenseTracker";
import GrowthCalculatorPage from "@/pages/GrowthCalculator";
import VaccineQueryPage from "@/pages/VaccineQuery";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="child-info" element={<ChildInfo />} />
          <Route path="vaccine-schedule" element={<VaccineSchedulePage />} />
          <Route path="checkup-schedule" element={<CheckupSchedulePage />} />
          <Route path="temperature" element={<TemperatureRecordPage />} />
          <Route path="sleep" element={<SleepRecordPage />} />
          <Route path="allergy" element={<AllergyRecordPage />} />
          <Route path="timeline" element={<BabyTimelinePage />} />
          <Route path="expense" element={<ExpenseTrackerPage />} />
          <Route path="growth-calculator" element={<GrowthCalculatorPage />} />
          <Route path="vaccine-query" element={<VaccineQueryPage />} />
          <Route path="reaction-diary" element={<ReactionDiaryPage />} />
          <Route path="reaction-diary/:id" element={<ReactionDiaryPage />} />
          <Route path="reminders" element={<RemindersPage />} />
          <Route path="medication" element={<MedicationRemindersPage />} />
          <Route path="records" element={<RecordsPage />} />
          <Route path="checkup-compare" element={<CheckupComparePage />} />
          <Route path="export" element={<ExportPrintPage />} />
          <Route path="vaccine-certificate" element={<VaccineCertificatePage />} />
          <Route path="*" element={<Dashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}
