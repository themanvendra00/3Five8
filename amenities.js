const amenities = [
  {
    name: "Clubhouse",
    slots: [
      { start: "10:00", end: "16:00", amount: 100 },
      { start: "16:00", end: "22:00", amount: 500 },
    ],
  },
  {
    name: "Tennis Court",
    slots: [{ start: "00:00", end: "22:00", amount: 50 }],
  },
  {
    name: "Swiming Pool",
    slots: [
      { start: "06:00", end: "12:00", amount: 50 },
      { start: "12:00", end: "16:00", amount: 100 },
      { start: "16:00", end: "22:00", amount: 200 },
    ],
  },
  {
    name: "Playground",
    slots: [{ start: "06:00", end: "18:00", amount: 20 }],
  },
];

module.exports = { amenities };
