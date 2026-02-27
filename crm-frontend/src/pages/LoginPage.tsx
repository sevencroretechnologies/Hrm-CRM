import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Swal from "sweetalert2";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login({ email, password });
            Swal.fire({
                icon: "success",
                title: "Logged in successfully",
                showConfirmButton: false,
                timer: 1500
            });
            navigate("/");
        } catch (err: any) {
            console.error(err);
            Swal.fire("Error", err.response?.data?.message || "Invalid credentials", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
            <div className="card shadow border-0" style={{ width: "400px" }}>
                <div className="card-body p-5">
                    <div className="text-center mb-4">
                        <h3 className="fw-bold text-primary">CRM</h3>
                        <p className="text-muted">Sign in to your account</p>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label text-muted">Email address</label>
                            <input
                                type="email"
                                className="form-control"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <div className="d-flex justify-content-between">
                                <label className="form-label text-muted">Password</label>
                                <Link to="/forgot-password" style={{ fontSize: "0.85rem" }}>Forgot Password?</Link>
                            </div>
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary w-100 py-2 mb-3 fw-semibold"
                            disabled={loading}
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                        <div className="text-center">
                            <span className="text-muted" style={{ fontSize: "0.9rem" }}>Don't have an account? </span>
                            <Link to="/signup" className="fw-semibold" style={{ fontSize: "0.9rem" }}>Sign Up</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
