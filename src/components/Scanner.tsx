import React, { useState, useEffect } from "react";
import { QrCode, Compass, ShieldAlert, CheckCircle2, AlertCircle, RotateCcw, Play, Loader2, Sparkles, BookOpen } from "lucide-react";
import { Equipment } from "../data/initialData";

interface ScannerProps {
  equipment: Equipment[];
  currentUser: { name: string; role: string };
  onCheckIn: (id: string, project: string) => void;
  onCheckout: (id: string) => void;
}

export default function Scanner({ equipment, currentUser, onCheckIn, onCheckout }: ScannerProps) {
  // States
  const [selectedEqId, setSelectedEqId] = useState(equipment[0]?.id || "");
  const [scanning, setScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [transitionedState, setTransitionedState] = useState<"in" | "out" | null>(null);
  const [projectName, setProjectName] = useState("");
  const [requireProjectForm, setRequireProjectForm] = useState(false);
  const [scanMessage, setScanMessage] = useState("");

  const targetEquipment = equipment.find((eq) => eq.id === selectedEqId);

  // Trigger Scanning Effect Simulation
  const triggerScan = () => {
    if (!selectedEqId || !targetEquipment) return;
    
    // Clear old states
    setScanSuccess(false);
    setTransitionedState(null);
    setRequireProjectForm(false);
    setConflictMessage("");

    if (targetEquipment.availability === "Maintenance") {
      setScanMessage("This hardware is locked under maintenance protocol. Cannot operate.");
      return;
    }

    setScanning(true);
    setScanMessage("Activating laser calibration engine...");

    // Stage 2 scanning animation
    setTimeout(() => {
      setScanMessage("Reading QR metadata payload...");
    }, 800);

    // Stage 3 complete scan
    setTimeout(() => {
      setScanning(false);
      setScanSuccess(true);
      
      // Determine what needs to happen
      if (targetEquipment.availability === "Available") {
        setRequireProjectForm(true);
        setScanMessage("QR Decrypted: Available. Project log required to initiate session.");
      } else if (targetEquipment.availability === "In Use") {
        if (targetEquipment.currentSession?.user === currentUser.name) {
          // Checkout
          onCheckout(targetEquipment.id);
          setTransitionedState("out");
          setScanMessage(`Check-out confirmed for ${targetEquipment.name}. Thank you.`);
        } else {
          // In use by someone else
          setScanSuccess(false);
          setScanMessage(`Conflict: System is currently occupied by ${targetEquipment.currentSession?.user}.`);
        }
      } else if (targetEquipment.availability === "Reserved") {
        setRequireProjectForm(true);
        setScanMessage("QR Decrypted: Reserved. Override key accepted. Please enter project name.");
      }
    }, 1800);
  };

  const handleSimulatedCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || !selectedEqId) return;

    onCheckIn(selectedEqId, projectName);
    setRequireProjectForm(false);
    setTransitionedState("in");
    setScanMessage(`Check-in complete. Laser session initialized for: "${projectName}".`);
    setProjectName("");
  };

  const resetScanner = () => {
    setScanning(false);
    setScanSuccess(false);
    setTransitionedState(null);
    setRequireProjectForm(false);
    setProjectName("");
    setScanMessage("");
  };

  const [conflictMessage, setConflictMessage] = useState("");

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left/Middle Column: Scanner Camera View Simulation */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-2xl overflow-hidden flex flex-col relative border border-white/5">
            
            {/* Holographic scanning overlay */}
            <div className="bg-slate-950 p-4 border-b border-white/5 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 tracking-wider flex items-center gap-1.5 uppercase">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                ResrvScan Holographic Lens v4.2
              </span>
              <span className="text-[10px] font-mono text-slate-500">SYS: OPERATIONAL</span>
            </div>

            {/* Visual Viewfinder box */}
            <div className="h-96 bg-slate-950/90 flex flex-col items-center justify-center p-6 relative overflow-hidden select-none">
              
              {/* Laser Grid scanning line */}
              {scanning && (
                <div className="absolute inset-x-0 h-1 z-10 scanner-laser shadow-[0_0_15px_rgba(6,182,212,0.8)]" />
              )}

              {/* Viewfinder crosshairs */}
              <div className="absolute w-60 h-60 border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border border-cyan-500/20 rounded-xl relative">
                  {/* Glowing corners */}
                  <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400 -mt-[2px] -ml-[2px]" />
                  <span className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400 -mt-[2px] -mr-[2px]" />
                  <span className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400 -mb-[2px] -ml-[2px]" />
                  <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400 -mb-[2px] -mr-[2px]" />
                </div>
              </div>

              {/* Scanner Screen states */}
              <div className="z-20 text-center space-y-4 max-w-sm px-4">
                
                {/* 1. Idle screen state */}
                {!scanning && !scanSuccess && !transitionedState && (
                  <div className="flex flex-col items-center">
                    <div className="p-5 bg-white/5 border border-white/10 rounded-full text-slate-500 mb-4 animate-pulse">
                      <QrCode className="h-16 w-16 text-cyan-500/60" />
                    </div>
                    <h4 className="text-md font-bold text-white tracking-wide">Ready for Calibration</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-[250px] leading-relaxed">
                      Select target equipment in the control panel and trigger the optic telemetry capture.
                    </p>
                  </div>
                )}

                {/* 2. Scanning screen state */}
                {scanning && (
                  <div className="flex flex-col items-center animate-pulse">
                    <Loader2 className="h-12 w-12 text-cyan-400 animate-spin mb-4" />
                    <h4 className="text-md font-bold text-cyan-400 tracking-widest uppercase">SCANNING TARGET...</h4>
                    <p className="text-[11px] text-slate-500 font-mono mt-1">{scanMessage}</p>
                  </div>
                )}

                {/* 3. Successful State check-in/out */}
                {transitionedState && (
                  <div className="flex flex-col items-center animate-bounce-short">
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full mb-4 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                      <CheckCircle2 className="h-14 w-14" />
                    </div>
                    <h4 className="text-lg font-bold text-emerald-400">TELEMETRY SECURED</h4>
                    <p className="text-xs text-slate-300 mt-2 max-w-[280px] leading-relaxed">{scanMessage}</p>
                    <button 
                      onClick={resetScanner}
                      className="mt-6 bg-slate-900 border border-white/10 text-slate-400 hover:text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Scan Another Device
                    </button>
                  </div>
                )}

                {/* 4. Form Require State */}
                {scanSuccess && requireProjectForm && (
                  <form onSubmit={handleSimulatedCheckIn} className="bg-slate-900/90 border border-cyan-500/30 p-5 rounded-2xl text-left space-y-4 shadow-2xl backdrop-blur-md animate-scale-up">
                    <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-white/5 pb-2">
                      <Sparkles className="h-4 w-4 text-cyan-400" />
                      Session Initiation Panel
                    </h4>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 uppercase font-semibold">Purpose / Research Goal</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Enzyme kinetic trial..."
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="w-full bg-slate-950 text-slate-100 border border-white/10 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-cyan-500 transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                    >
                      Initialize Check-In
                    </button>
                  </form>
                )}

                {/* 5. Generic Error screen state */}
                {!scanning && !scanSuccess && !transitionedState && scanMessage && (
                  <div className="flex flex-col items-center">
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full mb-4">
                      <AlertCircle className="h-10 w-10 animate-bounce" />
                    </div>
                    <h4 className="text-md font-bold text-rose-400">OPERATION SHIELDED</h4>
                    <p className="text-xs text-slate-400 mt-2 max-w-[280px] leading-relaxed">{scanMessage}</p>
                    <button 
                      onClick={resetScanner}
                      className="mt-6 bg-slate-900 border border-white/10 text-slate-400 hover:text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Retry Option
                    </button>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Optical Control Panel */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="border-b border-white/5 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="h-4.5 w-4.5 text-cyan-400" />
                Optic Control Desk
              </h3>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">Simulate a high-accuracy laser sweep over a piece of hardware QR code below.</p>
            </div>

            {/* Select Device Dropdown */}
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-semibold">Select Target Hardware</label>
              <select
                value={selectedEqId}
                disabled={scanning}
                onChange={(e) => {
                  setSelectedEqId(e.target.value);
                  resetScanner();
                }}
                className="w-full bg-slate-900 text-slate-100 border border-white/10 rounded-xl py-3 px-4 text-xs focus:outline-none focus:border-cyan-500/40"
              >
                {equipment.map((eq) => (
                  <option key={eq.id} value={eq.id} className="bg-slate-950 text-slate-200">
                    [{eq.availability}] {eq.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Selection Info details */}
            {targetEquipment && (
              <div className="p-4 rounded-xl border border-white/5 bg-slate-900/20 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Class:</span>
                  <span className="text-slate-300 font-semibold uppercase">{targetEquipment.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Location:</span>
                  <span className="text-slate-300 font-semibold">{targetEquipment.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Telemetry ID:</span>
                  <span className="text-slate-400 font-mono font-bold">{targetEquipment.qrCodeVal}</span>
                </div>
                <div className="flex justify-between border-t border-white/5 pt-2 mt-1">
                  <span className="text-slate-500">Current Status:</span>
                  <span className={`font-extrabold ${
                    targetEquipment.availability === "Available" ? "text-emerald-400" :
                    targetEquipment.availability === "In Use" ? "text-cyan-400" :
                    targetEquipment.availability === "Reserved" ? "text-fuchsia-400" : "text-rose-400"
                  }`}>{targetEquipment.availability}</span>
                </div>
              </div>
            )}
          </div>

          {/* Trigger Scan Button */}
          <button
            onClick={triggerScan}
            disabled={scanning || transitionedState !== null || requireProjectForm}
            className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500 text-slate-950 font-extrabold text-xs py-4 px-6 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all uppercase tracking-wider"
          >
            {scanning ? (
              <>
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
                Scanning Optics...
              </>
            ) : (
              <>
                <Play className="h-4.5 w-4.5" />
                Trigger QR Code Sweep
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
