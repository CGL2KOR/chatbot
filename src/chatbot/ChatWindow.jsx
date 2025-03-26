import React, { useState, useEffect, useRef } from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import MapView from "./MapView";
const cities = [
  "Bangalore",
  "Mumbai",
  "Delhi",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Coimbatore",
];

function ChatWindow() {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi there! Which city are you traveling to?📍" },
  ]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState(1);
  const [isTyping, setIsTyping] = useState(false);
  const [answeredSteps, setAnsweredSteps] = useState({});
  const [selectedCity, setSelectedCity] = useState("");
  const [filterWomenSafe, setFilterWomenSafe] = useState(false);
  const [selectedStay, setSelectedStay] = useState(null);
  const [modalTab, setModalTab] = useState("details");
  const [userLocation, setUserLocation] = useState(null);

  const chatRef = useRef(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          console.error("Location permission denied", err);
        }
      );
    }
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const handleSend = async (value = null) => {
    const userInput = value || input;
    if (!userInput.trim()) return;


    setMessages((prev) => [...prev, { from: "user", text: userInput }]);
    setInput("");
    setAnsweredSteps((prev) => ({ ...prev, [step]: true }));
    setIsTyping(true);

    setTimeout(async () => {
      
      if (userInput.toLowerCase().includes("filter")) {
        setStep(4);
        setIsTyping(false);
        setAnsweredSteps((prev) => ({ ...prev, 4: false }));
        setMessages((prev) => [
          ...prev,
          {
            from: "bot",
            text: "Sure! Please select or update your filters below.",
          },
        ]);
        return;
      }
      let botReply = "";

      if (step === 1) {
        setSelectedCity(userInput);
        botReply = `Awesome! What’s your preferred budget 💰 for your stay in ${userInput}?`;
        setStep(2);
      } else if (step === 2) {
        botReply = "Are you traveling for business 🧑‍💼💻 or personal🧔 ?";
        setStep(3);
      } else if (step === 3) {
        botReply = "Would you like to apply any filters?";
        setStep(4);
      } else if (step === 4) {
        return;
      } else {
        botReply =
          "Let me know if you want more suggestions or type 'restart' to start again.";
      }

      setMessages((prev) => [...prev, { from: "bot", text: botReply }]);
      setIsTyping(false);
    }, 1000);
  };

  const applyOption = (text) => {
    handleSend(text);
  };

  const applyFilter = async (type) => {
    setAnsweredSteps((prev) => ({ ...prev, 4: true }));
    setIsTyping(true);

    setTimeout(async () => {
      const res = await fetch("/recommendations.json");
      let data = await res.json();
      let filtered = data.recommended_stays;

      if (type === "women") {
        filtered = filtered.filter((stay) =>
          stay.tags?.includes("women-friendly")
        );
        setFilterWomenSafe(true);
      } else if (type === "long") {
        filtered = filtered.filter((stay) => stay.tags?.includes("long-stay"));
        setFilterWomenSafe(false);
      } else if (type === "corporate") {
        filtered = filtered.filter((stay) =>
          stay.tags?.includes("corporate-approved")
        );
        setFilterWomenSafe(false);
      } else if (type === "solo-women") {
        filtered = filtered.filter((stay) => stay.tags?.includes("solo-women"));
        setFilterWomenSafe(true);
      } else {
        setFilterWomenSafe(false);
      }
      const top = filtered.slice(0, 3);

      const stayMessages = [
        {
          from: "bot",
          custom: true,
          component: (
            <Carousel
              showThumbs={false}
              infiniteLoop
              useKeyboardArrows
              dynamicHeight
              showStatus={false}
              swipeable={true}
              emulateTouch={true}
              showIndicators={true}
              className="carousel-wrapper"
            >
              {top.map((stay, index) => (
                <div className="hotel-card" key={index}>
                  <div className="card-right">
                    <h4>{stay.name}</h4>
                    <p>
                      <strong>Score:</strong> {stay.score}
                    </p>
                    <p>🛏 {stay.amenities.join(", ")}</p>
                    <p>📍 {stay.distance_to_office_km} km from work</p>
                    <p>
                      ⚠{" "}
                      {stay.alert_badges.length
                        ? stay.alert_badges.join(", ")
                        : "None"}
                    </p>
                    {filterWomenSafe && <p>✅ Women Safety Verified</p>}
                    <a
                      href={`https://www.google.com/maps/search/${encodeURIComponent(
                        stay.name + " " + selectedCity
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="map-link"
                    >
                      📍 View on Map
                    </a>
                    <div className="card-buttons">
                      <button onClick={() => setSelectedStay(stay)}>
                        View
                      </button>
                      <button onClick={() => alert(`Booking ${stay.name}`)}>
                        Book
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </Carousel>
          ),
        },
      ];

      setMessages((prev) => [...prev, ...stayMessages]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="chat-window">
      <div className="messages" ref={chatRef}>
        {messages.map((msg, i) =>
          msg.custom ? (
            <div key={i} className={`bubble ${msg.from}`}>
              {msg.component}
            </div>
          ) : (
            <div key={i} className={`bubble ${msg.from}`}>
              {msg.text}
            </div>
          )
        )}

        {isTyping && <div className="bubble bot">Typing...</div>}

        {step === 1 && !answeredSteps[1] && (
          <div className="bubble-options">
            {cities.map((city, index) => (
              <button
                key={index}
                className="option-button"
                onClick={() => handleSend(city)}
              >
                {city}
              </button>
            ))}
          </div>
        )}

        {step === 3 && !answeredSteps[3] && (
          <div className="bubble-options">
            <button
              className="option-button"
              onClick={() => handleSend("Business")}
            >
              Business
            </button>
            <button
              className="option-button"
              onClick={() => handleSend("Personal")}
            >
              Personal
            </button>
          </div>
        )}

        {step === 4 && !answeredSteps[4] && (
          <div className="bubble-options">
            <button
              onClick={() => applyFilter("women")}
              className="option-button"
            >
              👩 Women-Friendly
            </button>
            <button
              onClick={() => applyFilter("long")}
              className="option-button"
            >
              🏘️ Long Stay
            </button>
            <button
              onClick={() => applyFilter("corporate")}
              className="option-button"
            >
              🏢 Corporate Approved
            </button>
            <button
              onClick={() => applyFilter("solo-women")}
              className="option-button"
            >
              🧕 Solo-Women Travelers
            </button>
            <button
              onClick={() => applyFilter("all")}
              className="option-button"
            >
              🚫 No Filter
            </button>
          </div>
        )}
      </div>

      <div className="input-area">
        <input
          value={input}
          placeholder="Type your message..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={() => handleSend()}>Send</button>
      </div>

      {selectedStay && (
        <div className="modal-backdrop" onClick={() => setSelectedStay(null)}>
          <div
            className="modal modal-split"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left: Details with Tabs */}
            <div className="modal-left">
              <div className="modal-tabs">
                {[
                  "details",
                  "reviews",
                  "FAQs",
                  "safety",
                  "images",
                  "HR Policies",
                  "map",
                ].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setModalTab(tab)}
                    className={`tab-button ${modalTab === tab ? "active" : ""}`}
                  >
                    {tab
                      .replace("-", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </button>
                ))}
              </div>

              <div className="tab-content">
                {modalTab === "HR Policies" && (
                  <div className="hr-policies-section">
                    <h4>🏛️ Company HR Accommodation Policies</h4>
                    <ul>
                      <li>✅ Must be booked via corporate portal</li>
                      <li>✅ Reimbursement cap: ₹4000/night (metro cities)</li>
                      <li>✅ ID proof and office approval mandatory</li>
                      <li>🚫 No personal guests allowed</li>
                      <li>
                        📞 Report safety issues to travel desk: 1800-XYZ-HELP
                      </li>
                    </ul>
                  </div>
                )}

                {modalTab === "map" && selectedStay && (
                  <div style={{ marginTop: "10px" }}>
                    <MapView stay={selectedStay} userLocation={userLocation} />
                  </div>
                )}

                {modalTab === "images" && (
                  <div className="image-gallery">
                    {(
                      selectedStay.images || [
                        selectedStay.image_url || "/placeholder.jpg",
                      ]
                    ).map((img, idx) => (
                      <div className="gallery-item" key={idx}>
                        <img src={img} alt={`Stay ${idx}`} />
                      </div>
                    ))}
                  </div>
                )}
                {modalTab === "details" && (
                  <>
                    <h2>{selectedStay.name}</h2>
                    <p className="modal-description">
                      {selectedStay.description ||
                        "A comfortable, secure stay verified for business travelers."}
                    </p>

                    <div className="score-dashboard">
                      <div className="score-box">
                        <strong>🏅 Score</strong>
                        <div className="score-value">{selectedStay.score}</div>
                      </div>
                      <div className="score-box">
                        <strong>🚨 Crime Index</strong>
                        <div>{selectedStay.crime_index || "Low"}</div>
                      </div>
                      <div className="score-box">
                        <strong>🏥 Hospital Nearby</strong>
                        <div>{selectedStay.hospital_proximity || "1.2 km"}</div>
                      </div>
                      <div className="score-box">
                        <strong>👩 Women Friendly</strong>
                        <div>
                          {selectedStay.tags?.includes("women-friendly")
                            ? "✅ Yes"
                            : "❌ No"}
                        </div>
                      </div>
                    </div>

                    <p>
                      <strong>📍 Commute:</strong>{" "}
                      {selectedStay.distance_to_office_km} km
                    </p>
                    <p>
                      <strong>🛏 Amenities:</strong>{" "}
                      {selectedStay.amenities.join(", ")}
                    </p>
                    <p>
                      <strong>⚠ Alerts:</strong>{" "}
                      {selectedStay.alert_badges.join(", ") || "None"}
                    </p>
                    <p>
                      <strong>🏷️ Tags:</strong> {selectedStay.tags?.join(", ")}
                    </p>
                  </>
                )}

                {modalTab === "reviews" && (
                  <div className="reviews-section">
                    <h4>✅ Verified Reviews</h4>
                    <ul>
                      <li>🌟 “Comfortable and safe for solo travel.” — Riya</li>
                      <li>🌟 “Close to office, clean rooms.” — Ajay</li>
                      <li>🌟 “Staff were helpful and professional.” — Priya</li>
                    </ul>
                  </div>
                )}

                {modalTab === "FAQs" && (
                  <div className="faq-section">
                    <h4>❓ Frequently Asked Questions</h4>
                    <details>
                      <summary>
                        Is this hotel reimbursable under company policy?
                      </summary>
                      <p>
                        Yes, it is an approved vendor listed under corporate
                        accommodation policy.
                      </p>
                    </details>
                    <details>
                      <summary>Can I extend my stay?</summary>
                      <p>
                        Yes, with prior approval from your reporting manager and
                        updated travel request.
                      </p>
                    </details>
                    <details>
                      <summary>Are meals covered or included?</summary>
                      <p>
                        Most properties offer in-house dining or tie-ups with
                        food vendors, but meals are not reimbursable unless
                        explicitly approved.
                      </p>
                    </details>
                  </div>
                )}

                {modalTab === "safety" && (
                  <div className="safety-section">
                    <h4>🛡️ Safety Measures Implemented</h4>
                    <ul>
                      <li>✅ 24x7 security guard on premises</li>
                      <li>✅ CCTV coverage in public areas</li>
                      <li>✅ Fire safety equipment certified</li>
                      <li>✅ Contactless check-in option available</li>
                      <li>✅ Emergency contact numbers displayed in rooms</li>
                      <li>✅ Verified women-friendly property</li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <a
                  href={`https://www.google.com/maps/search/${encodeURIComponent(
                    selectedStay.name + " " + selectedCity
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="map-button"
                >
                  📍 View on Map
                </a>
                <button
                  onClick={() => setSelectedStay(null)}
                  className="close-button"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatWindow;

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(2); // returns in km
};
