const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

document.getElementById("bookingForm").addEventListener("submit", (e) => {
  e.preventDefault();
  let facility = document.getElementById("facility").value;
  let date = document.getElementById("date").value;
  let startTime = document.getElementById("startTime").value;
  let endTime = document.getElementById("endTime").value;

  const bookingDetails = {
    facility,
    date,
    startTime,
    endTime,
  };

  fetch("http://localhost:8080/book", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bookingDetails),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "Booked") {
        Toast.fire({
          icon: "success",
          title: `${data.status}, Rs. ${data.amount}`,
        });
      } else if (data.error) {
        Toast.fire({
          icon: "error",
          title: `${data.error}`,
        });
      }
    });
});
