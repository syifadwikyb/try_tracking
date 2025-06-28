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
    [-7.0538, 110.4293], // Rusunawa Undip
    [-7.0551, 110.4297], // Masjid Hijau Sigawe
    [-7.0561, 110.4302], // Pos Satpam Astina Undip
    [-7.0569, 110.4310], // Student Center
    [-7.0578, 110.4320], // Teknik Arsitektur
    [-7.0588, 110.4332], // Fakultas Hukum & FISIP
    [-7.0597, 110.4346], // Sekolah Vokasi
    [-7.0602, 110.4358], // Sekolah Vokasi & FIB
    [-7.0607, 110.4372], // Widya Puraya & Taman Inspirasi
    [-7.0610, 110.4385], // SA-MWA & FSM Barat
    [-7.0614, 110.4391], // Teknik Elektro
    [-7.0608, 110.4396], // Fakultas Psikologi (Halte Trans Semarang)
    [-7.0616, 110.4405], // Fakultas Ekonomika dan Bisnis
    [-7.0624, 110.4413], // Fakultas Kesehatan Masyarakat
    [-7.0632, 110.4421], // Fakultas Perikanan dan Ilmu Kelautan
    [-7.0640, 110.4430], // Fakultas Peternakan dan Pertanian
    [-7.0648, 110.4437], // UPT Laboratorium Terpadu
    [-7.0655, 110.4445], // Bundaran Undip
];


const routeLine = L.polyline(routeCoordinates, {
    color: "blue",
    weight: 5,
    opacity: 0.8,
}).addTo(map);

map.fitBounds(routeLine.getBounds());

// === Halte ===
const halteList = [
    { name: "Rusunawa Undip", coords: [-7.0538, 110.4293] },
    { name: "Masjid Hijau Sigawe", coords: [-7.0551, 110.4297] },
    { name: "Pos Satpam Astina Undip", coords: [-7.0561, 110.4302] },
    { name: "Halte Trans Semarang Fakultas Psikologi", coords: [-7.0608, 110.4396] },
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
            timeout: 5000,
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
