import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
    customerApi,
    customerGroupApi,
    territoryApi,
    leadApi,
    opportunityApi,
    industryTypeApi,
    priceListApi,
    paymentTermApi,
    contactApi,
    enumApi
} from "@/services/api";
import type {
    CustomerGroup,
    Territory,
    Lead,
    Opportunity,
    IndustryType,
    PriceList,
    PaymentTerm,
    Contact,
    // EnumOption
} from "@/types";
import Swal from "sweetalert2";
import Skeleton from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

export default function CustomerForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState<Record<string, string | number | null>>({});

    // Dropdown options
    const [customerGroups, setCustomerGroups] = useState<CustomerGroup[]>([]);
    const [territories, setTerritories] = useState<Territory[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [industries, setIndustries] = useState<IndustryType[]>([]);
    const [priceLists, setPriceLists] = useState<PriceList[]>([]);
    const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [customerTypes, setCustomerTypes] = useState<string[]>(['Company', 'Individual', 'Partnership']); // Static as it's an Enum string now

    useEffect(() => {
        // Load dropdown options
        Promise.all([
            customerGroupApi.list(),
            territoryApi.list(),
            leadApi.list(),
            opportunityApi.list(),
            industryTypeApi.list(),
            priceListApi.list(),
            paymentTermApi.list(),
            contactApi.list()
        ]).then(([groupsRes, territoriesRes, leadsRes, oppsRes, indRes, pricesRes, termsRes, contactsRes]) => {
            setCustomerGroups(groupsRes);
            setTerritories(territoriesRes);
            setLeads(Array.isArray(leadsRes) ? leadsRes : leadsRes.data || []);
            setOpportunities(Array.isArray(oppsRes) ? oppsRes : oppsRes.data || []);
            setIndustries(indRes);
            setPriceLists(pricesRes);
            setPaymentTerms(termsRes);
            setContacts(Array.isArray(contactsRes) ? contactsRes : contactsRes.data || []);
        });
    }, []);

    useEffect(() => {
        if (id) {
            setLoading(true);
            customerApi.get(Number(id)).then((customer) => {
                setForm({
                    name: customer.name || "",
                    customer_type: customer.customer_type || "",
                    customer_group_id: customer.customer_group_id || "",
                    territory_id: customer.territory_id || "",
                    lead_id: customer.lead_id || "",
                    opportunity_id: customer.opportunity_id || "",
                    industry_id: customer.industry_id || "",
                    default_price_list_id: customer.default_price_list_id || "",
                    payment_term_id: customer.payment_term_id || "",
                    customer_contact_id: customer.customer_contact_id || "",
                    email: customer.email || "",
                    phone: customer.phone || "",
                    website: customer.website || "",
                    tax_id: customer.tax_id || "",
                    billing_currency: customer.billing_currency || "",
                    bank_account_details: customer.bank_account_details || "",
                    print_language: customer.print_language || "",
                    customer_details: customer.customer_details || "",
                });
            }).finally(() => setLoading(false));
        }
    }, [id]);

    const setField = (key: string, value: string | number) => setForm((p) => ({ ...p, [key]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = { ...form };
            // Convert empty strings to null for relations
            const nullableFields = [
                'customer_group_id', 'territory_id', 'lead_id', 'opportunity_id',
                'industry_id', 'default_price_list_id', 'payment_term_id', 'customer_contact_id'
            ];
            nullableFields.forEach(key => {
                if (payload[key] === '' || payload[key] === null) {
                    payload[key] = null;
                }
            });

            if (isEdit) {
                await customerApi.update(Number(id), payload);
                Swal.fire("Updated!", "Customer has been updated.", "success");
            } else {
                await customerApi.create(payload);
                Swal.fire("Created!", "Customer has been created.", "success");
            }
            navigate("/customers");
        } catch {
            Swal.fire("Error", "Failed to save customer.", "error");
        }
    };

    return (
        <div>
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item"><Link to="/">CRM</Link></li>
                    <li className="breadcrumb-item"><Link to="/customers">Customers</Link></li>
                    <li className="breadcrumb-item active">{isEdit ? "Edit" : "New"}</li>
                </ol>
            </nav>
            <div className="d-flex align-items-center mb-4">
                <Link to="/customers" className="btn btn-outline-secondary me-3" title="Back">
                    <ArrowLeft size={20} />
                </Link>
                <h2 className="mb-0">{isEdit ? "Edit Customer" : "New Customer"}</h2>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Basic Info */}
                <div className="form-container mb-4">
                    <h5 className="mb-3 border-bottom pb-2">Basic Information</h5>
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label">Customer Name <span className="text-danger">*</span></label>
                            <input className="form-control" value={form.name?.toString() || ""} onChange={(e) => setField("name", e.target.value)} required />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Customer Type</label>
                            <select className="form-select" value={form.customer_type?.toString() || ""} onChange={(e) => setField("customer_type", e.target.value)}>
                                <option value="">Select Type</option>
                                {customerTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Customer Group</label>
                            <select className="form-select" value={form.customer_group_id?.toString() || ""} onChange={(e) => setField("customer_group_id", e.target.value)}>
                                <option value="">Select Group</option>
                                {customerGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Classification */}
                <div className="form-container mb-4">
                    <h5 className="mb-3 border-bottom pb-2">Classification & Relations</h5>
                    <div className="row g-3">
                        <div className="col-md-4">
                            <label className="form-label">Territory</label>
                            <select className="form-select" value={form.territory_id?.toString() || ""} onChange={(e) => setField("territory_id", e.target.value)}>
                                <option value="">Select Territory</option>
                                {territories.map(t => <option key={t.id} value={t.id}>{t.territory_name}</option>)}
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">Leads</label>
                            <select className="form-select" value={form.lead_id?.toString() || ""} onChange={(e) => setField("lead_id", e.target.value)}>
                                <option value="">Select Lead</option>
                                {leads.map(l => <option key={l.id} value={l.id}>{l.first_name} {l.last_name}</option>)}
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">Opportunity</label>
                            <select className="form-select" value={form.opportunity_id?.toString() || ""} onChange={(e) => setField("opportunity_id", e.target.value)}>
                                <option value="">Select Opportunity</option>
                                {opportunities.map(o => <option key={o.id} value={o.id}>{o.party_name}</option>)}
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">Industry</label>
                            <select className="form-select" value={form.industry_id?.toString() || ""} onChange={(e) => setField("industry_id", e.target.value)}>
                                <option value="">Select Industry</option>
                                {industries.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                            </select>
                        </div>
                        {/* <div className="col-md-4">
                            <label className="form-label">Primary Contact</label>
                            <select className="form-select" value={form.customer_contact_id?.toString() || ""} onChange={(e) => setField("customer_contact_id", e.target.value)}>
                                <option value="">Select Contact</option>
                                {contacts.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                            </select>
                        </div> */}
                    </div>
                </div>

                {/* Contact info */}
                <div className="form-container mb-4">
                    <h5 className="mb-3 border-bottom pb-2">Contact Details</h5>
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label">Email</label>
                            <input type="email" className="form-control" value={form.email?.toString() || ""} onChange={(e) => setField("email", e.target.value)} />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Phone</label>
                            <input className="form-control" value={form.phone?.toString() || ""} onChange={(e) => setField("phone", e.target.value)} />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Website</label>
                            <input className="form-control" value={form.website?.toString() || ""} onChange={(e) => setField("website", e.target.value)} />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Print Language</label>
                            <input className="form-control" value={form.print_language?.toString() || ""} onChange={(e) => setField("print_language", e.target.value)} />
                        </div>
                    </div>
                </div>

                {/* Sales & Accounting */}
                <div className="form-container mb-4">
                    <h5 className="mb-3 border-bottom pb-2">Sales & Accounting</h5>
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label">Default Price List</label>
                            <select className="form-select" value={form.default_price_list_id?.toString() || ""} onChange={(e) => setField("default_price_list_id", e.target.value)}>
                                <option value="">Select Price List</option>
                                {priceLists.map(p => <option key={p.id} value={p.id}>{p.name} ({p.currency})</option>)}
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Payment Terms</label>
                            <select className="form-select" value={form.payment_term_id?.toString() || ""} onChange={(e) => setField("payment_term_id", e.target.value)}>
                                <option value="">Select Payment Term</option>
                                {paymentTerms.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Billing Currency</label>
                            <input className="form-control" value={form.billing_currency?.toString() || ""} onChange={(e) => setField("billing_currency", e.target.value)} />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Tax ID</label>
                            <input className="form-control" value={form.tax_id?.toString() || ""} onChange={(e) => setField("tax_id", e.target.value)} />
                        </div>
                        <div className="col-12">
                            <label className="form-label">Bank Account Details</label>
                            <textarea className="form-control" rows={3} value={form.bank_account_details?.toString() || ""} onChange={(e) => setField("bank_account_details", e.target.value)}></textarea>
                        </div>
                    </div>
                </div>

                {/* Other Details */}
                <div className="form-container mb-4">
                    <h5 className="mb-3 border-bottom pb-2">Other Details</h5>
                    <div className="row g-3">
                        <div className="col-12">
                            <label className="form-label">Customer Details</label>
                            <textarea className="form-control" rows={3} value={form.customer_details?.toString() || ""} onChange={(e) => setField("customer_details", e.target.value)}></textarea>
                        </div>
                    </div>
                </div>

                <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary">Save</button>
                    <Link to="/customers" className="btn btn-secondary">Cancel</Link>
                </div>
            </form>
        </div>
    );
}
