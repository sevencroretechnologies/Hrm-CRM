
import { useState, useEffect } from "react"; // Added imports
import { Opportunity } from "@/types";
import { Briefcase, Building, Calendar, DollarSign, List } from "lucide-react";
import { opportunityApi } from "@/services/api"; // Added import

interface OpportunityDetailsModalProps {
    opportunity: Opportunity;
    onClose: () => void;
}

export default function OpportunityDetailsModal({ opportunity, onClose }: OpportunityDetailsModalProps) {
    const [items, setItems] = useState<any[]>([]); // Added state
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (opportunity.id) {
            setLoading(true);
            opportunityApi.getProducts(opportunity.id)
                .then(data => setItems(data))
                .catch(err => console.error("Failed to load products", err))
                .finally(() => setLoading(false));
        }
    }, [opportunity.id]);

    // Helper to format currency
    const formatCurrency = (amount: number | string | undefined | null) => {
        if (amount === undefined || amount === null) return "-";
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(amount));
    };

    // Helper to format date
    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString();
    };

    // Compute total from loaded items as fallback when opportunity_amount is not set
    const itemsTotal = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const displayAmount = opportunity.opportunity_amount ?? (itemsTotal > 0 ? itemsTotal : null);

    const partyName = (() => {
        if (opportunity.opportunity_from === 'lead' && opportunity.lead) {
            return `${opportunity.lead.first_name} ${opportunity.lead.last_name || ''}`.trim();
        }
        if (opportunity.opportunity_from === 'customer') {
            if (opportunity.customer) return opportunity.customer.name;
            if (opportunity.contact) return opportunity.contact.full_name || `${opportunity.contact.first_name} ${opportunity.contact.last_name}`.trim();
        }
        return opportunity.party_name || "—";
    })();

    return (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex={-1}>
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Opportunity Details</h5>
                        <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        {/* Header Section */}
                        <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
                            <div className="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: "64px", height: "64px" }}>
                                <span className="fs-3 fw-bold">OP</span>
                            </div>
                            <div>
                                <h4 className="mb-1">{opportunity.naming_series || opportunity.id}</h4>
                                <div className="text-muted d-flex align-items-center gap-2 flex-wrap mt-1">
                                    <span className="badge bg-secondary text-capitalize">
                                        <Briefcase size={11} className="me-1" />{opportunity.opportunity_from}
                                    </span>
                                    {opportunity.opportunity_type && (
                                        <span className="badge bg-primary">
                                            Type: {opportunity.opportunity_type.name}
                                        </span>
                                    )}
                                    {opportunity.source && (
                                        <span className="badge bg-info text-dark">
                                            Source: {opportunity.source.name}
                                        </span>
                                    )}
                                    <span className="text-muted small">
                                        <Building size={13} className="me-1" />{partyName}
                                    </span>
                                </div>
                            </div>
                            <div className="ms-auto text-end">
                                {opportunity.status && (
                                    <span className={`badge bg-${opportunity.status.status_name.toLowerCase().includes('won') ? 'success' : 'primary'} fs-6`}>
                                        {opportunity.status.status_name}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="row g-4">
                            {/* Overview */}
                            <div className="col-md-6">
                                <h6 className="fw-bold mb-3 text-uppercase small text-muted">Overview</h6>
                                <div className="d-flex flex-column gap-2">
                                    <div className="d-flex">
                                        <span className="text-muted" style={{ minWidth: "120px" }}>Type:</span>
                                        <span className="fw-medium">{opportunity.opportunity_type?.name || "-"}</span>
                                    </div>
                                    <div className="d-flex">
                                        <span className="text-muted" style={{ minWidth: "120px" }}>Status:</span>
                                        <span className="fw-medium">{opportunity.status?.status_name || "-"}</span>
                                    </div>
                                    <div className="d-flex">
                                        <span className="text-muted" style={{ minWidth: "120px" }}>Stage:</span>
                                        <span className="fw-medium">{opportunity.opportunity_stage?.name || "-"}</span>
                                    </div>
                                    <div className="d-flex">
                                        <span className="text-muted" style={{ minWidth: "120px" }}>Probability:</span>
                                        <span className="fw-medium">{opportunity.probability ? `${opportunity.probability}%` : "-"}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Dates & Amounts */}
                            <div className="col-md-6">
                                <h6 className="fw-bold mb-3 text-uppercase small text-muted">Details</h6>
                                <div className="d-flex flex-column gap-2">
                                    <div className="d-flex">
                                        <span className="text-muted" style={{ minWidth: "120px", marginRight:"20px"}}><Calendar size={14} className="me-1" /> Expected Close:</span>
                                        <span className="fw-medium">{formatDate(opportunity.expected_closing)}</span>
                                    </div>
                                    <div className="d-flex align-items-start">
                                        <span className="text-muted" style={{ minWidth: "120px" }}><DollarSign size={14} className="me-1" /> Amount:</span>
                                        <div>
                                            <span className="fw-bold text-success">{formatCurrency(displayAmount)}</span>
                                            {!opportunity.opportunity_amount && itemsTotal > 0 && (
                                                <div className="text-muted" style={{ fontSize: '0.72rem' }}>calculated from items</div>
                                            )}
                                        </div>
                                    </div>
                                    {/* <div className="d-flex">
                                        <span className="text-muted" style={{ minWidth: "120px" }}>Currency:</span>
                                        <span className="fw-medium">{opportunity.currency || "INR"}</span>
                                    </div> */}
                                </div>
                            </div>

                            {/* Items Section */}
                            <div className="col-12">
                                <h6 className="fw-bold mb-3 text-uppercase small text-muted border-top pt-3">
                                    <List size={16} className="me-1" /> Items
                                </h6>
                                {loading ? (
                                    <p className="text-muted small">Loading items...</p>
                                ) : items && items.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="table table-sm table-bordered">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Item Code</th>
                                                    <th>Product Name</th>
                                                    <th className="text-end">Qty</th>
                                                    {/* <th className="text-end">Rate</th> */}
                                                    <th className="text-end">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {items.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>{item.item_code || "-"}</td>
                                                        <td>{item.item_name || "-"}</td>
                                                        <td className="text-end">{item.qty}</td>
                                                        {/* <td className="text-end">{formatCurrency(item.rate)}</td> */}
                                                        <td className="text-end">{formatCurrency(item.amount)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-muted small">No items added to this opportunity.</p>
                                )}
                            </div>

                            {opportunity.next_contact_date && (
                                <div className="col-12">
                                    <h6 className="fw-bold mb-3 text-uppercase small text-muted border-top pt-3">Follow Up</h6>
                                    <div className="d-flex">
                                        <span className="text-muted" style={{ minWidth: "120px" }}>Next Contact:</span>
                                        <span className="fw-medium">{formatDate(opportunity.next_contact_date)}</span>
                                    </div>
                                    {opportunity.next_contact_by && (
                                        <div className="d-flex mt-1">
                                            <span className="text-muted" style={{ minWidth: "120px" }}>Contact By:</span>
                                            <span className="fw-medium">{opportunity.next_contact_by}</span>
                                        </div>
                                    )}
                                </div>
                            )}
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
