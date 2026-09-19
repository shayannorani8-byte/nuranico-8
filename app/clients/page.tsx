export default function ClientsPage() {
  const clients = [
    "CLIENT 01",
    "CLIENT 02",
    "CLIENT 03",
    "CLIENT 04",
    "CLIENT 05",
    "CLIENT 06",
    "CLIENT 07",
    "CLIENT 08",
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#171717",
        color: "#f5f5f5",
        padding: "120px 7vw",
      }}
    >
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <a
          href="/"
          style={{
            color: "#aaa",
            textDecoration: "none",
            fontSize: 13,
            letterSpacing: "0.08em",
          }}
        >
          ← BACK TO NURANICO
        </a>

        <div style={{ marginTop: 90 }}>
          <p
            style={{
              fontSize: 12,
              letterSpacing: "0.18em",
              color: "#888",
              marginBottom: 20,
            }}
          >
            SELECTED CLIENTS
          </p>

          <h1
            style={{
              fontSize: "clamp(48px, 8vw, 110px)",
              lineHeight: 0.95,
              fontWeight: 400,
              letterSpacing: "-0.05em",
              margin: 0,
            }}
          >
            Brands we
            <br />
            <span style={{ color: "#777" }}>create with.</span>
          </h1>
        </div>

        <div
          style={{
            marginTop: 100,
            borderTop: "1px solid #333",
          }}
        >
          {clients.map((client, index) => (
            <div
              key={client}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "28px 0",
                borderBottom: "1px solid #333",
                fontSize: "clamp(20px, 2.5vw, 34px)",
              }}
            >
              <span>{client}</span>

              <span
                style={{
                  fontSize: 11,
                  color: "#777",
                  letterSpacing: "0.12em",
                }}
              >
                0{index + 1}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}