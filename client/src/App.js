import React, { useState, useEffect } from "react";

const BASE_URL = "https://student-task-backend-6g1q.onrender.com";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [search, setSearch] = useState("");

  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("Medium");

  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  // ================= CHECK LOGIN =================
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // ================= FETCH TASKS =================
  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${BASE_URL}/tasks`, {
        headers: { Authorization: token },
      });

      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.log("Fetch error:", err);
    }
  };

  useEffect(() => {
    if (user) fetchTasks();
  }, [user]);

  // ================= ADD TASK =================
  const addTask = async () => {
    if (!title) return;

    try {
      const token = localStorage.getItem("token");

      await fetch(`${BASE_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ title, dueDate, priority }),
      });

      setTitle("");
      setDueDate("");
      setPriority("Medium");
      fetchTasks();
    } catch (err) {
      alert("Failed to add task");
    }
  };

  // ================= DELETE =================
  const deleteTask = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await fetch(`${BASE_URL}/tasks/${id}`, {
        method: "DELETE",
        headers: { Authorization: token },
      });

      fetchTasks();
    } catch (err) {
      alert("Delete failed");
    }
  };

  // ================= TOGGLE =================
  const toggleComplete = async (task) => {
    try {
      const token = localStorage.getItem("token");

      await fetch(`${BASE_URL}/tasks/${task._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ completed: !task.completed }),
      });

      fetchTasks();
    } catch (err) {
      alert("Update failed");
    }
  };

  // ================= AUTH =================
  const handleSignup = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${BASE_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message);
        setIsLogin(true);
      } else {
        alert(data.message);
      }
    } catch {
      alert("Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
      } else {
        alert(data.message);
      }
    } catch {
      alert("Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setTasks([]);
  };

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(search.toLowerCase())
  );

  const completedCount = tasks.filter((t) => t.completed).length;

  // ================= AUTH SCREEN =================
  if (!user) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h2>{isLogin ? "Login" : "Signup"}</h2>

          {!isLogin && (
            <input
              style={styles.input}
              type="text"
              placeholder="Name"
              onChange={(e) => setName(e.target.value)}
            />
          )}

          <input
            style={styles.input}
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            style={styles.addBtn}
            onClick={isLogin ? handleLogin : handleSignup}
            disabled={loading}
          >
            {loading ? "Please wait..." : isLogin ? "Login" : "Signup"}
          </button>

          <p
            style={{ cursor: "pointer", marginTop: "10px" }}
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin
              ? "Don't have an account? Signup"
              : "Already have an account? Login"}
          </p>
        </div>
      </div>
    );
  }

  // ================= MAIN APP =================
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </button>

        <h1>Student Task Tracker 🚀</h1>
        <p>Welcome, {user.name}</p>

        <p>Total Tasks: {tasks.length}</p>
        <p>Completed: {completedCount}</p>

        <div style={styles.inputRow}>
          <input
            style={styles.input}
            type="text"
            placeholder="Task title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <input
          style={styles.input}
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <select
          style={styles.input}
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <button style={styles.addBtn} onClick={addTask}>
          ➕ Add Task
        </button>

        <input
          style={{ ...styles.input, marginTop: "20px" }}
          type="text"
          placeholder="🔍 Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <h3>📌 Pending Tasks</h3>
        <ul style={styles.list}>
          {filteredTasks
            .filter((task) => !task.completed)
            .map((task) => (
              <li key={task._id} style={styles.taskItem}>
                <div style={{ flex: 1 }}>
                  <strong
                    style={{ cursor: "pointer" }}
                    onClick={() => toggleComplete(task)}
                  >
                    {task.title}
                  </strong>

                  <div style={{ fontSize: "12px" }}>
                    📅{" "}
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString()
                      : "No Due Date"}
                  </div>

                  <div
                    style={{
                      fontSize: "12px",
                      color:
                        task.priority === "High"
                          ? "red"
                          : task.priority === "Medium"
                          ? "orange"
                          : "green",
                    }}
                  >
                    🔥 {task.priority}
                  </div>

                  {task.dueDate &&
                    new Date(task.dueDate) < new Date() && (
                      <div style={{ color: "red", fontSize: "12px" }}>
                        ⚠️ Overdue
                      </div>
                    )}
                </div>

                <button
                  style={styles.deleteBtn}
                  onClick={() => deleteTask(task._id)}
                >
                  ❌
                </button>
              </li>
            ))}
        </ul>

        <h3>✅ Completed Tasks</h3>
        <ul style={styles.list}>
          {filteredTasks
            .filter((task) => task.completed)
            .map((task) => (
              <li key={task._id} style={styles.taskItem}>
                <span
                  style={{
                    textDecoration: "line-through",
                    flex: 1,
                  }}
                >
                  {task.title}
                </span>

                <button
                  style={styles.deleteBtn}
                  onClick={() => deleteTask(task._id)}
                >
                  ❌
                </button>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
  },
  card: {
    background: "white",
    padding: "30px",
    borderRadius: "12px",
    width: "450px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
    position: "relative",
  },
  inputRow: {
    display: "flex",
    gap: "10px",
  },
  input: {
    width: "100%",
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    marginBottom: "10px",
  },
  addBtn: {
    width: "100%",
    padding: "8px",
    background: "#667eea",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginBottom: "10px",
  },
  deleteBtn: {
    background: "red",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    padding: "5px 8px",
  },
  logoutBtn: {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "#333",
    color: "white",
    border: "none",
    padding: "5px 10px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  list: {
    listStyle: "none",
    padding: 0,
  },
  taskItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "10px",
    padding: "8px",
    background: "#f4f4f4",
    borderRadius: "6px",
  },
};

export default App;