import { useEffect, useState } from "react";
import MapView from "./components/MapView";

const API_BASE = "http://localhost:4000";

function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [robots, setRobots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Beim Laden prüfen, ob schon Token/User im localStorage liegen
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken) {
      setToken(storedToken);
    }
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        /* ignore */
      }
    }
  }, []);

  // Wenn Token vorhanden, Roboter laden
  useEffect(() => {
    if (!token) return;
    fetchRobots();
  }, [token]);

  // Roboter automatisch alle 5 Sekunden neu laden, solange ein Token vorhanden ist
  useEffect(() => {
    if (!token) return;

    const intervalId = setInterval(() => {
      fetchRobots();
    }, 5000);

    // Aufräumen, wenn Token weg ist oder Komponente neu geladen wird
    return () => clearInterval(intervalId);
  }, [token]);


  async function handleLogin(email, password) {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Login fehlgeschlagen!");
      }

      const data = await res.json();
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    } catch (err) {
      console.error("Login error!:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchRobots() {
    if (!token) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/robots`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Fehler beim Laden der Roboter!");
      }

      const data = await res.json();
      setRobots(data);
    } catch (err) {
      console.error("Robots error!:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function moveRobot(id) {
    if (!token) return;
    setError("");
    try {
      const res = await fetch(`${API_BASE}/robots/${id}/move`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Fehler beim Bewegen des Roboters!");
      }

      const updated = await res.json();

      setRobots((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r))
      );
    } catch (err) {
      console.error("Move error!:", err);
      setError(err.message);
    }
  }

  function handleLogout() {
    setToken(null);
    setUser(null);
    setRobots([]);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  // Login Formular, wenn kein Token
  if (!token) {
    return (
      <div style={styles.container}>
        <h1>Fleet Monitor - Login</h1>
        <LoginForm onLogin={handleLogin} loading={loading} />
        {error && <p style={styles.error}>{error}</p>}
      </div>
    );
  }

  // Wenn Token vorhanden, Dashboard
  return (
  <div style={styles.container}>
    <header style={styles.header}>
      <h1>Fleet Monitor - Dashboard</h1>
      <div>
        {user && (
          <span style={{ marginRight: "1rem" }}>
            Eingeloggt als <strong>{user.email}</strong>
          </span>
        )}
        <button onClick={handleLogout}>Logout</button>
      </div>
    </header>

    {error && <p style={styles.error}>{error}</p>}

    {/* Karte */}
    <MapView robots={robots} />

    <section style={{ marginBottom: "1rem" }}>
      <button onClick={fetchRobots} disabled={loading}>
        {loading ? "Lade..." : "Roboter neu laden"}
      </button>
    </section>

    <RobotTable robots={robots} onMove={moveRobot} />
  </div>
);

}

// Login Formular
function LoginForm({ onLogin, loading }) {
  const [email, setEmail] = useState("admin@test.com");
  const [password, setPassword] = useState("test123");

  function handleSubmit(e) {
    e.preventDefault();
    onLogin(email, password);
  }

  return (
    <form onSubmit={handleSubmit} style={styles.card}>
      <label style={styles.label}>
        E-Mail
        <input
          style={styles.input}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
        />
      </label>
      <label style={styles.label}>
        Passwort
        <input
          style={styles.input}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
      </label>
      <button type="submit" disabled={loading}>
        {loading ? "Anmelden..." : "Login"}
      </button>
    </form>
  );
}

// Tabelle Roboter
function RobotTable({ robots, onMove }) {
  if (!robots || robots.length === 0) {
    return <p>Aktuell sind keine Roboter vorhanden.</p>;
  }

  return (
    <table style={styles.table}>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Status</th>
          <th>Lat</th>
          <th>Lon</th>
          <th>Zuletzt aktualisiert</th>
          <th>Aktion</th>
        </tr>
      </thead>
      <tbody>
        {robots.map((robot) => (
          <tr key={robot.id}>
            <td>{robot.id}</td>
            <td>{robot.name}</td>
            <td>{robot.status}</td>
            <td>{robot.lat.toFixed(5)}</td>
            <td>{robot.lon.toFixed(5)}</td>
            <td>
              {robot.updated_at
                ? new Date(robot.updated_at).toLocaleString()
                : "-"}
            </td>
            <td>
              <button onClick={() => onMove(robot.id)}>Bewegen</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const styles = {
  container: {
    fontFamily: "system-ui, sans-serif",
    maxWidth: "900px",
    margin: "2rem auto",
    padding: "1rem",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    maxWidth: "300px",
  },
  label: {
    display: "flex",
    flexDirection: "column",
    fontSize: "0.9rem",
  },
  input: {
    padding: "0.4rem 0.5rem",
    marginTop: "0.25rem",
  },
  error: {
    color: "red",
    marginTop: "1rem",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
};

export default App;
