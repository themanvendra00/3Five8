const express = require("express");
const cors = require('cors');
const { amenities } = require("./amenities");

const app = express();
app.use(express.json());
app.use(cors());

const bookedSlots = {};

// Helper function to convert time string to minutes
function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// Booking Endpoint
app.post("/book", (req, res) => {
  const { facility, date, startTime, endTime } = req.body;

  // Checking for valid facility
  const facilityConfig = amenities.find((amenity) => amenity.name === facility);
  if (!facilityConfig) {
    return res.status(404).json({ error: "Facility not found" });
  }

// Converting date and time formats to match the expected format
const [year, month, day] = date.split('-');
const formattedDate = `${day}-${month}-${year}`;
const formattedStartTime = startTime.substring(0, 5);
const formattedEndTime = endTime.substring(0, 5);

// Validate date and time
const bookingDate = new Date(`${year}-${month}-${day}`);
const startDateTime = new Date(`${formattedDate} ${formattedStartTime}`);
const endDateTime = new Date(`${formattedDate} ${formattedEndTime}`);

if (
  isNaN(bookingDate) ||
  isNaN(startDateTime) ||
  isNaN(endDateTime) ||
  startDateTime >= endDateTime
) {
  return res.status(400).json({ error: 'Invalid date or time format' });
}

const validSlot = facilityConfig.slots.some((slot) => {
  const slotStartMinutes = timeToMinutes(slot.start);
  const slotEndMinutes = timeToMinutes(slot.end);
  return timeToMinutes(formattedStartTime) >= slotStartMinutes && timeToMinutes(formattedEndTime) <= slotEndMinutes;
});

if (!validSlot) {
  return res.status(400).json({ error: 'Invalid booking time slot' });
}

  // Checking if the slot is already booked or not
  const existingBooking = bookedSlots[facility]?.[formattedDate];
  if (existingBooking) {
    const overlapping = existingBooking.some((booking) => {
      const bookingStartMinutes = timeToMinutes(booking.startTime);
      const bookingEndMinutes = timeToMinutes(booking.endTime);
      return (
        timeToMinutes(formattedStartTime) >= bookingStartMinutes &&
        timeToMinutes(formattedStartTime) <= bookingEndMinutes
      ) || (
        timeToMinutes(formattedEndTime) >= bookingStartMinutes &&
        timeToMinutes(formattedEndTime) <= bookingEndMinutes
      );
    });

    if (overlapping) {
      return res.status(409).json({ error: 'Booking Failed, Already Booked' });
    }
  }

  // Calculating the total amount
  const totalAmount = facilityConfig.slots.reduce((total, slot) => {
    const slotStartMinutes = timeToMinutes(slot.start);
    const slotEndMinutes = timeToMinutes(slot.end);
    const intersectionStart = Math.max(timeToMinutes(formattedStartTime), slotStartMinutes);
    const intersectionEnd = Math.min(timeToMinutes(formattedEndTime), slotEndMinutes);
    const intersectionDuration = intersectionEnd - intersectionStart;
    return total + slot.amount * (intersectionDuration / 60);
  }, 0);

  if (!bookedSlots[facility]) {
    bookedSlots[facility] = {};
  }
  if (!bookedSlots[facility][formattedDate]) {
    bookedSlots[facility][formattedDate] = [];
  }
  bookedSlots[facility][formattedDate].push({ startTime: formattedStartTime, endTime: formattedEndTime });

  return res.status(200).json({ status: 'Booked', amount: totalAmount });
});

const port = 8080;
app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
