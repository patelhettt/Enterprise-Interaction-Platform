import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../../config";

const SharedProtectedRoute = ({ children }) => {
    const [status, setStatus] = useState("checking");
    const [fallbackLogin, setFallbackLogin] = useState("/login");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setStatus("invalid");
            return;
        }

        const adminRaw = localStorage.getItem("adminData");
        const userRaw = localStorage.getItem("user");

        let role = null;
        let url = "";

        if (adminRaw) {
            try {
                const admin = JSON.parse(adminRaw);
                if (admin.user_type === "admin" || admin.has_admin_role) {
                    role = "admin";
                    setFallbackLogin("/adminLogin");
                    url = `${BACKEND_URL}/auth/admin/verify`;
                }
            } catch { }
        }

        if (!role && userRaw) {
            try {
                const user = JSON.parse(userRaw);
                if (user.user_type === "employee") {
                    role = "employee";
                    url = `${BACKEND_URL}/auth/employee/verify`;
                }
            } catch { }
        }

        if (!role) {
            setStatus("invalid");
            return;
        }

        axios
            .get(url, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                if (res.data.valid) {
                    setStatus("valid");
                } else {
                    setStatus("invalid");
                }
            })
            .catch(() => {
                setStatus("invalid");
            });
    }, []);

    if (status === "checking") {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
        );
    }

    if (status === "invalid") {
        return <Navigate to={fallbackLogin} replace />;
    }

    return children;
};

export default SharedProtectedRoute;
