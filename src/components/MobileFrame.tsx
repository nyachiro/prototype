import { ReactNode } from "react";

interface MobileFrameProps {
  children: ReactNode;
}

const MobileFrame = ({ children }: MobileFrameProps) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-8">
      <div className="relative">
        {/* Phone frame */}
        <div className="relative w-[375px] h-[812px] bg-black rounded-[3rem] p-2 shadow-elevated">
          {/* Screen */}
          <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-36 h-6 bg-black rounded-b-xl z-50"></div>
            
            {/* App content */}
            <div className="w-full h-full pt-6">
              {children}
            </div>
          </div>
        </div>
        
        {/* Home indicator */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white rounded-full opacity-60"></div>
      </div>
    </div>
  );
};

export default MobileFrame;