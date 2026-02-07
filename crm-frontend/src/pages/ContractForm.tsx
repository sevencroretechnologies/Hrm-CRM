import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { contractApi } from "@/services/api";
import Swal from "sweetalert2";

export default function ContractForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({ party_type: "Customer", status: "Unsigned" });

  useEffect(() => {
    if (id) {
      setLoading(true);
      contractApi.get(Number(id)).then((item) => {
        setForm({
          party_type: item.party_type || "Customer",
          party_name: item.party_name || "",
          status: item.status || "Unsigned",
          start_date: item.start_date || "",
          end_date: item.end_date || "",
          contract_template: item.contract_template || "",
          contract_terms: item.contract_terms || "",
          signee: item.signee || "",
          signee_company: item.signee_company || "",
          fulfilment_deadline: item.fulfilment_deadline || "",
          fulfilment_status: item.fulfilment_status || "",
        });
      }).finally(() => setLoading(false));
    }
  }, [id]);

  const setField = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await contractApi.update(Number(id), form);
        Swal.fire("Updated!", "Contract has been updated.", "success");
      } else {
        await contractApi.create(form);
        Swal.fire("Created!", "Contract has been created.", "success");
      }
      navigate("/contracts");
    } catch {
      Swal.fire("Error", "Failed to save contract.", "error");
    }
  };

  if (loading) return <div className="text-center py-5 text-muted">Loading...</div>;

  return (
    <div>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">CRM</Link></li>
          <li className="breadcrumb-item"><Link to="/contracts">Contract</Link></li>
          <li className="breadcrumb-item active">{isEdit ? "Edit" : "New"}</li>
        </ol>
      </nav>
      <h2 className="mb-4">{isEdit ? "Edit Contract" : "New Contract"}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-container mb-4">
          <h5 className="mb-3 border-bottom pb-2">Party Details</h5>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Party Type</label>
              <select className="form-select" value={form.party_type || "Customer"} onChange={(e) => setField("party_type", e.target.value)}>
                <option value="Customer">Customer</option>
                <option value="Supplier">Supplier</option>
                <option value="Employee">Employee</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Party Name <span className="text-danger">*</span></label>
              <input className="form-control" value={form.party_name || ""} onChange={(e) => setField("party_name", e.target.value)} required />
            </div>
            <div className="col-md-4">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status || "Unsigned"} onChange={(e) => setField("status", e.target.value)}>
                <option value="Unsigned">Unsigned</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-container mb-4">
          <h5 className="mb-3 border-bottom pb-2">Contract Period</h5>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Start Date</label>
              <input type="date" className="form-control" value={form.start_date || ""} onChange={(e) => setField("start_date", e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">End Date</label>
              <input type="date" className="form-control" value={form.end_date || ""} onChange={(e) => setField("end_date", e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Contract Template</label>
              <input className="form-control" value={form.contract_template || ""} onChange={(e) => setField("contract_template", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-container mb-4">
          <h5 className="mb-3 border-bottom pb-2">Signee Details</h5>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Signee</label>
              <input className="form-control" value={form.signee || ""} onChange={(e) => setField("signee", e.target.value)} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Signee Company</label>
              <input className="form-control" value={form.signee_company || ""} onChange={(e) => setField("signee_company", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-container mb-4">
          <h5 className="mb-3 border-bottom pb-2">Terms and Conditions</h5>
          <div className="row g-3">
            <div className="col-md-12">
              <label className="form-label">Contract Terms</label>
              <textarea className="form-control" rows={6} value={form.contract_terms || ""} onChange={(e) => setField("contract_terms", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-container mb-4">
          <h5 className="mb-3 border-bottom pb-2">Fulfilment</h5>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Fulfilment Deadline</label>
              <input type="date" className="form-control" value={form.fulfilment_deadline || ""} onChange={(e) => setField("fulfilment_deadline", e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Fulfilment Status</label>
              <select className="form-select" value={form.fulfilment_status || ""} onChange={(e) => setField("fulfilment_status", e.target.value)}>
                <option value="">Select</option>
                <option value="Fulfilled">Fulfilled</option>
                <option value="Unfulfilled">Unfulfilled</option>
                <option value="Partially Fulfilled">Partially Fulfilled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary">Save</button>
          <Link to="/contracts" className="btn btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
