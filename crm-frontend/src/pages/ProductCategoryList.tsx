import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { productCategoryApi } from "@/services/api";
import type { ProductCategory, PaginatedResponse } from "@/types";
import { Plus, Trash2, Edit2, Search, X, ArrowLeft, ArrowRight } from "lucide-react";
import Swal from "sweetalert2";

export default function ProductCategoryList() {
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(15);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchCategories = useCallback((page = 1) => {
        setLoading(true);
        const params: Record<string, string | number> = { page, per_page: perPage };
        if (search) params.search = search;
        productCategoryApi
            .list(params)
            .then((data: PaginatedResponse<ProductCategory>) => {
                setCategories(data.data || []);
                setCurrentPage(data.current_page);
                setTotalPages(data.last_page);
                setTotal(data.total);
            })
            .catch(() => setCategories([]))
            .finally(() => setLoading(false));
    }, [search, perPage]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCategories(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [search, fetchCategories]);

    const handleAdd = async () => {
        const { value: formValues } = await Swal.fire({
            title: "Add Product Category",
            html:
                '<input id="swal-name" class="swal2-input" placeholder="Category Name">' +
                '<textarea id="swal-description" class="swal2-textarea" placeholder="Description (optional)"></textarea>',
            focusConfirm: false,
            showCancelButton: true,
            preConfirm: () => {
                const name = (document.getElementById("swal-name") as HTMLInputElement).value;
                if (!name) {
                    Swal.showValidationMessage("Category name is required!");
                    return false;
                }
                return {
                    name,
                    description: (document.getElementById("swal-description") as HTMLTextAreaElement).value || null,
                };
            },
        });
        if (formValues) {
            try {
                await productCategoryApi.create(formValues);
                Swal.fire("Added!", "Product category has been added.", "success");
                fetchCategories(currentPage);
            } catch {
                Swal.fire("Error", "Failed to add product category.", "error");
            }
        }
    };

    const handleEdit = async (category: ProductCategory) => {
        const { value: formValues } = await Swal.fire({
            title: "Edit Product Category",
            html:
                `<input id="swal-name" class="swal2-input" placeholder="Category Name" value="${category.name}">` +
                `<textarea id="swal-description" class="swal2-textarea" placeholder="Description (optional)">${category.description || ""}</textarea>`,
            focusConfirm: false,
            showCancelButton: true,
            preConfirm: () => {
                const name = (document.getElementById("swal-name") as HTMLInputElement).value;
                if (!name) {
                    Swal.showValidationMessage("Category name is required!");
                    return false;
                }
                return {
                    name,
                    description: (document.getElementById("swal-description") as HTMLTextAreaElement).value || null,
                };
            },
        });
        if (formValues && (formValues.name !== category.name || formValues.description !== category.description)) {
            try {
                await productCategoryApi.update(category.id, formValues);
                Swal.fire("Updated!", "Product category has been updated.", "success");
                fetchCategories(currentPage);
            } catch {
                Swal.fire("Error", "Failed to update product category.", "error");
            }
        }
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: "Delete Product Category?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            confirmButtonText: "Delete",
        });
        if (result.isConfirmed) {
            try {
                await productCategoryApi.delete(id);
                Swal.fire("Deleted!", "Product category has been deleted.", "success");
                fetchCategories(currentPage);
            } catch {
                Swal.fire("Error", "Failed to delete product category.", "error");
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
                    <li className="breadcrumb-item active">Product Categories</li>
                </ol>
            </nav>

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">
                    Product Categories
                    {total > 0 && <small className="text-muted ms-2" style={{ fontSize: "0.5em" }}>({total})</small>}
                </h2>
                <button className="btn btn-primary" onClick={handleAdd}>
                    <Plus size={18} className="me-1" /> Add Category
                </button>
            </div>

            <div className="row g-2 mb-3">
                <div className="col-md-4">
                    <div className="position-relative">
                        <Search size={16} className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
                        <input
                            type="text"
                            className="form-control ps-5"
                            placeholder="Search categories..."
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
                                <th>Name</th>
                                <th>Description</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center text-muted py-4">
                                        No product categories found
                                    </td>
                                </tr>
                            )}
                            {categories.map((category, index) => (
                                <tr key={category.id}>
                                    <td>{(currentPage - 1) * perPage + index + 1}</td>
                                    <td>
                                        <span className="badge bg-success">{category.name}</span>
                                    </td>
                                    <td>{category.description || "-"}</td>
                                    <td className="text-end">
                                        <button
                                            className="btn btn-sm btn-outline-primary me-2"
                                            onClick={() => handleEdit(category)}
                                            title="Edit"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDelete(category.id)}
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
                                        onClick={() => fetchCategories(currentPage - 1)} 
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
                                        onClick={() => fetchCategories(currentPage + 1)} 
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
