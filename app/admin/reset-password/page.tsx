"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabaseBrowser.auth.getSession();

      if (!data.session) {
        setError("Recovery link is invalid or expired.");
      }

      setChecking(false);
    }

    checkSession();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error: updateError } =
      await supabaseBrowser.auth.updateUser({
        password,
      });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setMessage("Password updated successfully.");

    setTimeout(() => {
      router.push("/admin");
    }, 1000);
  }

  if (checking) {
    return (
      <main style={styles.page}>
        <div style={styles.card}>
          <p style={styles.muted}>Checking recovery link...</p>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>NURANICO</div>

        <h1 style={styles.title}>Reset Password</h1>

        <p style={styles.subtitle}>
          Create a new password for your admin account.
        </p>

        {error && <div style={styles.error}>{error}</div>}

        {message && <div style={styles.success}>{message}</div>}

        {!error && (
          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              style={styles.input}
              required
            />

            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              autoComplete="new-password"
              style={styles.input}
              required
            />

            <button
              type="submit"
              disabled={loading}
              style={styles.button}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}

        <button
          type="button"
          onClick={() => router.push("/admin/login")}
          style={styles.back}
        >
          Back to Login
        </button>
      </div>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#111",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
  } as React.CSSProperties,

  card: {
    width: "100%",
    maxWidth: "430px",
    background: "#181818",
    border: "1px solid #292929",
    borderRadius: "18px",
    padding: "38px",
    boxSizing: "border-box",
  } as React.CSSProperties,

  logo: {
    fontSize: "13px",
    letterSpacing: "4px",
    fontWeight: 600,
    marginBottom: "34px",
  } as React.CSSProperties,

  title: {
    fontSize: "30px",
    fontWeight: 500,
    margin: "0 0 10px",
  } as React.CSSProperties,

  subtitle: {
    color: "#999",
    fontSize: "14px",
    lineHeight: 1.7,
    margin: "0 0 28px",
  } as React.CSSProperties,

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  } as React.CSSProperties,

  input: {
    width: "100%",
    boxSizing: "border-box",
    background: "#111",
    border: "1px solid #303030",
    color: "#fff",
    borderRadius: "10px",
    padding: "14px 15px",
    outline: "none",
    fontSize: "14px",
  } as React.CSSProperties,

  button: {
    border: 0,
    borderRadius: "10px",
    padding: "14px",
    marginTop: "8px",
    background: "#fff",
    color: "#111",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  } as React.CSSProperties,

  back: {
    width: "100%",
    background: "transparent",
    border: 0,
    color: "#888",
    marginTop: "24px",
    cursor: "pointer",
    fontSize: "13px",
  } as React.CSSProperties,

  error: {
    background: "#2a1717",
    border: "1px solid #4a2424",
    color: "#ff9b9b",
    padding: "12px",
    borderRadius: "9px",
    fontSize: "13px",
    lineHeight: 1.5,
    marginBottom: "18px",
  } as React.CSSProperties,

  success: {
    background: "#17251b",
    border: "1px solid #294a32",
    color: "#9be0aa",
    padding: "12px",
    borderRadius: "9px",
    fontSize: "13px",
    lineHeight: 1.5,
    marginBottom: "18px",
  } as React.CSSProperties,

  muted: {
    color: "#888",
    fontSize: "14px",
  } as React.CSSProperties,
};