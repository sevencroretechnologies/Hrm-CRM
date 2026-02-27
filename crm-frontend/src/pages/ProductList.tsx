import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { productApi, productCategoryApi } from "@/services/api";
import type { Product, ProductCategory, PaginatedResponse } from "@/types";
import { Plus, Trash2, Edit2, Eye, Search, X, ArrowLeft, ArrowRight } from "lucide-react";
import Swal from "sweetalert2";

export default function ProductList() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(15);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchProducts = useCallback((page = 1) => {
        setLoading(true);
        const params: Record<string, string | number> = { page, per_page: perPage };
        if (search) params.search = search;
        if (categoryFilter) params.category_id = categoryFilter;
        productApi
            .list(params)
            .then((data: PaginatedResponse<Product>) => {
                setProducts(data.data || []);
                setCurrentPage(data.current_page);
                setTotalPages(data.last_page);
                setTotal(data.total);
            })
            .catch(() => setProducts([]))
            .finally(() => setLoading(false));
    }, [search, categoryFilter, perPage]);

    useEffect(() => {
        productCategoryApi.listAll().then((data) => setCategories(Array.isArray(data) ? data : []));
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchProducts]);

    const viewProduct = async (product: Product) => {

        const fmt = (n: number) => Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        await Swal.fire({
            title: product.name,
            width: 650,
            html: `
                <div style="text-align:left;">
                    <table class="table table-borderless mb-0" style="font-size:0.9rem;">
                        <tr><td class="fw-semibold" style="width:140px;">Code</td><td>${product.code || "—"}</td></tr>
                        <tr><td class="fw-semibold">Category</td><td>${product.category?.name || "—"}</td></tr>
                        <tr><td class="fw-semibold">Slug</td><td>${product.slug || "—"}</td></tr>
                        <tr><td class="fw-semibold">Stock</td><td>${product.stock}</td></tr>
                        <tr><td class="fw-semibold">Rate</td><td>₹${fmt(product.rate)}</td></tr>
                        <tr><td class="fw-semibold">Amount</td><td>₹${fmt(product.amount)}</td></tr>
                    </table>
                    ${product.description ? `<div class="mt-3"><h6 class="fw-semibold border-bottom pb-1">Description</h6><p class="small text-muted">${product.description}</p></div>` : ""}
                    ${product.long_description ? `<div class="mt-3"><h6 class="fw-semibold border-bottom pb-1">Long Description</h6><p class="small text-muted">${product.long_description}</p></div>` : ""}
                </div>
            `,
            confirmButtonText: "Close",
            confirmButtonColor: "#6c757d",
        });
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: "Delete Product?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            confirmButtonText: "Yes, delete it!",
        });
        if (result.isConfirmed) {
            try {
                await productApi.delete(id);
                Swal.fire("Deleted!", "Product has been deleted.", "success");
                fetchProducts(currentPage);
            } catch {
                Swal.fire("Error", "Failed to delete product.", "error");
            }
        }
    };

    return (
        <div>
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                        <Link to="/">CRM</Link>
                    </li>
                    <li className="breadcrumb-item active">Products</li>
                </ol>
            </nav>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>
                    Products
                    {total > 0 && <small className="text-muted ms-2" style={{ fontSize: "0.5em" }}>({total})</small>}
                </h2>
                <Link to="/products/new" className="btn btn-primary">
                    <Plus size={16} className="me-1" /> New Product
                </Link>
            </div>
            <div className="row g-2 mb-3">
                <div className="col-md-4">
                    <div className="position-relative">
                        <Search size={16} className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
                        <input
                            type="text"
                            className="form-control ps-5"
                            placeholder="Search products..."
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
                <div className="col-md-3">
                    <select
                        className="form-select"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="">All Categories</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5 text-muted">Loading...</div>
            ) : products.length === 0 ? (
                <div className="text-center py-5">
                    <p className="text-muted mb-3">No products found.</p>
                    <Link to="/products/new" className="btn btn-primary">
                        Create a new Product
                    </Link>
                </div>
            ) : (
                <div className="card">
                    <div className="card-body p-0">
                        <table className="table table-hover mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Code</th>
                                    <th>Category</th>
                                    <th>Stock</th>
                                    <th>Rate</th>
                                    <th>Amount</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product, index) => (
                                    <tr key={product.id}>
                                        <td>{(currentPage - 1) * perPage + index + 1}</td>
                                        <td className="fw-medium">
                                            <Link
                                                to={`/products/${product.id}/edit`}
                                                className="text-decoration-none text-dark"
                                            >
                                                {product.name}
                                            </Link>
                                        </td>
                                        <td>
                                            {product.code ? (
                                                <span className="badge bg-secondary">{product.code}</span>
                                            ) : (
                                                "-"
                                            )}
                                        </td>
                                        <td>
                                            {product.category ? (
                                                <span className="badge bg-success">{product.category.name}</span>
                                            ) : (
                                                "-"
                                            )}
                                        </td>
                                        <td>{product.stock}</td>
                                        <td>₹{Number(product.rate).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        <td>₹{Number(product.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        <td className="text-end">
                                            <button
                                                className="btn btn-sm btn-outline-secondary me-1"
                                                onClick={() => viewProduct(product)}
                                                title="View"
                                            >
                                                <Eye size={14} />
                                            </button>
                                            <Link
                                                to={`/products/${product.id}/edit`}
                                                className="btn btn-sm btn-outline-primary me-1"
                                                title="Edit"
                                            >
                                                <Edit2 size={14} />
                                            </Link>
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleDelete(product.id)}
                                                title="Delete"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
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
                                            onClick={() => fetchProducts(currentPage - 1)} 
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
                                            onClick={() => fetchProducts(currentPage + 1)} 
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
            )}
        </div>
    );
}
