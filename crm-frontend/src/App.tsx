import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import LeadList from "./pages/LeadList";
import LeadForm from "./pages/LeadForm";
import OpportunityList from "./pages/OpportunityList";
import OpportunityForm from "./pages/OpportunityForm";
import ProspectList from "./pages/ProspectList";
import ProspectForm from "./pages/ProspectForm";
import CampaignList from "./pages/CampaignList";
import CampaignForm from "./pages/CampaignForm";
import ContractList from "./pages/ContractList";
import ContractForm from "./pages/ContractForm";
import AppointmentList from "./pages/AppointmentList";
import AppointmentForm from "./pages/AppointmentForm";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/leads" element={<LeadList />} />
        <Route path="/leads/new" element={<LeadForm />} />
        <Route path="/leads/:id/edit" element={<LeadForm />} />
        <Route path="/opportunities" element={<OpportunityList />} />
        <Route path="/opportunities/new" element={<OpportunityForm />} />
        <Route path="/opportunities/:id/edit" element={<OpportunityForm />} />
        <Route path="/prospects" element={<ProspectList />} />
        <Route path="/prospects/new" element={<ProspectForm />} />
        <Route path="/prospects/:id/edit" element={<ProspectForm />} />
        <Route path="/campaigns" element={<CampaignList />} />
        <Route path="/campaigns/new" element={<CampaignForm />} />
        <Route path="/campaigns/:id/edit" element={<CampaignForm />} />
        <Route path="/contracts" element={<ContractList />} />
        <Route path="/contracts/new" element={<ContractForm />} />
        <Route path="/contracts/:id/edit" element={<ContractForm />} />
        <Route path="/appointments" element={<AppointmentList />} />
        <Route path="/appointments/new" element={<AppointmentForm />} />
        <Route path="/appointments/:id/edit" element={<AppointmentForm />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
