const socket = io();

const map = L.map("map").setView([-6.8140, 110.8520], 14);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

// === Icon Halte & Pengguna ===
const halteIcon = L.icon({
    iconUrl: "/images/halte.svg",
    iconSize: [32, 32],
});

const userIcon = L.icon({
    iconUrl: "/images/bus.svg",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
});

// === Rute ===
const routeCoordinates = [
    [-6.8054, 110.8406],
    [-6.8080, 110.8450],
    [-6.8103, 110.8489],
    [-6.8142, 110.8535],
    [-6.8190, 110.8580],
    [-6.8235, 110.8635],
];

const routeLine = L.polyline(routeCoordinates, {
    color: "blue",
    weight: 5,
    opacity: 0.8,
}).addTo(map);

map.fitBounds(routeLine.getBounds());

// === Halte ===
const halteList = [
    { name: "Alun-Alun Kudus", coords: [-6.8054, 110.8406] },
    { name: "Simpang Tujuh", coords: [-6.8103, 110.8489] },
    { name: "Pasar Kliwon", coords: [-6.8142, 110.8535] },
    { name: "Terminal Jati", coords: [-6.8235, 110.8635] },
];

halteList.forEach((halte) => {
    L.marker(halte.coords, { icon: halteIcon })
        .addTo(map)
        .bindPopup(`<b>${halte.name}</b>`);
});

// === Lokasi Pengguna ===
const markers = {};

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            socket.emit("send-location", { latitude, longitude });
        },
        (error) => {
            console.error("Geolocation error:", error);
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
        }
    );
}

// === Terima lokasi user lain ===
socket.on("receiveLocation", (data) => {
    const { id, latitude, longitude } = data;

    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude], { icon: userIcon }).addTo(map);
    }
});

socket.on("Client disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
