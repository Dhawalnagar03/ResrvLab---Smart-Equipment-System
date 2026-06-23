import React, { useState } from "react";
import { KeyRound, Mail, User, ShieldAlert, Sparkles, ShieldCheck, Briefcase } from "lucide-react";

interface LoginProps {
  onLoginSuccess: (user: { name: string; role: string }) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [activeTab, setActiveTab] = useState<"signin" | "register">("signin");
  
  // Sign In States
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  
  // Register States
  const [regName, setRegName] = useState("");
  const [regRole, setRegRole] = useState("PhD Researcher");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Preset accounts
  const presetUsers = [
    {
      name: "Liam Carter",
      role: "PhD Researcher",
      email: "liam.carter@resrvlab.edu",
      password: "password123"
    },
    {
      name: "Dr. Elena Vance",
      role: "Principal Investigator",
      email: "elena.vance@resrvlab.edu",
      password: "password123"
    },
    {
      name: "Admin Operator",
      role: "Facility Administrator",
      email: "admin@resrvlab.edu",
      password: "adminsecure"
    }
  ];

  const handleFillPreset = (preset: typeof presetUsers[0]) => {
    setActiveTab("signin");
    setSignInEmail(preset.email);
    setSignInPassword(preset.password);
    setErrorMessage(null);
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Retrieve registered users from localStorage
    const savedUsersStr = localStorage.getItem("resrvlab_user_directory");
    const savedUsers = savedUsersStr ? JSON.parse(savedUsersStr) : [];
    
    // Combine preset users and custom registered users
    const allUsers = [...presetUsers, ...savedUsers];

    const matchedUser = allUsers.find(
      (u) => u.email.toLowerCase() === signInEmail.trim().toLowerCase() && u.password === signInPassword
    );

    if (matchedUser) {
      onLoginSuccess({
        name: matchedUser.name,
        role: matchedUser.role
      });
    } else {
      setErrorMessage("Invalid email or password. Please try again.");
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMessage("All fields are required.");
      return;
    }

    // Retrieve and save users to local storage
    const savedUsersStr = localStorage.getItem("resrvlab_user_directory");
    const savedUsers = savedUsersStr ? JSON.parse(savedUsersStr) : [];

    // Check if email already exists
    const emailExists = [...presetUsers, ...savedUsers].some(
      (u) => u.email.toLowerCase() === regEmail.trim().toLowerCase()
    );

    if (emailExists) {
      setErrorMessage("An account with this email address already exists.");
      return;
    }

    const newUser = {
      name: regName.trim(),
      role: regRole,
      email: regEmail.trim().toLowerCase(),
      password: regPassword
    };

    savedUsers.push(newUser);
    localStorage.setItem("resrvlab_user_directory", JSON.stringify(savedUsers));

    setSuccessMessage("Account created successfully! Auto-populating Sign In details...");
    
    // Switch to Sign In and auto fill
    setTimeout(() => {
      setActiveTab("signin");
      setSignInEmail(newUser.email);
      setSignInPassword(newUser.password);
      setSuccessMessage(null);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      
      {/* Background Holographic Glows */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-fuchsia-500/10 rounded-full filter blur-[120px] pointer-events-none" />

      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-8 z-10 animate-fade-in">
        <div className="p-3 bg-gradient-to-tr from-cyan-500 to-teal-400 rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.4)]">
          <span className="text-slate-950 font-black tracking-tighter text-2xl font-mono">RL</span>
        </div>
        <div>
          <span className="text-3xl font-extrabold tracking-tight text-white font-mono">Resrv<span className="text-cyan-400">Lab</span></span>
          <span className="text-xs text-slate-500 font-bold block uppercase tracking-widest mt-0.5">Optic Smart Hub Login</span>
        </div>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-md border border-white/10 p-8 rounded-3xl relative z-10 space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-scale-up">
        
        {/* Tab Selection */}
        <div className="flex bg-slate-950/60 border border-white/5 p-1 rounded-xl">
          <button
            onClick={() => {
              setActiveTab("signin");
              setErrorMessage(null);
            }}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "signin"
                ? "bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setActiveTab("register");
              setErrorMessage(null);
            }}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "register"
                ? "bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Register
          </button>
        </div>

        {/* Tab 1: Sign In Form */}
        {activeTab === "signin" ? (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="name@resrvlab.edu"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-cyan-500 transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-cyan-500 transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.2)] uppercase tracking-widest mt-2"
            >
              Sign In to Lab Console
            </button>
          </form>
        ) : (
          /* Tab 2: Register Form */
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="Dr. Morgan Freeman"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-cyan-500 transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@resrvlab.edu"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-3 text-xs text-white focus:outline-none focus:border-cyan-500 transition-all placeholder:text-slate-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Lab Role / Title</label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition-all"
                >
                  <option value="PhD Researcher">PhD Researcher</option>
                  <option value="Principal Investigator">Principal Investigator</option>
                  <option value="Facility Administrator">Facility Administrator</option>
                  <option value="Lab Technician">Lab Technician</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">New Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="Create secure password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-cyan-500 transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.2)] uppercase tracking-widest mt-2"
            >
              Commission Account
            </button>
          </form>
        )}

        {/* Success / Error Messages */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-start gap-2.5 animate-pulse">
            <ShieldAlert className="h-4.5 w-4.5 flex-shrink-0 mt-0.5 text-rose-400" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-start gap-2.5">
            <ShieldCheck className="h-4.5 w-4.5 flex-shrink-0 mt-0.5 text-emerald-400" />
            <span className="font-semibold text-emerald-400">{successMessage}</span>
          </div>
        )}

      </div>

      {/* Developer Presets Helper Panel (Click to fill) */}
      <div className="w-full max-w-md mt-6 bg-slate-900/30 backdrop-blur-sm border border-white/5 p-5 rounded-2xl relative z-10 space-y-3 animate-fade-in">
        <h4 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" />
          Preset Lab Profiles (Auto-fill)
        </h4>
        <div className="grid grid-cols-1 gap-2">
          {presetUsers.map((preset) => (
            <button
              key={preset.email}
              onClick={() => handleFillPreset(preset)}
              className="flex justify-between items-center p-2.5 rounded-xl bg-slate-950/40 hover:bg-slate-950/80 border border-white/5 hover:border-cyan-500/20 text-left transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-cyan-500/15 text-cyan-400 font-bold flex items-center justify-center text-[10px] border border-cyan-500/20 group-hover:bg-cyan-500/30">
                  {preset.name[0]}
                </span>
                <div>
                  <p className="text-[11px] font-bold text-white leading-none">{preset.name}</p>
                  <p className="text-[9px] text-slate-500 leading-none mt-1">{preset.role}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-mono text-slate-400 block">{preset.email}</span>
                <span className="text-[8px] font-mono text-slate-600 block mt-0.5">Password: {preset.password}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
