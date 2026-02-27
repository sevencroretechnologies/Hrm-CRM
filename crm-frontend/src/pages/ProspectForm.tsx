import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { prospectApi, statusApi, sourceApi, industryTypeApi, territoryApi, customerGroupApi } from "@/services/api";
import type { Status, Source, IndustryType, Territory, CustomerGroup } from "@/types";
import Swal from "sweetalert2";

export default function ProspectForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  const [statuses, setStatuses] = useState<Status[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [industries, setIndustries] = useState<IndustryType[]>([]);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [customerGroups, setCustomerGroups] = useState<CustomerGroup[]>([]);

  useEffect(() => {
    Promise.all([
      statusApi.list(),
      sourceApi.list(),
      industryTypeApi.list(),
      territoryApi.list(),
      // customerGroupApi.list(),
    ]).then(([statusRes, sourceRes, industryRes, territoryRes]) => {
      setStatuses(Array.isArray(statusRes) ? statusRes : []);
      setSources(Array.isArray(sourceRes) ? sourceRes : []);
      setIndustries(Array.isArray(industryRes) ? industryRes : []);
      setTerritories(Array.isArray(territoryRes) ? territoryRes : []);
      // setCustomerGroups(Array.isArray(customerGroupRes) ? customerGroupRes : []);
    });
  }, []);

  useEffect(() => {
    if (id) {
      setLoading(true);
      prospectApi.get(Number(id)).then((item) => {
        console.log("Prospect Data:", item); // Debugging
        setForm({
          company_name: item.company_name || "",
          status: item.status || "New",
          source: item.source || "",
          industry: item.industry || "",
          market_segment: item.market_segment || "",
          customer_group: item.customer_group || "",
          territory: item.territory || "",
          no_of_employees: item.no_of_employees || "",
          annual_revenue: item.annual_revenue?.toString() || "",
          fax: item.fax || "",
          website: item.website || "",
          email: item.email || "",
          phone: item.phone || "",
          address: item.address || "",
          city: item.city || "",
          state: item.state || "",
          country: item.country || "",
          zip_code: item.zip_code || "",
        });
      }).finally(() => setLoading(false));
    }
  }, [id]);

  const setField = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await prospectApi.update(Number(id), form);
        Swal.fire("Updated!", "Prospect has been updated.", "success");
      } else {
        await prospectApi.create(form);
        Swal.fire("Created!", "Prospect has been created.", "success");
      }
      navigate("/prospects");
    } catch {
      Swal.fire("Error", "Failed to save prospect.", "error");
    }
  };

  // if (loading) return <div className="text-center py-5 text-muted">Loading...</div>;

  return (
    <div>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">CRM</Link></li>
          <li className="breadcrumb-item"><Link to="/prospects">Prospect</Link></li>
          <li className="breadcrumb-item active">{isEdit ? "Edit" : "New"}</li>
        </ol>
      </nav>
      <h2 className="mb-4">{isEdit ? "Edit Prospect" : "New Prospect"}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-container mb-4">
          <h5 className="mb-3 border-bottom pb-2">Company Information</h5>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Company Name <span className="text-danger">*</span></label>
              <input className="form-control" value={form.company_name || ""} onChange={(e) => setField("company_name", e.target.value)} required />
            </div>
            <div className="col-md-4">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status || "New"} onChange={(e) => setField("status", e.target.value)}>
                <option value="New">New</option>
                {statuses.map((s) => <option key={s.id} value={s.status_name}>{s.status_name}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Source</label>
              <select className="form-select" value={form.source || ""} onChange={(e) => setField("source", e.target.value)}>
                <option value="">Select Source</option>
                {sources.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Industry</label>
              <select className="form-select" value={form.industry || ""} onChange={(e) => setField("industry", e.target.value)}>
                <option value="">Select Industry</option>
                {industries.map((i) => <option key={i.id} value={i.name}>{i.name}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Market Segment</label>
              <input className="form-control" value={form.market_segment || ""} onChange={(e) => setField("market_segment", e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Customer Group</label>
              <input className="form-control" value={form.customer_group || ""} onChange={(e) => setField("customer_group", e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Territory</label>
              <select className="form-select" value={form.territory || ""} onChange={(e) => setField("territory", e.target.value)}>
                <option value="">Select Territory</option>
                {territories.map((t) => <option key={t.id} value={t.territory_name}>{t.territory_name}</option>)}
              </select>
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
              <label className="form-label">Annual Revenue</label>
              <input type="number" className="form-control" value={form.annual_revenue || ""} onChange={(e) => setField("annual_revenue", e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Website</label>
              <input className="form-control" value={form.website || ""} onChange={(e) => setField("website", e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Fax</label>
              <input className="form-control" value={form.fax || ""} onChange={(e) => setField("fax", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-container mb-4">
          <h5 className="mb-3 border-bottom pb-2">Contact Information</h5>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-control" value={form.email || ""} onChange={(e) => setField("email", e.target.value)} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Phone / Mobile</label>
              <input type="tel" className="form-control" value={form.phone || ""} onChange={(e) => setField("phone", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-container mb-4">
          <h5 className="mb-3 border-bottom pb-2">Address</h5>
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label">Address</label>
              <textarea className="form-control" rows={3} value={form.address || ""} onChange={(e) => setField("address", e.target.value)}></textarea>
            </div>
            <div className="col-md-3">
              <label className="form-label">City</label>
              <input className="form-control" value={form.city || ""} onChange={(e) => setField("city", e.target.value)} />
            </div>
            <div className="col-md-3">
              <label className="form-label">State</label>
              <input className="form-control" value={form.state || ""} onChange={(e) => setField("state", e.target.value)} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Country</label>
              <input className="form-control" value={form.country || ""} onChange={(e) => setField("country", e.target.value)} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Zip Code</label>
              <input className="form-control" value={form.zip_code || ""} onChange={(e) => setField("zip_code", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary">Save</button>
          <Link to="/prospects" className="btn btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
