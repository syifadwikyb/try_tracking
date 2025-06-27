const socket = io();

// Mendapatkan lokasi pengguna secara real-time
if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            socket.emit("send-location", { latitude, longitude });
        },
        (error) => {
            // switch (error.code) {
            //     case 1:
            //         alert("❌ Akses lokasi ditolak. Silakan izinkan akses lokasi di browser.");
            //         break;
            //     case 2:
            //         alert("⚠️ Lokasi tidak tersedia. Aktifkan GPS atau Wi-Fi.");
            //         break;
            //     case 3:
            //         alert("⌛ Permintaan lokasi melebihi waktu. Coba lagi.");
            //         break;
            //     default:
            //         alert("❗ Terjadi kesalahan saat mengambil lokasi.");
            // }
            console.error(error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        }
    );
}

// Menampilkan peta menggunakan Leaflet.js
const map = L.map("map").setView([0, 0], 16);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

// Menyimpan marker setiap pengguna
const markers = {};

// Menerima lokasi dari server dan menampilkannya di peta
socket.on("receiveLocation", (data) => {
    const { id, latitude, longitude } = data;
    map.setView([latitude, longitude]);

    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
});

// Menghapus marker saat pengguna disconnect
socket.on("Client disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
