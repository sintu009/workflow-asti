import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Circle, Play, Square, Clock } from 'lucide-react';

const EventNode = ({ data, selected }) => {
  const getEventIcon = () => {
    if (data.event?.type === 'start') return <Play className="w-3 h-3 text-white" />;
    if (data.event?.type === 'end') return <Square className="w-3 h-3 text-white" />;
    if (data.event?.timeDuration) return <Clock className="w-3 h-3 text-white" />;
    return <Circle className="w-3 h-3 text-white" />;
  };

  return (
    <div className={`group relative transition-all duration-200 ${
      selected ? 'scale-110' : 'hover:scale-105'
    }`}>
      <div className={`w-16 h-16 rounded-full shadow-lg bg-green-50 border-2 transition-all duration-200 ${
        selected 
          ? 'border-green-500 shadow-xl' 
          : 'border-green-200 hover:border-green-400 hover:shadow-xl'
      } flex items-center justify-center relative`}>
        <Handle
          type="target"
          position={Position.Top}
          className="w-2 h-2 !bg-green-500 !border-2 !border-white absolute shadow-md transition-all duration-200 hover:scale-125"
          style={{ 
            background: '#10b981',
            top: '-4px',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        />
        
        <div className="flex flex-col items-center">
          <div className="w-6 h-6 bg-green-600 border border-green-700 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow mb-1">
            {getEventIcon()}
          </div>
          <div className="text-xs text-green-800 font-bold text-center leading-tight max-w-12 truncate">
            {data.event?.eventName || data.label || 'Event'}
          </div>
          {data.event?.timeDuration && (
            <div className="text-xs text-green-600 font-medium mt-1">
              {data.event.timeDuration}
            </div>
          )}
        </div>

        <Handle
          type="source"
          position={Position.Bottom}
          className="w-2 h-2 !bg-green-500 !border-2 !border-white absolute shadow-md transition-all duration-200 hover:scale-125"
          style={{ 
            background: '#10b981',
            bottom: '-4px',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        />
      </div>
    </div>
  );
};

export default EventNode;