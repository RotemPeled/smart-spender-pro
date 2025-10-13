import { Plus, FolderPlus, ArrowUpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function QuickActionFab() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const handleAddProject = () => {
    navigate("/add-project");
  };

  const handleAddExpense = () => {
    navigate("/finance");
  };

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-200"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Action Buttons */}
      <div className="fixed bottom-24 right-8 z-50 flex flex-col gap-3">
        {/* Add Project */}
        <button
          onClick={handleAddProject}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/90 backdrop-blur-xl
            shadow-lg transition-all duration-300 ease-in-out
            hover:bg-white hover:scale-105 active:scale-95
            ${open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
          style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)' }}
        >
          <div 
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#007AFF' }}
          >
            <FolderPlus className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <span className="text-sm font-medium text-foreground whitespace-nowrap">הוסף פרויקט</span>
        </button>

        {/* Add Expense */}
        <button
          onClick={handleAddExpense}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/90 backdrop-blur-xl
            shadow-lg transition-all duration-300 ease-in-out
            hover:bg-white hover:scale-105 active:scale-95
            ${open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
          style={{ 
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
            transitionDelay: open ? '50ms' : '0ms'
          }}
        >
          <div 
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#FF3B30' }}
          >
            <ArrowUpCircle className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <span className="text-sm font-medium text-foreground whitespace-nowrap">הוסף הוצאה</span>
        </button>
      </div>

      {/* Main FAB */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed ${isMobile ? 'bottom-6 right-6 w-14 h-14' : 'bottom-8 right-8 w-12 h-12'} 
          rounded-full flex items-center justify-center
          transition-all duration-200 ease-in-out
          active:scale-95 hover:scale-105
          z-50 ${open ? 'rotate-45' : 'rotate-0'}`}
        style={{
          backgroundColor: '#007AFF',
          boxShadow: '0 8px 20px rgba(0, 122, 255, 0.3), 0 2px 8px rgba(0, 0, 0, 0.15)'
        }}
        aria-label="Quick Actions"
      >
        <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
      </button>
    </>
  );
}
