import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { settingsApi, salesStageApi, lostReasonApi, competitorApi } from "@/services/api";
import type { CrmSetting, SalesStage, OpportunityLostReason, Competitor } from "@/types";
import { Plus, Trash2 } from "lucide-react";
import Swal from "sweetalert2";

export default function SettingsPage() {
  const [settings, setSettings] = useState<CrmSetting | null>(null);
  const [stages, setStages] = useState<SalesStage[]>([]);
  const [reasons, setReasons] = useState<OpportunityLostReason[]>([]);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      settingsApi.get().catch(() => null),
      salesStageApi.list().catch(() => []),
      lostReasonApi.list().catch(() => []),
      competitorApi.list().catch(() => []),
    ]).then(([s, st, r, c]) => {
      setSettings(s);
      setStages(Array.isArray(st) ? st : []);
      setReasons(Array.isArray(r) ? r : []);
      setCompetitors(Array.isArray(c) ? c : []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSaveSettings = async () => {
    if (!settings) return;
    try {
      await settingsApi.update(settings);
      Swal.fire("Saved!", "Settings have been updated.", "success");
    } catch {
      Swal.fire("Error", "Failed to save settings.", "error");
    }
  };

  const handleAddStage = async () => {
    const { value } = await Swal.fire({ title: "Add Sales Stage", input: "text", inputLabel: "Stage Name", inputPlaceholder: "Enter stage name", showCancelButton: true });
    if (value) {
      await salesStageApi.create({ stage_name: value });
      Swal.fire("Added!", "Sales stage has been added.", "success");
      fetchAll();
    }
  };

  const handleDeleteStage = async (id: number) => {
    const result = await Swal.fire({ title: "Delete Stage?", icon: "warning", showCancelButton: true, confirmButtonColor: "#dc3545", confirmButtonText: "Delete" });
    if (result.isConfirmed) {
      await salesStageApi.delete(id);
      fetchAll();
    }
  };

  const handleAddReason = async () => {
    const { value } = await Swal.fire({ title: "Add Lost Reason", input: "text", inputLabel: "Reason", inputPlaceholder: "Enter lost reason", showCancelButton: true });
    if (value) {
      await lostReasonApi.create({ reason: value });
      Swal.fire("Added!", "Lost reason has been added.", "success");
      fetchAll();
    }
  };

  const handleDeleteReason = async (id: number) => {
    const result = await Swal.fire({ title: "Delete Reason?", icon: "warning", showCancelButton: true, confirmButtonColor: "#dc3545", confirmButtonText: "Delete" });
    if (result.isConfirmed) {
      await lostReasonApi.delete(id);
      fetchAll();
    }
  };

  const handleAddCompetitor = async () => {
    const { value } = await Swal.fire({ title: "Add Competitor", input: "text", inputLabel: "Competitor Name", inputPlaceholder: "Enter competitor name", showCancelButton: true });
    if (value) {
      await competitorApi.create({ competitor_name: value });
      Swal.fire("Added!", "Competitor has been added.", "success");
      fetchAll();
    }
  };

  const handleDeleteCompetitor = async (id: number) => {
    const result = await Swal.fire({ title: "Delete Competitor?", icon: "warning", showCancelButton: true, confirmButtonColor: "#dc3545", confirmButtonText: "Delete" });
    if (result.isConfirmed) {
      await competitorApi.delete(id);
      fetchAll();
    }
  };

  if (loading) return <div className="text-center py-5 text-muted">Loading...</div>;

  return (
    <div>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">CRM</Link></li>
          <li className="breadcrumb-item active">Settings</li>
        </ol>
      </nav>
      <h2 className="mb-4">CRM Settings</h2>

      <div className="form-container mb-4">
        <h5 className="mb-3 border-bottom pb-2">General Settings</h5>
        {settings && (
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Campaign Naming By</label>
              <select className="form-select" value={settings.campaign_naming_by || ""} onChange={(e) => setSettings({ ...settings, campaign_naming_by: e.target.value })}>
                <option value="">Select</option>
                <option value="Campaign Name">Campaign Name</option>
                <option value="Naming Series">Naming Series</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Close Opportunity After (days)</label>
              <input type="number" className="form-control" value={settings.close_opportunity_after_days || ""} onChange={(e) => setSettings({ ...settings, close_opportunity_after_days: Number(e.target.value) || null })} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Default Valid Till (days)</label>
              <input type="number" className="form-control" value={settings.default_valid_till || ""} onChange={(e) => setSettings({ ...settings, default_valid_till: Number(e.target.value) || null })} />
            </div>
            <div className="col-md-12">
              <div className="form-check mb-2">
                <input className="form-check-input" type="checkbox" checked={settings.allow_lead_duplication_based_on_emails} onChange={(e) => setSettings({ ...settings, allow_lead_duplication_based_on_emails: e.target.checked })} id="dupCheck" />
                <label className="form-check-label" htmlFor="dupCheck">Allow lead duplication based on emails</label>
              </div>
              <div className="form-check mb-2">
                <input className="form-check-input" type="checkbox" checked={settings.auto_creation_of_contact} onChange={(e) => setSettings({ ...settings, auto_creation_of_contact: e.target.checked })} id="autoContact" />
                <label className="form-check-label" htmlFor="autoContact">Auto creation of contact</label>
              </div>
              <div className="form-check mb-2">
                <input className="form-check-input" type="checkbox" checked={settings.carry_forward_communication_and_comments} onChange={(e) => setSettings({ ...settings, carry_forward_communication_and_comments: e.target.checked })} id="carryFwd" />
                <label className="form-check-label" htmlFor="carryFwd">Carry forward communication and comments</label>
              </div>
            </div>
            <div className="col-md-12">
              <button className="btn btn-primary" onClick={handleSaveSettings}>Save Settings</button>
            </div>
          </div>
        )}
      </div>

      <div className="row g-4">
        <div className="col-md-4">
          <div className="card">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <span className="fw-semibold">Sales Stages</span>
              <button className="btn btn-sm btn-primary" onClick={handleAddStage}><Plus size={14} /></button>
            </div>
            <ul className="list-group list-group-flush">
              {stages.length === 0 && <li className="list-group-item text-muted text-center">No stages</li>}
              {stages.map((s) => (
                <li key={s.id} className="list-group-item d-flex justify-content-between align-items-center">
                  {s.stage_name}
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteStage(s.id)}><Trash2 size={14} /></button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <span className="fw-semibold">Lost Reasons</span>
              <button className="btn btn-sm btn-primary" onClick={handleAddReason}><Plus size={14} /></button>
            </div>
            <ul className="list-group list-group-flush">
              {reasons.length === 0 && <li className="list-group-item text-muted text-center">No reasons</li>}
              {reasons.map((r) => (
                <li key={r.id} className="list-group-item d-flex justify-content-between align-items-center">
                  {r.reason}
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteReason(r.id)}><Trash2 size={14} /></button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <span className="fw-semibold">Competitors</span>
              <button className="btn btn-sm btn-primary" onClick={handleAddCompetitor}><Plus size={14} /></button>
            </div>
            <ul className="list-group list-group-flush">
              {competitors.length === 0 && <li className="list-group-item text-muted text-center">No competitors</li>}
              {competitors.map((c) => (
                <li key={c.id} className="list-group-item d-flex justify-content-between align-items-center">
                  {c.competitor_name}
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteCompetitor(c.id)}><Trash2 size={14} /></button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
