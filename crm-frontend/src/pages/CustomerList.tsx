import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { customerApi } from "@/services/api";
import type { Customer, PaginatedResponse } from "@/types";
import { Plus, Trash2, Edit2, Eye, Search, X, ArrowLeft, ArrowRight } from "lucide-react";
import Swal from "sweetalert2";

export default function CustomerList() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(15);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchCustomers = useCallback((page = 1) => {
        setLoading(true);
        const params: Record<string, string | number> = { page, per_page: perPage };
        if (search) params.search = search;

        customerApi.list(params)
            .then((data: PaginatedResponse<Customer>) => {
                setCustomers(data.data || []);
                setCurrentPage(data.current_page);
                setTotalPages(data.last_page);
                setTotal(data.total);
            })
            .catch(() => setCustomers([]))
            .finally(() => setLoading(false));
    }, [search, perPage]);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCustomers(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [search, fetchCustomers]);

    const viewCustomer = async (customer: Customer) => {
        await Swal.fire({
            title: customer.name,
            width: 650,
            html: `
                <div style="text-align:left;">
                    <table class="table table-borderless mb-0" style="font-size:0.9rem;">
                        <tr><td class="fw-semibold" style="width:160px;">Customer Type</td><td>${customer.customer_type || "—"}</td></tr>
                        <tr><td class="fw-semibold">Customer Group</td><td>${customer.customer_group?.name || "—"}</td></tr>
                        <tr><td class="fw-semibold">Territory</td><td>${customer.territory?.territory_name || "—"}</td></tr>
                        <tr><td class="fw-semibold">Email</td><td>${customer.email || "—"}</td></tr>
                        <tr><td class="fw-semibold">Phone</td><td>${customer.phone || "—"}</td></tr>
                        <tr><td class="fw-semibold">Website</td><td>${customer.website || "—"}</td></tr>
                    </table>
                </div>
            `,
            confirmButtonText: "Close",
            confirmButtonColor: "#6c757d",
        });
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: "Delete Customer?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            confirmButtonText: "Yes, delete it!",
        });
        if (result.isConfirmed) {
            await customerApi.delete(id);
            Swal.fire("Deleted!", "Customer has been deleted.", "success");
            fetchCustomers(currentPage);
        }
    };

    return (
        <div>
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item"><Link to="/">CRM</Link></li>
                    <li className="breadcrumb-item active">Customers</li>
                </ol>
            </nav>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>
                    Customers
                    <small className="text-muted ms-2" style={{ fontSize: "0.5em" }}>({total})</small>
                </h2>
                <Link to="/customers/new" className="btn btn-primary"><Plus size={16} className="me-1" /> New Customer</Link>
            </div>
            <div className="row g-2 mb-3">
                <div className="col-md-4">
                    <div className="position-relative">
                        <Search size={16} className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
                        <input
                            type="text"
                            className="form-control ps-5"
                            placeholder="Search customers..."
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

            {loading ? (
                <div className="text-center py-5 text-muted">Loading...</div>
            ) : customers.length === 0 ? (
                <div className="text-center py-5">
                    <p className="text-muted mb-3">No customers found.</p>
                    <Link to="/customers/new" className="btn btn-primary">Create a new Customer</Link>
                </div>
            ) : (
                <div className="card">
                    <div className="card-body p-0">
                        <table className="table table-hover mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Customer Type</th>
                                    <th>Customer Group</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map((customer, index) => (
                                    <tr key={customer.id}>
                                        <td>{(currentPage - 1) * perPage + index + 1}</td>
                                        <td className="fw-medium">
                                            <Link to={`/customers/${customer.id}/edit`} className="text-decoration-none text-dark">
                                                {customer.name}
                                            </Link>
                                        </td>
                                        <td>{customer.customer_type || "-"}</td>
                                        <td>{customer.customer_group?.name || "-"}</td>
                                        <td>{customer.email || "-"}</td>
                                        <td>{customer.phone || "-"}</td>
                                        <td className="text-end">
                                            <button
                                                className="btn btn-sm btn-outline-secondary me-1"
                                                onClick={() => viewCustomer(customer)}
                                                title="View"
                                            >
                                                <Eye size={14} />
                                            </button>
                                            <Link
                                                to={`/customers/${customer.id}/edit`}
                                                className="btn btn-sm btn-outline-primary me-1"
                                                title="Edit"
                                            >
                                                <Edit2 size={14} />
                                            </Link>
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleDelete(customer.id)}
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
                                            onClick={() => fetchCustomers(currentPage - 1)} 
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
                                            onClick={() => fetchCustomers(currentPage + 1)} 
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
