import React,{ useState, useEffect } from 'react';
import { ChevronDown ,Repeat,Minus, Plus,CheckCircle2, AlertCircle, X, BookOpen, AlignLeft } from 'lucide-react';
import fetchData from '../DAL/FetchData'
const INPUT_STYLE = `
  w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200
  rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500
  focus:bg-white outline-none transition-all duration-200
  text-gray-900 placeholder:text-gray-400
`;

const LABEL_STYLE = "text-[13px] font-bold text-gray-500 ml-1 uppercase tracking-wider";

function PopUp({ isOpen, onClose, type = 'success', title = "Make a booking" , roomID, timeDuration, bookingDate}) {
  if (!isOpen) return null;

  const isSuccess = type === 'success';
  const [description, setDescription] = useState('')
  const [bookingTitle, setTitle] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [frequency, setFrequency] = useState('')
  const [recurrenceLength, setRecurrenceLength] = useState(4); 
  const [monthlyType, setMonthlyType] = useState('date'); 
  const [monthlyOrdinal, setMonthlyOrdinal] = useState('1st');
  const [monthlyWeekday ,setMonthlyWeekday] = useState('Monday')
  const ordinals = ["1st", "2nd", "3rd", "4th", "last"];
  const weekdays = {0:'Sunday', 1:'Monday', 2:'Tuesday', 3:'Wednesday', 4:'Thursday', 5:'Friday', 6:'Saturday'};

  useEffect(() => {
    const dayName = weekdays[new Date(bookingDate).getDay()];
    const weekNum = Math.ceil(new Date(bookingDate).getDate() / 7);

    setMonthlyWeekday(dayName);
    setMonthlyOrdinal(weekNum > 4 ? "last" : ordinals[weekNum - 1]);
  }, [bookingDate]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl transform animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 border border-white/20">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Make a booking
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
                placeholder="e.g. Year 8 Maths"
                required
                className={INPUT_STYLE}
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
                placeholder="e.g. End of unit assessment"
                required
                className={INPUT_STYLE}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Recurring Toggle Section */}
          <div className="space-y-4">
            <button 
              onClick={() => setIsRecurring(!isRecurring)}
              className={`w-full p-4 rounded-3xl border-2 transition-all flex items-center justify-between group
                ${isRecurring ? 'border-blue-600 bg-blue-50/40' : 'border-slate-100 bg-white hover:border-slate-200'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl transition-all shadow-sm ${isRecurring ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  <Repeat size={18} />
                </div>
                <div className="text-left">
                  <p className="font-black text-slate-900 uppercase text-[10px] tracking-tight">Recurring Booking</p>
                  <p className="text-[10px] text-slate-400 font-medium">Create a series</p>
                </div>
              </div>
              <div className={`h-6 w-10 rounded-full relative transition-all ${isRecurring ? 'bg-blue-600' : 'bg-slate-200'}`}>
                <div className={`absolute top-1 bg-white h-4 w-4 rounded-full shadow-sm transition-all ${isRecurring ? 'left-5' : 'left-1'}`} />
              </div>
            </button>

            {isRecurring && (
              <div className="space-y-5 p-7 bg-slate-50 rounded-[2rem] border border-slate-200 animate-in slide-in-from-top-4 duration-500">
                
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Repeat Pattern</label>
                  <div className="grid grid-cols-3 gap-2 bg-white p-1.5 rounded-2xl border border-slate-100">
                    {['Daily', 'Weekly', 'Monthly'].map((freq) => (
                      <button
                        key={freq}
                        onClick={() => setFrequency(freq)}
                        className={`py-2 rounded-xxl font-bold text-[9px] transition-all
                          ${frequency === freq ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        {freq.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Monthly Selection */}
          {frequency === 'Monthly' && (
            <div className="space-y-2">
              <button 
                onClick={() => setMonthlyType('fixed')}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all
                  ${monthlyType === 'fixed' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 hover:bg-slate-50'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${monthlyType === 'fixed' ? 'border-blue-600' : 'border-slate-300'}`}>
                    {monthlyType === 'fixed' && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                  </div>
                  <span className="text-sm font-medium">Monthly Date: {new Date(bookingDate).getDay()}</span>
                </div>
              </button>

              <div className={`rounded-xl border transition-all ${monthlyType === 'ordinal' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100'}`}>
                <button 
                  onClick={() => setMonthlyType('ordinal')}
                  className="w-full flex items-center gap-3 p-3 text-left"
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${monthlyType === 'ordinal' ? 'border-blue-600' : 'border-slate-300'}`}>
                    {monthlyType === 'ordinal' && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                  </div>
                  <span className="text-sm font-medium">Every month on the:</span>
                </button>
                
                {monthlyType === 'ordinal' && (
                  <div className="px-3 pb-3 flex gap-2 animate-in fade-in duration-200">
                    <div className="flex-1 relative">
                      <select
                        value={monthlyOrdinal}
                        onChange={(e) => setMonthlyOrdinal(e.target.value)}
                        className="w-full appearance-none bg-white border border-blue-200 rounded-lg p-2 pr-8 text-xs font-bold text-blue-700 outline-none"
                      >
                        {ordinals.map(o => <option key={o} value={o}>{o.toUpperCase()}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none" />
                    </div>
                    <div className="flex-[1.5] relative">
                      <select
                        value={monthlyWeekday}
                        onChange={(e) => setMonthlyWeekday(e.target.value)}
                        className="w-full appearance-none bg-white border border-blue-200 rounded-lg p-2 pr-8 text-xs font-bold text-blue-700 outline-none"
                      >
                        {Object.entries(weekdays).map(([key, value]) => (
                          <option key={key} value={key}>{value}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Occurrences</label>
                  <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100">
                    <input 
                      type="number"
                      value={recurrenceLength}
                      onChange={(e) => setRecurrenceLength(e.target.value)}
                      className="flex-1 text-center font-black text-base text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={async ()=> 
              {
                if(isRecurring){
                  if(frequency === 'Monthly' && monthlyType === 'ordinal'){
                    await fetchData.createRecurringBooking(description, roomID, bookingDate, timeDuration, bookingTitle, frequency,recurrenceLength, monthlyOrdinal, monthlyWeekday);
                  }
                  else{
                    await fetchData.createRecurringBooking(description, roomID, bookingDate, timeDuration, bookingTitle, frequency,recurrenceLength);
                  }
              }
              else{
                await fetchData.createBooking(description, roomID, bookingDate, timeDuration, bookingTitle);
              }
                onClose();
            }}
            className={`w-full py-4 px-6 font-bold rounded-2xl transition-all shadow-lg shadow-blue-200 active:scale-[0.98] ${
              isSuccess ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'
            } text-white text-lg`}
          >
            {isSuccess ? 'Confirm Booking' : 'Try Again'}
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