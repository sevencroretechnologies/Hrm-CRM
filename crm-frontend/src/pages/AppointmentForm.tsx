import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { appointmentApi } from "@/services/api";
import Swal from "sweetalert2";

const STATUS_OPTIONS = ["Open", "Closed", "Cancelled"];

export default function AppointmentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({ status: "Open" });

  useEffect(() => {
    if (id) {
      setLoading(true);
      appointmentApi.get(Number(id)).then((item) => {
        setForm({
          scheduled_time: item.scheduled_time || "",
          status: item.status || "Open",
          customer_name: item.customer_name || "",
          customer_phone_number: item.customer_phone_number || "",
          customer_skype: item.customer_skype || "",
          customer_email: item.customer_email || "",
          customer_details: item.customer_details || "",
          appointment_with: item.appointment_with || "",
          party: item.party || "",
        });
      }).finally(() => setLoading(false));
    }
  }, [id]);

  const setField = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await appointmentApi.update(Number(id), form);
        Swal.fire("Updated!", "Appointment has been updated.", "success");
      } else {
        await appointmentApi.create(form);
        Swal.fire("Created!", "Appointment has been created.", "success");
      }
      navigate("/appointments");
    } catch {
      Swal.fire("Error", "Failed to save appointment.", "error");
    }
  };

  if (loading) return <div className="text-center py-5 text-muted">Loading...</div>;

  return (
    <div>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">CRM</Link></li>
          <li className="breadcrumb-item"><Link to="/appointments">Appointment</Link></li>
          <li className="breadcrumb-item active">{isEdit ? "Edit" : "New"}</li>
        </ol>
      </nav>
      <h2 className="mb-4">{isEdit ? "Edit Appointment" : "New Appointment"}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-container mb-4">
          <h5 className="mb-3 border-bottom pb-2">Appointment Details</h5>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Scheduled Time <span className="text-danger">*</span></label>
              <input type="datetime-local" className="form-control" value={form.scheduled_time || ""} onChange={(e) => setField("scheduled_time", e.target.value)} required />
            </div>
            <div className="col-md-4">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status || "Open"} onChange={(e) => setField("status", e.target.value)}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Appointment With</label>
              <input className="form-control" value={form.appointment_with || ""} onChange={(e) => setField("appointment_with", e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Party</label>
              <input className="form-control" value={form.party || ""} onChange={(e) => setField("party", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-container mb-4">
          <h5 className="mb-3 border-bottom pb-2">Customer Information</h5>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Customer Name <span className="text-danger">*</span></label>
              <input className="form-control" value={form.customer_name || ""} onChange={(e) => setField("customer_name", e.target.value)} required />
            </div>
            <div className="col-md-4">
              <label className="form-label">Customer Email <span className="text-danger">*</span></label>
              <input type="email" className="form-control" value={form.customer_email || ""} onChange={(e) => setField("customer_email", e.target.value)} required />
            </div>
            <div className="col-md-4">
              <label className="form-label">Customer Phone</label>
              <input className="form-control" value={form.customer_phone_number || ""} onChange={(e) => setField("customer_phone_number", e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Customer Skype</label>
              <input className="form-control" value={form.customer_skype || ""} onChange={(e) => setField("customer_skype", e.target.value)} />
            </div>
            <div className="col-md-12">
              <label className="form-label">Customer Details</label>
              <textarea className="form-control" rows={3} value={form.customer_details || ""} onChange={(e) => setField("customer_details", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary">Save</button>
          <Link to="/appointments" className="btn btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
