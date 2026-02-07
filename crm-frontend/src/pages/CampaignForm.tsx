import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { campaignApi } from "@/services/api";
import Swal from "sweetalert2";

export default function CampaignForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (id) {
      setLoading(true);
      campaignApi.get(Number(id)).then((item) => {
        setForm({
          campaign_name: item.campaign_name || "",
          description: item.description || "",
        });
      }).finally(() => setLoading(false));
    }
  }, [id]);

  const setField = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await campaignApi.update(Number(id), form);
        Swal.fire("Updated!", "Campaign has been updated.", "success");
      } else {
        await campaignApi.create(form);
        Swal.fire("Created!", "Campaign has been created.", "success");
      }
      navigate("/campaigns");
    } catch {
      Swal.fire("Error", "Failed to save campaign.", "error");
    }
  };

  if (loading) return <div className="text-center py-5 text-muted">Loading...</div>;

  return (
    <div>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">CRM</Link></li>
          <li className="breadcrumb-item"><Link to="/campaigns">Campaign</Link></li>
          <li className="breadcrumb-item active">{isEdit ? "Edit" : "New"}</li>
        </ol>
      </nav>
      <h2 className="mb-4">{isEdit ? "Edit Campaign" : "New Campaign"}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-container mb-4">
          <h5 className="mb-3 border-bottom pb-2">Campaign Details</h5>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Campaign Name <span className="text-danger">*</span></label>
              <input className="form-control" value={form.campaign_name || ""} onChange={(e) => setField("campaign_name", e.target.value)} required />
            </div>
            <div className="col-md-12">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows={4} value={form.description || ""} onChange={(e) => setField("description", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary">Save</button>
          <Link to="/campaigns" className="btn btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
