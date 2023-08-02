const express = require("express");
const cors = require("cors");
const { amenities } = require("./amenities");

const app = express();
app.use(express.json());
app.use(cors());

const bookedSlots = {};

// Helper function to convert time string to minutes
function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number);
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

  // Parsing the date and time
  const [day, month, year] = date.split("-").map(Number);
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  // checking for valid date and time
  if (
    isNaN(day) ||
    isNaN(month) ||
    isNaN(year) ||
    isNaN(startMinutes) ||
    isNaN(endMinutes)
  ) {
    return res.status(400).json({ error: "Invalid date or time format" });
  }

  const validSlot = facilityConfig.slots.some((slot) => {
    const slotStartMinutes = timeToMinutes(slot.start);
    const slotEndMinutes = timeToMinutes(slot.end);
    return startMinutes >= slotStartMinutes && endMinutes <= slotEndMinutes;
  });

  if (!validSlot) {
    return res.status(400).json({ error: "Invalid booking time slot" });
  }

  // Checking if the slot is already booked or not
  const existingBooking = bookedSlots[facility]?.[date];
  if (existingBooking) {
    const overlapping = existingBooking.some((booking) => {
      const bookingStartMinutes = timeToMinutes(booking.startTime);
      const bookingEndMinutes = timeToMinutes(booking.endTime);
      return (
        (startMinutes >= bookingStartMinutes &&
          startMinutes <= bookingEndMinutes) ||
        (endMinutes >= bookingStartMinutes && endMinutes <= bookingEndMinutes)
      );
    });

    if (overlapping) {
      return res.status(409).json({ error: "Booking Failed, Already Booked" });
    }
  }

  // Calculating the total amount
  const totalAmount = facilityConfig.slots.reduce((total, slot) => {
    const slotStartMinutes = timeToMinutes(slot.start);
    const slotEndMinutes = timeToMinutes(slot.end);
    const intersectionStart = Math.max(startMinutes, slotStartMinutes);
    const intersectionEnd = Math.min(endMinutes, slotEndMinutes);
    const intersectionDuration = intersectionEnd - intersectionStart;
    return total + slot.amount * (intersectionDuration / 60);
  }, 0);

  if (!bookedSlots[facility]) {
    bookedSlots[facility] = {};
  }
  if (!bookedSlots[facility][date]) {
    bookedSlots[facility][date] = [];
  }
  bookedSlots[facility][date].push({ startTime, endTime });

  return res.status(200).json({ status: "Booked", amount: totalAmount });
});

const port = 8080;
app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
