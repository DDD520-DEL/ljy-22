import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import ChildInfo from "@/pages/ChildInfo";
import VaccineSchedulePage from "@/pages/VaccineSchedule";
import CheckupSchedulePage from "@/pages/CheckupSchedule";
import RemindersPage from "@/pages/Reminders";
import RecordsPage from "@/pages/Records";
import ExportPrintPage from "@/pages/ExportPrint";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="child-info" element={<ChildInfo />} />
          <Route path="vaccine-schedule" element={<VaccineSchedulePage />} />
          <Route path="checkup-schedule" element={<CheckupSchedulePage />} />
          <Route path="reminders" element={<RemindersPage />} />
          <Route path="records" element={<RecordsPage />} />
          <Route path="export" element={<ExportPrintPage />} />
          <Route path="*" element={<Dashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}
