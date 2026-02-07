import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { opportunityApi, salesStageApi } from "@/services/api";
import type { SalesStage } from "@/types";
import Swal from "sweetalert2";

const STATUS_OPTIONS = ["Open", "Quotation", "Converted", "Lost", "Replied", "Closed"];

export default function OpportunityForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [stages, setStages] = useState<SalesStage[]>([]);
  const [form, setForm] = useState<Record<string, string>>({ status: "Open", opportunity_from: "Lead" });

  useEffect(() => {
    salesStageApi.list().then((res) => setStages(Array.isArray(res) ? res : []));
    if (id) {
      setLoading(true);
      opportunityApi.get(Number(id)).then((item) => {
        setForm({
          opportunity_from: item.opportunity_from || "Lead",
          customer_name: item.customer_name || "",
          status: item.status || "Open",
          sales_stage_id: item.sales_stage_id?.toString() || "",
          opportunity_amount: item.opportunity_amount?.toString() || "",
          expected_closing: item.expected_closing || "",
          probability: item.probability?.toString() || "",
          contact_person: item.contact_person || "",
          contact_email: item.contact_email || "",
          contact_mobile: item.contact_mobile || "",
          territory: item.territory || "",
          currency: item.currency || "USD",
        });
      }).finally(() => setLoading(false));
    }
  }, [id]);

  const setField = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await opportunityApi.update(Number(id), form);
        Swal.fire("Updated!", "Opportunity has been updated.", "success");
      } else {
        await opportunityApi.create(form);
        Swal.fire("Created!", "Opportunity has been created.", "success");
      }
      navigate("/opportunities");
    } catch {
      Swal.fire("Error", "Failed to save opportunity.", "error");
    }
  };

  if (loading) return <div className="text-center py-5 text-muted">Loading...</div>;

  return (
    <div>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">CRM</Link></li>
          <li className="breadcrumb-item"><Link to="/opportunities">Opportunity</Link></li>
          <li className="breadcrumb-item active">{isEdit ? "Edit" : "New"}</li>
        </ol>
      </nav>
      <h2 className="mb-4">{isEdit ? "Edit Opportunity" : "New Opportunity"}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-container mb-4">
          <h5 className="mb-3 border-bottom pb-2">Details</h5>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Opportunity From</label>
              <select className="form-select" value={form.opportunity_from || "Lead"} onChange={(e) => setField("opportunity_from", e.target.value)}>
                <option value="Lead">Lead</option>
                <option value="Customer">Customer</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Customer Name</label>
              <input className="form-control" value={form.customer_name || ""} onChange={(e) => setField("customer_name", e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Status <span className="text-danger">*</span></label>
              <select className="form-select" value={form.status || "Open"} onChange={(e) => setField("status", e.target.value)} required>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Sales Stage</label>
              <select className="form-select" value={form.sales_stage_id || ""} onChange={(e) => setField("sales_stage_id", e.target.value)}>
                <option value="">Select</option>
                {stages.map((s) => <option key={s.id} value={s.id}>{s.stage_name}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Opportunity Amount</label>
              <input type="number" className="form-control" value={form.opportunity_amount || ""} onChange={(e) => setField("opportunity_amount", e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Expected Closing</label>
              <input type="date" className="form-control" value={form.expected_closing || ""} onChange={(e) => setField("expected_closing", e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Probability (%)</label>
              <input type="number" min="0" max="100" className="form-control" value={form.probability || ""} onChange={(e) => setField("probability", e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Territory</label>
              <input className="form-control" value={form.territory || ""} onChange={(e) => setField("territory", e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Currency</label>
              <input className="form-control" value={form.currency || "USD"} onChange={(e) => setField("currency", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-container mb-4">
          <h5 className="mb-3 border-bottom pb-2">Contact Information</h5>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Contact Person</label>
              <input className="form-control" value={form.contact_person || ""} onChange={(e) => setField("contact_person", e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Contact Email</label>
              <input type="email" className="form-control" value={form.contact_email || ""} onChange={(e) => setField("contact_email", e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Contact Mobile</label>
              <input className="form-control" value={form.contact_mobile || ""} onChange={(e) => setField("contact_mobile", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary">Save</button>
          <Link to="/opportunities" className="btn btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
