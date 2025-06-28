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
    [-7.054530628133792, 110.44409710857212], // Rusunawa Undip
    [-7.056234052500145, 110.44004208648464], // Masjid Hijau Sigawe
    [-7.056003018955179, 110.43926129762791], // Bunderan Undip
    [-7.055477621567211, 110.43932981593592], // Halte
    [-7.053668644111272, 110.43961436423432], // Pertigaan Student Center
    [-7.053615526827244, 110.43919571442535], // Student Center
    [-7.0521253,110.4380869], // Teknik Arsitektur
    [-7.05103631044339, 110.43810601436417], // Fakultas Hukum & FISIP
    [-7.0504302,110.4357956], // Sekolah Vokasi
    [-7.0504215,110.4360987], // Sekolah Vokasi & FIB
    [-7.049849,110.438497], // Widya Puraya & Taman Inspirasi
    [-7.0494732,110.4398028], // Teknik Elektro
    [-7.048747,110.440217], // SA-MWA & FSM Barat
    [-7.0471904,110.4387002], // Fakultas Psikologi (Halte Trans Semarang)
    [-7.046986,110.4387627], // Halte Trans Semarang
    [-7.0476918,110.4410274], // Fakultas Ekonomika dan Bisnis
    [-7.048945,110.442528], // Fakultas Kesehatan Masyarakat
    [-7.0507336,110.4420419], // Fakultas Perikanan dan Ilmu Kelautan
    [-7.0530413,110.4412937], // Fakultas Peternakan dan Pertanian
    [-7.0545669,110.439623], // UPT Laboratorium Terpadu
    [-7.0560117,110.4393959], // Bundaran Undip
    [-7.054530628133792, 110.44409710857212] //
];


const routeLine = L.polyline(routeCoordinates, {
    color: "blue",
    weight: 5,
    opacity: 0.8,
}).addTo(map);

map.fitBounds(routeLine.getBounds());

// === Halte ===
const halteList = [
    { name: "Rusunawa Undip", coords: [-7.054530628133792, 110.44409710857212] },
    { name: "Masjid Hijau Sigawe", coords: [-7.056234052500145, 110.44004208648464] },
    { name: "Pos Satpam Astina Undip", coords: [-7.055477621567211, 110.43932981593592] },
    { name: "Halte Trans Semarang Fakultas Psikologi", coords: [-7.046986,110.4387627] },
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
