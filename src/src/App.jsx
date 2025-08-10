import React, { useEffect, useState } from "react";

/*
 Simple demo web app:
 - Email/password signup & login stored in browser localStorage (per device)
 - Multicolored pastel theme backgrounds
 - Profile modal (hidden until Profile button clicked)
 - Tim widget with a daily motivational thought saved per-day
 - Wren & Martin progress control & simple habit UI
 - Stories preview area and bottom navigation
 This app is ready to be built & deployed (Vite).
*/

const defaultThoughts = [
  "Small steps every day lead to big results.",
  "Mistakes are proof you're trying.",
  "Your effort today is your success tomorrow.",
  "Learning is a journey, not a race.",
  "Consistency beats perfection.",
  "Read a page, meet a new idea."
];

function DoodleIcon() {
  return (
    <svg className="doodle" width="72" height="72" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0" x2="1">
          <stop offset="0" stopColor="#ffd6e0" />
          <stop offset="1" stopColor="#d9f7f1" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="12" fill="url(#g)" />
    </svg>
  );
}

function TimWidget() {
  const [thought, setThought] = useState("");
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const key = "tim_thought_" + today;
    let t = localStorage.getItem(key);
    if (!t) {
      t = defaultThoughts[Math.floor(Math.random() * defaultThoughts.length)];
      localStorage.setItem(key, t);
    }
    setThought(t);
  }, []);
  return (
    <div className="card row tim-widget">
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div className="tim-avatar">Tim</div>
        <div>
          <div style={{ fontWeight: 700 }}>Tim says</div>
          <div className="small">{thought}</div>
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div className="mini">Tum the cat is cheering you on 🐾</div>
        <div style={{ fontSize: 28 }}>😺</div>
      </div>
    </div>
  );
}

function Auth({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");

  function loadUsers() {
    return JSON.parse(localStorage.getItem("users") || "{}");
  }
  function saveUsers(u) {
    localStorage.setItem("users", JSON.stringify(u));
  }
  function handleSignup() {
    const users = loadUsers();
    if (!email || !pw) {
      setMsg("Enter email and password");
      return;
    }
    if (users[email]) {
      setMsg("Account exists. Login or use another email.");
      return;
    }
    users[email] = { password: pw, profile: null, data: { progress: {}, habits: {} } };
    saveUsers(users);
    localStorage.setItem("currentUser", email);
    onLogin(email);
  }
  function handleLogin() {
    const users = loadUsers();
    if (users[email] && users[email].password === pw) {
      localStorage.setItem("currentUser", email);
      onLogin(email);
    } else setMsg("Invalid credentials");
  }

  return (
    <div className="card auth-card">
      <h2>Welcome to English with Tim</h2>
      <div className="small">A pastel learning app for friends & family (demo: accounts stored locally)</div>
      <div style={{ marginTop: 12 }}>
        <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div style={{ marginTop: 8 }}>
        <input className="input" placeholder="Password" type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button className="button" onClick={() => setMode("login")}>Login</button>
        <button className="button" onClick={() => setMode("signup")}>Sign up</button>
      </div>
      <div style={{ marginTop: 10 }}>
        {mode === "signup" ? <button className="button" onClick={handleSignup}>Create account</button> : <button className="button" onClick={handleLogin}>Sign in</button>}
      </div>
      <div style={{ marginTop: 10, color: "#b33" }}>{msg}</div>
      <div style={{ marginTop: 12 }} className="mini">Tip: accounts are saved in your browser only. Friends should sign up on their device too.</div>
    </div>
  );
}

function ProfileModal({ userEmail, onClose, onSave }) {
  const users = JSON.parse(localStorage.getItem("users") || "{}");
  const u = users[userEmail] || {};
  const p = u.profile || { name: "", age: "", level: "Beginner", genre: "General" };
  const [profile, setProfile] = useState(p);

  function save() {
    const users = JSON.parse(localStorage.getItem("users") || "{}");
    if (!users[userEmail]) users[userEmail] = { password: "", profile: null, data: {} };
    users[userEmail].profile = profile;
    localStorage.setItem("users", JSON.stringify(users));
    onSave(profile);
    onClose();
  }

  return (
    <div className="profile-modal card">
      <h3>Edit Profile</h3>
      <div style={{ marginTop: 6 }}><input className="input" placeholder="Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></div>
      <div style={{ marginTop: 6 }}><input className="input" placeholder="Age" value={profile.age} onChange={(e) => setProfile({ ...profile, age: e.target.value })} /></div>
      <div style={{ marginTop: 6 }}>
        <select className="input" value={profile.level} onChange={(e) => setProfile({ ...profile, level: e.target.value })}>
          <option>Beginner</option><option>Intermediate</option><option>Hard</option>
        </select>
      </div>
      <div style={{ marginTop: 6 }}><input className="input" placeholder="Favourite story/comic genre" value={profile.genre} onChange={(e) => setProfile({ ...profile, genre: e.target.value })} /></div>
      <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
        <button className="button" onClick={save}>Save</button>
        <button className="button" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

function AppInner({ userEmail }) {
  const [showProfile, setShowProfile] = useState(false);
  const users = JSON.parse(localStorage.getItem("users") || "{}");
  const profile = (users[userEmail] && users[userEmail].profile) || null;
  const [wrenProgress, setWrenProgress] = useState(parseInt(localStorage.getItem("wren_" + userEmail) || "0", 10));
  useEffect(() => {
    localStorage.setItem("wren_" + userEmail, "" + wrenProgress);
  }, [wrenProgress, userEmail]);

  function logout() {
    localStorage.removeItem("currentUser");
    window.location.reload();
  }

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <div className="logo">ET</div>
          <div>
            <div style={{ fontWeight: 700 }}>English with Tim</div>
            <div className="small">Multicolored pastel • Aesthetic doodles</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button className="button" onClick={() => setShowProfile(s => !s)}>Profile</button>
          <button className="button" onClick={logout}>Logout</button>
        </div>
      </header>

      {showProfile && <ProfileModal userEmail={userEmail} onClose={() => setShowProfile(false)} onSave={() => { }} />}

      <TimWidget />

      <div className="card">
        <h3>Today's Tasks</h3>
        <ul>
          <li>Read 20 minutes</li>
          <li>Wren & Martin — Chapter {wrenProgress + 1} (1 chapter per week)</li>
          <li>Presentation practice (short 2 min)</li>
          <li>Fun weekly task</li>
        </ul>
        <div style={{ marginTop: 8 }}>
          <div className="small">Wren progress</div>
          <div className="progressbar" style={{ marginTop: 6 }}>
            <div className="progress" style={{ width: `${(wrenProgress / 40) * 100}%` }}></div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button className="button" onClick={() => setWrenProgress(p => Math.max(0, p - 1))}>-</button>
            <button className="button" onClick={() => setWrenProgress(p => Math.min(40, p + 1))}>+</button>
            <div className="mini">Chapters completed: {wrenProgress}/40</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Progress & Habit Tracker</h3>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div style={{ width: '48%' }}>
            <div className="small">Reading streak</div>
            <div className="progressbar" style={{ marginTop: 6 }}>
              <div className="progress" style={{ width: '60%' }}></div>
            </div>
          </div>
          <div style={{ width: '48%' }}>
            <div className="small">Essays / week</div>
            <div className="progressbar" style={{ marginTop: 6 }}>
              <div className="progress" style={{ width: '30%' }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Upcoming Tasks</h3>
        <ul>
          <li>Essay — Monday & Thursday</li>
          <li>Weekly Test — Sunday</li>
          <li>Presentation topic practice</li>
        </ul>
      </div>

      <div className="card">
        <h3>Stories & Comics</h3>
        <div className="row">
          <div style={{ flex: 1 }}>
            <div className="card" style={{ padding: 10 }}>
              <div style={{ fontWeight: 700 }}>Story preview</div>
              <div className="small" style={{ marginTop: 6 }}>A short cozy story or comic based on your interests.</div>
            </div>
          </div>
          <div style={{ width: 120, textAlign: 'center' }}>
            <DoodleIcon />
            <div className="mini">Aesthetic doodles</div>
          </div>
        </div>
      </div>

      <div className="footer-note">Share this app link with friends — they can sign up and create their own local accounts on their device.</div>

      <div style={{ height: 96 }}></div>

      <div className="bottom-nav">
        <button className="nav-btn">Home</button>
        <button className="nav-btn">Progress</button>
        <button className="nav-btn">Upcoming</button>
        <button className="nav-btn">Stories</button>
      </div>
    </div>
  );
}

export default function App() {
  const [current, setCurrent] = useState(localStorage.getItem("currentUser") || null);
  function onLogin(email) { setCurrent(email); }
  return current ? <AppInner userEmail={current} /> : <Auth onLogin={onLogin} />;
  }
