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

import { useRef} from "react";
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



// const [reports, setReports] = useState([]);

const [role, setRole] = useState(null);

useEffect(() => {
  const storedRole = localStorage.getItem("role");
  if (storedRole) {
    setRole(storedRole);
  }
}, []);


function makeCircle(color, size = 8, opacity = 0.9) {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/waterlogging/all`, {
        headers: {
          "ngrok-skip-browser-warning": "true"
        }
      });
      const data = await response.json();
      setWaterloggingReports(data.result);
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/history`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/favourite`, {
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
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/waterlogging/all`,{
    headers: {
      "ngrok-skip-browser-warning": "true"
    }
  });
        

        const data = await response.json();

        const reportsArray = data.result;   // 👈 VERY IMPORTANT

        const filteredZones = reportsArray.filter(r =>
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
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/predictions`,{
    headers: {
      "ngrok-skip-browser-warning": "true"
    }
  });
    const data = await res.json();
    console.log("Predictions response:", data); // ✅ check here
    setPredictions(data);
  } catch (e) {
    console.error("Prediction fetch error:", e);
  }
}


const [reports, setReports] = useState(null); // null = no area query yet
const [isDrawingArea, setIsDrawingArea] = useState(false);
const [isViewingArea, setIsViewingArea] = useState(false);
const [drawnPolygon, setDrawnPolygon] = useState(null);
const [severity, setSeverity] = useState("safe");
const [description, setDescription] = useState("");

// ✅ Use a ref so EditControl's onCreated closure always sees latest values
const isViewingAreaRef = useRef(false);
const isDrawingAreaRef = useRef(false);

// Keep refs in sync with state
useEffect(() => { isViewingAreaRef.current = isViewingArea; }, [isViewingArea]);
useEffect(() => { isDrawingAreaRef.current = isDrawingArea; }, [isDrawingArea]);





  
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





  const handleClickLogOut = () => {
    // console.log("hello world");
    localStorage.clear();
    setIsAuthenticated(false);
  };

  const handleClickGoUI = () => {
    // console.log("hello world");
    navigate("/userInterface");
  };





const handleIncidentSubmit = async (e) => {
  e.preventDefault();
  try {
    const payload = {
      user_id: parseInt(localStorage.getItem("user_id"), 10), // ensure integer
      lat: Number(currentPosition[0]),
      lng: Number(currentPosition[1]),
      severity,
      description: incidentDescription,
      other: incidentOther,
      date: new Date().toISOString().split("T")[0],
    };

    console.log("Submitting payload:", payload); // debug

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/waterlogging/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      alert("Report Submitted!");
      setIncidentDescription("");
      setIncidentOther("");
      setSeverity("mild");
      setShowIncidentForm(false);
      getWaterloggingReports();
    } else {
      const err = await response.json();
      alert("Error submitting report: " + err.error);
      console.error("Backend error:", err);
    }
  } catch (error) {
    console.error("Network error:", error);
  }
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




const ngrokFetch = (url, options = {}) => {
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
      ...(options.headers || {})
    }
  });
};











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
      setWaterloggingReports(prev => prev.filter(r => r.id !== id));
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
  



  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/waterlogging/reports`,{
    headers: {
      "ngrok-skip-browser-warning": "true"
    }
  })
      .then(data => setWaterloggingAreaReports(Array.isArray(data) ? data : (data.result || [])))
      .catch(err => console.error("Error fetching reports:", err));
  }, []);



  // const [description, setDescription] = useState("");
  const [incidentOther, setIncidentOther] = useState("");
  



  // const [severity, setSeverity] = useState("mild"); // default

  const addToWaterloggingReport = async (lat, lng, severity, description, date) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/waterlogging/report`, {
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
  





// fetchAreaReports
const fetchAreaReports = () => {
  ngrokFetch(`${import.meta.env.VITE_API_URL}/api/waterlogging/reports`)
    .then(res => res.json())
    .then(data => {
      const rows = Array.isArray(data) ? data : (data.result || []);
      console.log("Area reports loaded:", rows); 
      setWaterloggingAreaReports(rows);
    })
    .catch(err => console.error("Error fetching area reports:", err));
};

// viewReportsInArea
const viewReportsInArea = async (polygonGeoJSON) => {
  try {
    const response = await ngrokFetch(`${import.meta.env.VITE_API_URL}/api/waterlogging/problems-in-area`, {
      method: "POST",
      body: JSON.stringify({ polygon: polygonGeoJSON.coordinates[0] })
    });
    const data = await response.json();
    setReports({
      points: data.points || data.result || [],
      areas: data.areas || []
    });
    setIsViewingArea(false);
  } catch (err) {
    console.error("Error fetching area reports:", err);
  }
};

// submitAreaReport
const submitAreaReport = async (e) => {
  e.preventDefault();
  if (!drawnPolygon) return;
  try {
    const user_id = localStorage.getItem("user_id");
    await ngrokFetch(`${import.meta.env.VITE_API_URL}/api/waterlogging/report-area`, {
      method: "POST",
      body: JSON.stringify({
        polygon: drawnPolygon.coordinates[0],
        severity,
        description,
        date: new Date().toISOString().split("T")[0],
        user_id
      })
    });
    fetchAreaReports();
    alert("Area report submitted successfully!");
    setDrawnPolygon(null);
    setIsDrawingArea(false);
    setSeverity("safe");
    setDescription("");
  } catch (err) {
    console.error("Error submitting area report:", err);
  }
};


















const [waterloggingAreaReports, setWaterloggingAreaReports] = useState([]);

// Call on mount
useEffect(() => {
  fetchAreaReports();
  // ...your other fetches
}, []);




  

  return (
    <div> {isAuthenticated ? (
      <div className="topbar flex flex-wrap gap-3 justify-center p-4 bg-white shadow-md rounded-lg">
        <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition" onClick={handleClickFavourite} > ⭐ Add To Favourite </button>
        <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition" onClick={() => setShowIncidentForm(!showIncidentForm)} > ⚠️ Report </button>
       <button
  className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition"
  onClick={() => {
    setIsDrawingArea(true);
    setIsViewingArea(false);
    setDrawnPolygon(null);
    setReports(null);
  }}
>
  🗺️ Report Area
</button>

<button
  className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition"
  onClick={() => {
    setIsViewingArea(true);
    setIsDrawingArea(false);
    setDrawnPolygon(null);
    setReports(null);
  }}
>
  📍 View Reports in Area
</button>







        <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 hover:bg-purple-200 transition" onClick={handleClickGoUI} > 🏠 Go To User Interface </button> 
        <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition" onClick={handleClickLogOut} > 🚪 Log Out </button> </div>) : (<div></div>)}


{showIncidentForm && (
  <form
    onSubmit={handleIncidentSubmit}
    className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8 transition-all duration-300"
  >
    <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
      Incident Report
    </h2>

    <table className="w-full table-auto border-collapse">
      <tbody>
        {/* Date */}
        <tr className="border-b border-gray-200">
          <td className="py-2 pr-4 font-medium text-gray-700 w-1/3">Date</td>
          <td className="py-2">
            <input
              type="date"
              value={new Date().toISOString().split("T")[0]}
              readOnly
              className="w-full border border-gray-300 rounded-lg p-2 bg-gray-100 text-gray-600 cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </td>
        </tr>

        {/* Severity */}
        <tr className="border-b border-gray-200">
          <td className="py-2 pr-4 font-medium text-gray-700">Severity</td>
          <td className="py-2">
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select severity</option>
              <option value="safe">Safe</option>
              <option value="mild">Mild</option>
              <option value="heavy">Heavy</option>
              <option value="manhole_open">Manhole Open</option>
              <option value="very_mudded">Very Mudded</option>
            </select>
          </td>
        </tr>

        {/* Description */}
        <tr className="border-b border-gray-200">
          <td className="py-2 pr-4 font-medium text-gray-700 align-top">Description</td>
          <td className="py-2">
            <textarea
              value={incidentDescription}
              onChange={(e) => setIncidentDescription(e.target.value)}
              placeholder="Describe the situation..."
              required
              className="w-full border border-gray-300 rounded-lg p-2 h-24 sm:h-28 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </td>
        </tr>

        {/* Other notes */}
        <tr className="border-b border-gray-200">
          <td className="py-2 pr-4 font-medium text-gray-700 align-top">Other (optional)</td>
          <td className="py-2">
            <textarea
              value={incidentOther}
              onChange={(e) => setIncidentOther(e.target.value)}
              placeholder="Additional notes..."
              className="w-full border border-gray-300 rounded-lg p-2 h-20 sm:h-24 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </td>
        </tr>

        {/* Submit button */}
      </tbody>
          </table>
          
  <div className="flex justify-center mt-6">
    <button
      type="submit"
      className="bg-red-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-red-600 transition-colors duration-200 shadow-md"
    >
      Submit Report
    </button>
  </div>
</form>
)}


{isDrawingArea && !drawnPolygon && (
  <div className="text-center py-2 bg-green-50 border border-green-200 rounded-lg mx-4 mb-2 text-green-700 font-medium">
    ✏️ Draw a polygon or rectangle on the map to define the area
  </div>
)}

{isDrawingArea && drawnPolygon?.coordinates && (
  <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-6 mb-4">
    <h2 className="text-lg font-semibold mb-4 text-gray-800">📍 Submit Area Report</h2>
    <form onSubmit={submitAreaReport}>
      <table className="w-full table-auto border-collapse">
        <tbody>
          <tr className="border-b border-gray-200">
            <td className="py-2 pr-4 font-medium text-gray-700 w-1/3">Severity</td>
            <td className="py-2">
              <select
                value={severity}
                onChange={e => setSeverity(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="safe">Safe</option>
                <option value="mild">Mild</option>
                <option value="heavy">Heavy</option>
                <option value="manhole_open">Manhole Open</option>
                <option value="very_mudded">Very Mudded</option>
              </select>
            </td>
          </tr>
          <tr className="border-b border-gray-200">
            <td className="py-2 pr-4 font-medium text-gray-700 align-top">Description</td>
            <td className="py-2">
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe the waterlogging situation..."
                className="w-full border border-gray-300 rounded-lg p-2 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </td>
          </tr>
          <tr>
            <td colSpan={2} className="pt-4 flex gap-3 justify-center">
              <button
                type="submit"
                className="bg-red-500 text-white font-semibold py-2 px-6 rounded-lg hover:bg-red-600 transition shadow-md"
              >
                Submit Area Report
              </button>
              <button
                type="button"
                onClick={() => { setIsDrawingArea(false); setDrawnPolygon(null); }}
                className="bg-gray-200 text-gray-700 font-semibold py-2 px-6 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </form>
  </div>
)}

{isViewingArea && !drawnPolygon && (
  <div className="text-center py-2 bg-indigo-50 border border-indigo-200 rounded-lg mx-4 mb-2 text-indigo-700 font-medium">
    🔍 Draw a polygon or rectangle on the map to search for reports in that area
  </div>
)}



{console.log("reports value at render:", reports)}

{reports && reports.points !== undefined && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[9999]">
    <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
      <h2 className="text-lg font-bold mb-4 text-gray-800">📋 Reports in Selected Area</h2>

      {/* Point reports */}
      {reports.points?.length > 0 ? (
        <>
          <h3 className="font-semibold text-sm text-gray-500 uppercase mb-2">Point Reports</h3>
          {reports?.points?.map((r) => (
            <div key={r.id} className="mb-3 p-3 bg-gray-50 rounded-lg border">
              <p className="font-semibold" style={{ color: severityColors[r.severity] || "red" }}>
                ⚠️ {r.severity?.toUpperCase().replace("_", " ")}
              </p>
              <p className="text-sm text-gray-600">{r.description}</p>
              <small className="text-gray-400">
                {new Date(r.date_reported).toLocaleDateString()}
              </small>
            </div>
          ))}
        </>
      ) : null}

      {/* Area reports */}
      {reports.areas?.length > 0 ? (
        <>
          <h3 className="font-semibold text-sm text-gray-500 uppercase mb-2 mt-3">Area Reports</h3>
          {reports?.areas?.map((r) => (
            <div key={r.id} className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="font-semibold text-blue-700">
                📍 {r.severity?.toUpperCase().replace("_", " ")}
              </p>
              <p className="text-sm text-gray-600">{r.description}</p>
              <small className="text-gray-400">
                {new Date(r.date_reported).toLocaleDateString()}
              </small>
            </div>
          ))}
        </>
      ) : null}

      {/* Nothing found */}
      {reports.points?.length === 0 && reports.areas?.length === 0 && (
        <p className="text-gray-500 text-center py-4">No reports found in this area.</p>
      )}

      <button
        className="mt-4 w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold"
        onClick={() => { setReports(null); setDrawnPolygon(null); }}
      >
        Close
      </button>
    </div>
  </div>
)}







      <MapContainer
  center={center}
  zoom={17}
  minZoom={13}
  maxZoom={18}
  scrollWheelZoom={false}
  style={{ height: "850px" }}
  maxBounds={dhanmondiBounds}
  maxBoundsViscosity={0.7}
>
  <TileLayer
    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  />

        




 {/* ✅ 1. All waterlogging point markers (main feed) */}
  {Array.isArray(waterloggingReports) && waterloggingReports.map((report, idx) => {
    if (!report.latitude || !report.longitude) return null;
    const lat = parseFloat(report.latitude);
    const lng = parseFloat(report.longitude);
    if (isNaN(lat) || isNaN(lng)) return null;
    const markerColor = severityColors[report.severity] || "red";

    return (
      <Marker
        key={report.id || idx}
        position={[lat, lng]}
        icon={L.divIcon({
          className: "custom-marker",
          html: `<div style="
            background: ${markerColor};
            width: 18px; height: 18px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 0 5px rgba(0,0,0,0.3);
          "></div>`
        })}
      >
        <Popup>
          <div style={{ minWidth: "150px" }}>
            <strong style={{ color: markerColor }}>
              {report.severity ? report.severity.toUpperCase().replace(/_/g, " ") : "UNKNOWN"}
            </strong>
            <p style={{ margin: "5px 0" }}>{report.description}</p>
            <small style={{ color: "#666" }}>
              {new Date(report.date_reported).toLocaleDateString()}
            </small>
            <hr style={{ margin: "8px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button onClick={() => sendFeedback(report.id, "like")}>👍 {report.likes || 0}</button>
              <button onClick={() => sendFeedback(report.id, "verify")}>✅ {report.verifications || 0}</button>
              <button onClick={() => sendFeedback(report.id, "disapprove")}>❌ {report.disapprovals || 0}</button>
            </div>
            {role === "admin" && (
              <button
                style={{ marginTop: "8px", background: "red", color: "white", width: "100%" }}
                onClick={() => deleteReport(report.id)}
              >
                Delete Report
              </button>
            )}
          </div>
        </Popup>
      </Marker>
    );
  })}



{Array.isArray(waterloggingAreaReports) && waterloggingAreaReports.map((report, idx) => {
  let geojson;
  try {
    geojson = typeof report.geom === "string" ? JSON.parse(report.geom) : report.geom;
  } catch {
    return null;
  }
  if (!geojson) return null;

  const markerColor = severityColors[report.severity] || "red";

  return (
    <GeoJSON
      // key={report.id || idx}
      key={`area-${report.id}`}  
      data={geojson}
      style={{
        color: markerColor,
        fillColor: markerColor,
        fillOpacity: 0.25,
        weight: 2,
      }}
    >
      <Popup>
        <div style={{ minWidth: "150px" }}>
          <strong style={{ color: markerColor }}>
            {report.severity?.toUpperCase().replace(/_/g, " ") || "UNKNOWN"}
          </strong>
          <p style={{ margin: "5px 0" }}>{report.description}</p>
          <small style={{ color: "#666" }}>
            {new Date(report.date_reported).toLocaleDateString()}
          </small>
          {role === "admin" && (
            <button
              style={{ marginTop: "8px", background: "red", color: "white", width: "100%", padding: "4px" }}
              onClick={async () => {
                await fetch(`${import.meta.env.VITE_API_URL}/api/waterlogging/area/${report.id}`, {
                  method: "DELETE",
                  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                });
                fetchAreaReports(); // refresh after delete
              }}
            >
              Delete Area Report
            </button>
          )}
        </div>
      </Popup>
    </GeoJSON>
  );
})}
        




  {/* ✅ 2. Draw tool — shown when either mode is active */}
  {(isDrawingArea || isViewingArea) && (
    <FeatureGroup>
      <EditControl
        position="topright"
        draw={{
          polygon: true,
          rectangle: true,
          circle: false,
          marker: false,
          polyline: false,
          circlemarker: false,
        }}
        edit={{ edit: false, remove: false }}
        onCreated={(e) => {
          const latlngs = e.layer.getLatLngs()[0];
          const coords = latlngs.map(p => [p.lng, p.lat]);
          // Close the polygon by repeating first point
          if (coords[0] !== coords[coords.length - 1]) {
            coords.push(coords[0]);
          }
          const geojsonPolygon = { type: "Polygon", coordinates: [coords] };
          setDrawnPolygon(geojsonPolygon);

          // Use refs to avoid stale closure
          if (isViewingAreaRef.current) {
            viewReportsInArea(geojsonPolygon);
          }
          // If isDrawingArea, form will appear automatically via state
        }}
      />
    </FeatureGroup>
  )}

  {/* ✅ 3. Road predictions */}
  {/* {Array.isArray(predictions) && predictions.map((road, idx) => (
    <Polyline
      key={idx}
      positions={road.geometry.map(coord => [coord[1], coord[0]])}
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


         */}




{/* ✅ 3. Road predictions — aggregated by month */}
{Array.isArray(predictions) && predictions.map((road, idx) => {

  // ── Aggregate 365 days → 12 monthly summaries ──
  const monthlyMap = {};
  road.predictions.forEach((p) => {
    if (!monthlyMap[p.month]) {
      monthlyMap[p.month] = { totalOccurrence: 0, totalDuration: 0, days: 0 };
    }
    monthlyMap[p.month].totalOccurrence += p.occurrence;   // sum flood days
    monthlyMap[p.month].totalDuration   += p.duration;     // sum all durations
    monthlyMap[p.month].days            += 1;              // days in month
  });

  // Sort into calendar order
  const monthOrder = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const monthly = monthOrder
    .filter((m) => monthlyMap[m])
    .map((m) => ({
      month:       m,
      floodDays:   monthlyMap[m].totalOccurrence,
      avgDuration: monthlyMap[m].totalOccurrence > 0
                     ? monthlyMap[m].totalDuration / monthlyMap[m].totalOccurrence
                     : 0,
    }));

  const hasFlood = monthly.some((m) => m.floodDays > 0);

  return (
    <Polyline
      key={idx}
      positions={road.geometry.map(coord => [coord[1], coord[0]])}
      color={hasFlood ? "red" : "green"}
      weight={5}
    >
      <Popup>
        <strong>{road.road_name}</strong>
        <table style={{ fontSize: "12px", borderCollapse: "collapse", marginTop: "6px", width: "100%" }}>
          <thead>
            <tr style={{ background: "#f0f0f0" }}>
              <th style={{ padding: "3px 8px", textAlign: "left"   }}>Month</th>
              <th style={{ padding: "3px 8px", textAlign: "center" }}>Flood Days</th>
              <th style={{ padding: "3px 8px", textAlign: "center" }}>Avg Duration</th>
            </tr>
          </thead>
          <tbody>
            {monthly.map((m, i) => (
              <tr key={i} style={{ background: m.floodDays > 0 ? "#fff3f3" : "white" }}>
                <td style={{ padding: "3px 8px" }}>{m.month}</td>
                <td style={{ padding: "3px 8px", textAlign: "center", color: m.floodDays > 0 ? "red" : "green" }}>
                  {m.floodDays} days
                </td>
                <td style={{ padding: "3px 8px", textAlign: "center" }}>
                  {m.avgDuration > 0 ? `${m.avgDuration.toFixed(1)} hrs` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Popup>
    </Polyline>
  );
})}





















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
