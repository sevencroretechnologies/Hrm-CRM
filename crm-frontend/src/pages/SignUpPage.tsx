import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Swal from "sweetalert2";

export default function SignUpPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [loading, setLoading] = useState(false);
    const { signUp } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== passwordConfirmation) {
            return Swal.fire("Error", "Passwords do not match", "error");
        }

        setLoading(true);
        try {
            await signUp({
                name,
                email,
                password,
                password_confirmation: passwordConfirmation
            });
            Swal.fire({
                icon: "success",
                title: "Account created successfully",
                showConfirmButton: false,
                timer: 1500
            });
            navigate("/");
        } catch (err: any) {
            console.error(err);
            Swal.fire("Error", err.response?.data?.message || "Registration failed", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
            <div className="card shadow border-0" style={{ width: "450px" }}>
                <div className="card-body p-5">
                    <div className="text-center mb-4">
                        <h3 className="fw-bold text-primary">CRM</h3>
                        <p className="text-muted">Create your account</p>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label text-muted">Full Name</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
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
                        <div className="row mb-3">
                            <div className="col-md-6">
                                <label className="form-label text-muted">Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label text-muted">Confirm</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder="Confirm"
                                    value={passwordConfirmation}
                                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary w-100 py-2 mb-3 fw-semibold"
                            disabled={loading}
                        >
                            {loading ? "Creating account..." : "Create Account"}
                        </button>
                        <div className="text-center">
                            <span className="text-muted" style={{ fontSize: "0.9rem" }}>Already have an account? </span>
                            <Link to="/login" className="fw-semibold" style={{ fontSize: "0.9rem" }}>Sign In</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
