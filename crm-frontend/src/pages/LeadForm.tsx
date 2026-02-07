import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { leadApi } from "@/services/api";
import Swal from "sweetalert2";

const STATUS_OPTIONS = ["Lead", "Open", "Replied", "Opportunity", "Quotation", "Lost Quotation", "Interested", "Converted", "Do Not Contact"];

export default function LeadForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({ status: "Lead" });

  useEffect(() => {
    if (id) {
      setLoading(true);
      leadApi.get(Number(id)).then((lead) => {
        setForm({
          first_name: lead.first_name || "",
          last_name: lead.last_name || "",
          email_id: lead.email_id || "",
          mobile_no: lead.mobile_no || "",
          phone: lead.phone || "",
          company_name: lead.company_name || "",
          job_title: lead.job_title || "",
          gender: lead.gender || "",
          status: lead.status || "Lead",
          request_type: lead.request_type || "",
          industry: lead.industry || "",
          territory: lead.territory || "",
          city: lead.city || "",
          state: lead.state || "",
          country: lead.country || "",
          website: lead.website || "",
          no_of_employees: lead.no_of_employees || "",
          annual_revenue: lead.annual_revenue?.toString() || "",
          market_segment: lead.market_segment || "",
        });
      }).finally(() => setLoading(false));
    }
  }, [id]);

  const setField = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await leadApi.update(Number(id), form);
        Swal.fire("Updated!", "Lead has been updated.", "success");
      } else {
        await leadApi.create(form);
        Swal.fire("Created!", "Lead has been created.", "success");
      }
      navigate("/leads");
    } catch {
      Swal.fire("Error", "Failed to save lead.", "error");
    }
  };

  if (loading) return <div className="text-center py-5 text-muted">Loading...</div>;

  return (
    <div>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">CRM</Link></li>
          <li className="breadcrumb-item"><Link to="/leads">Lead</Link></li>
          <li className="breadcrumb-item active">{isEdit ? "Edit" : "New"}</li>
        </ol>
      </nav>
      <h2 className="mb-4">{isEdit ? "Edit Lead" : "New Lead"}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-container mb-4">
          <h5 className="mb-3 border-bottom pb-2">Personal Information</h5>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">First Name</label>
              <input className="form-control" value={form.first_name || ""} onChange={(e) => setField("first_name", e.target.value)} required />
            </div>
            <div className="col-md-4">
              <label className="form-label">Last Name</label>
              <input className="form-control" value={form.last_name || ""} onChange={(e) => setField("last_name", e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Gender</label>
              <select className="form-select" value={form.gender || ""} onChange={(e) => setField("gender", e.target.value)}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Job Title</label>
              <input className="form-control" value={form.job_title || ""} onChange={(e) => setField("job_title", e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Status <span className="text-danger">*</span></label>
              <select className="form-select" value={form.status || "Lead"} onChange={(e) => setField("status", e.target.value)} required>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Request Type</label>
              <select className="form-select" value={form.request_type || ""} onChange={(e) => setField("request_type", e.target.value)}>
                <option value="">Select</option>
                <option value="Product Enquiry">Product Enquiry</option>
                <option value="Request for Information">Request for Information</option>
                <option value="Suggestions">Suggestions</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-container mb-4">
          <h5 className="mb-3 border-bottom pb-2">Contact Info</h5>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" value={form.email_id || ""} onChange={(e) => setField("email_id", e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Mobile No</label>
              <input className="form-control" value={form.mobile_no || ""} onChange={(e) => setField("mobile_no", e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Phone</label>
              <input className="form-control" value={form.phone || ""} onChange={(e) => setField("phone", e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Website</label>
              <input className="form-control" value={form.website || ""} onChange={(e) => setField("website", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-container mb-4">
          <h5 className="mb-3 border-bottom pb-2">Organization</h5>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Organization Name</label>
              <input className="form-control" value={form.company_name || ""} onChange={(e) => setField("company_name", e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Annual Revenue</label>
              <input type="number" className="form-control" value={form.annual_revenue || ""} onChange={(e) => setField("annual_revenue", e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Territory</label>
              <input className="form-control" value={form.territory || ""} onChange={(e) => setField("territory", e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">No of Employees</label>
              <select className="form-select" value={form.no_of_employees || ""} onChange={(e) => setField("no_of_employees", e.target.value)}>
                <option value="">Select</option>
                <option value="1-10">1-10</option>
                <option value="11-50">11-50</option>
                <option value="51-200">51-200</option>
                <option value="201-500">201-500</option>
                <option value="501-1000">501-1000</option>
                <option value="1000+">1000+</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Industry</label>
              <input className="form-control" value={form.industry || ""} onChange={(e) => setField("industry", e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Market Segment</label>
              <input className="form-control" value={form.market_segment || ""} onChange={(e) => setField("market_segment", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-container mb-4">
          <h5 className="mb-3 border-bottom pb-2">Address</h5>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">City</label>
              <input className="form-control" value={form.city || ""} onChange={(e) => setField("city", e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">State</label>
              <input className="form-control" value={form.state || ""} onChange={(e) => setField("state", e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Country</label>
              <input className="form-control" value={form.country || ""} onChange={(e) => setField("country", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary">Save</button>
          <Link to="/leads" className="btn btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
