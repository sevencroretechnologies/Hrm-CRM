import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { leadApi, statusApi, sourceApi, requestTypeApi, industryTypeApi, enumApi, userApi, EnumOption, User } from "@/services/api";
import type { Status, Source, RequestType, IndustryType } from "@/types";
import Swal from "sweetalert2";
import Skeleton from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

const SALUTATIONS = ["Mr.", "Mrs.", "Ms.", "Dr.", "Prof."];
const EMPLOYEE_RANGES = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];

export default function LeadForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Record<string, string | number | null>>({});

  // Dropdown options
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [requestTypes, setRequestTypes] = useState<RequestType[]>([]);
  const [industries, setIndustries] = useState<IndustryType[]>([]);
  const [genders, setGenders] = useState<EnumOption[]>([]);
  const [qualificationStatuses, setQualificationStatuses] = useState<EnumOption[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Load dropdown options
    Promise.all([
      statusApi.list(),
      sourceApi.list(),
      requestTypeApi.list(),
      industryTypeApi.list(),
      enumApi.genders(),
      enumApi.qualificationStatuses(),
      userApi.list(),
    ]).then(([statusRes, sourceRes, requestTypeRes, industryRes, genderRes, qualStatusRes, usersRes]) => {
      setStatuses(Array.isArray(statusRes) ? statusRes : []);
      setSources(Array.isArray(sourceRes) ? sourceRes : []);
      setRequestTypes(Array.isArray(requestTypeRes) ? requestTypeRes : []);
      setIndustries(Array.isArray(industryRes) ? industryRes : []);
      setGenders(Array.isArray(genderRes) ? genderRes : []);
      setQualificationStatuses(Array.isArray(qualStatusRes) ? qualStatusRes : []);
      setUsers(Array.isArray(usersRes) ? usersRes : []);
    });
  }, []);

  useEffect(() => {
    if (id) {
      setLoading(true);
      leadApi.get(Number(id)).then((lead) => {
        setForm({
          series: lead.series || "",
          salutation: lead.salutation || "",
          first_name: lead.first_name || "",
          middle_name: lead.middle_name || "",
          last_name: lead.last_name || "",
          job_title: lead.job_title || "",
          gender: lead.gender || "",
          status_id: lead.status_id || "",
          source_id: lead.source_id || "",
          request_type_id: lead.request_type_id || "",
          email: lead.email || "",
          phone: lead.phone || "",
          mobile_no: lead.mobile_no || "",
          website: lead.website || "",
          whatsapp_no: lead.whatsapp_no || "",
          city: lead.city || "",
          state: lead.state || "",
          country: lead.country || "",
          company_name: lead.company_name || "",
          annual_revenue: lead.annual_revenue?.toString() || "",
          no_of_employees: lead.no_of_employees || "",
          industry_id: lead.industry_id || "",
          qualification_status: lead.qualification_status || "",
          qualified_by: lead.qualified_by || "",
          qualified_on: lead.qualified_on ? lead.qualified_on.split('T')[0] : "",
        });
      }).finally(() => setLoading(false));
    }
  }, [id]);

  const setField = (key: string, value: string | number) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Convert empty strings to null for foreign keys
      const payload = { ...form };
      ['status_id', 'source_id', 'request_type_id', 'industry_id', 'qualified_by'].forEach(key => {
        if (payload[key] === '' || payload[key] === null) {
          payload[key] = null;
        }
      });
      // Convert empty date to null
      if (payload.qualified_on === '') {
        payload.qualified_on = null;
      }

      if (isEdit) {
        await leadApi.update(Number(id), payload);
        Swal.fire("Updated!", "Lead has been updated.", "success");
      } else {
        await leadApi.create(payload);
        Swal.fire("Created!", "Lead has been created.", "success");
      }
      navigate("/leads");
    } catch {
      Swal.fire("Error", "Failed to save lead.", "error");
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Skeleton className="d-inline-block" style={{ width: '40px', height: '20px' }} /></li>
            <li className="breadcrumb-item"><Skeleton className="d-inline-block" style={{ width: '50px', height: '20px' }} /></li>
            <li className="breadcrumb-item active"><Skeleton className="d-inline-block" style={{ width: '30px', height: '20px' }} /></li>
          </ol>
        </nav>
        <h2 className="mb-4"><Skeleton style={{ width: '200px', height: '32px' }} /></h2>

        {/* Personal Information Skeleton */}
        <div className="form-container mb-4">
          <h5 className="mb-3 border-bottom pb-2"><Skeleton style={{ width: '180px', height: '24px' }} /></h5>
          <div className="row g-3">
            {[...Array(7)].map((_, i) => (
              <div key={i} className={`col-md-${i === 0 || i === 1 || i === 3 ? '2' : i === 2 || i === 4 ? '3' : '4'}`}>
                <label className="form-label"><Skeleton style={{ width: '80px', height: '20px' }} /></label>
                <Skeleton className="form-control" style={{ height: '38px' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Lead Details Skeleton */}
        <div className="form-container mb-4">
          <h5 className="mb-3 border-bottom pb-2"><Skeleton style={{ width: '120px', height: '24px' }} /></h5>
          <div className="row g-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="col-md-4">
                <label className="form-label"><Skeleton style={{ width: '60px', height: '20px' }} /></label>
                <Skeleton className="form-select" style={{ height: '38px' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Contact Information Skeleton */}
        <div className="form-container mb-4">
          <h5 className="mb-3 border-bottom pb-2"><Skeleton style={{ width: '160px', height: '24px' }} /></h5>
          <div className="row g-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="col-md-4">
                <label className="form-label"><Skeleton style={{ width: '70px', height: '20px' }} /></label>
                <Skeleton className="form-control" style={{ height: '38px' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">CRM</Link></li>
          <li className="breadcrumb-item"><Link to="/leads">Leads</Link></li>
          <li className="breadcrumb-item active">{isEdit ? "Edit" : "New"}</li>
        </ol>
      </nav>
      <div className="d-flex align-items-center mb-4">
        <Link to="/leads" className="btn btn-outline-secondary me-3" title="Back to Leads">
          <ArrowLeft size={20} />
        </Link>
        <h2 className="mb-0">{isEdit ? "Edit Lead" : "New Lead"}</h2>
      </div>
      <form onSubmit={handleSubmit}>
        {/* Personal Information */}
        <div className="form-container mb-4">
          <h5 className="mb-3 border-bottom pb-2">Personal Information</h5>
          <div className="row g-3">

            <div className="col-md-2">
              <label className="form-label">Salutation</label>
              <select className="form-select" value={form.salutation?.toString() || ""} onChange={(e) => setField("salutation", e.target.value)}>
                <option value="">Select</option>
                {SALUTATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">First Name <span className="text-danger">*</span></label>
              <input className="form-control" value={form.first_name?.toString() || ""} onChange={(e) => setField("first_name", e.target.value)} required />
            </div>
            <div className="col-md-2">
              <label className="form-label">Middle Name</label>
              <input className="form-control" value={form.middle_name?.toString() || ""} onChange={(e) => setField("middle_name", e.target.value)} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Last Name</label>
              <input className="form-control" value={form.last_name?.toString() || ""} onChange={(e) => setField("last_name", e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Job Title</label>
              <input className="form-control" value={form.job_title?.toString() || ""} onChange={(e) => setField("job_title", e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Gender</label>
              <select className="form-select" value={form.gender?.toString() || ""} onChange={(e) => setField("gender", e.target.value)}>
                <option value="">Select</option>
                {genders.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Lead Details */}
        <div className="form-container mb-4">
          <h5 className="mb-3 border-bottom pb-2">Lead Details</h5>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status_id?.toString() || ""} onChange={(e) => setField("status_id", e.target.value)}>
                <option value="">Select Status</option>
                {statuses.map((s) => <option key={s.id} value={s.id}>{s.status_name}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Source</label>
              <select className="form-select" value={form.source_id?.toString() || ""} onChange={(e) => setField("source_id", e.target.value)}>
                <option value="">Select Source</option>
                {sources.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Request Type</label>
              <select className="form-select" value={form.request_type_id?.toString() || ""} onChange={(e) => setField("request_type_id", e.target.value)}>
                <option value="">Select Request Type</option>
                {requestTypes.map((rt) => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="form-container mb-4">
          <h5 className="mb-3 border-bottom pb-2">Contact Information</h5>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" value={form.email?.toString() || ""} onChange={(e) => setField("email", e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Phone</label>
              <input className="form-control" value={form.phone?.toString() || ""} onChange={(e) => setField("phone", e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Mobile No</label>
              <input className="form-control" value={form.mobile_no?.toString() || ""} onChange={(e) => setField("mobile_no", e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">WhatsApp No</label>
              <input className="form-control" value={form.whatsapp_no?.toString() || ""} onChange={(e) => setField("whatsapp_no", e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Website</label>
              <input className="form-control" value={form.website?.toString() || ""} onChange={(e) => setField("website", e.target.value)} />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="form-container mb-4">
          <h5 className="mb-3 border-bottom pb-2">Location</h5>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">City</label>
              <input className="form-control" value={form.city?.toString() || ""} onChange={(e) => setField("city", e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">State</label>
              <input className="form-control" value={form.state?.toString() || ""} onChange={(e) => setField("state", e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Country</label>
              <input className="form-control" value={form.country?.toString() || ""} onChange={(e) => setField("country", e.target.value)} />
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div className="form-container mb-4">
          <h5 className="mb-3 border-bottom pb-2">Company Information</h5>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Company Name</label>
              <input className="form-control" value={form.company_name?.toString() || ""} onChange={(e) => setField("company_name", e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Annual Revenue</label>
              <input type="number" className="form-control" value={form.annual_revenue?.toString() || ""} onChange={(e) => setField("annual_revenue", e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">No of Employees</label>
              <select className="form-select" value={form.no_of_employees?.toString() || ""} onChange={(e) => setField("no_of_employees", e.target.value)}>
                <option value="">Select</option>
                {EMPLOYEE_RANGES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Industry</label>
              <select className="form-select" value={form.industry_id?.toString() || ""} onChange={(e) => setField("industry_id", e.target.value)}>
                <option value="">Select Industry</option>
                {industries.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Qualification */}
        {/* <div className="form-container mb-4">
          <h5 className="mb-3 border-bottom pb-2">Qualification</h5>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Qualification Status</label>
              <select className="form-select" value={form.qualification_status?.toString() || ""} onChange={(e) => setField("qualification_status", e.target.value)}>
                <option value="">Select</option>
                {qualificationStatuses.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Qualified By</label>
              <select className="form-select" value={form.qualified_by?.toString() || ""} onChange={(e) => setField("qualified_by", e.target.value)}>
                <option value="">Select User</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Qualified On</label>
              <input type="date" className="form-control" value={form.qualified_on?.toString() || ""} onChange={(e) => setField("qualified_on", e.target.value)} />
            </div>
          </div>
        </div> */}

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary">Save</button>
          <Link to="/leads" className="btn btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
