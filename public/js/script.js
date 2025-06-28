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
    [-7.046986,110.4387627], // Halte Rusunawa
    [-7.0562188876791225, 110.44004767270535], // Masjid Hijau Sigawe
    [-7.056043315617696, 110.43919707375414], // Bunderan Undip
    [-7.055277538463565, 110.43933054750067], // Halte
    [-7.053639710655384, 110.43961526490833], // Pertigaan Student Center
    [-7.0534757153490055, 110.43890806492082], // Student Center
    [-7.050958590847894, 110.43761154733755], // belokan
    [-7.05103631044339, 110.43810601436417], // Fakultas Hukum & FISIP
    [-7.0504905489418155, 110.43582397369855], // Sekolah Vokasi (HALTE)
    [-7.0504535559116, 110.43585476599394],
    [-7.048737860350842, 110.4401883825455], // Rumah Taman Kita (HALTE)
    [-7.047600721324302, 110.44055951070504], // Pertigaan
    [-7.0476714910198295, 110.44089498462439], // FEB (HALTE)
    [-7.0485936827203135, 110.44265091616849], // FKM (HALTE)
    [-7.050046557077623, 110.44223555321109], // FPIK (HALTE)
    [-7.051514421116319, 110.44181281311766], // FPP (HALTE)
    [-7.053671645233053, 110.43967923069772], // Pertigaan
    [-7.056016780999938, 110.4393010392309], // Bunderan Undip
    [-7.0549239088003155, 110.44288901861245], // Pos Jembatan Sikatak
    [-7.054045897116651, 110.44485717581234],
    [-7.054137515803368, 110.44489179486477],
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
