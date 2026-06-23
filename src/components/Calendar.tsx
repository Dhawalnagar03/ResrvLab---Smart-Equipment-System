import React, { useState } from "react";
import { Calendar as CalendarIcon, Clock, User, Briefcase, Plus, AlertCircle, Trash2, CheckCircle2, Sliders } from "lucide-react";
import { Equipment, Booking } from "../data/initialData";

interface CalendarProps {
  equipment: Equipment[];
  bookings: Booking[];
  currentUser: { name: string; role: string };
  onAddBooking: (booking: Booking) => void;
  onCancelBooking: (id: string) => void;
  preSelectedEquipmentId?: string;
}

export default function Calendar({ equipment, bookings, currentUser, onAddBooking, onCancelBooking, preSelectedEquipmentId }: CalendarProps) {
  // Calendar States
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(preSelectedEquipmentId || equipment[0]?.id || "");
  const [showAddForm, setShowAddForm] = useState(false);

  // New Booking States
  const [formEqId, setFormEqId] = useState(preSelectedEquipmentId || equipment[0]?.id || "");
  const [projectTitle, setProjectTitle] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("11:00");
  const [conflictError, setConflictError] = useState<string | null>(null);

  // Helper: Next 7 days list for beautiful quick selector tabs
  const getNext7Days = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const isToday = i === 0;
      dates.push({
        dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
        dateStr: d.toISOString().split("T")[0],
        dayNum: d.getDate(),
        month: d.toLocaleDateString("en-US", { month: "short" })
      });
    }
    return dates;
  };
  const weekDays = getNext7Days();

  // Selected Equipment Object
  const selectedEquipment = equipment.find(e => e.id === selectedEquipmentId);

  // Bookings list for chosen date & equipment
  const dayBookings = bookings.filter(
    b => b.equipmentId === selectedEquipmentId && b.date === selectedDate && b.status === "active"
  ).sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Time Slot Timelines (08:00 to 22:00 in 2-hour increments)
  const timeSlots = [
    { label: "08:00 - 10:00", start: "08:00", end: "10:00" },
    { label: "10:00 - 12:00", start: "10:00", end: "12:00" },
    { label: "12:00 - 14:00", start: "12:00", end: "14:00" },
    { label: "14:00 - 16:00", start: "14:00", end: "16:00" },
    { label: "16:00 - 18:00", start: "16:00", end: "18:00" },
    { label: "18:00 - 20:00", start: "18:00", end: "20:00" },
    { label: "20:00 - 22:00", start: "20:00", end: "22:00" }
  ];

  // Conflict Checker
  const checkConflict = (eqId: string, date: string, start: string, end: string): string | null => {
    // Convert HH:MM to minutes
    const toMins = (t: string) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };
    
    const newStart = toMins(start);
    const newEnd = toMins(end);

    if (newEnd <= newStart) {
      return "End time must be after start time.";
    }

    // Check overlaps with active bookings
    const activeEqBookings = bookings.filter(b => b.equipmentId === eqId && b.date === date && b.status === "active");

    for (const b of activeEqBookings) {
      const bStart = toMins(b.startTime);
      const bEnd = toMins(b.endTime);

      // Overlap formula: (newStart < bEnd) && (newEnd > bStart)
      if (newStart < bEnd && newEnd > bStart) {
        return `Time conflict with active reservation: "${b.project}" by ${b.user} (${b.startTime} - ${b.endTime})`;
      }
    }
    return null;
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError(null);

    const error = checkConflict(formEqId, selectedDate, startTime, endTime);
    if (error) {
      setConflictError(error);
      return;
    }

    const targetEq = equipment.find(eq => eq.id === formEqId);
    if (!targetEq) return;

    const newBooking: Booking = {
      id: `BK-${Math.floor(100 + Math.random() * 900)}`,
      equipmentId: formEqId,
      equipmentName: targetEq.name,
      user: currentUser.name,
      role: currentUser.role,
      project: projectTitle,
      date: selectedDate,
      startTime,
      endTime,
      status: "active"
    };

    onAddBooking(newBooking);
    
    // Clear and close
    setProjectTitle("");
    setShowAddForm(false);
    setSelectedEquipmentId(formEqId); // Switch active view to see it
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Date & Machine Selector Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Modern Date Carousel */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <CalendarIcon className="h-4.5 w-4.5 text-cyan-400" />
              Select Reservation Date
            </h3>
            <span className="text-xs text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded font-mono">
              {selectedDate}
            </span>
          </div>

          {/* Quick Date Select Slider */}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {weekDays.map((day) => {
              const isActive = selectedDate === day.dateStr;
              return (
                <button
                  key={day.dateStr}
                  onClick={() => {
                    setSelectedDate(day.dateStr);
                    setConflictError(null);
                  }}
                  className={`flex flex-col items-center p-3 rounded-xl border transition-all ${
                    isActive
                      ? "bg-cyan-500 border-cyan-400 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                      : "bg-slate-900/40 border-white/5 text-slate-400 hover:text-white hover:border-white/10"
                  }`}
                >
                  <span className={`text-[10px] uppercase ${isActive ? "text-slate-900" : "text-slate-500"}`}>{day.dayName}</span>
                  <span className="text-lg font-extrabold mt-1">{day.dayNum}</span>
                  <span className={`text-[10px] ${isActive ? "text-slate-900" : "text-slate-500"}`}>{day.month}</span>
                </button>
              );
            })}
          </div>

          {/* Custom Date Input for booking ahead */}
          <div className="flex items-center gap-3 pt-2 text-xs">
            <span className="text-slate-500">Or pick custom date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setConflictError(null);
              }}
              min={todayStr}
              className="bg-slate-950 border border-white/10 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500 transition-all font-mono"
            />
          </div>
        </div>

        {/* Right Side: Active Equipment Picker */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="h-4.5 w-4.5 text-fuchsia-400" />
              Target Equipment
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">Select hardware to inspect active scheduled bookings or book new slots.</p>
          </div>

          <select
            value={selectedEquipmentId}
            onChange={(e) => {
              setSelectedEquipmentId(e.target.value);
              setFormEqId(e.target.value);
              setConflictError(null);
            }}
            className="w-full bg-slate-900/80 text-slate-100 border border-white/10 rounded-xl py-3 px-4 text-xs focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/40"
          >
            {equipment.map((eq) => (
              <option key={eq.id} value={eq.id} className="bg-slate-950 text-slate-200">
                [{eq.category}] {eq.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content Pane: Daily Timeline and Reservations */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Timeline representation (Left) */}
        <div className="xl:col-span-2 glass-panel p-6 rounded-2xl space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white">{selectedEquipment?.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Location: {selectedEquipment?.location} &nbsp;•&nbsp; Status: {selectedEquipment?.availability}</p>
            </div>
            <button
              onClick={() => {
                setFormEqId(selectedEquipmentId);
                setShowAddForm(true);
              }}
              disabled={selectedEquipment?.availability === "Maintenance"}
              className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500 text-slate-950 font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all"
            >
              <Plus className="h-4.5 w-4.5" />
              Schedule Slot
            </button>
          </div>

          {/* Timeline Slots */}
          <div className="space-y-3">
            {timeSlots.map((slot, index) => {
              // Find matching active bookings that cover this slot range
              const isSlotBooked = dayBookings.some(
                b => (slot.start >= b.startTime && slot.start < b.endTime) ||
                     (slot.end > b.startTime && slot.end <= b.endTime) ||
                     (b.startTime >= slot.start && b.endTime <= slot.end)
              );
              
              // Find specific booking to show info
              const slotBooking = dayBookings.find(
                b => (slot.start >= b.startTime && slot.start < b.endTime) ||
                     (slot.end > b.startTime && slot.end <= b.endTime)
              );

              return (
                <div 
                  key={index}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    isSlotBooked 
                      ? "bg-fuchsia-500/5 border-fuchsia-500/10" 
                      : "bg-slate-900/20 border-white/5 hover:border-white/10"
                  }`}
                >
                  {/* Slot Time Indicator */}
                  <div className="w-28 flex-shrink-0 flex items-center gap-2 text-xs font-semibold text-slate-300">
                    <Clock className={`h-4 w-4 ${isSlotBooked ? "text-fuchsia-400" : "text-slate-500"}`} />
                    <span>{slot.label}</span>
                  </div>

                  {/* Slot Status Visual Block */}
                  <div className="flex-1 min-w-0">
                    {isSlotBooked && slotBooking ? (
                      <div className="flex justify-between items-center gap-4">
                        <div>
                          <p className="text-xs font-bold text-white truncate">{slotBooking.project}</p>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">{slotBooking.user} ({slotBooking.role})</p>
                        </div>
                        <span className="text-[9px] uppercase font-bold tracking-widest bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 px-2 py-0.5 rounded flex-shrink-0">
                          Reserved ({slotBooking.startTime} - {slotBooking.endTime})
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500 italic">Available for reservation</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Reservations Details Drawer (Right) */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col">
          <div className="border-b border-white/5 pb-4 mb-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
              Day Reservations List
            </h4>
            <p className="text-xs text-slate-500 mt-1">Showing {dayBookings.length} bookings for this machine.</p>
          </div>

          {/* List */}
          {dayBookings.length > 0 ? (
            <div className="space-y-4 overflow-y-auto max-h-[420px] pr-1 flex-1">
              {dayBookings.map((b) => (
                <div key={b.id} className="p-4 rounded-xl border border-white/5 bg-slate-900/40 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-fuchsia-500" />
                  
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h5 className="text-xs font-bold text-white line-clamp-1">{b.project}</h5>
                      <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {b.user} ({b.role})
                      </p>
                    </div>
                    {b.user === currentUser.name && (
                      <button
                        onClick={() => onCancelBooking(b.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-white/5 transition-all"
                        title="Cancel reservation"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-fuchsia-400">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{b.startTime} - {b.endTime}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center flex-1">
              <div className="p-3 bg-slate-800/40 rounded-full border border-white/5 text-slate-600 mb-3">
                <CalendarIcon className="h-8 w-8" />
              </div>
              <h5 className="text-xs font-semibold text-slate-400">No bookings for this date</h5>
              <p className="text-[10px] text-slate-500 mt-1 max-w-[150px]">Be the first to secure a slot for this hardware.</p>
            </div>
          )}
        </div>
      </div>

      {/* New Booking Form Modal Overlay */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl glass-panel-glow bg-slate-950 p-6 md:p-8 space-y-6">
            
            {/* Close Button */}
            <button
              onClick={() => {
                setShowAddForm(false);
                setConflictError(null);
              }}
              className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all hover:bg-white/10"
            >
              <XIcon className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-gradient-cyan flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Schedule Equipment Slot
              </h3>
              <p className="text-xs text-slate-400">Reserve lab hardware safely. Double-booking conflicts are checked live.</p>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-4 pt-2">
              
              {/* Equipment Picker */}
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">Select Hardware</label>
                <select
                  value={formEqId}
                  onChange={(e) => setFormEqId(e.target.value)}
                  className="w-full bg-slate-900 text-slate-100 border border-white/10 rounded-xl py-3 px-4 text-xs focus:outline-none focus:border-cyan-500 transition-all"
                >
                  {equipment.filter(eq => eq.availability !== "Maintenance").map((eq) => (
                    <option key={eq.id} value={eq.id} className="bg-slate-950 text-slate-200">
                      [{eq.category}] {eq.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Indicator */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Date</label>
                  <input
                    type="text"
                    disabled
                    value={selectedDate}
                    className="w-full bg-slate-900 border border-white/5 text-slate-300 font-semibold font-mono rounded-xl py-2.5 px-4 text-xs focus:outline-none opacity-80"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Researcher Name</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.name}
                    className="w-full bg-slate-900 border border-white/5 text-slate-300 font-semibold rounded-xl py-2.5 px-4 text-xs focus:outline-none opacity-80"
                  />
                </div>
              </div>

              {/* Start & End Times */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Start Time</label>
                  <select
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-slate-900 text-slate-100 border border-white/10 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    {Array.from({ length: 15 }).map((_, i) => {
                      const h = String(8 + i).padStart(2, "0");
                      return (
                        <React.Fragment key={i}>
                          <option value={`${h}:00`}>{h}:00</option>
                          <option value={`${h}:30`}>{h}:30</option>
                        </React.Fragment>
                      );
                    })}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">End Time</label>
                  <select
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-slate-900 text-slate-100 border border-white/10 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    {Array.from({ length: 15 }).map((_, i) => {
                      const h = String(9 + i).padStart(2, "0");
                      return (
                        <React.Fragment key={i}>
                          <option value={`${h}:00`}>{h}:00</option>
                          <option value={`${h}:30`}>{h}:30</option>
                        </React.Fragment>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Research Goal / Title */}
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">Research Goal / Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Exosome purification, Spectral mapping..."
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="w-full bg-slate-900 text-slate-100 border border-white/10 rounded-xl py-3 px-4 text-xs focus:outline-none focus:border-cyan-500 placeholder:text-slate-600 transition-all"
                />
              </div>

              {/* Safety/Role Checklist */}
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-[11px] text-slate-400 flex items-start gap-2">
                <Briefcase className="h-4 w-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>
                  Booking as <strong>{currentUser.role}</strong>. You agree to follow the safety checkpoints and leave the equipment in operational condition.
                </span>
              </div>

              {/* Conflict Error Block */}
              {conflictError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-start gap-2 animate-pulse">
                  <AlertCircle className="h-4.5 w-4.5 flex-shrink-0 mt-0.5 text-rose-400" />
                  <span className="font-semibold">{conflictError}</span>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setConflictError(null);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-xs font-semibold py-2.5 px-4 rounded-xl border border-white/5 text-slate-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs py-2.5 px-6 rounded-xl flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                >
                  Confirm Reservation
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Simple internal helper component since we didn't write standard Lucide X
function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
