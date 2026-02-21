import React, { useState, useEffect } from "react";

const BASE_URL = "https://student-task-backend-6g1q.onrender.com";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [search, setSearch] = useState("");

  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("Medium");

  const [sortType, setSortType] = useState("created");

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
    } catch {
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
    } catch {
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
    } catch {
      alert("Update failed");
    }
  };

  // ================= SORTING LOGIC =================
  let filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(search.toLowerCase())
  );

  if (sortType === "dueDate") {
    filteredTasks.sort(
      (a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0)
    );
  } else if (sortType === "priority") {
    const priorityOrder = { High: 1, Medium: 2, Low: 3 };
    filteredTasks.sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
    );
  } else {
    filteredTasks.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  //const completedCount = tasks.filter((t) => t.completed).length;

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
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setTasks([]);
  };

  // ================= AUTH SCREEN =================
  if (!user) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h2>{isLogin ? "Login" : "Signup"}</h2>

          {!isLogin && (
            <input
              style={styles.input}
              placeholder="Name"
              onChange={(e) => setName(e.target.value)}
            />
          )}

          <input
            style={styles.input}
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
            {loading ? "Please wait..." : isLogin ? "Login" : "Signup"}
          </button>

          <p onClick={() => setIsLogin(!isLogin)} style={{ cursor: "pointer" }}>
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

        <input
          style={styles.input}
          placeholder="Task title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

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
          style={styles.input}
          placeholder="🔍 Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          style={styles.input}
          value={sortType}
          onChange={(e) => setSortType(e.target.value)}
        >
          <option value="created">Sort by Created</option>
          <option value="dueDate">Sort by Due Date</option>
          <option value="priority">Sort by Priority</option>
        </select>

        <ul style={styles.list}>
          {filteredTasks.map((task) => (
            <li key={task._id} style={styles.taskItem}>
              <div style={{ flex: 1 }}>
                <strong onClick={() => toggleComplete(task)}>
                  {task.title}
                </strong>
                <div>📅 {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No Due Date"}</div>
                <div>🔥 {task.priority}</div>
              </div>
              <button onClick={() => deleteTask(task._id)} style={styles.deleteBtn}>
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
  },
  input: {
    width: "100%",
    padding: "8px",
    marginBottom: "10px",
  },
  addBtn: {
    width: "100%",
    padding: "8px",
    background: "#667eea",
    color: "white",
    border: "none",
    marginBottom: "10px",
  },
  deleteBtn: {
    background: "red",
    color: "white",
    border: "none",
  },
  logoutBtn: {
    float: "right",
  },
  list: {
    listStyle: "none",
    padding: 0,
  },
  taskItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px",
    background: "#f4f4f4",
    marginBottom: "10px",
  },
};

export default App;