import { useLocation } from "react-router-dom";
import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "./styles/UserInterface.css";
import "./MapBody";

function UserInterface() {
  const location = useLocation();

  // const hst = useHistory();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [viewProfile, setViewProfile] = useState(false);
  const [updateProfile, setUpdateProfile] = useState(false);
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [showFavourites, setShowFavourites] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [favourites, setFavourites] = useState([]);
  const [history, setHistory] = useState([]);
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    personalInfo: user?.personalInfo || "",
  });
  const [incident, setIncident] = useState({
    latitude: "",
    longitude: "",
    description: "",
    time: "",
  });
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);

  useEffect(() => {
    // Fetch user favourites and history from the backend if needed
    fetchUserData();
    fetchUserFavourites();
    fetchUserHistory();
  }, []);

  const fetchUserData = async () => {
    try {
      const user_id = localStorage.getItem("user_id");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/user/user/${user_id}`
      );
      const data = await response.json();
      setUser(data.user);
      setRating(data.user.rating);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const fetchUserFavourites = async () => {
    try {
      const user_id = localStorage.getItem("user_id");
      console.log("this is user_id " + user_id);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/user/favourite/${user_id}`
      );
      const data = await response.json();
      setFavourites(data.result);
    } catch (error) {
      console.error("Error fetching favourite:", error);
    }
  };

  const fetchUserHistory = async () => {
    try {
      const user_id = localStorage.getItem("user_id");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/user/history/${user_id}`
      );
      const data = await response.json();
      setHistory(data.result);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleIncidentChange = (e) => {
    const { name, value } = e.target;
    setIncident({ ...incident, [name]: value });
  };



  const handleIncidentSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/waterlogging/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(incident),
    });
    if (response.ok) {
      alert("Waterlogging Report Submitted!");
      setIncident({
        latitude: "",
        longitude: "",
        severity: "mild",
        description: "",
        date_reported: "",
      });
      setShowIncidentForm(false);
    } else {
      alert("Error reporting waterlogging incident");
    }
  } catch (error) {
    console.error("Error reporting waterlogging incident:", error);
  }
};




  const fetchUserReports = async () => {
  try {
    const user_id = localStorage.getItem("user_id");
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/waterlogging/user/${user_id}`);
    const data = await response.json();
    setUserReports(data.result);
  } catch (error) {
    console.error("Error fetching user reports:", error);
  }
};





const [userReports, setUserReports] = useState([]);






  const addFavourite = async () => {
    const route = prompt("Enter route to add to favourites:");
    if (route) {
      try {
        const response = await fetch(`/user/add-favourite/${user.id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ route }),
        });
        if (response.ok) {
          setFavourites([...favourites, route]);
          alert("Route added to favourites!");
        } else {
          alert("Error adding favourite");
        }
      } catch (error) {
        console.error("Error adding favourite:", error);
      }
    }
  };

  const addRating = async (rating) => {
    try {
      const user_id = localStorage.getItem("user_id");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/user/rating/${user_id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ rating }),
        }
      );
      if (response.ok) {
        alert("rating updated");
      } else {
        alert("Error updating rating");
      }
    } catch (error) {
      console.error("Error adding rating:", error);
    }
  };

  const handleFeedbackChange = (e) => {
    setFeedback(e.target.value);
  };

  const handleRatingChange = (value) => {
    setRating(value);
    addRating(value);
  };

  const redirectToMapBody = () => {
    navigate("/");
  };

  const showInMap = (
    source_lat,
    source_lng,
    destination_lat,
    destination_lng
  ) => {
    navigate("/", {
      state: {
        source_lat: source_lat,
        source_lng: source_lng,
        destination_lat: destination_lat,
        destination_lng: destination_lng,
      },
    });
  };



  const [showReports, setShowReports] = useState(false);




  return (
    <div id="userInterface">
      <h1>User Interface</h1>
      <div className="buttons">
        <button onClick={() => setViewProfile(!viewProfile)}>
          View Profile
        </button>
        {/* <button onClick={() => setUpdateProfile(!updateProfile)}> */}
        {/* Update Profile */}
        {/* </button> */}
        <button onClick={() => setShowFavourites(!showFavourites)}>
          View Favourites
        </button>
        {/* <button onClick={addFavourite}>Add Favourites</button> */}
        <button onClick={() => setShowHistory(!showHistory)}>
          View History
        </button>

        <button onClick={redirectToMapBody}>Go to Map</button>
      </div>

      {viewProfile && (
        <div className="profile">
          <h2>Profile</h2>
          {/* <p>Name: {profile.name}</p> */}
          <p>Email: {user.email}</p>
          {/* <p>Personal Info: {profile.personalInfo}</p> */}
        </div>
      )}



      {showFavourites && (
        <div className="favourites">
          <h2>Favourites</h2>
          <ul>
            {favourites.map((fav, index) => (
              <li key={index}>
                <li key={index}>
                  <p>Source Latitude: {fav.current_latitude}</p>
                  <p>Source Longitude: {fav.current_longitude}</p>
                  <p>Destination Latitude: {fav.destination_latitude}</p>
                  <p>Destination Longitude: {fav.destination_longitude}</p>
                  <button
                    onClick={() => showInMap(
                      fav.current_latitude,
                      fav.current_longitude,
                      fav.destination_latitude,
                      fav.destination_longitude
                    )}
                  >
                    View In Map
                  </button>
                </li>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showHistory && (
        <div className="history">
          <h2>History</h2>
          <ul>
            {history.map((incident, index) => (
              <li key={index}>
                <p>Source Latitude: {incident.current_latitude}</p>
                <p>Source Longitude: {incident.current_longitude}</p>
                <p>Destination Latitude: {incident.destination_latitude}</p>
                <p>Destination Longitude: {incident.destination_longitude}</p>
                <p>Time: {incident.timestamp}</p>
                <button
                    onClick={() => showInMap(
                      incident.current_latitude,
                      incident.current_longitude,
                      incident.destination_latitude,
                      incident.destination_longitude
                    )}
                  >
                    View In Map
                  </button>
              </li>
            ))}
          </ul>
        </div>
      )}


      <div className="rating">
        <h2>Rating</h2>
        <div className="stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={star <= rating ? "filled" : ""}
              onClick={() => handleRatingChange(star)}
            >
              ★
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserInterface;
