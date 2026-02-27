import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { sourceApi } from "@/services/api";
import type { Source } from "@/types";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Swal from "sweetalert2";

export default function SourceList() {
  const [items, setItems] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchItems = useCallback(() => {
    setLoading(true);
    sourceApi.list().then((res) => {
      const sources = Array.isArray(res) ? res : [];
      if (search) {
        const searchLower = search.toLowerCase();
        setItems(sources.filter(s => 
          s.name.toLowerCase().includes(searchLower) ||
          (s.source_code && s.source_code.toLowerCase().includes(searchLower))
        ));
      } else {
        setItems(sources);
      }
    }).finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Delete Source?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      confirmButtonText: "Yes, delete it!"
    });
    if (result.isConfirmed) {
      await sourceApi.delete(id);
      Swal.fire("Deleted!", "Source has been deleted.", "success");
      fetchItems();
    }
  };

  return (
    <div>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">CRM</Link></li>
          <li className="breadcrumb-item active">Sources</li>
        </ol>
      </nav>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Sources</h2>
        <Link to="/sources/new" className="btn btn-primary"><Plus size={16} className="me-1" /> Add Source</Link>
      </div>
      <div className="row g-2 mb-3">
        <div className="col-md-4">
          <input type="text" className="form-control" placeholder="Search sources..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5 text-muted">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted mb-3">No sources found.</p>
          <Link to="/sources/new" className="btn btn-primary">Create a new Source</Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Source Name</th>
                <th>Source Code</th>
                <th>Created</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="fw-medium">{item.name}</td>
                  <td>{item.source_code || "-"}</td>
                  <td>{item.created_at ? new Date(item.created_at).toLocaleDateString() : "-"}</td>
                  <td className="text-end">
                    <Link to={`/sources/${item.id}/edit`} className="btn btn-sm btn-outline-secondary me-1"><Pencil size={14} /></Link>
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
