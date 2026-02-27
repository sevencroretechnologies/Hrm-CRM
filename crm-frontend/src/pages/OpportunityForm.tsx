import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  opportunityApi, statusApi, sourceApi,
  opportunityTypeApi, opportunityStageApi, userApi, leadApi,
  territoryApi, prospectApi, contactApi,
  productApi, productCategoryApi, opportunityProductApi
} from "@/services/api";
import type {
  Lead, Status, Source, OpportunityType, OpportunityStage,
  Territory, Prospect, Contact, Product, ProductCategory
} from "@/types";
import Swal from "sweetalert2";

export default function OpportunityForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({
    opportunity_from: "lead",
    currency: "INR",
    probability: 0,
    with_items: false,
    items: []
  });

  // Dropdown options
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [opportunityTypes, setOpportunityTypes] = useState<OpportunityType[]>([]);
  const [opportunityStages, setOpportunityStages] = useState<OpportunityStage[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);

  // Item Addition State
  const [itemSearch, setItemSearch] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [newItem, setNewItem] = useState<{
    product_id?: number | null;
    item_code: string;
    item_name: string;
    qty: number | string;
    rate: number | string;
    amount: number | string;
    category_id?: number | null;
    description?: string;
    long_description?: string;
    slug?: string;
    stock?: number;
    is_new_product?: boolean;
  }>({
    item_code: "",
    item_name: "",
    qty: "",
    rate: 0,
    amount: "",
    description: "",
    long_description: "",
    slug: "",
    stock: 0,
    is_new_product: false
  });

  useEffect(() => {
    Promise.all([
      statusApi.list(),
      sourceApi.list(),
      opportunityTypeApi.list(),
      opportunityStageApi.list(),
      userApi.list(),
      leadApi.list(),
      territoryApi.list(),
      prospectApi.list(),
      contactApi.list(),
      productApi.list({ per_page: 1000 }),
      productCategoryApi.listAll(),
    ]).then(([statusRes, sourceRes, typeRes, stageRes, , leadsRes, territoryRes, prospectsRes, contactsRes, productsRes, categoriesRes]) => {
      setStatuses(Array.isArray(statusRes) ? statusRes : []);
      setSources(Array.isArray(sourceRes) ? sourceRes : []);
      setOpportunityTypes(Array.isArray(typeRes) ? typeRes : []);
      setOpportunityStages(Array.isArray(stageRes) ? stageRes : []);
      setLeads(Array.isArray(leadsRes) ? leadsRes : (leadsRes as any)?.data || []);
      setTerritories(Array.isArray(territoryRes) ? territoryRes : []);
      setProspects(Array.isArray(prospectsRes) ? prospectsRes : (prospectsRes as any)?.data || []);
      setContacts(Array.isArray(contactsRes) ? contactsRes : (contactsRes as any)?.data || []);
      setProducts(Array.isArray(productsRes) ? productsRes : (productsRes as any)?.data || []);
      setCategories(Array.isArray(categoriesRes) ? categoriesRes : []);
    });
  }, []);

  useEffect(() => {
    if (id) {
      setLoading(true);
      opportunityApi.get(Number(id)).then(async (item) => {
        // Fetch opportunity products using new API
        let existingItems: any[] = [];
        try {
          existingItems = await opportunityApi.getProducts(item.id);
        } catch (e) {
          console.error("Failed to load existing items", e);
        }

        // Map API response to form format
        const mappedItems = existingItems.map((p: any) => ({
          product_id: p.product_id,
          item_code: p.item_code || "",
          item_name: p.item_name || "",
          qty: p.qty,
          rate: p.rate || 0,
          amount: p.amount || 0,
          description: p.description || ""
        }));

        setForm({
          ...item,
          expected_closing: item.expected_closing ? item.expected_closing.split('T')[0] : "",
          next_contact_date: item.next_contact_date ? item.next_contact_date.split('T')[0] : "",
          with_items: Boolean(item.with_items) || mappedItems.length > 0,
          items: mappedItems.length > 0 ? mappedItems : (item.items || [])
        });
      }).finally(() => setLoading(false));
    }
  }, [id]);

  const setField = (key: string, value: any) => setForm((p) => ({ ...p, [key]: value }));

  // --- Product Search & Add Logic ---

  const filteredProducts = products.filter(p =>
    (p.name && p.name.toLowerCase().includes(itemSearch.toLowerCase())) ||
    (p.code && p.code.toLowerCase().includes(itemSearch.toLowerCase()))
  );

  const handleProductSelect = (product: Product) => {
    const productRate = product.rate ?? 0;
    const productAmount = product.amount ?? 0;
    // When rate is 0, use the stored amount as the effective unit price
    // so that qty × rate calculation works correctly
    const rate = productRate > 0 ? productRate : productAmount;
    const qty = Number(newItem.qty);
    const amount = rate * qty;
    setNewItem({
      ...newItem,
      product_id: product.id,
      item_code: product.code || "",
      item_name: product.name,
      category_id: product.category_id,
      description: product.description || "",
      rate: rate,
      amount: amount,
      is_new_product: false
    });
    setItemSearch(product.name);
    setShowProductDropdown(false);
  };

  const handleManualProductEntry = () => {
    setNewItem({
      ...newItem,
      product_id: null,
      item_name: itemSearch,
      item_code: "", // will be auto-generated by backend
      is_new_product: true
    });
    setShowProductDropdown(false);
  };


  // Toggle for Add Item Section
  const [showAddSection, setShowAddSection] = useState(false);

  // ... (inside handleAddItem)
  const handleAddItem = async () => {
    // ... existing validation ...
    if (!newItem.item_name) {
      Swal.fire("Error", "Please select or enter a product name", "error");
      return;
    }

    let productId = newItem.product_id;

    // ... existing creation logic ...
    if (newItem.is_new_product && !productId) {
      try {
        const productPayload = {
          name: newItem.item_name,
          category_id: newItem.category_id || null,
          slug: newItem.slug || null,
          stock: Number(newItem.stock) || 0,
          amount: Number(newItem.amount) || 0,
          description: newItem.description || null,
          long_description: newItem.long_description || null,
        };
        const createdProduct = await productApi.create(productPayload);
        productId = createdProduct.id;
        // Use the backend auto-generated code (PRD-00001 format)
        setNewItem(prev => ({ ...prev, item_code: createdProduct.code || "" }));
        setProducts([...products, createdProduct]);
      } catch (err) {
        console.error("Failed to create product", err);
        Swal.fire("Error", "Failed to create new product. Please check inputs.", "error");
        return;
      }
    }

    // Add to items list
    const itemToAdd = {
      ...newItem,
      product_id: productId,
      amount: Number(newItem.amount)
    };

    const updatedItems = [...(form.items || []), itemToAdd];
    setField("items", updatedItems);
    setField("with_items", true);

    // Reset and Hide
    setNewItem({
      item_code: "",
      item_name: "",
      qty: "",
      rate: 0,
      amount: 0,
      is_new_product: false,
      product_id: null
    });
    setItemSearch("");
    setShowAddSection(false); // Hide the form
  };

  const removeItem = (index: number) => {
    const newItems = [...(form.items || [])];
    newItems.splice(index, 1);
    setField("items", newItems);
  };

  // --- Submit Logic ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Save Opportunity
      const { status, source, industry, owner, lead, customer, contact, prospect, items, with_items, ...cleanForm } = form;

      const payload: Record<string, any> = { ...cleanForm };
      // Explicitly include items and opportunity_lost_reasons and with_items
      if (form.opportunity_lost_reasons) payload.opportunity_lost_reasons = form.opportunity_lost_reasons;
      payload.with_items = items && items.length > 0;
      payload.items = items; // Send items to backend

      let opportunityId = Number(id);

      if (isEdit) {
        await opportunityApi.update(opportunityId, payload);
      } else {
        await opportunityApi.create(payload);
      }

      Swal.fire("Success", "Opportunity saved successfully!", "success");
      navigate("/opportunities");
    } catch (err) {
      console.error("=== SUBMIT ERROR ===", err);
      Swal.fire("Error", "Failed to save opportunity.", "error");
    }
  };

  const updateItemDetails = (field: string, value: any) => {
    // Specific handler for amount
    if (field === 'amount') {
      setNewItem(prev => ({ ...prev, amount: value }));
      return;
    }

    // Allow empty string for clearing fields (qty, rate)
    if (value === "") {
      setNewItem(prev => ({
        ...prev,
        [field]: "",
        // Only reset amount to 0 if we were relying on rate for calculation
        amount: Number(prev.rate) > 0 ? 0 : prev.amount
      }));
      return;
    }

    const val = parseFloat(value);

    if (field === 'qty') {
      setNewItem(prev => {
        const rateVal = Number(prev.rate || 0);
        // Only trigger calculation if rate is > 0
        const newAmount = rateVal > 0
          ? (isNaN(val) ? 0 : val) * rateVal
          : prev.amount;

        return {
          ...prev,
          qty: value,
          amount: newAmount
        };
      });
    } else if (field === 'rate') {
      setNewItem(prev => ({
        ...prev,
        rate: value,
        // If rate is explicitly changed, we recalculate amount
        amount: Number(prev.qty || 0) * (isNaN(val) ? 0 : val)
      }));
    }
  };

  return (
    <div>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">CRM</Link></li>
          <li className="breadcrumb-item"><Link to="/opportunities">Opportunity</Link></li>
          <li className="breadcrumb-item active">{isEdit ? form.naming_series || "Edit" : "New"}</li>
        </ol>
      </nav>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{isEdit ? "Edit Opportunity" : "New Opportunity"}</h2>
        <button type="button" onClick={handleSubmit} className="btn btn-primary">Save</button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Sales Section */}
        <div className="form-container mb-4">
          <h5 className="mb-3 border-bottom pb-2">Sales</h5>
          <div className="row g-3">
            {/* ... (Existing Sales Fields) ... */}
            <div className="col-md-6">
              <label className="form-label">Opportunity Type</label>
              <select className="form-select" value={form.opportunity_type_id || ""} onChange={(e) => setField("opportunity_type_id", e.target.value)}>
                <option value="">Select Type</option>
                {opportunityTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Opportunity Stage</label>
              <select className="form-select" value={form.opportunity_stage_id || ""} onChange={(e) => setField("opportunity_stage_id", e.target.value)}>
                <option value="">Select Stage</option>
                {opportunityStages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Opportunity From</label>
              <select className="form-select" value={form.opportunity_from || "lead"} onChange={(e) => {
                setField("opportunity_from", e.target.value);
                setField("lead_id", "");
                setField("customer_id", "");
                setField("prospect_id", "");
                setField("customer_contact_id", "");
              }}>
                <option value="lead">Lead</option>
                <option value="customer">Customer</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Status <span className="text-danger">*</span></label>
              <select className="form-select" value={form.status_id || ""} onChange={(e) => setField("status_id", e.target.value)} required>
                <option value="">Select Status</option>
                {statuses.map((s) => <option key={s.id} value={s.id}>{s.status_name}</option>)}
              </select>
            </div>

            {form.opportunity_from === "lead" && (
              <div className="col-md-6">
                <label className="form-label">Lead</label>
                <select className="form-select" value={form.lead_id || ""} onChange={(e) => setField("lead_id", e.target.value)}>
                  <option value="">Select Lead</option>
                  {leads.map((l) => <option key={l.id} value={l.id}>{l.first_name} {l.last_name}</option>)}
                </select>
              </div>
            )}
            {form.opportunity_from === "customer" && (
              <div className="col-md-6">
                <label className="form-label">Customer Contact</label>
                <select className="form-select" value={form.customer_contact_id || ""} onChange={(e) => setField("customer_contact_id", e.target.value)}>
                  <option value="">Select Contact</option>
                  {contacts.map((c) => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                </select>
              </div>
            )}

            <div className="col-md-6">
              <label className="form-label">Expected Closing Date</label>
              <input type="date" className="form-control" value={form.expected_closing || ""} onChange={(e) => setField("expected_closing", e.target.value)} />
            </div>

            <div className="col-md-6">
              <label className="form-label">Probability (%)</label>
              <input type="number" className="form-control" value={form.probability || ""} onChange={(e) => setField("probability", e.target.value)} />
            </div>


            <div className="col-12">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="withItems" checked={Boolean(form.with_items)} onChange={(e) => setField("with_items", e.target.checked)} />
                <label className="form-check-label" htmlFor="withItems">With Items</label>
              </div>
            </div>
          </div>
        </div>


        {/* Add Items Section */}
        {Boolean(form.with_items) && (
          <div className="form-container mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
              <h5 className="mb-0">Items</h5>
              {!showAddSection && (
                <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => setShowAddSection(true)}>
                  + Add Product
                </button>
              )}
            </div>

            {showAddSection && (
              <div className="card p-3 mb-4 bg-light border">
                <div className="d-flex justify-content-between mb-2">
                  <h6 className="card-title">Add New Item</h6>
                  <button type="button" className="btn-close" onClick={() => setShowAddSection(false)} aria-label="Close"></button>
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-md-4 position-relative">
                    <label className="form-label">Search Item Code / Name <span className="text-danger">*</span></label>
                    <input
                      className="form-control"
                      placeholder="Type to search..."
                      value={itemSearch}
                      onChange={(e) => {
                        setItemSearch(e.target.value);
                        setShowProductDropdown(true);
                        if (e.target.value === "") {
                          setNewItem(prev => ({ ...prev, is_new_product: false }));
                        }
                      }}
                      onFocus={() => setShowProductDropdown(true)}
                    />
                    {showProductDropdown && itemSearch && (
                      <div className="card position-absolute w-100 shadow" style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}>
                        <ul className="list-group list-group-flush">
                          {filteredProducts.map(p => (
                            <li key={p.id} className="list-group-item list-group-item-action cursor-pointer"
                              onClick={() => handleProductSelect(p)}>
                              <strong>{p.code}</strong> - {p.name}
                            </li>
                          ))}
                          {filteredProducts.length === 0 && (
                            <li className="list-group-item list-group-item-action text-primary cursor-pointer"
                              onClick={handleManualProductEntry}>
                              + Create new: "{itemSearch}"
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="col-md-2">
                    <label className="form-label">Quantity</label>
                    <input type="number" className="form-control" min="1"
                      value={newItem.qty}
                      onChange={(e) => updateItemDetails('qty', e.target.value)} />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Rate (INR)</label>
                    <input type="number" className="form-control" min="0"
                      value={newItem.rate}
                      onChange={(e) => updateItemDetails('rate', e.target.value)} />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Amount (INR)</label>
                    <input type="number" className="form-control" value={newItem.amount} onChange={(e) => updateItemDetails('amount', e.target.value)} />
                  </div>
                  <div className="col-md-2 d-flex align-items-end">
                    <button type="button" className="btn btn-success w-100" onClick={handleAddItem}>
                      {newItem.is_new_product ? "Create & Add" : "Add Item"}
                    </button>
                  </div>
                </div>

                {/* New Product Fields (Conditional) */}
                {newItem.is_new_product && (
                  <div className="card bg-white mb-3 p-3 border">
                    <h6 className="fw-semibold mb-3 border-bottom pb-2">
                      New Product Details
                      {/* <span className="ms-2 badge bg-light text-muted fw-normal" style={{ fontSize: '0.7rem' }}>Code auto-generated (e.g. PRD-00001)</span> */}
                    </h6>
                    <div className="row g-3">
                      {/* Row 1: Name + Category */}
                      <div className="col-md-8">
                        <label className="form-label">Product Name <span className="text-danger">*</span></label>
                        <input className="form-control form-control-sm" value={newItem.item_name}
                          onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })} required />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Category</label>
                        <select className="form-select form-select-sm" value={newItem.category_id || ""}
                          onChange={(e) => setNewItem({ ...newItem, category_id: Number(e.target.value) })}>
                          <option value="">Select Category</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                      {/* Row 2: Slug + Stock */}
                      <div className="col-md-6">
                        <label className="form-label">Slug</label>
                        <input className="form-control form-control-sm" placeholder="e.g. product-name"
                          value={newItem.slug || ""}
                          onChange={(e) => setNewItem({ ...newItem, slug: e.target.value })} />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Stock</label>
                        <input type="number" className="form-control form-control-sm" min={0}
                          value={newItem.stock ?? 0}
                          onChange={(e) => setNewItem({ ...newItem, stock: Number(e.target.value) })} />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Amount (Unit Price)</label>
                        <input type="number" className="form-control form-control-sm" min={0} step="0.01"
                          value={newItem.amount || 0}
                          onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })} />
                      </div>
                      {/* Row 3: Short Description */}
                      <div className="col-12">
                        <label className="form-label">Short Description</label>
                        <textarea className="form-control form-control-sm" rows={2}
                          value={newItem.description || ""}
                          onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} />
                      </div>
                      {/* Row 4: Long Description */}
                      <div className="col-12">
                        <label className="form-label">Long Description</label>
                        <textarea className="form-control form-control-sm" rows={3}
                          value={newItem.long_description || ""}
                          onChange={(e) => setNewItem({ ...newItem, long_description: e.target.value })} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Items List Table (Moved inside the same container) */}
            <div className="table-responsive">
              <table className="table table-bordered table-striped">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Item Code</th>
                    <th>Item Name</th>
                    <th>Quantity</th>
                    <th>Rate (INR)</th>
                    <th>Amount (INR)</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {form.items?.map((item: any, index: number) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item.item_code}</td>
                      <td>{item.item_name}</td>
                      <td>{item.qty}</td>
                      <td>{item.rate}</td>
                      <td>{item.amount}</td>
                      <td><button type="button" className="btn btn-sm btn-danger" onClick={() => removeItem(index)}>Remove</button></td>
                    </tr>
                  ))}
                  {(!form.items || form.items.length === 0) && (
                    <tr><td colSpan={7} className="text-center text-muted">No items added yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Contact Info (Simplified for brevity as per instructions to return FILE, keeping existing sections is good practice) */}
        <div className="form-container mb-4">
          <h5 className="mb-3 border-bottom pb-2">Contact Info</h5>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Contact Person</label>
              <input className="form-control" value={form.contact_person || ""} onChange={(e) => setField("contact_person", e.target.value)} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Territory</label>
              <select className="form-select" value={form.territory_id || ""} onChange={(e) => setField("territory_id", e.target.value)}>
                <option value="">Select Territory</option>
                {territories.map(t => <option key={t.id} value={t.id}>{t.territory_name}</option>)}
              </select>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
