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
    enumApi,
    EnumOption
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
} from "@/types";
import { showAlert, getErrorMessage } from "@/lib/sweetalert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Loader2, ChevronLeft, Plus, Trash2, Star } from "lucide-react";
import { set } from "date-fns";

const CUSTOMER_TYPES = ['Company', 'Individual', 'Partnership'];
const SALUTATIONS = ["Mr", "Mrs", "Ms", "Dr", "Prof"];

interface PhoneRow {
    phone_no: string;
    is_primary: boolean;
}

interface EmailRow {
    email: string;
    is_primary: boolean;
}

export default function CustomerForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState<Record<string, any>>({
        name: "",
        customer_type: "",
        customer_group_id: "",
        territory_id: "",
        lead_id: "",
        opportunity_id: "",
        industry_id: "",
        default_price_list_id: "",
        payment_term_id: "",
        customer_contact_id: "",
        email: "",
        phone: "",
        website: "",
        tax_id: "",
        billing_currency: "",
        bank_account_details: "",
        print_language: "",
        customer_details: "",
    });

    // Contact Details State
    const [includeContact, setIncludeContact] = useState(false);
    const [genders, setGenders] = useState<EnumOption[]>([]);
    const [contactForm, setContactForm] = useState({
        salutation: "",
        first_name: "",
        middle_name: "",
        last_name: "",
        designation: "",
        gender: "",
    });
    const [contactPhones, setContactPhones] = useState<PhoneRow[]>([
        { phone_no: "", is_primary: true },
    ]);
    const [contactEmails, setContactEmails] = useState<EmailRow[]>([
        { email: "", is_primary: true },
    ]);

    // Dropdown options
    const [customerGroups, setCustomerGroups] = useState<CustomerGroup[]>([]);
    const [territories, setTerritories] = useState<Territory[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [industries, setIndustries] = useState<IndustryType[]>([]);
    const [priceLists, setPriceLists] = useState<PriceList[]>([]);
    const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);

    useEffect(() => {
        enumApi.genders().then(setGenders).catch(() => setGenders([]));
    }, []);

    useEffect(() => {
        const loadOptions = async () => {
            try {
                setLoading(true);
                const fetchResilient = async (apiCall: () => Promise<any>) => {
                    try {
                        return await apiCall();
                    } catch (err) {
                        return [];
                    }
                };

                const [
                    groupsRes,
                    territoriesRes,
                    leadsRes,
                    oppsRes,
                    indRes,
                    pricesRes,
                    termsRes,
                    contactsRes
                ] = await Promise.all([
                    fetchResilient(() => customerGroupApi.list()),
                    fetchResilient(() => territoryApi.list()),
                    fetchResilient(() => leadApi.getLead()),
                    fetchResilient(() => opportunityApi.getOpportunity()),
                    fetchResilient(() => industryTypeApi.list()),
                    fetchResilient(() => priceListApi.list()),
                    fetchResilient(() => paymentTermApi.list()),
                    fetchResilient(() => contactApi.list()),
                ]);

                const extractData = (res: any) => {
                    if (!res) return [];
                    if (Array.isArray(res)) return res;
                    if (res.data && Array.isArray(res.data)) return res.data;
                    if (res.data && res.data.data && Array.isArray(res.data.data)) return res.data.data;
                    return [];
                };

                setCustomerGroups(groupsRes || []);
                setTerritories(territoriesRes || []);
                setLeads(extractData(leadsRes));
                setOpportunities(extractData(oppsRes));
                setIndustries(indRes || []);
                setPriceLists(pricesRes || []);
                setPaymentTerms(termsRes || []);
                setContacts(extractData(contactsRes));

                console.log("CRM Options Loaded:", {
                    leads: extractData(leadsRes).length,
                    opportunities: extractData(oppsRes).length,
                    contacts: extractData(contactsRes).length
                });
            } catch (error) {
                console.error("Critical error in loadOptions:", error);
            }
            finally {
                setLoading(false);
            }
        };

        loadOptions();
    }, []);

    useEffect(() => {
        if (id) {
            const fetchCustomer = async () => {
                setLoading(true);
                try {
                    const customer = await customerApi.get(Number(id));
                    setForm({
                        name: customer.name || "",
                        customer_type: customer.customer_type || "",
                        customer_group_id: customer.customer_group_id?.toString() || "",
                        territory_id: customer.territory_id?.toString() || "",
                        lead_id: customer.lead_id?.toString() || "",
                        opportunity_id: customer.opportunity_id?.toString() || "",
                        industry_id: customer.industry_id?.toString() || "",
                        default_price_list_id: customer.default_price_list_id?.toString() || "",
                        payment_term_id: customer.payment_term_id?.toString() || "",
                        customer_contact_id: customer.customer_contact_id?.toString() || "",
                        email: customer.email || "",
                        phone: customer.phone || "",
                        website: customer.website || "",
                        tax_id: customer.tax_id || "",
                        billing_currency: customer.billing_currency || "",
                        bank_account_details: customer.bank_account_details || "",
                        print_language: customer.print_language || "",
                        customer_details: customer.customer_details || "",
                    });

                    if (customer.customer_contact_id && customer.primary_contact) {
                        setIncludeContact(true);
                        const contact = customer.primary_contact;
                        setContactForm({
                            salutation: contact.salutation || "",
                            first_name: contact.first_name || "",
                            middle_name: contact.middle_name || "",
                            last_name: contact.last_name || "",
                            designation: contact.designation || "",
                            gender: contact.gender || "",
                        });
                        
                        if (contact.phones && contact.phones.length > 0) {
                            setContactPhones(
                                (contact.phones as any[]).map((p) => ({
                                    phone_no: p.phone_no || "",
                                    is_primary: p.is_primary,
                                }))
                            );
                        } else {
                            setContactPhones([{ phone_no: "", is_primary: true }]);
                        }

                        if (contact.emails && contact.emails.length > 0) {
                            setContactEmails(
                                (contact.emails as any[]).map((e) => ({
                                    email: e.email || "",
                                    is_primary: e.is_primary,
                                }))
                            );
                        } else {
                            setContactEmails([{ email: "", is_primary: true }]);
                        }
                    }
                } catch (error) {
                    showAlert("error", "Error", getErrorMessage(error, "Failed to fetch customer details"));
                    navigate("/crm/customers");
                } finally {
                    setLoading(false);
                }
            };
            fetchCustomer();
        }
    }, [id, navigate]);

    const setField = (key: string, value: any) => setForm((p) => ({ ...p, [key]: value }));
    const setContactField = (key: string, value: any) => setContactForm((p) => ({ ...p, [key]: value }));

    const getOpportunityLabel = (o: Opportunity) => {
        if (o.party_name) return o.party_name;
        if (o.opportunity_from === 'lead' && o.lead) {
            return `${o.lead.first_name || ""} ${o.lead.last_name || ""}`.trim();
        }
        return o.naming_series || `ID: ${o.id}`;
    };

    // Phone Handlers
    const addContactPhone = () => setContactPhones((p) => [...p, { phone_no: "", is_primary: false }]);
    const removeContactPhone = (index: number) => {
        setContactPhones((p) => {
            const updated = p.filter((_, i) => i !== index);
            if (!updated.some((d) => d.is_primary) && updated.length > 0) {
                updated[0].is_primary = true;
            }
            return updated;
        });
    };
    const updateContactPhone = (index: number, key: keyof PhoneRow, value: string | boolean) => {
        setContactPhones((p) =>
            p.map((d, i) => {
                if (i === index) return { ...d, [key]: value };
                if (key === "is_primary" && value === true) return { ...d, is_primary: false };
                return d;
            })
        );
    };

    // Email Handlers
    const addContactEmail = () => setContactEmails((p) => [...p, { email: "", is_primary: false }]);
    const removeContactEmail = (index: number) => {
        setContactEmails((p) => {
            const updated = p.filter((_, i) => i !== index);
            if (!updated.some((d) => d.is_primary) && updated.length > 0) {
                updated[0].is_primary = true;
            }
            return updated;
        });
    };
    const updateContactEmail = (index: number, key: keyof EmailRow, value: string | boolean) => {
        setContactEmails((p) =>
            p.map((d, i) => {
                if (i === index) return { ...d, [key]: value };
                if (key === "is_primary" && value === true) return { ...d, is_primary: false };
                return d;
            })
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = { ...form };
            const nullableFields = [
                'customer_group_id', 'territory_id', 'lead_id', 'opportunity_id',
                'industry_id', 'default_price_list_id', 'payment_term_id', 'customer_contact_id'
            ];
            nullableFields.forEach(key => {
                if (payload[key] === '' || payload[key] === null) {
                    payload[key] = null;
                }
            });

            // Handle Contact
            let contactId = payload.customer_contact_id;
            if (includeContact && contactForm.first_name) {
                const contactPayload = {
                    ...contactForm,
                    salutation: contactForm.salutation || null,
                    middle_name: contactForm.middle_name || null,
                    last_name: contactForm.last_name || null,
                    designation: contactForm.designation || null,
                    gender: contactForm.gender || null,
                    company_name: form.name || null,
                    status: 'Open',
                    phones: contactPhones
                        .filter((p) => p.phone_no.trim() !== "")
                        .map((p) => ({ phone_no: p.phone_no.trim(), is_primary: p.is_primary })),
                    emails: contactEmails
                        .filter((e) => e.email.trim() !== "")
                        .map((e) => ({ email: e.email.trim(), is_primary: e.is_primary })),
                };

                if (contactId) {
                    await contactApi.update(Number(contactId), contactPayload);
                } else {
                    const newContact = await contactApi.create(contactPayload);
                    contactId = newContact.id;
                    payload.customer_contact_id = contactId;
                }
            }

            if (isEdit) {
                await customerApi.update(Number(id), payload);
                showAlert("success", "Updated!", "Customer has been updated.");
            } else {
                await customerApi.create(payload);
                showAlert("success", "Created!", "Customer has been created.");
            }
            navigate("/crm/customers");
        } catch (error) {
            showAlert("error", "Error", getErrorMessage(error, "Failed to save customer"));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link to="/crm/dashboard">CRM</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link to="/crm/customers">Customers</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>{isEdit ? "Edit" : "New"}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {isEdit ? "Edit Customer" : "New Customer"}
                    </h1>
                </div>
                <Button variant="outline" onClick={() => navigate("/crm/customers")}>
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back to Customers
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 pb-10">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2 md:col-span-1">
                            <Label>Customer Name <span className="text-destructive">*</span></Label>
                            <Input
                                value={form.name}
                                onChange={(e) => setField("name", e.target.value)}
                                required
                                placeholder="Enter customer name"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Customer Type</Label>
                                <Select
                                    value={form.customer_type}
                                    onValueChange={(v) => setField("customer_type", v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CUSTOMER_TYPES.map(t => (
                                            <SelectItem key={t} value={t}>{t}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Customer Group</Label>
                                <Select
                                    value={form.customer_group_id}
                                    onValueChange={(v) => setField("customer_group_id", v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Group" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {customerGroups.map(g => (
                                            <SelectItem key={g.id} value={g.id.toString()}>{g.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Classification & Relations */}
                <Card>
                    <CardHeader>
                        <CardTitle>Classification & Relations</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-4">
                        <div className="space-y-2">
                            <Label>Territory</Label>
                            <Select
                                value={form.territory_id}
                                onValueChange={(v) => setField("territory_id", v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Territory" />
                                </SelectTrigger>
                                <SelectContent>
                                    {territories.map(t => (
                                        <SelectItem key={t.id} value={t.id.toString()}>{t.territory_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Leads</Label>
                            <Select
                                value={form.lead_id}
                                onValueChange={(v) => setField("lead_id", v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Lead" />
                                </SelectTrigger>
                                <SelectContent>
                                    {leads.map(l => (
                                        <SelectItem key={l.id} value={l.id.toString()}>{l.first_name} {l.last_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Opportunity</Label>
                            <Select
                                value={form.opportunity_id}
                                onValueChange={(v) => setField("opportunity_id", v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Opportunity" />
                                </SelectTrigger>
                                <SelectContent>
                                    {opportunities.length === 0 ? (
                                        <SelectItem value="none" disabled>No opportunities found</SelectItem>
                                    ) : (
                                        opportunities.map(o => (
                                            <SelectItem key={o.id} value={o.id.toString()}>
                                                {getOpportunityLabel(o)}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Industry</Label>
                            <Select
                                value={form.industry_id}
                                onValueChange={(v) => setField("industry_id", v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Industry" />
                                </SelectTrigger>
                                <SelectContent>
                                    {industries.map(i => (
                                        <SelectItem key={i.id} value={i.id.toString()}>{i.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Primary Contact (Embedded Form) */}
                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader className="flex flex-row items-center space-y-0 gap-3 pb-4">
                        <Checkbox 
                            id="include-contact" 
                            checked={includeContact} 
                            onCheckedChange={(checked) => setIncludeContact(checked === true)}
                            className="h-5 w-5 rounded-sm data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                        />
                        <div className="space-y-1">
                            <CardTitle>Manage Primary Contact Details</CardTitle>
                            <CardDescription>Include rich contact details (multiple emails, phones, salutation)</CardDescription>
                        </div>
                    </CardHeader>
                    {includeContact && (
                        <CardContent className="grid gap-6">
                            <div className="grid gap-6 md:grid-cols-4 p-4 border rounded-md bg-background">
                                <div className="space-y-2">
                                    <Label>Salutation</Label>
                                    <Select
                                        value={contactForm.salutation}
                                        onValueChange={(v) => setContactField("salutation", v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SALUTATIONS.map((s) => (
                                                <SelectItem key={s} value={s}>{s}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>First Name <span className="text-destructive">*</span></Label>
                                    <Input
                                        value={contactForm.first_name}
                                        onChange={(e) => setContactField("first_name", e.target.value)}
                                        required={includeContact}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Middle Name</Label>
                                    <Input
                                        value={contactForm.middle_name}
                                        onChange={(e) => setContactField("middle_name", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Last Name</Label>
                                    <Input
                                        value={contactForm.last_name}
                                        onChange={(e) => setContactField("last_name", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Designation</Label>
                                    <Input
                                        value={contactForm.designation}
                                        onChange={(e) => setContactField("designation", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Gender</Label>
                                    <Select
                                        value={contactForm.gender}
                                        onValueChange={(v) => setContactField("gender", v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {genders.map((g) => (
                                                <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Phones */}
                                <div className="p-4 border rounded-md bg-background">
                                    <div className="flex items-center justify-between mb-4">
                                        <Label className="font-semibold text-base">Contact Phones</Label>
                                        <Button type="button" variant="outline" size="sm" onClick={addContactPhone}>
                                            <Plus className="mr-2 h-4 w-4" /> Add Phone
                                        </Button>
                                    </div>
                                    <div className="space-y-4">
                                        {contactPhones.map((phone, index) => (
                                            <div key={index} className="flex items-end gap-4">
                                                <div className="flex-1 space-y-2">
                                                    <Label>Phone No</Label>
                                                    <Input
                                                        placeholder="Enter phone number"
                                                        value={phone.phone_no}
                                                        onChange={(e) => updateContactPhone(index, "phone_no", e.target.value)}
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2 pb-2">
                                                    <Button
                                                        type="button"
                                                        variant={phone.is_primary ? "default" : "outline"}
                                                        size="icon"
                                                        onClick={() => updateContactPhone(index, "is_primary", true)}
                                                        title={phone.is_primary ? "Primary" : "Set as Primary"}
                                                        className={phone.is_primary ? "bg-yellow-500 hover:bg-yellow-600" : ""}
                                                    >
                                                        <Star className={`h-4 w-4 ${phone.is_primary ? "fill-current" : ""}`} />
                                                    </Button>
                                                    {contactPhones.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeContactPhone(index)}
                                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* Emails */}
                                <div className="p-4 border rounded-md bg-background">
                                    <div className="flex items-center justify-between mb-4">
                                        <Label className="font-semibold text-base">Contact Emails</Label>
                                        <Button type="button" variant="outline" size="sm" onClick={addContactEmail}>
                                            <Plus className="mr-2 h-4 w-4" /> Add Email
                                        </Button>
                                    </div>
                                    <div className="space-y-4">
                                        {contactEmails.map((emailRow, index) => (
                                            <div key={index} className="flex items-end gap-4">
                                                <div className="flex-1 space-y-2">
                                                    <Label>Email</Label>
                                                    <Input
                                                        type="email"
                                                        placeholder="Enter email address"
                                                        value={emailRow.email}
                                                        onChange={(e) => updateContactEmail(index, "email", e.target.value)}
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2 pb-2">
                                                    <Button
                                                        type="button"
                                                        variant={emailRow.is_primary ? "default" : "outline"}
                                                        size="icon"
                                                        onClick={() => updateContactEmail(index, "is_primary", true)}
                                                        title={emailRow.is_primary ? "Primary" : "Set as Primary"}
                                                        className={emailRow.is_primary ? "bg-yellow-500 hover:bg-yellow-600" : ""}
                                                    >
                                                        <Star className={`h-4 w-4 ${emailRow.is_primary ? "fill-current" : ""}`} />
                                                    </Button>
                                                    {contactEmails.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeContactEmail(index)}
                                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    )}
                </Card>

                {/* Legacy General Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Other Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Legacy Email</Label>
                                <Input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setField("email", e.target.value)}
                                    placeholder="email@example.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Legacy Phone</Label>
                                <Input
                                    value={form.phone}
                                    onChange={(e) => setField("phone", e.target.value)}
                                    placeholder="Phone number"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Website</Label>
                                <Input
                                    value={form.website}
                                    onChange={(e) => setField("website", e.target.value)}
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Print Language</Label>
                                <Input
                                    value={form.print_language}
                                    onChange={(e) => setField("print_language", e.target.value)}
                                    placeholder="English"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Sales & Accounting */}
                <Card>
                    <CardHeader>
                        <CardTitle>Sales & Accounting</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Default Price List</Label>
                                <Select
                                    value={form.default_price_list_id}
                                    onValueChange={(v) => setField("default_price_list_id", v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Price List" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {priceLists.map(p => (
                                            <SelectItem key={p.id} value={p.id.toString()}>{p.name} ({p.currency})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Payment Terms</Label>
                                <Select
                                    value={form.payment_term_id}
                                    onValueChange={(v) => setField("payment_term_id", v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Terms" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {paymentTerms.map(t => (
                                            <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Billing Currency</Label>
                                <Input
                                    value={form.billing_currency}
                                    onChange={(e) => setField("billing_currency", e.target.value)}
                                    placeholder="INR"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Tax ID</Label>
                                <Input
                                    value={form.tax_id}
                                    onChange={(e) => setField("tax_id", e.target.value)}
                                    placeholder="GSTIN/VAT"
                                />
                            </div>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Bank Account Details</Label>
                            <Textarea
                                value={form.bank_account_details}
                                onChange={(e) => setField("bank_account_details", e.target.value)}
                                placeholder="Bank name, Account number, IFSC, etc."
                                className="min-h-[100px]"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Other Details Textarea */}
                <Card>
                    <CardHeader>
                        <CardTitle>Customer Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Label>Customer Details</Label>
                            <Textarea
                                value={form.customer_details}
                                onChange={(e) => setField("customer_details", e.target.value)}
                                placeholder="Additional notes about the customer"
                                className="min-h-[100px]"
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate("/crm/customers")}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        className="bg-solarized-blue hover:bg-solarized-blue/90"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            isEdit ? "Update Customer" : "Save Customer"
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
