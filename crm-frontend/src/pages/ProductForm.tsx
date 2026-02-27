import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { productApi, productCategoryApi } from "@/services/api";
import type { ProductCategory } from "@/types";
import Swal from "sweetalert2";
import { ArrowLeft } from "lucide-react";

export default function ProductForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [form, setForm] = useState<Record<string, string | number | null>>({
        category_id: "",
        name: "",
        description: "",
        long_description: "",
        slug: "",
        stock: 0,
        // rate: 0,
        amount: 0,
    });

    useEffect(() => {
        productCategoryApi.listAll().then((data) => setCategories(Array.isArray(data) ? data : []));
    }, []);

    useEffect(() => {
        if (id) {
            setLoading(true);
            productApi
                .get(Number(id))
                .then((product) => {
                    setForm({
                        category_id: product.category_id || "",
                        name: product.name || "",
                        description: product.description || "",
                        long_description: product.long_description || "",
                        slug: product.slug || "",
                        stock: product.stock ?? 0,
                        // rate: product.rate ?? 0,
                        amount: product.amount ?? 0,
                    });
                })
                .finally(() => setLoading(false));
        }
    }, [id]);

    const setField = (key: string, value: string | number) =>
        setForm((p) => ({ ...p, [key]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = { ...form };
            // Convert empty strings to null for nullable fields
            const nullableFields = ["category_id", "code", "description", "long_description", "slug"];
            nullableFields.forEach((key) => {
                if (payload[key] === "" || payload[key] === null) {
                    payload[key] = null;
                }
            });

            if (isEdit) {
                await productApi.update(Number(id), payload);
                Swal.fire("Updated!", "Product has been updated.", "success");
            } else {
                await productApi.create(payload);
                Swal.fire("Created!", "Product has been created.", "success");
            }
            navigate("/products");
        } catch {
            Swal.fire("Error", "Failed to save product.", "error");
        }
    };

    if (loading) {
        return <div className="text-center py-5">Loading...</div>;
    }

    return (
        <div>
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                        <Link to="/">CRM</Link>
                    </li>
                    <li className="breadcrumb-item">
                        <Link to="/products">Products</Link>
                    </li>
                    <li className="breadcrumb-item active">{isEdit ? "Edit" : "New"}</li>
                </ol>
            </nav>
            <div className="d-flex align-items-center mb-4">
                <Link to="/products" className="btn btn-outline-secondary me-3" title="Back">
                    <ArrowLeft size={20} />
                </Link>
                <h2 className="mb-0">{isEdit ? "Edit Product" : "New Product"}</h2>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Basic Info */}
                <div className="form-container mb-4">
                    <h5 className="mb-3 border-bottom pb-2">Basic Information</h5>
                    <div className="row g-3">
                        <div className="col-md-9">
                            <label className="form-label">
                                Product Name <span className="text-danger">*</span>
                            </label>
                            <input
                                className="form-control"
                                value={form.name?.toString() || ""}
                                onChange={(e) => setField("name", e.target.value)}
                                required
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Category</label>
                            <select
                                className="form-select"
                                value={form.category_id?.toString() || ""}
                                onChange={(e) => setField("category_id", e.target.value)}
                            >
                                <option value="">Select Category</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Slug</label>
                            <input
                                className="form-control"
                                value={form.slug?.toString() || ""}
                                onChange={(e) => setField("slug", e.target.value)}
                                placeholder="e.g. product-name"
                            />
                        </div>
                    </div>
                </div>

                {/* Stock Info */}
                <div className="form-container mb-4">
                    <h5 className="mb-3 border-bottom pb-2">Inventory</h5>
                    <div className="row g-3">
                        <div className="col-md-4">
                            <label className="form-label">Stock</label>
                            <input
                                type="number"
                                className="form-control"
                                value={form.stock?.toString() || "0"}
                                onChange={(e) => setField("stock", Number(e.target.value))}
                                min={0}
                            />
                        </div>
                        {/* <div className="col-md-4">
                            <label className="form-label">Rate</label>
                            <input
                                type="number"
                                className="form-control"
                                value={form.rate?.toString() || "0"}
                                onChange={(e) => setField("rate", Number(e.target.value))}
                                min={0}
                                step="0.01"
                            />
                        </div> */}
                        <div className="col-md-4">
                            <label className="form-label">Amount</label>
                            <input
                                type="number"
                                className="form-control"
                                value={form.amount?.toString() || "0"}
                                onChange={(e) => setField("amount", Number(e.target.value))}
                                min={0}
                                step="0.01"
                            />
                        </div>
                    </div>
                </div>

                {/* Descriptions */}
                <div className="form-container mb-4">
                    <h5 className="mb-3 border-bottom pb-2">Descriptions</h5>
                    <div className="row g-3">
                        <div className="col-12">
                            <label className="form-label">Short Description</label>
                            <textarea
                                className="form-control"
                                rows={3}
                                value={form.description?.toString() || ""}
                                onChange={(e) => setField("description", e.target.value)}
                            ></textarea>
                        </div>
                        <div className="col-12">
                            <label className="form-label">Long Description</label>
                            <textarea
                                className="form-control"
                                rows={5}
                                value={form.long_description?.toString() || ""}
                                onChange={(e) => setField("long_description", e.target.value)}
                            ></textarea>
                        </div>
                    </div>
                </div>

                <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary">
                        Save
                    </button>
                    <Link to="/products" className="btn btn-secondary">
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
