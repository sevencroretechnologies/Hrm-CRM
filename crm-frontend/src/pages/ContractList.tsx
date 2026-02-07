import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { contractApi } from "@/services/api";
import type { Contract } from "@/types";
import { Plus, Pencil, Trash2, CheckCircle } from "lucide-react";
import Swal from "sweetalert2";

const statusBadge = (s: string, signed: boolean) => {
  if (signed) return "bg-success";
  if (s === "Unsigned") return "bg-warning text-dark";
  return "bg-secondary";
};

export default function ContractList() {
  const [items, setItems] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchItems = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (search) params.search = search;
    contractApi.list(params).then((res) => {
      setItems(Array.isArray(res) ? res : res.data || []);
    }).finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({ title: "Delete Contract?", text: "This action cannot be undone.", icon: "warning", showCancelButton: true, confirmButtonColor: "#dc3545", confirmButtonText: "Yes, delete it!" });
    if (result.isConfirmed) {
      await contractApi.delete(id);
      Swal.fire("Deleted!", "Contract has been deleted.", "success");
      fetchItems();
    }
  };

  const handleSign = async (id: number) => {
    const result = await Swal.fire({ title: "Sign Contract?", text: "Mark this contract as signed.", icon: "question", showCancelButton: true, confirmButtonText: "Yes, sign it!", input: "text", inputLabel: "Signee Name", inputPlaceholder: "Enter signee name" });
    if (result.isConfirmed) {
      try {
        await contractApi.sign(id, { signee: result.value || "" });
        Swal.fire("Signed!", "Contract has been signed.", "success");
        fetchItems();
      } catch {
        Swal.fire("Error", "Failed to sign contract.", "error");
      }
    }
  };

  return (
    <div>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">CRM</Link></li>
          <li className="breadcrumb-item active">Contract</li>
        </ol>
      </nav>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Contract</h2>
        <Link to="/contracts/new" className="btn btn-primary"><Plus size={16} className="me-1" /> Add Contract</Link>
      </div>
      <div className="row g-2 mb-3">
        <div className="col-md-4">
          <input type="text" className="form-control" placeholder="Search contracts..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5 text-muted">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted mb-3">No contracts found.</p>
          <Link to="/contracts/new" className="btn btn-primary">Create a new Contract</Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Party Name</th>
                <th>Party Type</th>
                <th>Status</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Signed</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="fw-medium">{item.party_name}</td>
                  <td>{item.party_type}</td>
                  <td><span className={`badge ${statusBadge(item.status, item.is_signed)}`}>{item.is_signed ? "Signed" : item.status}</span></td>
                  <td>{item.start_date || "-"}</td>
                  <td>{item.end_date || "-"}</td>
                  <td>{item.is_signed ? item.signee || "Yes" : "No"}</td>
                  <td className="text-end">
                    {!item.is_signed && <button className="btn btn-sm btn-outline-success me-1" title="Sign" onClick={() => handleSign(item.id)}><CheckCircle size={14} /></button>}
                    <Link to={`/contracts/${item.id}/edit`} className="btn btn-sm btn-outline-secondary me-1"><Pencil size={14} /></Link>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(item.id)}><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
