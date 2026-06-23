import React, { useState, useEffect } from "react";
import { initialEquipmentList, initialBookings, Equipment, Booking } from "./data/initialData";
import Dashboard from "./components/Dashboard";
import Catalog from "./components/Catalog";
import Calendar from "./components/Calendar";
import Scanner from "./components/Scanner";
import Login from "./components/Login";
import { LayoutDashboard, Compass, CalendarRange, QrCode, ShieldCheck, LogOut, Wrench, Plus, History } from "lucide-react";

export default function App() {
  // Global States persisted to LocalStorage
  const [equipment, setEquipment] = useState<Equipment[]>(() => {
    const saved = localStorage.getItem("resrvlab_equipment");
    return saved ? JSON.parse(saved) : initialEquipmentList;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem("resrvlab_bookings");
    return saved ? JSON.parse(saved) : initialBookings;
  });

  const [currentUser, setCurrentUser] = useState<{ name: string; role: string } | null>(() => {
    const saved = localStorage.getItem("resrvlab_session");
    return saved ? JSON.parse(saved) : null;
  });

  const handleLoginSuccess = (user: { name: string; role: string }) => {
    setCurrentUser(user);
    localStorage.setItem("resrvlab_session", JSON.stringify(user));
  };

  const [activeTab, setActiveTab] = useState<"Dashboard" | "Catalog" | "Calendar" | "Scanner" | "Admin">("Dashboard");
  const [preSelectedEqId, setPreSelectedEqId] = useState<string>("");

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem("resrvlab_equipment", JSON.stringify(equipment));
  }, [equipment]);

  useEffect(() => {
    localStorage.setItem("resrvlab_bookings", JSON.stringify(bookings));
  }, [bookings]);

  // Core Actions
  const handleCheckIn = (id: string, project: string) => {
    if (!currentUser) return;
    setEquipment(prev => prev.map(eq => {
      if (eq.id === id) {
        return {
          ...eq,
          availability: "In Use",
          currentSession: {
            user: currentUser.name,
            role: currentUser.role,
            project,
            startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            endTime: new Date(Date.now() + 4 * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) // 4 hr slot
          }
        };
      }
      return eq;
    }));

    // Generate simulated active booking on check-in if not exists
    const targetEq = equipment.find(e => e.id === id);
    if (targetEq) {
      const newBooking: Booking = {
        id: `BK-${Math.floor(100 + Math.random() * 900)}`,
        equipmentId: id,
        equipmentName: targetEq.name,
        user: currentUser.name,
        role: currentUser.role,
        project,
        date: new Date().toISOString().split("T")[0],
        startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        endTime: new Date(Date.now() + 4 * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: "active"
      };
      setBookings(b => [newBooking, ...b]);
    }
  };

  const handleCheckout = (id: string) => {
    if (!currentUser) return;
    setEquipment(prev => prev.map(eq => {
      if (eq.id === id) {
        return {
          ...eq,
          availability: "Available",
          currentSession: null
        };
      }
      return eq;
    }));

    // Archive matching active booking to completed
    setBookings(prev => prev.map(b => {
      if (b.equipmentId === id && b.status === "active" && b.user === currentUser.name) {
        return { ...b, status: "completed" as const };
      }
      return b;
    }));
  };

  const handleAddBooking = (newBooking: Booking) => {
    setBookings(prev => [newBooking, ...prev]);

    // If booking starts today, update active equipment state to Reserved
    const todayStr = new Date().toISOString().split("T")[0];
    if (newBooking.date === todayStr) {
      setEquipment(prev => prev.map(eq => {
        if (eq.id === newBooking.equipmentId && eq.availability === "Available") {
          return { ...eq, availability: "Reserved" };
        }
        return eq;
      }));
    }
  };

  const handleCancelBooking = (id: string) => {
    setBookings(prev => prev.map(b => {
      if (b.id === id) {
        return { ...b, status: "cancelled" as const };
      }
      return b;
    }));

    // If cancelled booking is today, set equipment back to Available
    const targetB = bookings.find(b => b.id === id);
    const todayStr = new Date().toISOString().split("T")[0];
    if (targetB && targetB.date === todayStr) {
      setEquipment(prev => prev.map(eq => {
        if (eq.id === targetB.equipmentId && eq.availability === "Reserved") {
          return { ...eq, availability: "Available" };
        }
        return eq;
      }));
    }
  };

  const handleNavigateToCalendar = (eqId: string) => {
    setPreSelectedEqId(eqId);
    setActiveTab("Calendar");
  };

  // Administrative Controls
  const [adminNewName, setAdminNewName] = useState("");
  const [adminNewCategory, setAdminNewCategory] = useState<Equipment["category"]>("Preparation");
  const [adminNewModel, setAdminNewModel] = useState("");
  const [adminNewLocation, setAdminNewLocation] = useState("");
  const [adminNewDesc, setAdminNewDesc] = useState("");

  const handleAdminAddEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminNewName || !adminNewModel || !adminNewLocation) return;

    const newDevice: Equipment = {
      id: `EQ-00${equipment.length + 1}`,
      name: adminNewName,
      category: adminNewCategory,
      description: adminNewDesc || "No overview provided.",
      model: adminNewModel,
      location: adminNewLocation,
      availability: "Available",
      currentSession: null,
      specs: [
        { label: "Acquisition Year", value: "2026" },
        { label: "Telemetry Standard", value: "Optic v4.2" }
      ],
      qrCodeVal: `resrvlab://EQ-00${equipment.length + 1}`,
      safetyInstructions: ["Wear safety glasses during operation.", "Read operating manual prior to activation."]
    };

    setEquipment(prev => [...prev, newDevice]);
    
    // Clear forms
    setAdminNewName("");
    setAdminNewModel("");
    setAdminNewLocation("");
    setAdminNewDesc("");
  };

  const handleAdminToggleMaintenance = (id: string) => {
    setEquipment(prev => prev.map(eq => {
      if (eq.id === id) {
        const nextState = eq.availability === "Maintenance" ? "Available" : "Maintenance";
        return {
          ...eq,
          availability: nextState,
          currentSession: null
        };
      }
      return eq;
    }));
  };

  // Sign Out Handler
  const handleLogOut = () => {
    setCurrentUser(null);
    localStorage.removeItem("resrvlab_session");
  };

  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row relative">
      
      {/* Side Glassmorphic Navigation Panel */}
      <aside className="w-full lg:w-72 bg-slate-950/80 backdrop-blur-md border-b lg:border-b-0 lg:border-r border-white/10 p-6 flex flex-col justify-between flex-shrink-0 z-30">
        
        {/* Upper Side panel items */}
        <div className="space-y-8">
          {/* Logo brand */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-cyan-500 to-teal-400 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <span className="text-slate-950 font-black tracking-tighter text-lg font-mono">RL</span>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white font-mono">Resrv<span className="text-cyan-400">Lab</span></span>
              <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-widest mt-0.5">Optic Smart Hub</span>
            </div>
          </div>

          {/* Nav buttons */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab("Dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === "Dashboard"
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <LayoutDashboard className="h-4.5 w-4.5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab("Catalog")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === "Catalog"
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <Compass className="h-4.5 w-4.5" />
              <span>Equipment Catalog</span>
            </button>

            <button
              onClick={() => {
                setPreSelectedEqId("");
                setActiveTab("Calendar");
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === "Calendar"
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <CalendarRange className="h-4.5 w-4.5" />
              <span>Smart Calendar</span>
            </button>

            <button
              onClick={() => setActiveTab("Scanner")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === "Scanner"
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <QrCode className="h-4.5 w-4.5" />
              <span>QR Scanner</span>
            </button>

            <button
              onClick={() => setActiveTab("Admin")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === "Admin"
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <ShieldCheck className="h-4.5 w-4.5" />
              <span>Admin Center</span>
            </button>
          </nav>
        </div>

        {/* Lower user settings swap widget */}
        <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-2xl relative overflow-hidden">
            <span className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center border border-cyan-500/30">
              {currentUser.name[0]}
            </span>
            <div>
              <p className="text-xs font-bold text-white leading-tight">{currentUser.name}</p>
              <p className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">{currentUser.role}</p>
            </div>
          </div>

          <button
            onClick={handleLogOut}
            className="w-full bg-slate-900 hover:bg-rose-500/10 hover:text-rose-400 text-[10px] uppercase font-bold tracking-widest py-2.5 px-3 rounded-xl border border-white/5 flex items-center justify-center gap-1.5 transition-all"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>

      </aside>

      {/* Main Workspace Frame container */}
      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full overflow-y-auto space-y-8 pb-20">
        
        {/* Tab router views switch */}
        {activeTab === "Dashboard" && (
          <Dashboard
            equipment={equipment}
            bookings={bookings}
            currentUser={currentUser}
            onCheckout={handleCheckout}
          />
        )}

        {activeTab === "Catalog" && (
          <Catalog
            equipment={equipment}
            currentUser={currentUser}
            onCheckIn={handleCheckIn}
            onCheckout={handleCheckout}
            onNavigateToCalendar={handleNavigateToCalendar}
          />
        )}

        {activeTab === "Calendar" && (
          <Calendar
            equipment={equipment}
            bookings={bookings}
            currentUser={currentUser}
            onAddBooking={handleAddBooking}
            onCancelBooking={handleCancelBooking}
            preSelectedEquipmentId={preSelectedEqId}
          />
        )}

        {activeTab === "Scanner" && (
          <Scanner
            equipment={equipment}
            currentUser={currentUser}
            onCheckIn={handleCheckIn}
            onCheckout={handleCheckout}
          />
        )}

        {activeTab === "Admin" && (
          <div className="space-y-8 animate-fade-in">
            {/* Header banner info */}
            <div className="p-6 glass-panel rounded-2xl">
              <h1 className="text-2xl font-bold text-gradient-magenta flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-fuchsia-400" />
                Administrative Facility Panel
              </h1>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                Add hardware items to the catalog list, trigger diagnostic maintenance schedules, or examine total system booking trails.
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Left Column: Manage Equipment List & Maintenance Lock */}
              <div className="xl:col-span-2 glass-panel p-6 rounded-2xl space-y-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-3">
                  <Wrench className="h-4.5 w-4.5 text-cyan-400" />
                  Active Catalog Directory Maintenance
                </h3>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {equipment.map(eq => (
                    <div key={eq.id} className="p-4 rounded-xl border border-white/5 bg-slate-900/40 flex justify-between items-center gap-4">
                      <div>
                        <h4 className="text-xs font-bold text-white">{eq.name}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Model: {eq.model} &nbsp;•&nbsp; Location: {eq.location}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded border ${
                          eq.availability === "Maintenance" 
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/20" 
                            : "bg-slate-800 text-slate-400 border-white/5"
                        }`}>
                          {eq.availability}
                        </span>
                        
                        <button
                          onClick={() => handleAdminToggleMaintenance(eq.id)}
                          className={`text-xs font-semibold py-1.5 px-3 rounded-lg border transition-all ${
                            eq.availability === "Maintenance"
                              ? "bg-emerald-500/20 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                              : "bg-rose-500/15 border-rose-500/10 text-rose-400 hover:bg-rose-500/25"
                          }`}
                        >
                          {eq.availability === "Maintenance" ? "Release Device" : "Lock for Repair"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Add New Equipment Card */}
              <div className="glass-panel p-6 rounded-2xl space-y-4 self-start">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-3">
                  <Plus className="h-4.5 w-4.5 text-fuchsia-400" />
                  Commission New Hardware
                </h3>

                <form onSubmit={handleAdminAddEquipment} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-semibold">Equipment Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ABI 3730xl Genetic Analyzer"
                      value={adminNewName}
                      onChange={e => setAdminNewName(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-cyan-400 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 uppercase font-semibold">Category</label>
                      <select
                        value={adminNewCategory}
                        onChange={e => setAdminNewCategory(e.target.value as Equipment["category"])}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl py-2 px-2 text-xs focus:outline-none text-white"
                      >
                        <option value="Analytical">Analytical</option>
                        <option value="Imaging">Imaging</option>
                        <option value="Storage">Storage</option>
                        <option value="Preparation">Preparation</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 uppercase font-semibold">Model / SKU</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Model-3730"
                        value={adminNewModel}
                        onChange={e => setAdminNewModel(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-cyan-400 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-semibold">Location / Room</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Genomics Lab, Bench-3"
                      value={adminNewLocation}
                      onChange={e => setAdminNewLocation(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-cyan-400 text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-semibold">Description Overview</label>
                    <textarea
                      placeholder="High-throughput capillary DNA sequencing system..."
                      value={adminNewDesc}
                      onChange={e => setAdminNewDesc(e.target.value)}
                      className="w-full h-20 bg-slate-900 border border-white/10 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-cyan-400 text-white resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)] uppercase tracking-wider"
                  >
                    Deploy to Catalog
                  </button>
                </form>
              </div>
            </div>

            {/* Audit Logs booking trail */}
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-3">
                <History className="h-4.5 w-4.5 text-fuchsia-400" />
                Laboratory Audit Trail Registry
              </h3>

              <div className="overflow-x-auto rounded-xl border border-white/5 bg-slate-900/20">
                <table className="w-full text-xs text-left text-slate-400">
                  <thead className="text-[10px] uppercase font-bold text-slate-500 bg-slate-950/40 border-b border-white/5">
                    <tr>
                      <th className="p-4">Log ID</th>
                      <th className="p-4">Equipment</th>
                      <th className="p-4">Researcher</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Time Slot</th>
                      <th className="p-4">Project Purpose</th>
                      <th className="p-4">Audit Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(b => (
                      <tr key={b.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4 font-mono font-bold text-slate-300">{b.id}</td>
                        <td className="p-4 font-semibold text-white">{b.equipmentName}</td>
                        <td className="p-4">{b.user} ({b.role})</td>
                        <td className="p-4 font-mono">{b.date}</td>
                        <td className="p-4 font-mono font-semibold text-cyan-400">{b.startTime} - {b.endTime}</td>
                        <td className="p-4">{b.project}</td>
                        <td className="p-4">
                          <span className={`inline-flex px-2 py-0.5 rounded font-semibold text-[9px] uppercase tracking-wide border ${
                            b.status === "active" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" :
                            b.status === "completed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                            "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          }`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
