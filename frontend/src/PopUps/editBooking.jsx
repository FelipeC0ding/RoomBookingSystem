import React,{ useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, X, BookOpen, AlignLeft } from 'lucide-react';
import fetchData from '../DAL/FetchData'
const INPUT_STYLE = `
  w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200
  rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500
  focus:bg-white outline-none transition-all duration-200
  text-gray-900 placeholder:text-gray-400
`;

const LABEL_STYLE = "text-[13px] font-bold text-gray-500 ml-1 uppercase tracking-wider";

function PopUp({ isOpen, onClose, type = 'success', title, BookingID, timeDuration, bookingDate,description}) {
  if (!isOpen) return null;

  const isSuccess = type === 'success';
  const [stateDescription, setDescription] = useState(description)
  const [bookingTitle, setTitle] = useState(title)
  useEffect(() => {
      if (isOpen) {
        setDescription(description || '');
        setTitle(title || '');
      }
    }, [description, title, isOpen]);


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl transform animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 border border-white/20">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Edit a booking
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="space-y-6 mb-8">
          <div className="space-y-2">
            <label className={LABEL_STYLE}>Booking Title</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                <BookOpen size={18} />
              </div>
              <input
                type="text"
                required
                className={INPUT_STYLE}
                value={bookingTitle}
                onChange={(e) => setTitle(e.target.value)}

              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={LABEL_STYLE}>Description</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                <AlignLeft size={18} />
              </div>
              <input
                type="text"
                required
                value = {stateDescription}
                className={INPUT_STYLE}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={async ()=>{await fetchData.updateBooking(BookingID, bookingTitle , stateDescription);onClose();}}
            className={`w-full py-4 px-6 font-bold rounded-2xl transition-all shadow-lg shadow-blue-200 active:scale-[0.98] ${
              isSuccess ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'
            } text-white text-lg`}
          >
            Update Booking
          </button>

          <button
              onClick={async ()=> {await fetchData.deleteBooking(BookingID); onClose();}}
              className="w-full py-3 px-4 rounded-2xl bg-red-600 text-white font-bold transition-all duration-200 hover:bg-red-700 hover:shadow-lg active:scale-[0.98]"
            >
            Delete
            </button>
          <button
            onClick={onClose}
            className="w-full py-3 px-4 rounded-2xl text-gray-500 font-bold transition-all duration-200 hover:bg-gray-50 hover:text-gray-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default PopUp;