import React, { useState } from "react";
import { Search, Compass, MapPin, Eye, QrCode, Calendar, ShieldAlert, Sparkles, X, Check, Activity, Clock } from "lucide-react";
import { Equipment } from "../data/initialData";

interface CatalogProps {
  equipment: Equipment[];
  currentUser: { name: string; role: string };
  onCheckIn: (id: string, project: string) => void;
  onCheckout: (id: string) => void;
  onNavigateToCalendar: (eqId: string) => void;
}

export default function Catalog({ equipment, currentUser, onCheckIn, onCheckout, onNavigateToCalendar }: CatalogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeDetailItem, setActiveDetailItem] = useState<Equipment | null>(null);
  const [checkInProject, setCheckInProject] = useState("");
  const [showCheckInForm, setShowCheckInForm] = useState(false);

  // Filters
  const filteredEquipment = equipment.filter((eq) => {
    const matchesSearch = eq.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          eq.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          eq.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || eq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["All", "Analytical", "Imaging", "Storage", "Preparation"];

  const getStatusBadge = (status: Equipment["availability"]) => {
    switch (status) {
      case "Available":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Available
          </span>
        );
      case "In Use":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping absolute" />
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 relative" />
            In Use
          </span>
        );
      case "Reserved":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400" />
            Reserved
          </span>
        );
      case "Maintenance":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            Under Repair
          </span>
        );
    }
  };

  const handleCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInProject.trim()) return;
    if (activeDetailItem) {
      onCheckIn(activeDetailItem.id, checkInProject);
      const updatedItem = {
        ...activeDetailItem,
        availability: "In Use" as const,
        currentSession: {
          user: currentUser.name,
          role: currentUser.role,
          project: checkInProject,
          startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          endTime: new Date(Date.now() + 4 * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) // 4 hour default
        }
      };
      setActiveDetailItem(updatedItem);
      setCheckInProject("");
      setShowCheckInForm(false);
    }
  };

  const handleQuickCheckout = () => {
    if (activeDetailItem) {
      onCheckout(activeDetailItem.id);
      const updatedItem = {
        ...activeDetailItem,
        availability: "Available" as const,
        currentSession: null
      };
      setActiveDetailItem(updatedItem);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Filtering Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 glass-panel rounded-2xl">
        <div className="flex-1 max-w-lg relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by system name, model, room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/40 text-slate-100 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/40 placeholder:text-slate-500 transition-all"
          />
        </div>
        
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-950/40 border border-white/5 p-1.5 rounded-xl self-start lg:self-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                selectedCategory === cat
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Equipment */}
      {filteredEquipment.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredEquipment.map((eq) => {
            const isBusy = eq.availability === "In Use";
            return (
              <div
                key={eq.id}
                className="group glass-panel rounded-2xl flex flex-col justify-between overflow-hidden relative border border-white/5 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/20 hover:shadow-[0_10px_30px_rgba(6,182,212,0.1)]"
              >
                {/* Category Gradient Tag */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-cyan-500/10 via-transparent to-transparent pointer-events-none" />

                <div className="p-6 space-y-4">
                  {/* Top Bar inside Card */}
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-[10px] uppercase font-bold tracking-widest bg-white/5 border border-white/10 px-2.5 py-1 rounded text-slate-400">
                      {eq.category}
                    </span>
                    {getStatusBadge(eq.availability)}
                  </div>

                  {/* Body Content */}
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                      {eq.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Model: <span className="font-semibold text-slate-300">{eq.model}</span></p>
                    <p className="text-slate-400 text-sm mt-3 line-clamp-2 leading-relaxed">
                      {eq.description}
                    </p>
                  </div>

                  {/* Location Info */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
                    <MapPin className="h-4 w-4 text-cyan-500/60" />
                    <span>{eq.location}</span>
                  </div>
                </div>

                {/* Bottom Actions Bar */}
                <div className="p-4 bg-slate-950/40 border-t border-white/5 flex gap-2">
                  <button
                    onClick={() => setActiveDetailItem(eq)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700/80 text-xs font-semibold py-2.5 px-3 rounded-xl border border-white/5 text-slate-300 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Eye className="h-4 w-4" />
                    Spec details
                  </button>

                  {eq.availability === "Available" && (
                    <button
                      onClick={() => {
                        setActiveDetailItem(eq);
                        setShowCheckInForm(true);
                      }}
                      className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all"
                    >
                      <Compass className="h-4 w-4" />
                      Check In
                    </button>
                  )}

                  {eq.availability === "In Use" && eq.currentSession?.user === currentUser.name && (
                    <button
                      onClick={() => {
                        setActiveDetailItem(eq);
                        handleQuickCheckout();
                      }}
                      className="bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/30 text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all"
                    >
                      Check Out
                    </button>
                  )}

                  {eq.availability === "Reserved" && (
                    <button
                      onClick={() => onNavigateToCalendar(eq.id)}
                      className="bg-fuchsia-500/20 text-fuchsia-400 hover:bg-fuchsia-500/30 border border-fuchsia-500/30 text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Calendar className="h-4 w-4" />
                      View Bookings
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center glass-panel rounded-2xl p-6">
          <div className="p-4 bg-slate-800/40 rounded-full border border-white/5 text-slate-600 mb-4">
            <Compass className="h-10 w-10" />
          </div>
          <h4 className="text-lg font-bold text-slate-300">No lab equipment matched filters</h4>
          <p className="text-slate-500 text-sm mt-1 max-w-[280px]">Try clearing your search query or switching categories.</p>
          <button 
            onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
            className="mt-6 bg-cyan-500 text-slate-950 text-xs font-bold py-2 px-4 rounded-xl hover:bg-cyan-400 transition-all"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Equipment Detail Modal (Interactive Glassmorphic Overlay) */}
      {activeDetailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl glass-panel-glow bg-slate-950 p-6 md:p-8 space-y-6">
            
            {/* Close Button */}
            <button
              onClick={() => {
                setActiveDetailItem(null);
                setShowCheckInForm(false);
                setCheckInProject("");
              }}
              className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Title Block */}
            <div className="space-y-2 pr-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[10px] uppercase font-bold tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-0.5 rounded">
                  {activeDetailItem.category}
                </span>
                {getStatusBadge(activeDetailItem.availability)}
              </div>
              <h2 className="text-2xl font-bold text-white mt-1 leading-tight">{activeDetailItem.name}</h2>
              <p className="text-xs text-slate-400">
                Model: <span className="font-semibold text-slate-300">{activeDetailItem.model}</span> 
                &nbsp;•&nbsp; Location: <span className="font-semibold text-slate-300">{activeDetailItem.location}</span>
              </p>
            </div>

            {/* Grid Layout inside Modal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-white/5">
              
              {/* Left Column: Description & Specs */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Device Overview</h4>
                  <p className="text-slate-400 text-sm mt-2 leading-relaxed">{activeDetailItem.description}</p>
                </div>

                {/* Specs Table */}
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Technical Specifications</h4>
                  <div className="rounded-xl border border-white/5 bg-slate-900/20 overflow-hidden text-xs">
                    {activeDetailItem.specs.map((spec, i) => (
                      <div key={i} className={`flex justify-between p-3 ${i % 2 === 0 ? "bg-white/5" : ""}`}>
                        <span className="text-slate-400 font-medium">{spec.label}</span>
                        <span className="text-slate-200 font-bold">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: QR Code & Check In/Safety */}
              <div className="space-y-6">
                {/* QR Code and Scanner Panel */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 flex flex-col items-center justify-center text-center">
                  <div className="bg-white p-3 rounded-2xl relative shadow-2xl">
                    {/* Simulated High Fidelity QR Code */}
                    <div className="w-36 h-36 border-4 border-slate-950 flex flex-col items-center justify-center bg-slate-950 text-white rounded">
                      <QrCode className="w-28 h-28 text-cyan-400" />
                      <span className="text-[8px] font-mono tracking-widest text-slate-400 mt-1 uppercase">
                        {activeDetailItem.id}
                      </span>
                    </div>
                  </div>
                  <h5 className="text-xs text-slate-300 font-semibold mt-3">Interactive System QR Code</h5>
                  <p className="text-[10px] text-slate-500 mt-0.5">Scan from mobile or scanner tab for instant checkout.</p>
                </div>

                {/* Safety Rules */}
                <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 space-y-2">
                  <h5 className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4" />
                    SAFETY INSTRUCTIONS
                  </h5>
                  <ul className="list-disc pl-4 space-y-1 text-slate-400 text-xs leading-relaxed">
                    {activeDetailItem.safetyInstructions.map((inst, i) => (
                      <li key={i}>{inst}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Active User Session Details */}
            {activeDetailItem.availability === "In Use" && activeDetailItem.currentSession && (
              <div className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                <div>
                  <p className="text-slate-400">Currently operated by:</p>
                  <p className="text-white font-bold text-sm mt-0.5">{activeDetailItem.currentSession.user} ({activeDetailItem.currentSession.role})</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Project: {activeDetailItem.currentSession.project}</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-900/60 border border-white/5 px-3 py-1.5 rounded-lg text-cyan-400 font-semibold self-start md:self-auto">
                  <Clock className="h-4 w-4" />
                  <span>Time: {activeDetailItem.currentSession.startTime} - {activeDetailItem.currentSession.endTime}</span>
                </div>
              </div>
            )}

            {/* Check-In Form */}
            {showCheckInForm && (
              <form onSubmit={handleCheckInSubmit} className="p-5 rounded-2xl bg-slate-900 border border-cyan-500/20 space-y-4">
                <h4 className="text-sm font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" />
                  Start Live Session
                </h4>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Research Project Name / Goal</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mitochondria imaging, RNA Synthesis assay..."
                    value={checkInProject}
                    onChange={(e) => setCheckInProject(e.target.value)}
                    className="w-full bg-slate-950 text-slate-100 border border-white/10 rounded-xl py-3 px-4 text-xs focus:outline-none focus:border-cyan-500 placeholder:text-slate-600 transition-all"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCheckInForm(false);
                      setCheckInProject("");
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-xs font-semibold py-2 px-4 rounded-xl border border-white/5 text-slate-300 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs py-2 px-5 rounded-xl flex items-center gap-1.5 transition-all"
                  >
                    <Check className="h-4 w-4" />
                    Confirm Check In
                  </button>
                </div>
              </form>
            )}

            {/* Footer Actions inside Modal */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/5">
              <button
                onClick={() => {
                  setActiveDetailItem(null);
                  onNavigateToCalendar(activeDetailItem.id);
                }}
                className="flex-1 bg-slate-800 hover:bg-slate-700 border border-white/5 text-slate-300 font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <Calendar className="h-4 w-4 text-cyan-400" />
                Schedule Slots
              </button>

              {activeDetailItem.availability === "Available" && !showCheckInForm && (
                <button
                  onClick={() => setShowCheckInForm(true)}
                  className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                >
                  <Compass className="h-4 w-4" />
                  Check In Now
                </button>
              )}

              {activeDetailItem.availability === "In Use" && activeDetailItem.currentSession?.user === currentUser.name && (
                <button
                  onClick={handleQuickCheckout}
                  className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  Check Out Equipment
                </button>
              )}

              {activeDetailItem.availability === "Maintenance" && (
                <div className="flex-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold">
                  <ShieldAlert className="h-4 w-4 animate-bounce" />
                  Locked for Maintenance
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
