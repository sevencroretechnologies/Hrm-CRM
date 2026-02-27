
import { Lead } from "@/types";
import { Mail, Phone, Globe, MapPin, Building, Briefcase } from "lucide-react";

interface LeadDetailsModalProps {
    lead: Lead;
    onClose: () => void;
}

export default function LeadDetailsModal({ lead, onClose }: LeadDetailsModalProps) {
    // Helper to format currency
    const formatCurrency = (amount: number | null) => {
        if (amount === null) return "-";
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    // Helper to format date
    const formatDate = (dateString: string | null) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex={-1}>
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Lead Details</h5>
                        <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        {/* Header Section */}
                        <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
                            <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: "64px", height: "64px" }}>
                                <span className="fs-3 fw-bold">{lead.first_name?.[0]}{lead.last_name?.[0]}</span>
                            </div>
                            <div>
                                <h4 className="mb-1">{lead.salutation} {lead.first_name} {lead.middle_name} {lead.last_name}</h4>
                                <div className="text-muted d-flex align-items-center gap-3">
                                    {lead.job_title && <span><Briefcase size={14} className="me-1" />{lead.job_title}</span>}
                                    {lead.company_name && <span><Building size={14} className="me-1" />{lead.company_name}</span>}
                                </div>
                            </div>
                            <div className="ms-auto text-end">
                                {lead.status && (
                                    <span className={`badge bg-${lead.status.status_name.toLowerCase().includes('won') ? 'success' : 'primary'} fs-6`}>
                                        {lead.status.status_name}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="row g-4">
                            {/* Personal Information */}
                            <div className="col-md-6">
                                <h6 className="fw-bold mb-3 text-uppercase small text-muted">Contact Information</h6>
                                <div className="d-flex flex-column gap-2">
                                    <div className="d-flex">
                                        <span className="text-muted" style={{ minWidth: "100px" }}><Mail size={14} className="me-1" /> Email:</span>
                                        <span className="fw-medium">{lead.email || "-"}</span>
                                    </div>
                                    <div className="d-flex">
                                        <span className="text-muted" style={{ minWidth: "100px" }}><Phone size={14} className="me-1" /> Phone:</span>
                                        <span className="fw-medium">{lead.phone || "-"}</span>
                                    </div>
                                    <div className="d-flex">
                                        <span className="text-muted" style={{ minWidth: "100px" }}><Phone size={14} className="me-1" /> Mobile:</span>
                                        <span className="fw-medium">{lead.mobile_no || "-"}</span>
                                    </div>
                                    <div className="d-flex">
                                        <span className="text-muted" style={{ minWidth: "100px" }}><Globe size={14} className="me-1" /> Website:</span>
                                        <span className="fw-medium">{lead.website ? <a href={lead.website} target="_blank" rel="noopener noreferrer">{lead.website}</a> : "-"}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Location */}
                            <div className="col-md-6">
                                <h6 className="fw-bold mb-3 text-uppercase small text-muted">Location</h6>
                                <div className="d-flex flex-column gap-2">
                                    <div className="d-flex">
                                        <span className="text-muted" style={{ minWidth: "100px" }}><MapPin size={14} className="me-1" /> City:</span>
                                        <span className="fw-medium">{lead.city || "-"}</span>
                                    </div>
                                    <div className="d-flex">
                                        <span className="text-muted" style={{ minWidth: "100px" }}><MapPin size={14} className="me-1" /> State:</span>
                                        <span className="fw-medium">{lead.state || "-"}</span>
                                    </div>
                                    <div className="d-flex">
                                        <span className="text-muted" style={{ minWidth: "100px" }}><MapPin size={14} className="me-1" /> Country:</span>
                                        <span className="fw-medium">{lead.country || "-"}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Company Details */}
                            <div className="col-12">
                                <h6 className="fw-bold mb-3 text-uppercase small text-muted border-top pt-3">Company Details</h6>
                                <div className="row g-3">
                                    <div className="col-md-4">
                                        <div className="text-muted small">Annual Revenue</div>
                                        <div className="fw-medium">{formatCurrency(lead.annual_revenue)}</div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="text-muted small">No. of Employees</div>
                                        <div className="fw-medium">{lead.no_of_employees || "-"}</div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="text-muted small">Industry</div>
                                        <div className="fw-medium">{lead.industry?.name || "-"}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Lead Source & Qualification */}
                            <div className="col-12">
                                <h6 className="fw-bold mb-3 text-uppercase small text-muted border-top pt-3">System Information</h6>
                                <div className="row g-3">
                                    <div className="col-md-3">
                                        <div className="text-muted small">Source</div>
                                        <div className="fw-medium">{lead.source?.name || "-"}</div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="text-muted small">Request Type</div>
                                        <div className="fw-medium">{lead.request_type?.name || "-"}</div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="text-muted small">Qualification Status</div>
                                        <div className="fw-medium">{lead.qualification_status || "-"}</div>
                                    </div>
                                    {/* <div className="col-md-3">
                                        <div className="text-muted small">Created At</div>
                                        <div className="fw-medium">{formatDate(lead.created_at)}</div>
                                    </div> */}
                                </div>
                            </div>

                        </div>
                    </div>
                    <div className="modal-footer bg-light">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
