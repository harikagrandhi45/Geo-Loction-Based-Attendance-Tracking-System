// script.js

// Constants
const validStudentPassword = "vignan"; // Student password
const validAdminPassword = "vignanfaculty"; // Admin password
const allowedDistance = 200; // Distance in meters

// State to store admin's location
let adminLatitude = null;
let adminLongitude = null;

// Elements
const mainSelection = document.getElementById("mainSelection");
const loginForm = document.getElementById("loginForm");
const adminForm = document.getElementById("adminForm");
const adminDashboard = document.getElementById("adminDashboard");
const attendanceSection = document.getElementById("attendanceSection");
const attendanceDetails = document.createElement("div"); // To show attendance details

const userLoginButton = document.getElementById("userLogin");
const adminLoginButton = document.getElementById("adminLoginButton");
const loginButton = document.getElementById("loginButton");
const setLocationButton = document.getElementById("setLocation");
const markAttendanceButton = document.getElementById("markAttendance");

const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const adminUsernameInput = document.getElementById("adminUsername");
const adminPasswordInput = document.getElementById("adminPassword");

const loginError = document.getElementById("loginError");
const adminError = document.getElementById("adminError");
const adminStatus = document.getElementById("adminStatus");
const statusElement = document.getElementById("status");

// Utility function to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// Event: Show student login form
userLoginButton.addEventListener("click", () => {
  mainSelection.style.display = "none";
  loginForm.style.display = "block";
});

// Event: Show admin login form
document.getElementById("adminLogin").addEventListener("click", () => {
  mainSelection.style.display = "none";
  adminForm.style.display = "block";
});

// Student login handler
loginButton.addEventListener("click", () => {
  const username = usernameInput.value;
  const password = passwordInput.value;

  if (password === validStudentPassword) {
    loginForm.style.display = "none";
    attendanceSection.style.display = "block";
    checkLocationForAttendance(username);
  } else {
    loginError.textContent = "Invalid password. Please try again.";
  }
});

// Admin login handler
adminLoginButton.addEventListener("click", () => {
  const password = adminPasswordInput.value;

  if (password === validAdminPassword) {
    adminForm.style.display = "none";
    adminDashboard.style.display = "block";
  } else {
    adminError.textContent = "Invalid admin credentials. Please try again.";
  }
});

// Set admin's location and redirect to main page
setLocationButton.addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      adminLatitude = position.coords.latitude;
      adminLongitude = position.coords.longitude;
      adminStatus.textContent = "Location set successfully! Redirecting...";
      setTimeout(() => {
        adminDashboard.style.display = "none";
        mainSelection.style.display = "block";
      }, 2000); // Redirect after 2 seconds
    },
    (error) => {
      adminStatus.textContent = "Unable to set location. Please try again.";
      console.error(error);
    }
  );
});

// Check student location for attendance
function checkLocationForAttendance(username) {
  if (adminLatitude === null || adminLongitude === null) {
    statusElement.textContent = "Admin has not set the location yet.";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const studentLatitude = position.coords.latitude;
      const studentLongitude = position.coords.longitude;

      const distance = calculateDistance(
        studentLatitude,
        studentLongitude,
        adminLatitude,
        adminLongitude
      );

      if (distance <= allowedDistance) {
        statusElement.textContent = "You are within the allowed range.";
        markAttendanceButton.disabled = false;

        markAttendanceButton.addEventListener("click", () => {
          const currentDate = new Date();
          const date = currentDate.toLocaleDateString();
          const time = currentDate.toLocaleTimeString();

          attendanceDetails.innerHTML = `
            <h3>Attendance Marked Successfully</h3>
            <p><strong>Username:</strong> ${username}</p>
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Time:</strong> ${time}</p>
            <p><strong>Distance from Admin:</strong> ${Math.round(distance)} meters</p>
          `;
          attendanceSection.appendChild(attendanceDetails);

          // Disable further attendance marking
          markAttendanceButton.disabled = true;
        });
      } else {
        statusElement.textContent = `You are too far away. Distance: ${Math.round(
          distance
        )} meters.`;
        markAttendanceButton.disabled = true;
      }
    },
    (error) => {
      statusElement.textContent =
        "Unable to fetch location. Please enable GPS.";
      console.error(error);
    }
  );
}