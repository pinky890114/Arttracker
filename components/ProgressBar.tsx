import React from 'react';
import { CommissionStatus } from '../types';
import { STATUS_STEPS } from '../constants';
import { Check, Circle } from 'lucide-react';

interface ProgressBarProps {
  currentStatus: CommissionStatus;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentStatus }) => {
  const currentIndex = STATUS_STEPS.indexOf(currentStatus);

  return (
    <div className="w-full mt-4 mb-2 px-2">
      <div className="flex items-center justify-between relative">
        {/* Background Line */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-2 bg-stone-200 rounded-full -z-0"></div>
        
        {/* Active Line (Forest Green) */}
        <div 
            className="absolute left-0 top-1/2 transform -translate-y-1/2 h-2 bg-[#1a472a] rounded-full transition-all duration-500 -z-0"
            style={{ width: `${(currentIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
        ></div>

        {STATUS_STEPS.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step} className="flex flex-col items-center relative z-10 group cursor-default">
              <div 
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center border-[3px] transition-all duration-300 shadow-sm
                  ${isCompleted ? 'bg-[#1a472a] border-[#1a472a]' : 'bg-white border-stone-200'}
                  ${isCurrent ? 'ring-4 ring-[#1a472a]/20 scale-110' : ''}
                `}
              >
                {isCompleted ? (
                   <Check size={16} className="text-white stroke-[3px]" />
                ) : (
                   <div className="w-2 h-2 rounded-full bg-stone-300"></div>
                )}
              </div>
              <span className={`
                absolute top-9 text-[10px] md:text-xs font-bold tracking-wide transition-colors duration-300 whitespace-nowrap bg-white/80 px-1 rounded-md
                ${isCurrent ? 'text-[#1a472a] -translate-y-0.5' : isCompleted ? 'text-stone-500' : 'text-stone-300'}
              `}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};