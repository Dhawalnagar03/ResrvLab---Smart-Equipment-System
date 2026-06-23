import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Activity, Calendar, CheckCircle2, ShieldAlert, Cpu, Clock, LogIn } from "lucide-react";
import { Equipment, Booking } from "../data/initialData";

interface DashboardProps {
  equipment: Equipment[];
  bookings: Booking[];
  currentUser: { name: string; role: string };
  onCheckout: (id: string) => void;
}

export default function Dashboard({ equipment, bookings, currentUser, onCheckout }: DashboardProps) {
  // Calculations
  const totalEquip = equipment.length;
  const activeBookings = bookings.filter(b => b.status === "active").length;
  const inUseCount = equipment.filter(e => e.availability === "In Use").length;
  const maintenanceCount = equipment.filter(e => e.availability === "Maintenance").length;
  const utilizationRate = Math.round(((inUseCount) / (totalEquip - maintenanceCount)) * 100) || 0;

  // Chart data 1: Utilization by category
  const categories = ["Analytical", "Imaging", "Storage", "Preparation"];
  const categoryData = categories.map(cat => {
    const totalInCat = equipment.filter(e => e.category === cat).length;
    const busyInCat = equipment.filter(e => e.category === cat && (e.availability === "In Use" || e.availability === "Reserved")).length;
    const rate = totalInCat > 0 ? Math.round((busyInCat / totalInCat) * 100) : 0;
    return { name: cat, rate };
  });

  // Chart data 2: Bookings breakdown by category
  const bookingsBreakdown = categories.map(cat => {
    const count = bookings.filter(b => {
      const eq = equipment.find(e => e.id === b.equipmentId);
      return eq && eq.category === cat;
    }).length;
    return { name: cat, value: count };
  }).filter(item => item.value > 0);

  const COLORS = ["#06b6d4", "#a855f7", "#ec4899", "#10b981"];

  // Active Sessions
  const activeSessions = equipment.filter(e => e.availability === "In Use" && e.currentSession);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 glass-panel rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full filter blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-60 h-60 bg-fuchsia-500/10 rounded-full filter blur-[60px] pointer-events-none" />
        
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient-cyan">Welcome Back, {currentUser.name}</h1>
          <p className="text-slate-400 text-sm mt-1">Lab status is operational. All systems monitored in real-time.</p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2 self-start md:self-auto">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold tracking-wider uppercase text-emerald-400">Live Telemetry Active</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="glass-panel p-6 rounded-2xl relative group overflow-hidden transition-all duration-300 hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Lab Utilization</p>
              <h3 className="text-3xl font-bold mt-2 text-cyan-400">{utilizationRate}%</h3>
            </div>
            <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl group-hover:scale-110 transition-transform">
              <Activity className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-cyan-400 h-1.5 rounded-full transition-all duration-500" style={{ width: `${utilizationRate}%` }} />
          </div>
        </div>

        {/* Card 2 */}
        <div className="glass-panel p-6 rounded-2xl relative group overflow-hidden transition-all duration-300 hover:border-fuchsia-500/30 hover:shadow-[0_0_20px_rgba(217,70,239,0.15)]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Active Bookings</p>
              <h3 className="text-3xl font-bold mt-2 text-fuchsia-400">{activeBookings}</h3>
            </div>
            <div className="p-3 bg-fuchsia-500/10 text-fuchsia-400 rounded-xl group-hover:scale-110 transition-transform">
              <Calendar className="h-6 w-6" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-5 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-fuchsia-400" />
            Scheduled for this week
          </p>
        </div>

        {/* Card 3 */}
        <div className="glass-panel p-6 rounded-2xl relative group overflow-hidden transition-all duration-300 hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Currently In-Use</p>
              <h3 className="text-3xl font-bold mt-2 text-emerald-400">{inUseCount} <span className="text-xs font-normal text-slate-400">/ {totalEquip}</span></h3>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl group-hover:scale-110 transition-transform">
              <Cpu className="h-6 w-6" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Active hardware sessions
          </p>
        </div>

        {/* Card 4 */}
        <div className="glass-panel p-6 rounded-2xl relative group overflow-hidden transition-all duration-300 hover:border-rose-500/30 hover:shadow-[0_0_20px_rgba(244,63,94,0.15)]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Maintenance Alerts</p>
              <h3 className="text-3xl font-bold mt-2 text-rose-400">{maintenanceCount}</h3>
            </div>
            <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl group-hover:scale-110 transition-transform">
              <ShieldAlert className="h-6 w-6" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            Requires engineering check
          </p>
        </div>
      </div>

      {/* Main Grid: Charts & Active Sessions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Side: Graphs */}
        <div className="xl:col-span-2 space-y-8">
          {/* Bar Chart Panel */}
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-lg font-bold tracking-tight text-white mb-6">Equipment Utilization by Category</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                    labelStyle={{ fontWeight: "bold", color: "#fff" }}
                    itemStyle={{ color: "#22d3ee" }}
                  />
                  <Bar dataKey="rate" fill="url(#cyanGradient)" radius={[6, 6, 0, 0]}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                  <defs>
                    <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#0891b2" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bookings Breakdown Panel */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 space-y-4">
              <h3 className="text-lg font-bold tracking-tight text-white">Bookings Share</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Distribution of current scheduled reservations across the lab categories. Preparation and Analytical machinery represents the highest load.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2">
                {bookingsBreakdown.map((item, idx) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-xs text-slate-300 font-medium">{item.name} ({item.value})</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="h-60 w-60 flex-shrink-0 flex items-center justify-center relative">
              {bookingsBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={bookingsBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {bookingsBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                      itemStyle={{ color: "#fff" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs text-slate-500">No active bookings data</div>
              )}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-white">{activeBookings}</span>
                <span className="text-[10px] uppercase text-slate-400 tracking-widest mt-0.5">Total Bookings</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Live Sessions Feed */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl flex flex-col h-full">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                Active Sessions
              </h3>
              <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-semibold">
                {activeSessions.length} Running
              </span>
            </div>

            {/* List */}
            {activeSessions.length > 0 ? (
              <div className="space-y-4 overflow-y-auto max-h-[480px] pr-1">
                {activeSessions.map((session) => (
                  <div key={session.id} className="p-4 rounded-xl border border-white/5 bg-slate-900/40 relative group overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-400 to-teal-500" />
                    
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                          {session.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">{session.location}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded uppercase font-semibold">
                        {session.category}
                      </span>
                    </div>

                    {/* Researcher metadata */}
                    <div className="mt-3 flex items-center justify-between text-xs border-t border-white/5 pt-3">
                      <div>
                        <p className="text-slate-300 font-medium">{session.currentSession?.user}</p>
                        <p className="text-[10px] text-slate-500">{session.currentSession?.project}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-cyan-400 flex items-center gap-1 font-semibold justify-end">
                          <Clock className="h-3.5 w-3.5" />
                          {session.currentSession?.startTime} - {session.currentSession?.endTime}
                        </p>
                        <p className="text-[10px] text-slate-500">Live slot</p>
                      </div>
                    </div>

                    {/* Quick check out button */}
                    <button 
                      onClick={() => onCheckout(session.id)}
                      className="mt-4 w-full bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30 text-xs border border-white/10 text-slate-300 font-semibold py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5"
                    >
                      <LogIn className="h-3.5 w-3.5 rotate-180" />
                      Check Out Session
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center flex-1">
                <div className="p-4 bg-slate-800/40 rounded-full border border-white/5 text-slate-600 mb-4">
                  <Activity className="h-10 w-10" />
                </div>
                <h4 className="text-sm font-semibold text-slate-300">No active hardware sessions</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-[200px]">Use the scan module or catalog to check-in to available systems.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
