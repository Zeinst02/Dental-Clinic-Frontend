import { useEffect, useState } from "react";
import "./App.css";

type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: number;
};

const ROLE_ADMIN = 0;
const ROLE_DOCTOR = 1;
const ROLE_PATIENT = 2;

type Appointment = {
  id: number;
  patientId: number;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  doctorId: number;
  doctorName: string;
  doctorSpecialty: string;
  startTime: string;
  endTime: string;
  status: string;
};

type Doctor = {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialty: string;
};

type DoctorAvailability = {
  id: number;
  doctorId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

type CreateUserForm = {
  name: string;
  email: string;
  phone: string;
  password: string;
  specialty: string;
};

type ClinicUser = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: number;
};

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const SPECIALTIES = [
  "General Dentist",
  "Orthodontics",
  "Pediatric Dentistry",
  "Prosthodontics",
  "Periodontics",
  "Endodontics",
  "Oral Surgery",
];

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const [user, setUser] = useState<User | null>(null);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [availabilities, setAvailabilities] = useState<
    DoctorAvailability[]
  >([]);

  const [patientId, setPatientId] = useState<number | null>(null);
  const [specialty, setSpecialty] = useState<string | null>(null);

  const [showBooking, setShowBooking] = useState(false);
  const [showAppointments, setShowAppointments] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAvailability, setShowAvailability] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);

  // ==============================
  // ADMIN USER MANAGEMENT
  // ==============================

  const [clinicUsers, setClinicUsers] = useState<ClinicUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState("");

  const [userForm, setUserForm] = useState<CreateUserForm>({
    name: "",
    email: "",
    phone: "",
    password: "",
    specialty: "",
  });

  const [userFormType, setUserFormType] = useState<
    "doctor" | "patient"
  >("doctor");

  const [userManagementMessage, setUserManagementMessage] =
    useState("");

  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // ==============================
  // BOOKING
  // ==============================

  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingReady, setBookingReady] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  // ==============================
  // AVAILABILITY
  // ==============================

  const [newDay, setNewDay] = useState("1");
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");

  const [availabilityMessage, setAvailabilityMessage] = useState("");
  const [isSavingSlot, setIsSavingSlot] = useState(false);

  // ==============================
  // ROLE HELPERS
  // ==============================

  const isAdmin = user?.role === ROLE_ADMIN;
  const isDoctor = user?.role === ROLE_DOCTOR;
  const isPatient = user?.role === ROLE_PATIENT;

  // ==============================
  // LOAD DATA AFTER LOGIN
  // ==============================

  useEffect(() => {
    if (!user) return;

    loadAppointments();

    if (user.role === ROLE_ADMIN) {
      loadClinicUsers();
    }

    if (user.role === ROLE_DOCTOR) {
      loadAvailabilities();
      loadMyDoctorProfile();
    }

    if (user.role === ROLE_PATIENT) {
      loadDoctors();
      loadPatientProfile();
    }
  }, [user]);

  // ==============================
  // LOGIN
  // ==============================

 const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  setMessage("");

  if (!email || !password) {
    setMessage("Please enter your email and password.");
    return;
  }

  try {
    const response = await fetch(
      "https://localhost:7231/api/Users/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Invalid email or password.");
      return;
    }

    const loggedInUser: User = {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
    };

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(loggedInUser));

    setUser(loggedInUser);
    setMessage("");
  } catch (error) {
    console.error(error);
    setMessage("Unable to connect to the server.");
  }
};

  // ==============================
  // LOAD APPOINTMENTS
  // ==============================

  const loadAppointments = async () => {
    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      const response = await fetch(
        "https://localhost:7231/api/Appointments",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        console.error(
          "Could not load appointments. Status:",
          response.status
        );
        return;
      }

      const data = await response.json();

      setAppointments(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Could not load appointments:",
        error
      );
    }
  };

  // ==============================
  // LOAD CLINIC USERS
  // ==============================

  const loadClinicUsers = async () => {
    const token = localStorage.getItem("token");

    if (!token) return;

    setIsLoadingUsers(true);

    try {
      const response = await fetch(
        "https://localhost:7231/api/Users",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(
          "Could not load users:",
          data
        );
        return;
      }

      setClinicUsers(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Could not load users:",
        error
      );
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // ==============================
  // LOAD DOCTORS
  // ==============================

  const loadDoctors = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setDoctors([]);
      return;
    }

    try {
      const response = await fetch(
        "https://localhost:7231/api/Doctors",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(
          "Could not load doctors:",
          data
        );
        setDoctors([]);
        return;
      }

      setDoctors(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Could not load doctors:",
        error
      );

      setDoctors([]);
    }
  };

  // ==============================
  // LOAD DOCTOR PROFILE
  // ==============================

  const loadMyDoctorProfile = async () => {
    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      const response = await fetch(
        "https://localhost:7231/api/Doctors/me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(
          "Could not load doctor profile:",
          data
        );
        return;
      }

      setSpecialty(data.specialty);
    } catch (error) {
      console.error(
        "Could not load doctor profile:",
        error
      );
    }
  };

  // ==============================
  // LOAD PATIENT PROFILE
  // ==============================

  const loadPatientProfile = async () => {
    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      const response = await fetch(
        "https://localhost:7231/api/Patients/me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(
          "Could not load patient profile:",
          data
        );
        return;
      }

      setPatientId(data.patientId);
    } catch (error) {
      console.error(
        "Could not load patient profile:",
        error
      );
    }
  };

  // ==============================
  // LOAD AVAILABILITY
  // ==============================

  const loadAvailabilities = async () => {
    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      const response = await fetch(
        "https://localhost:7231/api/DoctorAvailabilities/me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(
          "Could not load availability:",
          data
        );
        return;
      }

      const list = Array.isArray(data)
        ? data
        : [];

      list.sort(
        (
          a: DoctorAvailability,
          b: DoctorAvailability
        ) => {
          if (a.dayOfWeek !== b.dayOfWeek) {
            return a.dayOfWeek - b.dayOfWeek;
          }

          return a.startTime.localeCompare(
            b.startTime
          );
        }
      );

      setAvailabilities(list);
    } catch (error) {
      console.error(
        "Could not load availability:",
        error
      );
    }
  };

  // ==============================
  // ADD AVAILABILITY
  // ==============================

  const addAvailabilitySlot = async () => {
    setAvailabilityMessage("");

    if (!newStart || !newEnd) {
      setAvailabilityMessage(
        "Please choose a start and end time."
      );
      return;
    }

    if (newStart >= newEnd) {
      setAvailabilityMessage(
        "Start time must be earlier than end time."
      );
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setAvailabilityMessage(
        "You are not logged in."
      );
      return;
    }

    setIsSavingSlot(true);

    try {
      const response = await fetch(
        "https://localhost:7231/api/DoctorAvailabilities/me",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            dayOfWeek: Number(newDay),
            startTime: `${newStart}:00`,
            endTime: `${newEnd}:00`,
          }),
        }
      );

      const responseText =
        await response.text();

      let data: any;

      try {
        data = JSON.parse(responseText);
      } catch {
        data = responseText;
      }

      if (!response.ok) {
        setAvailabilityMessage(
          typeof data === "string"
            ? data
            : data.message ||
                "Could not add this availability slot."
        );
        return;
      }

      setNewStart("");
      setNewEnd("");

      setAvailabilityMessage(
        "Availability slot added."
      );

      await loadAvailabilities();
    } catch (error) {
      console.error(
        "ADD AVAILABILITY ERROR:",
        error
      );

      setAvailabilityMessage(
        "Could not connect to the clinic server."
      );
    } finally {
      setIsSavingSlot(false);
    }
  };

  // ==============================
  // DELETE AVAILABILITY
  // ==============================

  const deleteAvailabilitySlot = async (
    id: number
  ) => {
    const token = localStorage.getItem("token");

    if (!token) return;

    const confirmed = window.confirm(
      "Remove this availability slot?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `https://localhost:7231/api/DoctorAvailabilities/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        window.alert(
          "Could not remove this availability slot."
        );
        return;
      }

      await loadAvailabilities();
    } catch (error) {
      console.error(
        "DELETE AVAILABILITY ERROR:",
        error
      );

      window.alert(
        "Could not connect to the clinic server."
      );
    }
  };

  // ==============================
  // CHECK APPOINTMENT
  // ==============================

  const checkAvailability = async () => {
    setBookingMessage("");
    setBookingReady(false);

    if (!patientId) {
      setBookingMessage(
        "Patient profile could not be loaded."
      );
      return;
    }

    if (!selectedDoctor) {
      setBookingMessage(
        "Please choose a doctor."
      );
      return;
    }

    if (!selectedDate) {
      setBookingMessage(
        "Please choose a date."
      );
      return;
    }

    if (!selectedTime) {
      setBookingMessage(
        "Please choose a time."
      );
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setBookingMessage(
        "You are not logged in."
      );
      return;
    }

    setIsChecking(true);

    try {
      const startTime =
        `${selectedDate}T${selectedTime}:00`;

      const response = await fetch(
        "https://localhost:7231/api/Appointments/check",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            patientId,
            doctorId: Number(selectedDoctor),
            startTime,
          }),
        }
      );

      const responseText =
        await response.text();

      let data: any;

      try {
        data = JSON.parse(responseText);
      } catch {
        data = responseText;
      }

      if (!response.ok) {
        setBookingMessage(
          typeof data === "string"
            ? data
            : data.message ||
                "The appointment is not available."
        );
        return;
      }

      setBookingMessage(
        typeof data === "string"
          ? data
          : data.message ||
              "The requested time is available. Would you like to confirm this appointment?"
      );

      setBookingReady(true);
    } catch (error) {
      console.error(
        "CHECK AVAILABILITY ERROR:",
        error
      );

      setBookingMessage(
        "Could not check appointment availability."
      );
    } finally {
      setIsChecking(false);
    }
  };

  // ==============================
  // CONFIRM APPOINTMENT
  // ==============================

  const confirmAppointment = async () => {
    if (!patientId) {
      setBookingMessage(
        "Patient profile could not be loaded."
      );
      return;
    }

    if (
      !selectedDoctor ||
      !selectedDate ||
      !selectedTime
    ) {
      setBookingMessage(
        "Please select the doctor, date and time."
      );
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setBookingMessage(
        "You are not logged in."
      );
      return;
    }

    setIsConfirming(true);

    try {
      const startTime =
        `${selectedDate}T${selectedTime}:00`;

      const response = await fetch(
        "https://localhost:7231/api/Appointments/confirm",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            patientId,
            doctorId: Number(selectedDoctor),
            startTime,
          }),
        }
      );

      const responseText =
        await response.text();

      let data: any;

      try {
        data = JSON.parse(responseText);
      } catch {
        data = responseText;
      }

      if (!response.ok) {
        setBookingMessage(
          typeof data === "string"
            ? data
            : data.message ||
                "Could not confirm the appointment."
        );
        return;
      }

      setBookingMessage(
        typeof data === "string"
          ? data
          : data.message ||
              "Your appointment has been confirmed successfully."
      );

      setBookingReady(false);

      await loadAppointments();

      setTimeout(() => {
        setSelectedDoctor("");
        setSelectedDate("");
        setSelectedTime("");
        setBookingMessage("");
        setShowBooking(false);
      }, 1200);
    } catch (error) {
      console.error(
        "CONFIRM APPOINTMENT ERROR:",
        error
      );

      setBookingMessage(
        "Could not confirm the appointment."
      );
    } finally {
      setIsConfirming(false);
    }
  };

  // ==============================
  // CANCEL APPOINTMENT
  // ==============================

  const cancelAppointment = async (
    appointmentId: number
  ) => {
    const token = localStorage.getItem("token");

    if (!token) return;

    const confirmed = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `https://localhost:7231/api/Appointments/cancel/${appointmentId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseText =
        await response.text();

      let data: any;

      try {
        data = JSON.parse(responseText);
      } catch {
        data = responseText;
      }

      if (!response.ok) {
        window.alert(
          typeof data === "string"
            ? data
            : data.message ||
                "Could not cancel the appointment."
        );
        return;
      }

      await loadAppointments();
    } catch (error) {
      console.error(
        "CANCEL APPOINTMENT ERROR:",
        error
      );

      window.alert(
        "Could not connect to the clinic server."
      );
    }
  };

  // ==============================
  // COMPLETE APPOINTMENT
  // ==============================

  const completeAppointment = async (
    appointmentId: number
  ) => {
    const token = localStorage.getItem("token");

    if (!token) return;

    const confirmed = window.confirm(
      "Mark this appointment as completed?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `https://localhost:7231/api/Appointments/complete/${appointmentId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseText =
        await response.text();

      let data: any;

      try {
        data = JSON.parse(responseText);
      } catch {
        data = responseText;
      }

      if (!response.ok) {
        window.alert(
          typeof data === "string"
            ? data
            : data.message ||
                "Could not complete this appointment."
        );
        return;
      }

      await loadAppointments();
    } catch (error) {
      console.error(
        "COMPLETE APPOINTMENT ERROR:",
        error
      );

      window.alert(
        "Could not connect to the clinic server."
      );
    }
  };

  // ==============================
  // CREATE DOCTOR / PATIENT
  // ==============================

  const createClinicUser = async () => {
    setUserManagementMessage("");

    if (!userForm.name.trim()) {
      setUserManagementMessage(
        "Please enter a name."
      );
      return;
    }

    if (!userForm.email.trim()) {
      setUserManagementMessage(
        "Please enter an email."
      );
      return;
    }

    if (!userForm.phone.trim()) {
      setUserManagementMessage(
        "Please enter a phone number."
      );
      return;
    }

    if (!userForm.password.trim()) {
      setUserManagementMessage(
        "Please enter a password."
      );
      return;
    }

    if (
      userFormType === "doctor" &&
      !userForm.specialty
    ) {
      setUserManagementMessage(
        "Please select the doctor's specialty."
      );
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setUserManagementMessage(
        "You are not logged in."
      );
      return;
    }

    setIsCreatingUser(true);

    try {
      const role =
        userFormType === "doctor"
          ? ROLE_DOCTOR
          : ROLE_PATIENT;

      // CREATE USER
      const userResponse = await fetch(
        "https://localhost:7231/api/Users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: userForm.name.trim(),
            email: userForm.email.trim(),
            phone: userForm.phone.trim(),
            password: userForm.password,
            role,
          }),
        }
      );

      const userText =
        await userResponse.text();

      let userData: any;

      try {
        userData = JSON.parse(userText);
      } catch {
        userData = userText;
      }

      if (!userResponse.ok) {
        setUserManagementMessage(
          typeof userData === "string"
            ? userData
            : userData.message ||
                "Could not create the user."
        );
        return;
      }

      const createdUserId = userData.id;

      // CREATE DOCTOR PROFILE
      if (userFormType === "doctor") {
        const doctorResponse = await fetch(
          "https://localhost:7231/api/Doctors",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              userId: createdUserId,
              specialty:
                userForm.specialty,
            }),
          }
        );

        const doctorText =
          await doctorResponse.text();

        let doctorData: any;

        try {
          doctorData =
            JSON.parse(doctorText);
        } catch {
          doctorData = doctorText;
        }

        if (!doctorResponse.ok) {
          setUserManagementMessage(
            typeof doctorData === "string"
              ? doctorData
              : doctorData.message ||
                  "User was created, but the doctor profile could not be created."
          );
          return;
        }

        setUserManagementMessage(
          "Doctor added successfully."
        );
      }

      // CREATE PATIENT PROFILE
      if (userFormType === "patient") {
        const patientResponse =
          await fetch(
            "https://localhost:7231/api/Patients",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                userId: createdUserId,
              }),
            }
          );

        const patientText =
          await patientResponse.text();

        let patientData: any;

        try {
          patientData =
            JSON.parse(patientText);
        } catch {
          patientData = patientText;
        }

        if (!patientResponse.ok) {
          setUserManagementMessage(
            typeof patientData === "string"
              ? patientData
              : patientData.message ||
                  "User was created, but the patient profile could not be created."
          );
          return;
        }

        setUserManagementMessage(
          "Patient added successfully."
        );
      }

      setUserForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        specialty: "",
      });

      await loadClinicUsers();
    } catch (error) {
      console.error(
        "CREATE USER ERROR:",
        error
      );

      setUserManagementMessage(
        "Could not connect to the clinic server."
      );
    } finally {
      setIsCreatingUser(false);
    }
  };

  // ==============================
  // DELETE USER
  // ==============================

  const deleteClinicUser = async (
    id: number
  ) => {
    const token = localStorage.getItem("token");

    if (!token) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `https://localhost:7231/api/Users/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseText =
        await response.text();

      let data: any;

      try {
        data = JSON.parse(responseText);
      } catch {
        data = responseText;
      }

      if (!response.ok) {
        window.alert(
          typeof data === "string"
            ? data
            : data.message ||
                "Could not delete this user."
        );
        return;
      }

      await loadClinicUsers();

      window.alert(
        "User deleted successfully."
      );
    } catch (error) {
      console.error(
        "DELETE USER ERROR:",
        error
      );

      window.alert(
        "Could not connect to the clinic server."
      );
    }
  };

  // ==============================
  // LOGOUT
  // ==============================

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    setUser(null);
    setAppointments([]);
    setPatientId(null);
    setSpecialty(null);
    setDoctors([]);
    setAvailabilities([]);
    setClinicUsers([]);

    setShowBooking(false);
    setShowAppointments(false);
    setShowProfile(false);
    setShowAvailability(false);
    setShowUserManagement(false);

    setSelectedDoctor("");
    setSelectedDate("");
    setSelectedTime("");

    setBookingMessage("");
    setBookingReady(false);

    setUserSearch("");
    setUserManagementMessage("");
  };

  // ==============================
  // FORMATTING
  // ==============================

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString(
      "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const formatSlotTime = (time: string) => {
    const [hourStr, minuteStr] =
      time.split(":");

    const hour = Number(hourStr);

    const period =
      hour >= 12 ? "PM" : "AM";

    const displayHour =
      hour % 12 === 0
        ? 12
        : hour % 12;

    return `${displayHour}:${minuteStr} ${period}`;
  };

  const getFirstName = (name: string) => {
    const withoutTitle = name.replace(
      /^(dr|prof|mr|mrs|ms)\.?\s+/i,
      ""
    );

    return withoutTitle.split(" ")[0];
  };

  // ==============================
  // FILTER USERS
  // ==============================

  const filteredClinicUsers =
    clinicUsers
      .filter(
        (clinicUser) =>
          clinicUser.role !== ROLE_ADMIN
      )
      .filter((clinicUser) => {
        const search =
          userSearch.toLowerCase().trim();

        if (!search) return true;

        return (
          clinicUser.name
            .toLowerCase()
            .includes(search) ||
          clinicUser.email
            .toLowerCase()
            .includes(search) ||
          clinicUser.phone
            .toLowerCase()
            .includes(search)
        );
      });

  // ==============================
  // LOGIN PAGE
  // ==============================

  if (!user) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="logo">🦷</div>

          <h1>Welcome Back</h1>

          <p className="subtitle">
            Sign in to your clinic account
          </p>

          <form onSubmit={handleLogin}>
            <label>Email</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />

            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />

            <button type="submit">
              Sign In
            </button>

          {message && (
  <div className="login-error-message">
    {message}
  </div>
)}
            
          </form>

          <p className="footer-text">
            Clinic Appointment System
          </p>
        </div>
      </div>
    );
  }

  // ==============================
  // PROFILE
  // ==============================

  if (showProfile) {
    return (
      <div className="booking-page">
        <div className="booking-card">
          <button
            className="back-button"
            onClick={() =>
              setShowProfile(false)
            }
          >
            ← Back to Dashboard
          </button>

          <div className="booking-header">
            <div className="booking-icon">
              👤
            </div>

            <div>
              <h1>My Profile</h1>

              <p>
                Your clinic account information
              </p>
            </div>
          </div>

          <div className="profile-info">
            <span>Name</span>
            <strong>{user.name}</strong>

            <span>Email</span>
            <strong>{user.email}</strong>

            <span>Phone</span>
            <strong>
              {user.phone ?? "—"}
            </strong>

            {isDoctor && (
              <>
                <span>Specialty</span>

                <strong>
                  {specialty ?? "Loading..."}
                </strong>
              </>
            )}

            <span>Role</span>

            <strong>
              {isAdmin
                ? "Admin"
                : isDoctor
                ? "Doctor"
                : "Patient"}
            </strong>
          </div>
        </div>
      </div>
    );
  }

  // ==============================
  // ADMIN USER MANAGEMENT
  // ==============================

  if (
    showUserManagement &&
    isAdmin
  ) {
    return (
      <div className="booking-page">
        <div className="booking-card">
          <button
            className="back-button"
            onClick={() => {
              setShowUserManagement(false);
              setUserManagementMessage("");
              setUserSearch("");
            }}
          >
            ← Back to Dashboard
          </button>

          <div className="booking-header">
            <div className="booking-icon">
              👥
            </div>

            <div>
              <h1>User Management</h1>

              <p>
                Add and manage doctors and patients
              </p>
            </div>
          </div>

          {/* SEARCH */}

          <div className="booking-form">
            <label>
              Search Users
            </label>

            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={userSearch}
              onChange={(e) =>
                setUserSearch(e.target.value)
              }
            />
          </div>

          {/* USERS */}

          <div className="section-header">
            <div>
              <h2>Clinic Users</h2>

              <p>
                {filteredClinicUsers.length} user
                {filteredClinicUsers.length !== 1
                  ? "s"
                  : ""}
              </p>
            </div>
          </div>

          {isLoadingUsers ? (
            <div className="empty-state">
              <h3>Loading users...</h3>
            </div>
          ) : filteredClinicUsers.length === 0 ? (
            <div className="empty-state">
              <div>👥</div>

              <h3>
                No users found
              </h3>

              <p>
                Try another search or add a new
                user below.
              </p>
            </div>
          ) : (
            <div className="appointment-list">
              {filteredClinicUsers.map(
                (clinicUser) => (
                  <div
                    className="appointment-item"
                    key={clinicUser.id}
                  >
                    <div className="doctor-info">
                      <div className="doctor-avatar">
                        {clinicUser.name
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <strong>
                          {clinicUser.name}
                        </strong>

                        <span>
                          {clinicUser.email}
                        </span>

                        <span>
                          {clinicUser.phone}
                        </span>
                      </div>
                    </div>

                    <div className="appointment-actions">
                      <span
                        className={
                          clinicUser.role ===
                          ROLE_DOCTOR
                            ? "status confirmed"
                            : "status"
                        }
                      >
                        {clinicUser.role ===
                        ROLE_DOCTOR
                          ? "Doctor"
                          : "Patient"}
                      </span>

                      <button
                        className="cancel-button"
                        onClick={() =>
                          deleteClinicUser(
                            clinicUser.id
                          )
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {/* ADD USER */}

          <div className="section-header">
            <div>
              <h2>Add New User</h2>

              <p>
                Create a new doctor or patient
              </p>
            </div>
          </div>

          <div className="booking-form">
            <label>User Type</label>

            <select
              value={userFormType}
              onChange={(e) => {
                setUserFormType(
                  e.target.value as
                    | "doctor"
                    | "patient"
                );

                setUserManagementMessage("");

                setUserForm({
                  name: "",
                  email: "",
                  phone: "",
                  password: "",
                  specialty: "",
                });
              }}
            >
              <option value="doctor">
                Doctor
              </option>

              <option value="patient">
                Patient
              </option>
            </select>

            <label>Name</label>

            <input
              type="text"
              placeholder={
                userFormType === "doctor"
                  ? "Dr. John Smith"
                  : "John Smith"
              }
              value={userForm.name}
              onChange={(e) =>
                setUserForm({
                  ...userForm,
                  name: e.target.value,
                })
              }
            />

            <label>Email</label>

            <input
              type="email"
              placeholder="Enter email address"
              value={userForm.email}
              onChange={(e) =>
                setUserForm({
                  ...userForm,
                  email: e.target.value,
                })
              }
            />

            <label>Phone</label>

            <input
              type="tel"
              placeholder="Enter phone number"
              value={userForm.phone}
              onChange={(e) =>
                setUserForm({
                  ...userForm,
                  phone: e.target.value,
                })
              }
            />

            <label>Password</label>

            <input
              type="password"
              placeholder="Enter password"
              value={userForm.password}
              onChange={(e) =>
                setUserForm({
                  ...userForm,
                  password: e.target.value,
                })
              }
            />

            {userFormType === "doctor" && (
              <>
                <label>Specialty</label>

                <select
                  value={userForm.specialty}
                  onChange={(e) =>
                    setUserForm({
                      ...userForm,
                      specialty:
                        e.target.value,
                    })
                  }
                >
                  <option value="">
                    Select Specialty
                  </option>

                  {SPECIALTIES.map(
                    (specialtyOption) => (
                      <option
                        key={specialtyOption}
                        value={
                          specialtyOption
                        }
                      >
                        {specialtyOption}
                      </option>
                    )
                  )}
                </select>
              </>
            )}

            <button
              className="check-button"
              onClick={createClinicUser}
              disabled={isCreatingUser}
            >
              {isCreatingUser
                ? "Creating..."
                : userFormType === "doctor"
                ? "Add Doctor"
                : "Add Patient"}
            </button>

            {userManagementMessage && (
              <p
                className={
                  userManagementMessage.includes(
                    "successfully"
                  )
                    ? "booking-message success-message"
                    : "booking-message"
                }
              >
                {userManagementMessage}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==============================
  // AVAILABILITY
  // ==============================

  if (showAvailability) {
    return (
      <div className="booking-page">
        <div className="booking-card">
          <button
            className="back-button"
            onClick={() =>
              setShowAvailability(false)
            }
          >
            ← Back to Dashboard
          </button>

          <div className="booking-header">
            <div className="booking-icon">
              🗓️
            </div>

            <div>
              <h1>My Availability</h1>

              <p>
                The hours you're open for
                appointments
              </p>
            </div>
          </div>

          {availabilities.length === 0 ? (
            <div className="empty-state">
              <div>🗓️</div>

              <h3>
                No availability set yet
              </h3>

              <p>
                Add your working hours below so
                patients can book you.
              </p>
            </div>
          ) : (
            <div className="availability-list">
              {availabilities.map((slot) => (
                <div
                  className="availability-item"
                  key={slot.id}
                >
                  <span className="availability-day">
                    {
                      DAY_NAMES[
                        slot.dayOfWeek
                      ]
                    }
                  </span>

                  <span className="availability-time">
                    {formatSlotTime(
                      slot.startTime
                    )}{" "}
                    –{" "}
                    {formatSlotTime(
                      slot.endTime
                    )}
                  </span>

                  <button
                    className="cancel-button"
                    onClick={() =>
                      deleteAvailabilitySlot(
                        slot.id
                      )
                    }
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="availability-form">
            <h3>Add a slot</h3>

            <label>Day</label>

            <select
              value={newDay}
              onChange={(e) =>
                setNewDay(e.target.value)
              }
            >
              {DAY_NAMES.map(
                (day, index) => (
                  <option
                    key={day}
                    value={index}
                  >
                    {day}
                  </option>
                )
              )}
            </select>

            <label>Start time</label>

            <input
              type="time"
              value={newStart}
              onChange={(e) =>
                setNewStart(e.target.value)
              }
            />

            <label>End time</label>

            <input
              type="time"
              value={newEnd}
              onChange={(e) =>
                setNewEnd(e.target.value)
              }
            />

            <button
              className="check-button"
              onClick={addAvailabilitySlot}
              disabled={isSavingSlot}
            >
              {isSavingSlot
                ? "Saving..."
                : "Add Slot"}
            </button>

            {availabilityMessage && (
              <p className="booking-message">
                {availabilityMessage}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==============================
  // APPOINTMENTS PAGE
  // ==============================

  if (showAppointments) {
    return (
      <div className="booking-page">
        <div className="booking-card">
          <button
            className="back-button"
            onClick={() =>
              setShowAppointments(false)
            }
          >
            ← Back to Dashboard
          </button>

          <div className="booking-header">
            <div className="booking-icon">
              📅
            </div>

            <div>
              <h1>
                {isAdmin
                  ? "All Appointments"
                  : "My Appointments"}
              </h1>

              <p>
                {isAdmin
                  ? "View and manage all clinic appointments"
                  : isDoctor
                  ? "View all appointments booked with you"
                  : "View all your dental appointments"}
              </p>
            </div>
          </div>

          {appointments.length === 0 ? (
            <div className="empty-state">
              <div>📅</div>

              <h3>
                No appointments found
              </h3>

              <p>
                {isAdmin
                  ? "There are no appointments in the clinic yet."
                  : isDoctor
                  ? "No patients have booked with you yet."
                  : "You don't have any appointments yet."}
              </p>
            </div>
          ) : (
            <div className="appointment-list">
              {appointments.map(
                (appointment) => (
                  <div
                    className="appointment-item"
                    key={appointment.id}
                  >
                    <div className="appointment-date">
                      <strong>
                        {formatDate(
                          appointment.startTime
                        )}
                      </strong>

                      <span>
                        {formatTime(
                          appointment.startTime
                        )}
                      </span>
                    </div>

                    <div className="doctor-info">
                      <div className="doctor-avatar">
                        {isAdmin
                          ? "A"
                          : isDoctor
                          ? "Pt"
                          : "Dr"}
                      </div>

                      <div>
                        {isAdmin ? (
                          <>
                            <strong>
                              {
                                appointment.patientName
                              }
                            </strong>

                            <span>
                              {
                                appointment.patientPhone
                              }
                            </span>

                            <span>
                              {appointment.doctorName}{" "}
                              —{" "}
                              {
                                appointment.doctorSpecialty
                              }
                            </span>
                          </>
                        ) : isDoctor ? (
                          <>
                            <strong>
                              {
                                appointment.patientName
                              }
                            </strong>

                            <span>
                              {
                                appointment.patientPhone
                              }
                            </span>
                          </>
                        ) : (
                          <>
                            <strong>
                              {
                                appointment.doctorName
                              }
                            </strong>

                            <span>
                              {
                                appointment.doctorSpecialty
                              }
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="appointment-actions">
                      <span
                        className={`status ${appointment.status.toLowerCase()}`}
                      >
                        {appointment.status}
                      </span>

                      {appointment.status ===
                        "Confirmed" && (
                        <>
                          {(isDoctor ||
                            isAdmin) && (
                            <button
                              className="complete-button"
                              onClick={() =>
                                completeAppointment(
                                  appointment.id
                                )
                              }
                            >
                              Mark Completed
                            </button>
                          )}

                          {(isPatient ||
                            isDoctor ||
                            isAdmin) && (
                            <button
                              className="cancel-button"
                              onClick={() =>
                                cancelAppointment(
                                  appointment.id
                                )
                              }
                            >
                              Cancel
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==============================
  // BOOKING PAGE
  // ==============================

  if (showBooking) {
    return (
      <div className="booking-page">
        <div className="booking-card">
          <button
            className="back-button"
            onClick={() => {
              setShowBooking(false);
              setBookingMessage("");
              setBookingReady(false);
            }}
          >
            ← Back to Dashboard
          </button>

          <div className="booking-header">
            <div className="booking-icon">
              📅
            </div>

            <div>
              <h1>
                Book Appointment
              </h1>

              <p>
                Schedule your dental appointment
              </p>
            </div>
          </div>

          <div className="booking-form">
            <label>
              Choose Doctor
            </label>

            <select
              value={selectedDoctor}
              onChange={(e) => {
                setSelectedDoctor(
                  e.target.value
                );

                setBookingMessage("");
                setBookingReady(false);
              }}
            >
              <option value="">
                Select a doctor
              </option>

              {doctors.map((doctor) => (
                <option
                  key={doctor.id}
                  value={doctor.id}
                >
                  {doctor.name} —{" "}
                  {doctor.specialty}
                </option>
              ))}
            </select>

            <label>
              Choose Date
            </label>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(
                  e.target.value
                );

                setBookingMessage("");
                setBookingReady(false);
              }}
            />

            <label>
              Choose Time
            </label>

            <input
              type="time"
              value={selectedTime}
              onChange={(e) => {
                setSelectedTime(
                  e.target.value
                );

                setBookingMessage("");
                setBookingReady(false);
              }}
            />

            <button
              className="check-button"
              onClick={checkAvailability}
              disabled={isChecking}
            >
              {isChecking
                ? "Checking..."
                : "Check Availability"}
            </button>

            {bookingMessage && (
              <p className="booking-message">
                {bookingMessage}
              </p>
            )}

            {bookingReady && (
              <button
                className="check-button"
                onClick={confirmAppointment}
                disabled={isConfirming}
                style={{
                  marginTop: "12px",
                }}
              >
                {isConfirming
                  ? "Confirming..."
                  : "Confirm Appointment"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==============================
  // DASHBOARD DATA
  // ==============================

  const upcomingAppointments =
    appointments.filter(
      (appointment) =>
        appointment.status ===
        "Confirmed"
    );

  const completedAppointments =
    appointments.filter(
      (appointment) =>
        appointment.status ===
        "Completed"
    );

  const cancelledAppointments =
    appointments.filter(
      (appointment) =>
        appointment.status ===
        "Cancelled"
    );

  const currentHour =
    new Date().getHours();

  const greeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 18
      ? "Good afternoon"
      : "Good evening";

  // ==============================
  // DASHBOARD
  // ==============================

  return (
    <div className="dashboard">

      {/* SIDEBAR */}

      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            🦷
          </div>

          <div>
            <h2>DentalCare</h2>

            <span>
              Clinic System
            </span>
          </div>
        </div>

        <nav>
          <button className="nav-item active">
            <span>⌂</span>
            Dashboard
          </button>

          <button
            className="nav-item"
            onClick={() =>
              setShowAppointments(true)
            }
          >
            <span>📅</span>

            {isAdmin
              ? "All Appointments"
              : "My Appointments"}
          </button>

          {isDoctor ? (
            <button
              className="nav-item"
              onClick={() =>
                setShowAvailability(true)
              }
            >
              <span>🗓️</span>
              My Availability
            </button>
          ) : isPatient ? (
            <button
              className="nav-item"
              onClick={() =>
                setShowBooking(true)
              }
            >
              <span>＋</span>
              Book Appointment
            </button>
          ) : isAdmin ? (
            <button
              className="nav-item"
              onClick={() =>
                setShowUserManagement(true)
              }
            >
              <span>👥</span>
              Manage Users
            </button>
          ) : null}

          <button
            className="nav-item"
            onClick={() =>
              setShowProfile(true)
            }
          >
            <span>👤</span>
            Profile
          </button>
        </nav>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          <span>↪</span>
          Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}

      <main className="main-content">

        {/* TOP BAR */}

        <header className="topbar">
          <div>
            <p className="welcome-small">
              {isAdmin
                ? "Admin Dashboard"
                : isDoctor
                ? "Doctor Dashboard"
                : "Patient Dashboard"}
            </p>

            <h1>
              {greeting},{" "}
              {getFirstName(user.name)} 👋
            </h1>
          </div>

          <div className="profile-mini">
            <div className="avatar">
              {user.name
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <strong>
                {user.name}
              </strong>

              <span>
                {isAdmin
                  ? "Admin"
                  : isDoctor
                  ? "Doctor"
                  : "Patient"}
              </span>
            </div>
          </div>
        </header>

        {/* STATS */}

        <section className="stats-grid">

          <div className="stat-card">
            <div className="stat-icon blue">
              📅
            </div>

            <div>
              <span>
                Upcoming
              </span>

              <strong>
                {
                  upcomingAppointments.length
                }
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              ✓
            </div>

            <div>
              <span>
                Completed
              </span>

              <strong>
                {
                  completedAppointments.length
                }
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon red">
              ×
            </div>

            <div>
              <span>
                Cancelled
              </span>

              <strong>
                {
                  cancelledAppointments.length
                }
              </strong>
            </div>
          </div>

        </section>

        {/* UPCOMING APPOINTMENTS */}

        <section className="appointments-card">

          <div className="section-header">
            <div>
              <h2>
                Upcoming Appointments
              </h2>

              <p>
                {isAdmin
                  ? "All clinic appointments"
                  : isDoctor
                  ? "Patients booked with you"
                  : "Your next dental visits"}
              </p>
            </div>
          </div>

          {upcomingAppointments.length ===
          0 ? (
            <div className="empty-state">
              <div>📅</div>

              <h3>
                No upcoming appointments
              </h3>

              <p>
                {isAdmin
                  ? "There are no upcoming appointments in the clinic."
                  : isDoctor
                  ? "You don't have any upcoming appointments. Make sure your availability is up to date."
                  : "You don't have any upcoming appointments."}
              </p>

              {isDoctor ? (
                <button
                  className="book-button"
                  onClick={() =>
                    setShowAvailability(true)
                  }
                >
                  Manage Availability
                </button>
              ) : isPatient ? (
                <button
                  className="book-button"
                  onClick={() =>
                    setShowBooking(true)
                  }
                >
                  + Book Appointment
                </button>
              ) : null}
            </div>
          ) : (
            <div className="appointment-list">

              {upcomingAppointments.map(
                (appointment) => (
                  <div
                    className="appointment-item"
                    key={appointment.id}
                  >

                    <div className="appointment-date">
                      <strong>
                        {formatDate(
                          appointment.startTime
                        )}
                      </strong>

                      <span>
                        {formatTime(
                          appointment.startTime
                        )}
                      </span>
                    </div>

                    <div className="doctor-info">

                      <div className="doctor-avatar">
                        {isAdmin
                          ? "A"
                          : isDoctor
                          ? "Pt"
                          : "Dr"}
                      </div>

                      <div>

                        {isAdmin ? (
                          <>
                            <strong>
                              {
                                appointment.patientName
                              }
                            </strong>

                            <span>
                              {
                                appointment.patientPhone
                              }
                            </span>

                            <span>
                              {
                                appointment.doctorName
                              }{" "}
                              —{" "}
                              {
                                appointment.doctorSpecialty
                              }
                            </span>
                          </>
                        ) : isDoctor ? (
                          <>
                            <strong>
                              {
                                appointment.patientName
                              }
                            </strong>

                            <span>
                              {
                                appointment.patientPhone
                              }
                            </span>
                          </>
                        ) : (
                          <>
                            <strong>
                              {
                                appointment.doctorName
                              }
                            </strong>

                            <span>
                              {
                                appointment.doctorSpecialty
                              }
                            </span>
                          </>
                        )}

                      </div>
                    </div>

                    <div className="appointment-actions">

                      <span className="status confirmed">
                        Confirmed
                      </span>

                      {(isDoctor ||
                        isAdmin) && (
                        <button
                          className="complete-button"
                          onClick={() =>
                            completeAppointment(
                              appointment.id
                            )
                          }
                        >
                          Mark Completed
                        </button>
                      )}

                      {(isPatient ||
                        isDoctor ||
                        isAdmin) && (
                        <button
                          className="cancel-button"
                          onClick={() =>
                            cancelAppointment(
                              appointment.id
                            )
                          }
                        >
                          Cancel
                        </button>
                      )}

                    </div>

                  </div>
                )
              )}

            </div>
          )}

        </section>

      </main>
    </div>
  );
}

export default App;