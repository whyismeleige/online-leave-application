import { MapPin, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function PolaroidCard({ item, rotate = 0, onDelete }) {
  return (
    <div
      className="group bg-white p-3 pb-8 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 h-fit relative"
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {/* Action Buttons (appear on hover) */}
      {onDelete && (
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <Link
            to={`/edit-log/${item.id}`}
            className="bg-blue-500 text-white p-2 border border-black hover:bg-blue-600"
          >
            <Edit size={14} />
          </Link>
          <button
            onClick={(e) => {
              e.preventDefault();
              onDelete();
            }}
            className="bg-red-500 text-white p-2 border border-black hover:bg-red-600"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      {/* Image */}
      <div className="aspect-square w-full bg-gray-100 border-2 border-black mb-4 overflow-hidden relative grayscale group-hover:grayscale-0 transition-all duration-500">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 left-2 bg-yellow-300 border border-black px-2 py-1 text-xs font-bold font-mono">
          {item.date}
        </div>
      </div>

      {/* Content */}
      <div className="px-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold font-sans tracking-tight">
            {item.title}
          </h3>
          <span className="text-xl">✈️</span>
        </div>

        <p className="text-sm font-mono text-gray-600 mb-4 leading-relaxed border-l-2 border-gray-200 pl-2 line-clamp-3">
          "{item.description}"
        </p>

        <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest bg-black text-white w-fit px-2 py-1">
          <MapPin className="w-3 h-3" /> {item.location}
        </div>
      </div>
    </div>
  );
}