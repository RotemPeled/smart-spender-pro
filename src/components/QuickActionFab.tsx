import { Plus, FolderPlus, ArrowUpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerOverlay,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

export default function QuickActionFab() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const handleAddProject = () => {
    setOpen(false);
    setTimeout(() => navigate("/add-project"), 300);
  };

  const handleAddExpense = () => {
    setOpen(false);
    setTimeout(() => navigate("/finance"), 300);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button
          className={`fixed ${isMobile ? 'bottom-6 right-6 w-14 h-14' : 'bottom-8 right-8 w-12 h-12'} 
            rounded-full flex items-center justify-center
            transition-all duration-200 ease-in-out
            active:scale-95 hover:scale-105
            z-50`}
          style={{
            backgroundColor: '#007AFF',
            boxShadow: '0 8px 20px rgba(0, 122, 255, 0.3), 0 2px 8px rgba(0, 0, 0, 0.15)'
          }}
          aria-label="Quick Actions"
        >
          <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
        </button>
      </DrawerTrigger>
      
      <DrawerOverlay className="bg-black/20 backdrop-blur-sm" />
      
      <DrawerContent className="border-none outline-none">
        <div 
          className="mx-auto w-full max-w-sm rounded-t-3xl bg-white/95 backdrop-blur-xl"
          style={{ boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.12)' }}
        >
          {/* Drag Handle */}
          <div className="flex justify-center pt-4 pb-2">
            <div className="w-10 h-1 rounded-full bg-gray-300/80" />
          </div>

          {/* Actions */}
          <div className="px-4 pb-8 pt-4 space-y-2">
            <button
              onClick={handleAddProject}
              className="w-full flex items-center gap-4 p-4 rounded-2xl
                transition-all duration-200 ease-in-out
                active:scale-98 active:bg-gray-100/80
                hover:bg-gray-50/80"
            >
              <div 
                className="w-11 h-11 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#007AFF' }}
              >
                <FolderPlus className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <div className="flex-1 text-right">
                <p className="text-base font-medium text-foreground">הוסף פרויקט חדש</p>
                <p className="text-sm text-muted-foreground">צור פרויקט עם פרטי לקוח</p>
              </div>
            </button>

            <button
              onClick={handleAddExpense}
              className="w-full flex items-center gap-4 p-4 rounded-2xl
                transition-all duration-200 ease-in-out
                active:scale-98 active:bg-gray-100/80
                hover:bg-gray-50/80"
            >
              <div 
                className="w-11 h-11 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#FF3B30' }}
              >
                <ArrowUpCircle className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <div className="flex-1 text-right">
                <p className="text-base font-medium text-foreground">הוסף הוצאה</p>
                <p className="text-sm text-muted-foreground">רשום הוצאה חדשה</p>
              </div>
            </button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
