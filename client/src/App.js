import React, { useState, useEffect } from "react";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [search, setSearch] = useState("");

  // Auth states
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ================= CHECK LOGIN ON LOAD =================
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      fetchTasks();
    }
  }, []);

  // ================= FETCH TASKS =================
  const fetchTasks = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5000/tasks", {
      headers: {
        Authorization: token,
      },
    });

    const data = await res.json();
    setTasks(data);
  };

  // ================= ADD TASK =================
  const addTask = async () => {
    if (!title) return;

    const token = localStorage.getItem("token");

    await fetch("http://localhost:5000/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ title }),
    });

    setTitle("");
    fetchTasks();
  };

  // ================= DELETE TASK =================
  const deleteTask = async (id) => {
    const token = localStorage.getItem("token");

    await fetch(`http://localhost:5000/tasks/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: token,
      },
    });

    fetchTasks();
  };

  // ================= TOGGLE COMPLETE =================
  const toggleComplete = async (task) => {
    const token = localStorage.getItem("token");

    await fetch(`http://localhost:5000/tasks/${task._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ completed: !task.completed }),
    });

    fetchTasks();
  };

  // ================= AUTH FUNCTIONS =================
  const handleSignup = async () => {
    const res = await fetch("http://localhost:5000/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    alert(data.message);
  };

  const handleLogin = async () => {
    const res = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      fetchTasks();
    } else {
      alert(data.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setTasks([]);
  };

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(search.toLowerCase())
  );

  const completedCount = tasks.filter((t) => t.completed).length;

  // ================= SHOW AUTH SCREEN =================
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
          >
            {isLogin ? "Login" : "Signup"}
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
            placeholder="Enter task..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button style={styles.addBtn} onClick={addTask}>
            ➕ Add
          </button>
        </div>

        <input
          style={{ ...styles.input, marginBottom: "20px" }}
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
                <span
                  onClick={() => toggleComplete(task)}
                  style={{ cursor: "pointer", flex: 1 }}
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

        <h3>✅ Completed Tasks</h3>
        <ul style={styles.list}>
          {filteredTasks
            .filter((task) => task.completed)
            .map((task) => (
              <li key={task._id} style={styles.taskItem}>
                <span
                  onClick={() => toggleComplete(task)}
                  style={{
                    textDecoration: "line-through",
                    cursor: "pointer",
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

// ================= STYLES =================
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
    width: "420px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
    textAlign: "center",
    position: "relative",
  },
  inputRow: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
  },
  input: {
    flex: 1,
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    marginBottom: "10px",
  },
  addBtn: {
    padding: "8px 12px",
    background: "#667eea",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  deleteBtn: {
    marginLeft: "10px",
    background: "red",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  logoutBtn: {
    position: "absolute",
    top: "15px",
    right: "15px",
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
    alignItems: "center",
    marginBottom: "10px",
    padding: "8px",
    background: "#f4f4f4",
    borderRadius: "6px",
  },
};

export default App;