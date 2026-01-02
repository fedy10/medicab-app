import { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  label?: string;
}

export function TimePicker({ value, onChange, label }: TimePickerProps) {
  const [hour, setHour] = useState('09');
  const [minute, setMinute] = useState('00');
  const [isOpen, setIsOpen] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const hourScrollRef = useRef<HTMLDivElement>(null);
  const minuteScrollRef = useRef<HTMLDivElement>(null);

  // Parse value when it changes (only from parent)
  useEffect(() => {
    if (value && value.includes(':')) {
      const [h, m] = value.split(':');
      const parsedHour = h.padStart(2, '0');
      const parsedMinute = m.padStart(2, '0');
      
      if (parsedHour !== hour || parsedMinute !== minute) {
        setHour(parsedHour);
        setMinute(parsedMinute);
      }
    }
  }, [value]);

  // Scroll to selected values when dropdown opens
  useEffect(() => {
    if (isOpen && hourScrollRef.current && minuteScrollRef.current) {
      const hourIndex = parseInt(hour);
      const minuteIndex = parseInt(minute);
      
      const hourButton = hourScrollRef.current.querySelector(`[data-hour="${hour}"]`);
      const minuteButton = minuteScrollRef.current.querySelector(`[data-minute="${minute}"]`);
      
      if (hourButton) {
        hourButton.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
      if (minuteButton) {
        minuteButton.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleHourChange = (newHour: string) => {
    setHour(newHour);
    onChange(`${newHour}:${minute}`);
  };

  const handleMinuteChange = (newMinute: string) => {
    setMinute(newMinute);
    onChange(`${hour}:${newMinute}`);
  };

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <div ref={containerRef} className="relative">
        {/* Input trigger */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Clock className="w-4 h-4 text-gray-400" />
          </div>
          
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full pl-10 pr-4 py-2.5 text-left bg-white border rounded-lg transition-all ${
              isOpen 
                ? 'border-blue-500 ring-2 ring-blue-200' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <span className="font-medium text-gray-900">
              {hour}:{minute}
            </span>
          </button>
        </div>

        {/* Dropdown with dual columns */}
        {isOpen && (
          <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 overflow-hidden">
            <div className="flex">
              {/* Hours column */}
              <div className="flex-1 border-r border-gray-200">
                <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 text-center">Heure</p>
                </div>
                <div 
                  ref={hourScrollRef}
                  className="h-48 overflow-y-auto custom-scrollbar"
                >
                  {hours.map((h) => (
                    <button
                      key={h}
                      type="button"
                      data-hour={h}
                      onClick={() => handleHourChange(h)}
                      className={`w-full px-4 py-2.5 text-center transition-all ${
                        h === hour
                          ? 'bg-blue-600 text-white font-bold'
                          : 'text-gray-700 hover:bg-blue-50'
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              {/* Minutes column */}
              <div className="flex-1">
                <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 text-center">Minute</p>
                </div>
                <div 
                  ref={minuteScrollRef}
                  className="h-48 overflow-y-auto custom-scrollbar"
                >
                  {minutes.map((m) => (
                    <button
                      key={m}
                      type="button"
                      data-minute={m}
                      onClick={() => handleMinuteChange(m)}
                      className={`w-full px-4 py-2.5 text-center transition-all ${
                        m === minute
                          ? 'bg-blue-600 text-white font-bold'
                          : 'text-gray-700 hover:bg-blue-50'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f9fafb;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
}