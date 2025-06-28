const socket = io();

// Mendapatkan lokasi pengguna secara real-time
if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const {latitude, longitude} = position.coords;
            // socket.emit("send-location", {latitude, longitude}); // ❌ Komen ini dulu
        },
        (error) => {
            console.error(error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        }
    );
}



// Inisialisasi peta dan atur pusatnya di Kudus
const map = L.map("map").setView([-6.8140, 110.8520], 14);

// Tambahkan tile layer OpenStreetMap
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

// Koordinat rute dari Alun-Alun ke Terminal Jati
const routeCoordinates = [
    [-6.8054, 110.8406], // Alun-Alun Kudus
    [-6.8080, 110.8450], // Masjid Agung
    [-6.8103, 110.8489], // Simpang 7
    [-6.8142, 110.8535], // Pasar Kliwon
    [-6.8190, 110.8580], // Wisudha Karya
    [-6.8235, 110.8635], // Terminal Jati
];

// Tambahkan polyline (jalur biru)
const routeLine = L.polyline(routeCoordinates, {
    color: "blue",
    weight: 5,
    opacity: 0.8,
}).addTo(map);

// Pastikan peta menyesuaikan ke rute
map.fitBounds(routeLine.getBounds());

// Halte di sepanjang rute
const halteList = [
    { name: "Alun-Alun Kudus", coords: [-6.8054, 110.8406] },
    { name: "Simpang Tujuh", coords: [-6.8103, 110.8489] },
    { name: "Pasar Kliwon", coords: [-6.8142, 110.8535] },
    { name: "Terminal Jati", coords: [-6.8235, 110.8635] },
];

// Tambahkan marker halte
halteList.forEach((halte) => {
    L.marker(halte.coords)
        .addTo(map)
        .bindPopup(`<b>${halte.name}</b>`);
});

console.log("Script Leaflet berhasil dijalankan");
