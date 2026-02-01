
import React from 'react';
import { X, Library, FlaskConical, Utensils, Wifi, Monitor, Bus } from 'lucide-react';

interface FacilitiesModalProps {
  onClose: () => void;
}

const FacilitiesModal: React.FC<FacilitiesModalProps> = ({ onClose }) => {
  const facilities = [
    { icon: <Library className="w-6 h-6" />, name: "Central Library", desc: "14,000+ volumes and digital journals." },
    { icon: <FlaskConical className="w-6 h-6" />, name: "Modern Labs", desc: "State-of-the-art equipment for all depts." },
    { icon: <Monitor className="w-6 h-6" />, name: "Computer Center", desc: "High-speed internet & CAD workstations." },
    { icon: <Wifi className="w-6 h-6" />, name: "Campus Wi-Fi", desc: "Free 24/7 connectivity for students." },
    { icon: <Utensils className="w-6 h-6" />, name: "Canteen", desc: "Hygienic and affordable food court." },
    { icon: <Bus className="w-6 h-6" />, name: "Transportation", desc: "College bus service to major routes." },
  ];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 backdrop-blur-md bg-black/80" onClick={onClose}>
      <div 
        className="glass-panel w-full max-w-3xl rounded-[2.5rem] bg-white dark:bg-[#0a0a0a] border border-white/20 shadow-2xl relative overflow-hidden flex flex-col max-h-[80vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center shrink-0">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Campus Facilities</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                <X className="w-6 h-6 dark:text-white" />
            </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar overscroll-contain flex-1 min-h-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {facilities.map((fac, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-start gap-4 hover:shadow-lg transition-all">
                        <div className="p-3 bg-white dark:bg-black rounded-xl text-sky-600 dark:text-sky-400 shadow-sm">
                            {fac.icon}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg">{fac.name}</h3>
                            <p className="text-sm text-slate-500 dark:text-neutral-400 mt-1 font-medium">{fac.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default FacilitiesModal;
