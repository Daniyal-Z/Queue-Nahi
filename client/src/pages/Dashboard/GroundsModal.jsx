import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const GroundModal = ({ onClose }) => {
  const [student, setStudent] = useState(null);
  const [grounds, setGrounds] = useState([]);
  const [selectedGround, setSelectedGround] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isBooking, setIsBooking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showBookings, setShowBookings] = useState(false);
  const [bookings, setBookings] = useState([]);


  const authorizedFetch = async (url, options = {}) => {
    const token = localStorage.getItem('access_token');
  
    // If token is missing, redirect immediately
    if (!token) {
      localStorage.removeItem('student');
      window.location.href = '/login/student';
      throw new Error('No authentication token found. Redirecting to login.');
    }
  
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
  
    // If token is invalid (expired, tampered, etc.)
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('student');
      window.location.href = '/login/student';
      throw new Error('Authentication failed. Redirecting to login.');
    }
  
    return response;
  };

  useEffect(() => {
      const storedStudent = localStorage.getItem('student');
      if (storedStudent) {
        try {
          setStudent(JSON.parse(storedStudent));
        } catch (err) {
          console.error("Failed to parse student data:", err);
          handleLogout();
        }
      }
    }, []);

  const fetchAvailableGrounds = async () => {
    try {
      const res = await authorizedFetch("http://localhost:3001/grounds/available");
      if (!res.ok) throw new Error("Failed to fetch grounds");
      const data = await res.json();
      setGrounds(data);
    } catch (err) {
      console.error("Grounds fetch error:", err);
      setError(err.message);
    }
  };

  const fetchAvailableSlots = async () => {
    setError('');
    setIsLoading(true);
    
    try {
      if (!selectedGround?.G_ID) return;
  
      //const date = selectedDate.toISOString().split('T')[0];
      const url = `http://localhost:3001/grounds/${selectedGround.G_ID}/slots`;

      const res = await authorizedFetch(url, {
        method: "POST",
        body: JSON.stringify({
          date: selectedDate.toISOString()
        })
      });
      
      
      if (!res.ok) {
       
        const errorText = await res.text();
        try {
          
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || errorData.error || `Error ${res.status}`);
        } catch {
          
          throw new Error(errorText || `Error ${res.status}`);
        }
      }
  
      const data = await res.json();
      setSlots(data);
      
    } catch (err) {
      console.error('Slot fetch error:', err);
      setError(err.message || 'Failed to load available slots');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBook = async () => {
    if (!selectedGround || !selectedSlot) {
      setError("Please select both ground and slot");
      return;
    }

    setIsBooking(true);
    setError("");

    try {
      const res = await authorizedFetch("http://localhost:3001/grounds/book", {
        method: "POST",
        body: JSON.stringify({
          roll_no: student?.id,
          g_id: selectedGround.G_ID,
          slot_id: selectedSlot.SlotID,
          date: selectedDate.toISOString()
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Booking failed");
      }

      alert("Booking successful!");
      onClose();
    } catch (err) {
      console.error("Booking error:", err);
      setError(err.message);
    } finally {
      setIsBooking(false);
    }
  };

  const fetchBookings = async () => {
    if (!student?.id) return;
  
    try {
      const res = await authorizedFetch(`http://localhost:3001/students/${student.id}/ground-bookings`);
      if (!res.ok) throw new Error("Failed to fetch bookings");
  
      const data = await res.json();
      setBookings(data);
      setShowBookings(true);
    } catch (err) {
      console.error("Booking fetch error:", err);
      alert(err.message || "Failed to load bookings");
    }
  };
  

  useEffect(() => { fetchAvailableGrounds(); }, []);
  useEffect(() => { fetchAvailableSlots(); }, [selectedGround, selectedDate]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Book Sports Ground </h2>
        
        {!selectedGround ? (
          <GroundSelection 
            grounds={grounds}
            onSelect={setSelectedGround}
            onClose={onClose}
          />
        ) : (
          <SlotSelection
            ground={selectedGround}
            slots={slots}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedSlot={selectedSlot}
            setSelectedSlot={setSelectedSlot}
            onBack={() => setSelectedGround(null)}
            onBook={handleBook}
            isBooking={isBooking}
            isLoading={isLoading}
            error={error}
          />
        )}

      <button
        onClick={fetchBookings}
        className="w-full bg-blue-100 hover:bg-blue-200 py-2 rounded mt-4"
      >
        View My Bookings
      </button>

      </div>

      {showBookings && <BookingPopup bookings={bookings} onClose={() => setShowBookings(false)} />}
    </div>
    
  );
};

const GroundSelection = ({ grounds, onSelect, onClose }) => (
  <>
    <h3 className="font-medium mb-2">Select Ground</h3>
    <div className="max-h-64 overflow-y-auto mb-4 border rounded">
      {grounds.length === 0 ? (
        <p className="p-4 text-gray-500">No grounds available</p>
      ) : (
        grounds.map((g) => (
          <div
            key={g.G_ID}
            className="flex justify-between items-center p-3 border-b hover:bg-gray-50 cursor-pointer"
            onClick={() => onSelect(g)}
          >
            <div>
              <span className="font-medium">{g.Ground_Type}</span>
              <span className="ml-2 text-sm text-gray-500">
                {g.G_Status}
              </span>
            </div>
            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        ))
      )}
    </div>
    <button
      onClick={onClose}
      className="w-full bg-gray-200 hover:bg-gray-300 py-2 rounded"
    >
      Cancel
    </button>
  </>
);

const SlotSelection = ({ 
  ground, 
  slots, 
  selectedDate, 
  setSelectedDate, 
  selectedSlot, 
  setSelectedSlot, 
  onBack, 
  onBook, 
  isBooking, 
  isLoading,
  error 
}) => (
  <>
    <div className="flex items-center mb-4">
      <button onClick={onBack} className="mr-2 text-gray-500 hover:text-gray-700">
        ← Back
      </button>
      <h3 className="font-medium">{ground.Ground_Type}</h3>
    </div>

    <div className="mb-4">
      <label className="block mb-1 text-sm font-medium">Booking Date</label>
      <DatePicker
        selected={selectedDate}
        onChange={setSelectedDate}
        minDate={new Date()}
        className="w-full p-2 border rounded"
        dateFormat="MMMM d, yyyy"
      />
    </div>

    <div className="mb-4">
      <label className="block mb-1 text-sm font-medium">Available Time Slots</label>
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      
      {isLoading ? (
        <div className="p-4 text-center text-gray-500">Loading slots...</div>
      ) : (
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
          {slots.length === 0 ? (
            <p className="col-span-2 text-gray-500 p-2">
              No available slots for selected date
            </p>
          ) : (
            slots.map((slot) => (
              <button
                key={slot.SlotID}
                className={`p-2 border rounded text-sm ${
                  selectedSlot?.SlotID === slot.SlotID
                    ? "bg-blue-100 border-blue-500"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => setSelectedSlot(slot)}
              >
                <div className="font-medium">{slot.Day}</div>
                <div>
                  {slot.StartTime}:00 - {slot.EndTime}:00
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>

    <div className="flex space-x-2">
      <button
        onClick={onBack}
        className="flex-1 bg-gray-200 hover:bg-gray-300 py-2 rounded"
      >
        Back
      </button>
      <button
        onClick={onBook}
        disabled={!selectedSlot || isBooking}
        className={`flex-1 py-2 rounded ${
          isBooking
            ? "bg-blue-300"
            : selectedSlot
            ? "bg-blue-500 hover:bg-blue-600 text-white"
            : "bg-gray-300 cursor-not-allowed"
        }`}
      >
        {isBooking ? "Processing..." : "Request Booking"}
      </button>
    </div>
  </>
);

const BookingPopup = ({ bookings, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
    <div className="bg-white rounded-lg p-6 w-full max-w-xl shadow-lg max-h-[80vh] overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4">My Ground Bookings</h2>
      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <ul className="space-y-3">
          {bookings.map((b) => (
            <li key={b.Booking_ID} className="border rounded p-3">
              <div><strong>Ground:</strong> {b.Ground_Type}</div>
              <div><strong>Date:</strong> {new Date(b.Day).toLocaleDateString()}</div>
              <div><strong>Time Slot:</strong> {b.StartTime}:00 - {b.EndTime}:00</div>
              <div><small className="text-gray-500">Booked on: {new Date(b.B_Time).toLocaleString()}</small></div>
            </li>
          ))}
        </ul>
      )}
      <button
        onClick={onClose}
        className="mt-4 bg-gray-200 hover:bg-gray-300 py-2 px-4 rounded"
      >
        Close
      </button>
    </div>
  </div>
);


export default GroundModal;