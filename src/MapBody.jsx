import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import { useEffect, useState } from "react";
import "./styles/MapBody.css";
import * as L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { divIcon } from "leaflet";
import "leaflet-routing-machine";
import "lrm-graphhopper";
import { useNavigate, useLocation } from "react-router-dom";


import { FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';



import "./UserInterface";
import { GeoJSON } from "react-leaflet";

function MapBody() {
  const [waterloggingReports, setWaterloggingReports] = useState([]);

  const [currentPosition, setCurrentPosition] = useState(null);
  const [destinationPosition, setDestinationPosition] = useState(null);
  const [routing, setRouting] = useState(null);

// adding dhanmondi bounds
  const dhanmondiBounds = [
  [23.7355, 90.3675], // southwest
  [23.7575, 90.3955]  // northeast
  ];

  const [center, setCenter] = useState([23.7465, 90.3780]); // center of Dhanmondi

  const dhanmondiPolygon = {
  type: "Feature",
  properties: { name: "Dhanmondi" },
  geometry: {
    type: "Polygon",
    coordinates: [[
      // Southwest - Jigatola
      [90.3675, 23.7375],
      [90.3685, 23.7420],

      // West - Shankar
      [90.3695, 23.7470],
      [90.3705, 23.7520],

      // Northwest - near Satmasjid Road / Dhanmondi 27
      [90.3750, 23.7575],
      [90.3820, 23.7580],
      [90.3880, 23.7570],

      // East - extend to Dhanmondi 2 (Kalabagan side)
      [90.3945, 23.7525],
      [90.3950, 23.7465],

      // Southeast - Science Lab junction
      [90.3910, 23.7405],
      [90.3835, 23.7390],
      [90.3760, 23.7390],

      // Close the loop back to Jigatola
      [90.3675, 23.7375]
    ]]
  }
};

const [predictions, setPredictions] = useState([]); // timeline blocks
const [selectedBlockIndex, setSelectedBlockIndex] = useState(0); // choose hour block

  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [incidentDescription, setIncidentDescription] = useState("");
  const [incidentTime, setIncidentTime] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const location = useLocation();
  const routeData = location.state;

const [mode, setMode] = useState("csv");

  const mapSeverityColors = { safe: "green", mild: "orange", heavy: "red" };
  const [avoidWaterlogging, setAvoidWaterlogging] = useState(false);
  const [dangerZones, setDangerZones] = useState([]);


const [isAreaMode, setIsAreaMode] = useState(false);
const [polygon, setPolygon] = useState([]);



const [reports, setReports] = useState([]);

const [role, setRole] = useState(null);

useEffect(() => {
  const storedRole = localStorage.getItem("role");
  if (storedRole) {
    setRole(storedRole);
  }
}, []);


function makeCircle(color, size = 14, opacity = 0.9) {
  return L.divIcon({
    className: "pred-marker",
    html: `<div style="
      background:${color};
      width:${size}px;height:${size}px;
      border-radius:50%;
      box-shadow:0 0 3px rgba(0,0,0,0.4);
      opacity:${opacity};
    "></div>`,
  });
}

function sizeByCredibility(cred) {
  if (cred >= 8) return 18;
  if (cred >= 4) return 14;
  return 10;
}

  async function getWaterloggingReports() {
    try {
      const response = await fetch("${import.meta.env.VITE_API_URL}/api/waterlogging/all");
      const data = await response.json();
      setWaterloggingReports(data);
    } catch (e) { console.error("Reports fetch error:", e); }
  } 


  const iconMarkup = renderToStaticMarkup(
    <i className="material-symbols-outlined" style={{ color: "red" }}>
      warning
    </i>
  );
  const customMarkerIcon = divIcon({
    html: iconMarkup,
  });


  const addTofavourite = async (
    current_lat,
    current_lng,
    destination_lat,
    destination_lng
  ) => {
    try {
      const user_id = localStorage.getItem("user_id");
      const response = await fetch("${import.meta.env.VITE_API_URL}/api/user/history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id,
          current_lat,
          current_lng,
          destination_lat,
          destination_lng,
        }),
      });

      const data = await response.json();
      if (!data.error) {
        // Optionally, save the user data to localStorage or context
        console.log(data);
      } else {
        console.log(data.error);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const addTofavourite2 = async (
    current_lat,
    current_lng,
    destination_lat,
    destination_lng
  ) => {
    try {
      const user_id = localStorage.getItem("user_id");
      const response = await fetch("${import.meta.env.VITE_API_URL}/api/user/favourite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id,
          current_lat,
          current_lng,
          destination_lat,
          destination_lng,
        }),
      });

      const data = await response.json();
      if (!data.error) {
        // Optionally, save the user data to localStorage or context
        console.log(data);
      } else {
        console.log(data.error);
      }
    } catch (err) {
      console.log(err);
    }
  };


  const MapRouting = () => {
    const map = useMap();

    if (routeData) {
      const leafletRouting = L.Routing.control({
        waypoints: [
          L.latLng([routeData.source_lat, routeData.source_lng]),
          L.latLng([routeData.destination_lat, routeData.destination_lng]),
        ],
        routeWhileDragging: true,
        router: new L.Routing.graphHopper(
          "65a6ed8f-3edf-44ca-a7cf-a83806334864"
        ),
      }).addTo(map);
    }
    return null;
  };



  useEffect(() => {
    const fetchDangerZones = async () => {
      try {
        const response = await fetch("${import.meta.env.VITE_API_URL}/api/waterlogging/all");
        const data = await response.json();
        // শুধুমাত্র 'heavy' বা 'manhole' যুক্ত রিপোর্টগুলো ফিল্টার করে রাখা ভালো
        const filteredZones = data.filter(r => 
          r.severity === 'heavy' || r.severity === 'manhole_open'
        );
        setDangerZones(filteredZones);
      } catch (e) {
        console.error("Danger zones fetch error:", e);
      }
    };

    fetchDangerZones();
  }, []);



const token = localStorage.getItem("token");







async function fetchPredictions() {
  try {
    const res = await fetch("${import.meta.env.VITE_API_URL}/api/predictions");
    const data = await res.json();
    console.log("Predictions response:", data); // ✅ check here
    setPredictions(data);
  } catch (e) {
    console.error("Prediction fetch error:", e);
  }
}



  
useEffect(() => {
  getWaterloggingReports();
  fetchPredictions();   // ✅ now it exists
}, [mode]);



const MapClickEvent = () => {
  const map = useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;

      if (!currentPosition) {
        setCurrentPosition([lat, lng]);
      } else if (!destinationPosition) {
        setDestinationPosition([lat, lng]);

        if (routing) {
          map.removeControl(routing);
        }

        const leafletRouting = L.Routing.control({
          waypoints: [
            L.latLng(currentPosition),
            L.latLng([lat, lng])
          ],
          routeWhileDragging: true,
          router: new L.Routing.graphHopper("65a6ed8f-3edf-44ca-a7cf-a83806334864", {
            serviceUrl: "https://graphhopper.com/api/1/route", // ✅ hosted API
            urlParameters: {
              vehicle: "car",
              "ch.disable": "false" // normal routing, no custom model
            }
          }),
          lineOptions: {
            styles: [{
              color: '#2980b9', // always blue for normal route
              weight: 6,
              opacity: 0.8
            }]
          }
        }).addTo(map);

        setRouting(leafletRouting);
        addTofavourite(currentPosition[0], currentPosition[1], lat, lng);
      } else {
        setCurrentPosition([lat, lng]);
        setDestinationPosition(null);
        if (routing) {
          map.removeControl(routing);
        }
      }
    },
  });
  return null;
};



  const handleClickFavourite = () => {
    // console.log("hello world");
    addTofavourite2(
      currentPosition[0],
      currentPosition[1],
      destinationPosition[0],
      destinationPosition[1]
    );
  };

  const handleClickIncident = () => {
    setShowIncidentForm(!showIncidentForm);
  };


  
const handleIncidentSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await fetch("${import.meta.env.VITE_API_URL}/api/waterlogging/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: localStorage.getItem("user_id"), // ✅ added
        lat: currentPosition[0],
        lng: currentPosition[1],
        severity,
        description: incidentDescription,
        date: incidentTime,
      }),
    });

    if (response.ok) {
      alert("Report Submitted!");
      setIncidentDescription("");
      setIncidentTime("");
      setSeverity("mild");
      setShowIncidentForm(false);
      getWaterloggingReports(); // refresh map markers
    } else {
      alert("Error submitting report");
    }
  } catch (error) {
    console.error("Error submitting report:", error);
  }
};



  const handleClickLogOut = () => {
    // console.log("hello world");
    localStorage.clear();
    setIsAuthenticated(false);
  };

  const handleClickGoUI = () => {
    // console.log("hello world");
    navigate("/userinterface");
  };






  useEffect(() => {
    let email = localStorage.getItem("email");

    if (email) {
      setIsAuthenticated(true);
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCenter([lat, lng]);
        const isAuthenticatedUser = localStorage.getItem("user_id"); // Assuming you store a token upon successful login
        setIsAuthenticated(isAuthenticatedUser ? true : false);
      },
      (error) => {
        console.log(error);
      }
    );
    getWaterloggingReports();
  }, []);






// useEffect(() => {
//   navigator.geolocation.getCurrentPosition(
//     (position) => {
//       const lat = position.coords.latitude;
//       const lng = position.coords.longitude;
//       setCenter([lat, lng]);
//       setCurrentPosition([lat, lng]); // ✅ auto-fill incident location
//     },
//     (error) => console.log("Geolocation error:", error)
//   );
// }, []);



















const sendFeedback = async (id, type) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/waterlogging/feedback/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: localStorage.getItem("user_id"), // 👈 include logged-in user
        type
      })
    });

    const data = await response.json();
    console.log("Feedback submitted:", data);

    if (response.ok) {
      getWaterloggingReports(); // refresh map markers
    } else {
      alert(data.error || "Error submitting feedback");
    }
  } catch (err) {
    console.error("Error submitting feedback:", err);
  }
};
  
  
  

  const deleteReport = async (id) => {
  try {
    const token = localStorage.getItem("token");

    // ✅ Capture the fetch result
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/waterlogging/report/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    if (!token) {
  console.error("No token found in localStorage");
  return;
}

    // ✅ Parse JSON body
    const data = await res.json();

    if (res.ok) {
      alert("Report deleted successfully");
      getWaterloggingReports(); // refresh list
    } else {
      alert(data.error || "Failed to delete report");
    }
  } catch (err) {
    console.error("Delete error:", err);
  }
};



const deleteAreaReport = async (id) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("No token found. Please sign in again.");
      return;
    }

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/waterlogging/area/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (res.ok) {
      setReports(prevReports => prevReports.filter(r => r.id !== id));
      alert("Area report deleted successfully");
    } else { const data = await res.json(); alert(data.error || "Failed to delete area report"); }
  } catch (err) {
    console.error("Delete area report error:", err);
  }
};


  const severityColors = {
  safe: "green",
  mild: "orange",
  heavy: "red",
  manhole_open: "black", 
  very_mudded: "brown" 
};
  

const submitAreaReport = async () => {
  try {
    const user_id = localStorage.getItem("user_id");
    const response = await fetch("${import.meta.env.VITE_API_URL}/api/waterlogging/report-area", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        polygon,
        severity,
        description,
        date: new Date().toISOString().split("T")[0],
        user_id
      })
    });
    const data = await response.json();
    console.log("Area report submitted:", data);

    // fetch all reports again after submission
    fetch("${import.meta.env.VITE_API_URL}/api/waterlogging/reports")
      .then(res => res.json())
      .then(rows => setReports(rows));

    setIsAreaMode(false); // exit area mode after submission
  } catch (err) {
    console.error("Error submitting area report:", err);
  }
};


  useEffect(() => {
    fetch("${import.meta.env.VITE_API_URL}/api/waterlogging/reports")
      .then(res => res.json()).then(data => setReports(data))
      .catch(err => console.error("Error fetching reports:", err));
  }, []);



const [description, setDescription] = useState("");
  



  const [severity, setSeverity] = useState("mild"); // default

  const addToWaterloggingReport = async (lat, lng, severity, description, date) => {
  try {
    const response = await fetch("${import.meta.env.VITE_API_URL}/api/waterlogging/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat, lng, severity, description, date })
    });

    const data = await response.json();
    if (!data.error) {
      console.log("Report submitted:", data);
      getWaterloggingReports(); // refresh map
    } else {
      console.log(data.error);
    }
  } catch (err) {
    console.log(err);
  }
};

// http://192.168.34.62:5001/api/waterlogging/report




  

  return (
    <div>
      {isAuthenticated ? (
        <div className="topbar">

          <button className="button" onClick={handleClickFavourite}>
            Add To Favourite
          </button>
          <button className="button" onClick={() => setShowIncidentForm(!showIncidentForm)}>Report
          </button>
          <button onClick={() => setIsAreaMode(true)}>Report Area</button>

          <button className="button" onClick={handleClickGoUI}>
            Go To User Interface
          </button>
          <button className="button" onClick={handleClickLogOut}>
            Log Out
          </button>
          {/* {isAuthenticated && <button onClick={handleClickIncident}>Add Incident</button>} */}
        </div>
      ) : (
        <div></div>
      )}

{/* 


  {showIncidentForm && (
  <form onSubmit={handleIncidentSubmit} className="incident-form">
    <select
      value={severity}
      onChange={(e) => setSeverity(e.target.value)}
      required
    >
      <option value="safe">Waterlogged (Safe)</option>
      <option value="mild">Waterlogged (Mild)</option>
      <option value="heavy">Waterlogged (Heavy)</option>
      <option value="manhole_open">Manhole Open</option>
      <option value="very_mudded">Very Mudded</option>
    </select>

    <textarea
      value={incidentDescription}
      onChange={(e) => setIncidentDescription(e.target.value)}
      placeholder="Description"
      required
    />

    <input
      type="datetime-local"
      value={incidentTime}
      onChange={(e) => setIncidentTime(e.target.value)}
      required
    />

    <button type="submit">Submit Report</button>
  </form>
      )} */}
      


{showIncidentForm && (
  <form onSubmit={handleIncidentSubmit} className="incident-form">
    <select value={severity} onChange={(e) => setSeverity(e.target.value)} required>
      <option value="safe">Safe</option>
      <option value="mild">Mild</option>
      <option value="heavy">Heavy</option>
      <option value="manhole_open">Manhole Open</option>
      <option value="very_mudded">Very Mudded</option>
    </select>

    <textarea
      value={incidentDescription}
      onChange={(e) => setIncidentDescription(e.target.value)}
      placeholder="Description"
      required
    />

    {/* Optional: auto-fill current time for mobile convenience */}
    <input
      type="datetime-local"
      value={incidentTime}
      onChange={(e) => setIncidentTime(e.target.value)}
      required
    />

    <button type="submit">Submit Report</button>
  </form>
)}





      
{isAreaMode && polygon.length > 0 && (
  <div className="area-report-form">
    <select value={severity} onChange={e => setSeverity(e.target.value)}>
      <option value="safe">Safe</option>
      <option value="mild">Mild</option>
      <option value="heavy">Heavy</option>
      <option value="manhole_open">Manhole Open</option>
      <option value="very_mudded">Very Mudded</option>
    </select>

    <textarea
      placeholder="Description"
      value={description}
      onChange={e => setDescription(e.target.value)}
    />

    <button onClick={submitAreaReport}>Submit Area Report</button>
  </div>
)}








      <MapContainer
  center={center}
  zoom={15}
  minZoom={13}
  maxZoom={18}
  scrollWheelZoom={false}
  style={{ height: "650px" }}
  maxBounds={dhanmondiBounds}
  maxBoundsViscosity={0.7}
>
  <TileLayer
    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  />





{waterloggingReports.map((report, idx) => {
  const markerColor = severityColors[report.severity] || "red";

  return (
    <Marker
      key={report.id || idx}
      position={[parseFloat(report.latitude), parseFloat(report.longitude)]} // parseFloat অত্যন্ত জরুরি
      icon={L.divIcon({
        className: "custom-marker",
        html: `<div style="
          background: ${markerColor};
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 0 5px rgba(0,0,0,0.3);
        "></div>`
      })}
    >
      <Popup>
        <div style={{ minWidth: "150px" }}>
          <strong style={{ color: markerColor }}>
            {report.severity ? report.severity.toUpperCase().replace('_', ' ') : 'UNKNOWN'}
          </strong>
          <br />
          <p style={{ margin: "5px 0" }}>{report.description}</p>
          <small style={{ color: "#666" }}>
            {new Date(report.date_reported).toLocaleDateString()}
          </small>
          
          <hr style={{ margin: "8px 0" }} />
          
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button onClick={() => sendFeedback(report.id, "like")} title="Like">
              👍 {report.likes || 0}
            </button>
            <button onClick={() => sendFeedback(report.id, "verify")} title="Verify">
              ✅ {report.verifications || 0}
            </button>
            <button onClick={() => sendFeedback(report.id, "disapprove")} title="Report Fake">
              ❌ {report.disapprovals || 0}
            </button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
})}
        

{isAreaMode && (
  <FeatureGroup>
    <EditControl
      position="topright"
      draw={{
        polygon: true,
        polyline: false,
        rectangle: false,
        circle: false,
        marker: false
      }}
      onCreated={(e) => {
        const coords = e.layer.getLatLngs()[0].map(p => [p.lng, p.lat]); // GeoJSON order
        setPolygon(coords);
      }}
    />
  </FeatureGroup>
)}



{reports.map(report => (
  <GeoJSON
    key={report.id}
    data={JSON.parse(report.geom)}
    style={{ color: report.severity === "manhole_open" ? "red" : "blue" }}
    onEachFeature={(feature, layer) => {
      let popupContent = `
        <b>Severity:</b> ${report.severity}<br/>
        <b>Description:</b> ${report.description}<br/>
        <b>Date:</b> ${report.date_reported}
      `;

      // ✅ Add admin-only delete button
      if (role === "admin") {
        popupContent += `<br/><button id="delete-area-${report.id}" style="background:red;color:white;margin-top:5px;">Delete Area Report</button>`;
      }

      layer.bindPopup(popupContent);

      // ✅ Attach delete handler
      layer.on("popupopen", () => {
        const btn = document.getElementById(`delete-area-${report.id}`);
        if (btn) {
          btn.addEventListener("click", () => deleteAreaReport(report.id));
        }
      });
    }}
  />
))}


{Array.isArray(waterloggingReports) && waterloggingReports.map((report, idx) => {
  const markerColor = severityColors[report.severity] || "red";

  return (
    <Marker
      key={report.id || idx}
      position={[parseFloat(report.latitude), parseFloat(report.longitude)]}
      icon={L.divIcon({ html: `<div style="background:${markerColor};width:18px;height:18px;border-radius:50%;"></div>` })}
    >
      <Popup>
        <strong style={{ color: markerColor }}>
          {report.severity.toUpperCase().replace("_", " ")}
        </strong>
        <p>{report.description}</p>
        <small>{new Date(report.date_reported).toLocaleDateString()}</small>

        <hr />

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button onClick={() => sendFeedback(report.id, "like")}>👍 {report.likes || 0}</button>
          <button onClick={() => sendFeedback(report.id, "verify")}>✅ {report.verifications || 0}</button>
          <button onClick={() => sendFeedback(report.id, "disapprove")}>❌ {report.disapprovals || 0}</button>
        </div>

        {/* ✅ Admin-only delete button */}
        {role === "admin" && (
          <button
            style={{ marginTop: "8px", background: "red", color: "white" }}
            onClick={() => deleteReport(report.id)}
          >
            Delete Report
          </button>
        )}
      </Popup>
    </Marker>
  );
})}

        
{Array.isArray(predictions) && predictions.map((road, idx) => (
  <Polyline
    key={idx}
    positions={road.geometry.map(coord => [coord[1], coord[0]])} // convert [lng, lat] → [lat, lng]
    color={road.predictions.some(p => p.occurrence === 1) ? "red" : "green"}
    weight={5}
  >
    <Popup>
      <strong>{road.road_name}</strong><br />
      {road.predictions.map((p, i) => (
        <div key={i}>
          {p.month}: Occurrence {p.occurrence}, Duration {p.duration.toFixed(1)} hrs
        </div>
      ))}
    </Popup>
  </Polyline>
))}



  {/* Current and destination markers */}
  {currentPosition && <Marker position={currentPosition} />}
  {destinationPosition && <Marker position={destinationPosition} />}

  <MapClickEvent />
  <MapRouting />
</MapContainer>
      
    </div>
  );
}

export default MapBody;
