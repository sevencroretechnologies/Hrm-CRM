import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { contactApi, enumApi } from "@/services/api";
import type { EnumOption } from "@/services/api";
import type { ContactPhone, ContactEmail } from "@/types";
import Swal from "sweetalert2";
import { ArrowLeft, Plus, Trash2, Star } from "lucide-react";

const SALUTATIONS = ["Mr", "Mrs", "Ms", "Dr", "Prof"];
const CONTACT_STATUSES = ["Open", "Replied", "Closed"];

interface PhoneRow {
    phone_no: string;
    is_primary: boolean;
}

interface EmailRow {
    email: string;
    is_primary: boolean;
}

export default function ContactForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState<{
        salutation: string;
        first_name: string;
        middle_name: string;
        last_name: string;
        designation: string;
        gender: string;
        company_name: string;
        address: string;
        status: string;
    }>({
        salutation: "",
        first_name: "",
        middle_name: "",
        last_name: "",
        designation: "",
        gender: "",
        company_name: "",
        address: "",
        status: "Open",
    });

    const [phones, setPhones] = useState<PhoneRow[]>([
        { phone_no: "", is_primary: true },
    ]);

    const [emails, setEmails] = useState<EmailRow[]>([
        { email: "", is_primary: true },
    ]);

    const [genders, setGenders] = useState<EnumOption[]>([]);

    useEffect(() => {
        enumApi.genders().then(setGenders).catch(() => setGenders([]));
    }, []);

    useEffect(() => {
        if (id) {
            setLoading(true);
            contactApi
                .get(Number(id))
                .then((contact) => {
                    setForm({
                        salutation: contact.salutation || "",
                        first_name: contact.first_name || "",
                        middle_name: contact.middle_name || "",
                        last_name: contact.last_name || "",
                        designation: contact.designation || "",
                        gender: contact.gender || "",
                        company_name: contact.company_name || "",
                        address: contact.address || "",
                        status: contact.status || "Open",
                    });

                    if (contact.phones && contact.phones.length > 0) {
                        setPhones(
                            contact.phones.map((p: ContactPhone) => ({
                                phone_no: p.phone_no || "",
                                is_primary: p.is_primary,
                            }))
                        );
                    } else {
                        setPhones([{ phone_no: "", is_primary: true }]);
                    }

                    if (contact.emails && contact.emails.length > 0) {
                        setEmails(
                            contact.emails.map((e: ContactEmail) => ({
                                email: e.email || "",
                                is_primary: e.is_primary,
                            }))
                        );
                    } else {
                        setEmails([{ email: "", is_primary: true }]);
                    }
                })
                .finally(() => setLoading(false));
        }
    }, [id]);

    const setField = (key: string, value: string) =>
        setForm((p) => ({ ...p, [key]: value }));

    // Phone handlers
    const addPhone = () =>
        setPhones((p) => [...p, { phone_no: "", is_primary: false }]);

    const removePhone = (index: number) => {
        setPhones((p) => {
            const updated = p.filter((_, i) => i !== index);
            if (!updated.some((d) => d.is_primary) && updated.length > 0) {
                updated[0].is_primary = true;
            }
            return updated;
        });
    };

    const updatePhone = (index: number, key: keyof PhoneRow, value: string | boolean) => {
        setPhones((p) =>
            p.map((d, i) => {
                if (i === index) return { ...d, [key]: value };
                if (key === "is_primary" && value === true) return { ...d, is_primary: false };
                return d;
            })
        );
    };

    // Email handlers
    const addEmail = () =>
        setEmails((p) => [...p, { email: "", is_primary: false }]);

    const removeEmail = (index: number) => {
        setEmails((p) => {
            const updated = p.filter((_, i) => i !== index);
            if (!updated.some((d) => d.is_primary) && updated.length > 0) {
                updated[0].is_primary = true;
            }
            return updated;
        });
    };

    const updateEmail = (index: number, key: keyof EmailRow, value: string | boolean) => {
        setEmails((p) =>
            p.map((d, i) => {
                if (i === index) return { ...d, [key]: value };
                if (key === "is_primary" && value === true) return { ...d, is_primary: false };
                return d;
            })
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            salutation: form.salutation || null,
            first_name: form.first_name,
            middle_name: form.middle_name || null,
            last_name: form.last_name || null,
            designation: form.designation || null,
            gender: form.gender || null,
            company_name: form.company_name || null,
            address: form.address || null,
            status: form.status || "Open",
            phones: phones
                .filter((p) => p.phone_no.trim() !== "")
                .map((p) => ({ phone_no: p.phone_no.trim(), is_primary: p.is_primary })),
            emails: emails
                .filter((e) => e.email.trim() !== "")
                .map((e) => ({ email: e.email.trim(), is_primary: e.is_primary })),
        };

        try {
            if (isEdit) {
                await contactApi.update(Number(id), payload);
                Swal.fire("Updated!", "Contact has been updated.", "success");
            } else {
                await contactApi.create(payload);
                Swal.fire("Created!", "Contact has been created.", "success");
            }
            navigate("/contacts");
        } catch (err: any) {
            const message = err?.response?.data?.message || "Failed to save contact.";
            Swal.fire("Error", message, "error");
        }
    };

    if (loading) {
        return <div className="text-center py-5 text-muted">Loading...</div>;
    }

    return (
        <div>
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                        <Link to="/">CRM</Link>
                    </li>
                    <li className="breadcrumb-item">
                        <Link to="/contacts">Contacts</Link>
                    </li>
                    <li className="breadcrumb-item active">{isEdit ? "Edit" : "New"}</li>
                </ol>
            </nav>

            <div className="d-flex align-items-center mb-4">
                <Link to="/contacts" className="btn btn-outline-secondary me-3" title="Back to Contacts">
                    <ArrowLeft size={20} />
                </Link>
                <h2 className="mb-0">{isEdit ? "Edit Contact" : "New Contact"}</h2>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Personal Information */}
                <div className="form-container mb-4">
                    <h5 className="mb-3 border-bottom pb-2">Personal Information</h5>
                    <div className="row g-3">
                        <div className="col-md-2">
                            <label className="form-label">Salutation</label>
                            <select
                                className="form-select"
                                value={form.salutation}
                                onChange={(e) => setField("salutation", e.target.value)}
                            >
                                <option value="">Select</option>
                                {SALUTATIONS.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">
                                First Name <span className="text-danger">*</span>
                            </label>
                            <input
                                className="form-control"
                                value={form.first_name}
                                onChange={(e) => setField("first_name", e.target.value)}
                                required
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Middle Name</label>
                            <input
                                className="form-control"
                                value={form.middle_name}
                                onChange={(e) => setField("middle_name", e.target.value)}
                            />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">Last Name</label>
                            <input
                                className="form-control"
                                value={form.last_name}
                                onChange={(e) => setField("last_name", e.target.value)}
                            />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">Gender</label>
                            <select
                                className="form-select"
                                value={form.gender}
                                onChange={(e) => setField("gender", e.target.value)}
                            >
                                <option value="">Select</option>
                                {genders.map((g) => (
                                    <option key={g.value} value={g.value}>{g.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">Designation</label>
                            <input
                                className="form-control"
                                value={form.designation}
                                onChange={(e) => setField("designation", e.target.value)}
                            />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">Status</label>
                            <select
                                className="form-select"
                                value={form.status}
                                onChange={(e) => setField("status", e.target.value)}
                            >
                                {CONTACT_STATUSES.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Company Information */}
                <div className="form-container mb-4">
                    <h5 className="mb-3 border-bottom pb-2">Company Information</h5>
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label">Company Name</label>
                            <input
                                className="form-control"
                                value={form.company_name}
                                onChange={(e) => setField("company_name", e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Phone Numbers */}
                <div className="form-container mb-4">
                    <h5 className="mb-3 border-bottom pb-2 d-flex justify-content-between align-items-center">
                        Phone Numbers
                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={addPhone}>
                            <Plus size={14} className="me-1" /> Add Phone
                        </button>
                    </h5>
                    <div className="table-responsive">
                        <table className="table table-bordered mb-0 align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th style={{ width: "5%" }}>#</th>
                                    <th>Phone No</th>
                                    <th style={{ width: "15%" }} className="text-center">Primary</th>
                                    <th style={{ width: "10%" }} className="text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {phones.map((phone, index) => (
                                    <tr key={index}>
                                        <td className="text-muted">{index + 1}</td>
                                        <td>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                placeholder="Enter phone number"
                                                value={phone.phone_no}
                                                onChange={(e) => updatePhone(index, "phone_no", e.target.value)}
                                            />
                                        </td>
                                        <td className="text-center">
                                            <button
                                                type="button"
                                                className={`btn btn-sm ${phone.is_primary ? "btn-warning" : "btn-outline-secondary"}`}
                                                onClick={() => updatePhone(index, "is_primary", true)}
                                                title={phone.is_primary ? "Primary" : "Set as Primary"}
                                            >
                                                <Star size={14} fill={phone.is_primary ? "currentColor" : "none"} />
                                            </button>
                                        </td>
                                        <td className="text-center">
                                            {phones.length > 1 && (
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => removePhone(index)}
                                                    title="Remove"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Email Addresses */}
                <div className="form-container mb-4">
                    <h5 className="mb-3 border-bottom pb-2 d-flex justify-content-between align-items-center">
                        Email Addresses
                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={addEmail}>
                            <Plus size={14} className="me-1" /> Add Email
                        </button>
                    </h5>
                    <div className="table-responsive">
                        <table className="table table-bordered mb-0 align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th style={{ width: "5%" }}>#</th>
                                    <th>Email</th>
                                    <th style={{ width: "15%" }} className="text-center">Primary</th>
                                    <th style={{ width: "10%" }} className="text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {emails.map((emailRow, index) => (
                                    <tr key={index}>
                                        <td className="text-muted">{index + 1}</td>
                                        <td>
                                            <input
                                                type="email"
                                                className="form-control form-control-sm"
                                                placeholder="Enter email address"
                                                value={emailRow.email}
                                                onChange={(e) => updateEmail(index, "email", e.target.value)}
                                            />
                                        </td>
                                        <td className="text-center">
                                            <button
                                                type="button"
                                                className={`btn btn-sm ${emailRow.is_primary ? "btn-warning" : "btn-outline-secondary"}`}
                                                onClick={() => updateEmail(index, "is_primary", true)}
                                                title={emailRow.is_primary ? "Primary" : "Set as Primary"}
                                            >
                                                <Star size={14} fill={emailRow.is_primary ? "currentColor" : "none"} />
                                            </button>
                                        </td>
                                        <td className="text-center">
                                            {emails.length > 1 && (
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => removeEmail(index)}
                                                    title="Remove"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Address */}
                <div className="form-container mb-4">
                    <h5 className="mb-3 border-bottom pb-2">Address</h5>
                    <div className="row g-3">
                        <div className="col-md-8">
                            <label className="form-label">Address</label>
                            <textarea
                                className="form-control"
                                rows={3}
                                value={form.address}
                                onChange={(e) => setField("address", e.target.value)}
                                placeholder="Enter full address"
                            />
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary">
                        {isEdit ? "Update" : "Save"}
                    </button>
                    <Link to="/contacts" className="btn btn-secondary">
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
