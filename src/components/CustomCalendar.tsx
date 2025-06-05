import React, { useState, useRef } from 'react';

const PROVIDERS = [
  { id: 1, name: 'Provider 1' },
  { id: 2, name: 'Provider 2' },
  { id: 3, name: 'Provider 3' },
];

const APPOINTMENT_TYPES = [
  { key: 'hormone', label: 'Hormone' },
  { key: 'sexual', label: 'Sexual Medicine' },
  { key: 'weightloss', label: 'Weight Loss' },
];

const BUSINESS_HOURS = { start: 9, end: 17 }; // 9am-5pm
const SLOT_INTERVAL = 30; // minutes
const EST_OFFSET = -4; // For demonstration, not for production

// Card type detection logic
const CARD_TYPES = [
  { name: 'Visa', regex: /^4/, logo: 'https://img.icons8.com/color/48/000000/visa.png', format: [4,4,4,4] },
  { name: 'Mastercard', regex: /^5[1-5]/, logo: 'https://img.icons8.com/color/48/000000/mastercard-logo.png', format: [4,4,4,4] },
  { name: 'Amex', regex: /^3[47]/, logo: 'https://img.icons8.com/color/48/000000/amex.png', format: [4,6,5] },
];

function detectCardType(card: string) {
  for (const type of CARD_TYPES) {
    if (type.regex.test(card.replace(/\D/g, ''))) return type;
  }
  return null;
}

function formatCardNumber(card: string, type: any) {
  const digits = card.replace(/\D/g, '');
  if (!type) return digits.replace(/(.{4})/g, '$1 ').trim();
  let parts = [];
  let idx = 0;
  for (const len of type.format) {
    if (digits.length > idx) {
      parts.push(digits.substr(idx, len));
      idx += len;
    }
  }
  return parts.join(' ').trim();
}

function getSlots(duration: number) {
  const slots = [];
  for (let hour = BUSINESS_HOURS.start; hour < BUSINESS_HOURS.end; hour++) {
    for (let min = 0; min < 60; min += SLOT_INTERVAL) {
      slots.push({
        time: `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`,
        hour,
        min,
      });
    }
  }
  return slots;
}

function getMonthDays(year: number, month: number) {
  const days = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  // Fill in blanks for the first week
  for (let i = 0; i < firstDay.getDay(); i++) {
    days.push(null);
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  return days;
}

const CustomCalendar = ({
  userType,
  appointmentType,
  onBookingConfirmed,
}: {
  userType: 'new' | 'returning';
  appointmentType: string;
  onBookingConfirmed: (details: any) => void;
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [selectedProvider, setSelectedProvider] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipcode: '',
    card: '',
    expMonth: '',
    expYear: '',
    cvv: '',
  });
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [month, setMonth] = useState<number>(new Date().getMonth());
  const [year, setYear] = useState<number>(new Date().getFullYear());

  const cardType = detectCardType(form.card);
  const cardInputRef = useRef<HTMLInputElement>(null);

  // Mocked provider logic
  function getAvailableProviders(date: Date, slot: any) {
    const day = date.getDay(); // 0=Sun, 1=Mon, ...
    if (userType === 'new') {
      return [PROVIDERS[0]]; // Provider 1
    }
    if (appointmentType === 'hormone' || appointmentType === 'sexual') {
      return [PROVIDERS[0]]; // Provider 1
    }
    if (appointmentType === 'weightloss') {
      if (day === 2) return [PROVIDERS[1], PROVIDERS[2]]; // Tue: Provider 2 & 3
      if (day === 4) return [PROVIDERS[2]]; // Thu: Provider 3
      return []; // No providers other days
    }
    return [];
  }

  function handleSlotSelect(slot: any) {
    setSelectedSlot(slot);
    const providers = getAvailableProviders(selectedDate!, slot);
    if (providers.length === 1) {
      setSelectedProvider(providers[0].id);
      setShowModal(true);
    } else if (providers.length > 1) {
      setSelectedProvider(null);
    }
  }

  function handleProviderSelect(id: number) {
    setSelectedProvider(id);
    setShowModal(true);
  }

  function handleConfirmBooking() {
    setBookingSuccess(true);
    setTimeout(() => {
      onBookingConfirmed({
        date: selectedDate,
        slot: selectedSlot,
        provider: selectedProvider,
        form,
      });
    }, 1000);
  }

  // Mocked slots
  const duration = userType === 'new' ? 90 : 40;
  const slots = getSlots(duration);
  const days = getMonthDays(year, month);
  const today = new Date();

  function isPastDay(day: Date | null) {
    if (!day) return true;
    return day.setHours(0,0,0,0) < today.setHours(0,0,0,0);
  }

  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
    setSelectedDate(null);
    setSelectedSlot(null);
  }
  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
    setSelectedDate(null);
    setSelectedSlot(null);
  }

  return (
    <div className="w-full max-w-lg mx-auto p-4 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col">
      <h2 className="text-xl font-bold mb-4 text-center text-gray-800">Select a Date and Time</h2>
      {/* Calendar grid */}
      <div className="flex items-center justify-between mb-2">
        <button onClick={prevMonth} className="px-2 py-1 rounded hover:bg-gray-200">&lt;</button>
        <span className="font-semibold">{new Date(year, month).toLocaleString('en-US', { month: 'long', year: 'numeric' })}</span>
        <button onClick={nextMonth} className="px-2 py-1 rounded hover:bg-gray-200">&gt;</button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs text-gray-500">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 mb-4">
        {days.map((day, i) => (
          <button
            key={i}
            disabled={!day || isPastDay(day)}
            className={`aspect-square rounded-lg text-sm font-medium flex items-center justify-center
              ${day && selectedDate && day.toDateString() === selectedDate.toDateString() ? 'bg-blue-200 text-blue-900' : 'bg-gray-100 text-gray-700'}
              ${!day || isPastDay(day) ? 'opacity-40 cursor-not-allowed' : 'hover:bg-blue-100'}`}
            onClick={() => day && !isPastDay(day) && setSelectedDate(day)}
          >
            {day ? day.getDate() : ''}
          </button>
        ))}
      </div>
      {/* Time slots */}
      {selectedDate && (
        <>
          <div className="mb-2 text-center text-gray-700 font-semibold">Available Times</div>
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {slots.map((slot, i) => (
              <button
                key={i}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${selectedSlot === slot ? 'bg-blue-400 text-white' : 'bg-gray-100 text-gray-700'} hover:bg-blue-200`}
                onClick={() => handleSlotSelect(slot)}
              >
                {slot.time}
              </button>
            ))}
          </div>
        </>
      )}
      {/* Provider selection if needed */}
      {selectedDate && selectedSlot && getAvailableProviders(selectedDate, selectedSlot).length > 1 && (
        <div className="mb-4">
          <div className="mb-2 text-center text-gray-700 font-semibold">Select Provider</div>
          <div className="flex flex-wrap gap-2 justify-center">
            {getAvailableProviders(selectedDate, selectedSlot).map((p) => (
              <button
                key={p.id}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${selectedProvider === p.id ? 'bg-blue-400 text-white' : 'bg-gray-100 text-gray-700'} hover:bg-blue-200`}
                onClick={() => handleProviderSelect(p.id)}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Modal for new patient details */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl max-w-md mx-2 p-6 shadow-2xl border border-gray-100">
            {userType === 'new' ? (
              <>
                <h3 className="text-lg font-bold mb-2">Confirm Your Details</h3>
                <div className="grid grid-cols-1 gap-2 mb-2">
                  {/* Address Autocomplete Placeholder - Integrate Google Places or Algolia Places here */}
                  <input
                    className="rounded-lg shadow-sm px-4 py-2 bg-gray-50 focus:ring-2 focus:ring-pink-200 focus:outline-none transition"
                    placeholder="First Name"
                    value={form.firstName}
                    onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                  />
                  <div
                    className={`transition-all duration-300 overflow-hidden ${form.firstName ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    <input
                      className="rounded-lg shadow-sm px-4 py-2 bg-gray-50 focus:ring-2 focus:ring-pink-200 focus:outline-none transition mt-2"
                      placeholder="Last Name"
                      value={form.lastName}
                      onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                    />
                  </div>
                  <input
                    className="rounded-lg shadow-sm px-4 py-2 bg-gray-50 focus:ring-2 focus:ring-pink-200 focus:outline-none transition"
                    placeholder="Address (Start typing...)"
                    value={form.address}
                    onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  />
                  {/* TODO: Show address suggestions dropdown here and auto-fill city/state/zip on select */}
                  <input
                    className="rounded-lg shadow-sm px-4 py-2 bg-gray-50 focus:ring-2 focus:ring-pink-200 focus:outline-none transition"
                    placeholder="City"
                    value={form.city}
                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  />
                  <input
                    className="rounded-lg shadow-sm px-4 py-2 bg-gray-50 focus:ring-2 focus:ring-pink-200 focus:outline-none transition"
                    placeholder="State"
                    value={form.state}
                    onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                  />
                  <input
                    className="rounded-lg shadow-sm px-4 py-2 bg-gray-50 focus:ring-2 focus:ring-pink-200 focus:outline-none transition"
                    placeholder="Zipcode"
                    value={form.zipcode}
                    onChange={e => setForm(f => ({ ...f, zipcode: e.target.value }))}
                  />
                </div>
                <div className="mb-2 font-semibold">Payment Details</div>
                <div className="relative mb-2">
                  {cardType && (
                    <img
                      src={cardType.logo}
                      alt={cardType.name}
                      className="absolute left-2 top-1/2 -translate-y-1/2 h-6 w-8 object-contain transition-all duration-300 opacity-100"
                      style={{ animation: 'fadeInLeft 0.3s' }}
                    />
                  )}
                  <input
                    ref={cardInputRef}
                    className={`w-full rounded-lg shadow-sm pl-12 pr-4 py-2 bg-gray-50 focus:ring-2 focus:ring-pink-200 focus:outline-none transition font-mono tracking-widest`}
                    placeholder="Card Number"
                    value={formatCardNumber(form.card, cardType)}
                    onChange={e => {
                      const raw = e.target.value.replace(/\D/g, '');
                      setForm(f => ({ ...f, card: raw }));
                    }}
                    maxLength={cardType && cardType.name === 'Amex' ? 15 : 16}
                    inputMode="numeric"
                  />
                </div>
                <div className="flex gap-2 mb-2">
                  <select
                    className="rounded-lg shadow-sm px-2 py-2 flex-1 bg-gray-50 focus:ring-2 focus:ring-pink-200 focus:outline-none transition"
                    value={form.expMonth}
                    onChange={e => setForm(f => ({ ...f, expMonth: e.target.value }))}
                  >
                    <option value="">MM</option>
                    {[...Array(12)].map((_, i) => (
                      <option key={i+1} value={String(i+1).padStart(2, '0')}>{String(i+1).padStart(2, '0')}</option>
                    ))}
                  </select>
                  <select
                    className="rounded-lg shadow-sm px-2 py-2 flex-1 bg-gray-50 focus:ring-2 focus:ring-pink-200 focus:outline-none transition"
                    value={form.expYear}
                    onChange={e => setForm(f => ({ ...f, expYear: e.target.value }))}
                  >
                    <option value="">YYYY</option>
                    {[...Array(12)].map((_, i) => {
                      const year = new Date().getFullYear() + i;
                      return <option key={year} value={year}>{year}</option>;
                    })}
                  </select>
                  <input
                    className="rounded-lg shadow-sm px-4 py-2 flex-1 bg-gray-50 focus:ring-2 focus:ring-pink-200 focus:outline-none transition"
                    placeholder="CVV"
                    value={form.cvv}
                    onChange={e => setForm(f => ({ ...f, cvv: e.target.value }))}
                    maxLength={4}
                    inputMode="numeric"
                    type="password"
                  />
                </div>
                <button
                  className="w-full py-2 bg-pink-200 hover:bg-pink-300 text-gray-800 rounded-lg font-semibold mt-2 transition active:scale-95 focus:scale-95 focus:ring-2 focus:ring-pink-300"
                  onClick={handleConfirmBooking}
                >
                  Confirm Booking
                </button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold mb-4">Confirm Card on File</h3>
                <button
                  className="w-full py-2 bg-pink-200 hover:bg-pink-300 text-gray-800 rounded-lg font-semibold mt-2 transition"
                  onClick={handleConfirmBooking}
                >
                  Confirm Booking
                </button>
              </>
            )}
          </div>
        </div>
      )}
      {/* Success message */}
      {bookingSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl text-center">
            <h3 className="text-lg font-bold mb-2">Booking Confirmed!</h3>
            <p className="mb-2">Your appointment has been booked.</p>
            <button
              className="w-full py-2 bg-pink-200 hover:bg-pink-300 text-gray-800 rounded-lg font-semibold mt-2 transition"
              onClick={() => setBookingSuccess(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {/* Button click feedback for all buttons */}
      <style>{`
        button:active, button:focus { outline: none; }
        @keyframes fadeInLeft { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
};

export default CustomCalendar; 