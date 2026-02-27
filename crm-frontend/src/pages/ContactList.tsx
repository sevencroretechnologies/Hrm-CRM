import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { contactApi } from "@/services/api";
import type { Contact, PaginatedResponse } from "@/types";
import { Plus, Trash2, Edit2, UserCircle, Search, Eye, ArrowLeft, ArrowRight, X, Phone, Mail, Star } from "lucide-react";
import Swal from "sweetalert2";

export default function ContactList() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(15);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchContacts = useCallback((page = 1) => {
        setLoading(true);
        const params: Record<string, string | number> = { page, per_page: perPage };
        if (search) params.search = search;
        contactApi
            .list(params)
            .then((data: PaginatedResponse<Contact>) => {
                setContacts(data.data || []);
                setCurrentPage(data.current_page);
                setTotalPages(data.last_page);
                setTotal(data.total);
            })
            .catch(() => setContacts([]))
            .finally(() => setLoading(false));
    }, [search, perPage]);

    useEffect(() => {
        fetchContacts();
    }, [fetchContacts]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchContacts(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [search, fetchContacts]);

    const getPrimaryPhone = (contact: Contact) => {
        const phones = contact.phones || [];
        return phones.find((p) => p.is_primary) || phones[0] || null;
    };

    const getPrimaryEmail = (contact: Contact) => {
        const emails = contact.emails || [];
        return emails.find((e) => e.is_primary) || emails[0] || null;
    };

    const viewContact = async (contact: Contact) => {
        const phones = contact.phones || [];
        const emails = contact.emails || [];

        const phonesHtml = phones.length > 0
            ? phones
                  .map(
                      (p) =>
                          `<tr>
                            <td>${p.phone_no || "—"}</td>
                            <td>${p.is_primary ? '<span class="badge bg-warning text-dark">Primary</span>' : ""}</td>
                          </tr>`
                  )
                  .join("")
            : '<tr><td colspan="2" class="text-muted text-center">No phone numbers</td></tr>';

        const emailsHtml = emails.length > 0
            ? emails
                  .map(
                      (e) =>
                          `<tr>
                            <td>${e.email || "—"}</td>
                            <td>${e.is_primary ? '<span class="badge bg-warning text-dark">Primary</span>' : ""}</td>
                          </tr>`
                  )
                  .join("")
            : '<tr><td colspan="2" class="text-muted text-center">No email addresses</td></tr>';

        await Swal.fire({
            title: contact.full_name,
            width: 650,
            html: `
                <div style="text-align:left;">
                    <table class="table table-borderless mb-3" style="font-size:0.9rem;">
                        <tr><td class="fw-semibold" style="width:140px;">Salutation</td><td>${contact.salutation || "—"}</td></tr>
                        <tr><td class="fw-semibold">First Name</td><td>${contact.first_name}</td></tr>
                        <tr><td class="fw-semibold">Middle Name</td><td>${contact.middle_name || "—"}</td></tr>
                        <tr><td class="fw-semibold">Last Name</td><td>${contact.last_name || "—"}</td></tr>
                        <tr><td class="fw-semibold">Gender</td><td>${contact.gender || "—"}</td></tr>
                        <tr><td class="fw-semibold">Designation</td><td>${contact.designation || "—"}</td></tr>
                        <tr><td class="fw-semibold">Company</td><td>${contact.company_name || "—"}</td></tr>
                        <tr><td class="fw-semibold">Status</td><td><span class="badge ${contact.status === "Open" ? "bg-success" : contact.status === "Replied" ? "bg-info" : "bg-secondary"}">${contact.status}</span></td></tr>
                        <tr><td class="fw-semibold">Address</td><td>${contact.address || "—"}</td></tr>
                        <tr><td class="fw-semibold">Created</td><td>${new Date(contact.created_at).toLocaleDateString()}</td></tr>
                    </table>
                    <h6 class="fw-semibold border-bottom pb-1">Phone Numbers</h6>
                    <table class="table table-sm table-bordered mb-3" style="font-size:0.85rem;">
                        <thead class="table-light"><tr><th>Phone</th><th style="width:80px;"></th></tr></thead>
                        <tbody>${phonesHtml}</tbody>
                    </table>
                    <h6 class="fw-semibold border-bottom pb-1">Email Addresses</h6>
                    <table class="table table-sm table-bordered" style="font-size:0.85rem;">
                        <thead class="table-light"><tr><th>Email</th><th style="width:80px;"></th></tr></thead>
                        <tbody>${emailsHtml}</tbody>
                    </table>
                </div>
            `,
            confirmButtonText: "Close",
            confirmButtonColor: "#6c757d",
        });
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: "Delete Contact?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            confirmButtonText: "Delete",
        });
        if (result.isConfirmed) {
            try {
                await contactApi.delete(id);
                Swal.fire("Deleted!", "Contact has been deleted.", "success");
                fetchContacts(currentPage);
            } catch {
                Swal.fire("Error", "Failed to delete contact.", "error");
            }
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
                    <li className="breadcrumb-item active">Contacts</li>
                </ol>
            </nav>

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">
                    <UserCircle size={24} className="me-2 text-primary" />
                    Contacts
                    <small className="text-muted ms-2" style={{ fontSize: "0.5em" }}>({total})</small>
                </h2>
                <Link to="/contacts/new" className="btn btn-primary">
                    <Plus size={18} className="me-1" /> Add Contact
                </Link>
            </div>

            <div className="row g-2 mb-3">
                <div className="col-md-4">
                    <div className="position-relative">
                        <Search size={16} className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
                        <input
                            type="text"
                            className="form-control ps-5"
                            placeholder="Search contacts..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                            <button
                                className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-muted"
                                onClick={() => setSearch("")}
                                style={{ textDecoration: "none" }}
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-body p-0">
                    <table className="table table-hover mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>#</th>
                                <th>Full Name</th>
                                <th>Company</th>
                                <th>Designation</th>
                                <th>Phone</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contacts.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="text-center text-muted py-4">
                                        No contacts found. Click "Add Contact" to create one.
                                    </td>
                                </tr>
                            )}
                            {contacts.map((contact, index) => {
                                const primaryPhone = getPrimaryPhone(contact);
                                const primaryEmail = getPrimaryEmail(contact);
                                const phoneCount = (contact.phones || []).length;
                                const emailCount = (contact.emails || []).length;
                                return (
                                    <tr key={contact.id}>
                                        <td>{(currentPage - 1) * perPage + index + 1}</td>
                                        <td>
                                            <span className="fw-medium">{contact.full_name}</span>
                                        </td>
                                        <td>{contact.company_name || <span className="text-muted">—</span>}</td>
                                        <td>{contact.designation || <span className="text-muted">—</span>}</td>
                                        <td>
                                            {primaryPhone?.phone_no ? (
                                                <div className="d-flex align-items-center gap-1">
                                                    <Phone size={13} className="text-muted" />
                                                    <span>{primaryPhone.phone_no}</span>
                                                    {primaryPhone.is_primary && (
                                                        <Star size={10} className="text-warning" fill="currentColor" />
                                                    )}
                                                    {phoneCount > 1 && (
                                                        <span className="badge bg-light text-dark border" style={{ fontSize: "0.7em" }}>
                                                            +{phoneCount - 1}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-muted">—</span>
                                            )}
                                        </td>
                                        <td>
                                            {primaryEmail?.email ? (
                                                <div className="d-flex align-items-center gap-1">
                                                    <Mail size={13} className="text-muted" />
                                                    <span style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "inline-block" }}>
                                                        {primaryEmail.email}
                                                    </span>
                                                    {primaryEmail.is_primary && (
                                                        <Star size={10} className="text-warning" fill="currentColor" />
                                                    )}
                                                    {emailCount > 1 && (
                                                        <span className="badge bg-light text-dark border" style={{ fontSize: "0.7em" }}>
                                                            +{emailCount - 1}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-muted">—</span>
                                            )}
                                        </td>
                                        <td>
                                            <span
                                                className={`badge ${
                                                    contact.status === "Open"
                                                        ? "bg-success"
                                                        : contact.status === "Replied"
                                                        ? "bg-info text-dark"
                                                        : "bg-secondary"
                                                }`}
                                            >
                                                {contact.status}
                                            </span>
                                        </td>
                                        <td className="text-end">
                                            <button
                                                className="btn btn-sm btn-outline-secondary me-1"
                                                onClick={() => viewContact(contact)}
                                                title="View"
                                            >
                                                <Eye size={14} />
                                            </button>
                                            <Link
                                                to={`/contacts/${contact.id}/edit`}
                                                className="btn btn-sm btn-outline-primary me-1"
                                                title="Edit"
                                            >
                                                <Edit2 size={14} />
                                            </Link>
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleDelete(contact.id)}
                                                title="Delete"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {total > 0 && (
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-3 px-3 pb-3 border-top pt-3">
                        <div className="d-flex align-items-center mb-2 mb-md-0">
                            <span className="small text-muted me-2">Rows per page:</span>
                            <select
                                className="form-select form-select-sm"
                                style={{ width: "auto" }}
                                value={perPage}
                                onChange={(e) => {
                                    setPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                            >
                                {[10, 15, 20, 25, 50].map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>
                            <div className="small text-muted ms-3">
                                {(currentPage - 1) * perPage + 1}-
                                {Math.min(currentPage * perPage, total)} of {total}
                            </div>
                        </div>
                        <nav>
                            <ul className="pagination pagination-sm mb-0">
                                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                    <button 
                                        className="page-link border-0" 
                                        onClick={() => fetchContacts(currentPage - 1)} 
                                        disabled={currentPage === 1}
                                        title="Previous Page"
                                    >
                                        <ArrowLeft size={16} />
                                    </button>
                                </li>
                                <li className="page-item disabled">
                                    <span className="page-link border-0 text-dark bg-transparent font-weight-bold">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                </li>
                                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                    <button 
                                        className="page-link border-0" 
                                        onClick={() => fetchContacts(currentPage + 1)} 
                                        disabled={currentPage === totalPages}
                                        title="Next Page"
                                    >
                                        <ArrowRight size={16} />
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                )}
            </div>
        </div>
    );
}
