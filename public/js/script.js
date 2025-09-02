const socket = io();

const map = L.map("map").setView([-6.8140, 110.8520], 14);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

const halteIcon = L.icon({
    iconUrl: "/images/halte.svg",
    iconSize: [32, 32],
});

const busIcon = L.icon({ // Ganti userIcon menjadi busIcon agar lebih deskriptif
    iconUrl: "/images/bus.png",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
});

// === Rute ===
const routeCoordinates = [
    [-7.054210740330652, 110.44482615946559],
    [-7.054958906707725, 110.44307224004602],
    [-7.056259460902268, 110.44021524314452],
    [-7.0562188876791225, 110.44004767270535],
    [-7.056043315617696, 110.43919707375414],
    [-7.055277538463565, 110.43933054750067],
    [-7.053639710655384, 110.43961526490833],
    [-7.0534757153490055, 110.43890806492082],
    [-7.053352023688737, 110.43872067554854],
    [-7.05322153690728, 110.43860534065148],
    [-7.050933103278125, 110.43759316038283],
    [-7.0509291103911025, 110.43736584316657],
    [-7.0504905489418155, 110.43582397369855],
    [-7.05040082924466, 110.4358662969806],
    [-7.050819629308075, 110.43740227086586],
    [-7.050813872734195, 110.4375762840299],
    [-7.050673796083812, 110.43778509981414],
    [-7.050111570191727, 110.4381447270102],
    [-7.050050166631729, 110.43827040320038],
    [-7.049583883145368, 110.43908633156214],
    [-7.049410872260698, 110.43924291564747],
    [-7.0495486356572625, 110.43979329346357],
    [-7.049426397583421, 110.44003314920771],
    [-7.048737860350842, 110.4401883825455],
    [-7.047657158657433, 110.44060685825151],
    [-7.047843733260816, 110.44127456480881],
    [-7.048264549456368, 110.44264034042997],
    [-7.048483291798438, 110.44269058048451],
    [-7.04869238365161, 110.44261603072252],
    [-7.049234413628306, 110.44241831179215],
    [-7.04953035851685, 110.44235186526458],
    [-7.05007461627563, 110.44219560312854],
    [-7.052318788833195, 110.44152469902183],
    [-7.053502079123587, 110.44112282388647],
    [-7.0537287139008304, 110.440910607664],
    [-7.053822572714713, 110.44058536325424],
    [-7.053671645233053, 110.43967923069772],
    [-7.056026732746777, 110.43933800682366],
    [-7.056149293287898, 110.44018241787253],
    [-7.056063012218507, 110.44058587158754],
    [-7.0552446893968215, 110.44233960472613],
    [-7.054912402398972, 110.44294506776454],
    [-7.054832861827349, 110.44313932324741],
    [-7.054045897116651, 110.44485717581234],
    [-7.054137515803368, 110.44489179486477],
    [-7.054210740330652, 110.44482615946559],
];

const routeLine = L.polyline(routeCoordinates, {
    color: "blue",
    weight: 5,
    opacity: 0.8,
}).addTo(map);

map.fitBounds(routeLine.getBounds());

// === Halte ===
const halteList = [
    {name: "Rusunawa Undip", coords: [-7.054210740330652, 110.44482615946559]},
    {name: "Masjid Hijau Sigawe", coords: [-7.0562188876791225, 110.44004767270535]},
    {name: "Halte Pos Satpam", coords: [-7.055277538463565, 110.43933054750067]},
    {name: "Halte Student Center", coords: [-7.0534757153490055, 110.43890806492082]},
    {name: "Halte Vokasi", coords: [-7.0504905489418155, 110.43582397369855]},
    {name: "Halte SAMWA", coords: [7.048737860350842, 110.4401883825455]},
    {name: "Halte FEB", coords: [-7.047843733260816, 110.44127456480881]},
    {name: "Halte FKM", coords: [-7.04869238365161, 110.44261603072252]},
    {name: "Halte FPIK", coords: [-7.05007461627563, 110.44219560312854]},
    {name: "Halte FPP", coords: [-7.052318788833195, 110.44152469902183]},
];

halteList.forEach((halte) => {
    L.marker(halte.coords, {icon: halteIcon})
        .addTo(map)
        .bindPopup(<b>${halte.name}</b>);
});

// === Animasi Bus ===
let busMarker = L.marker(routeCoordinates[0], {icon: busIcon}).addTo(map);
let currentIndex = 0;
let direction = 1; // 1 untuk maju, -1 untuk mundur

function animateBus() {
    // Ambil koordinat saat ini dan berikutnya
    const currentCoords = routeCoordinates[currentIndex];
    const nextIndex = currentIndex + direction;

    if (nextIndex < 0 || nextIndex >= routeCoordinates.length) {
        // Jika sudah sampai ujung, balik arah
        direction *= -1;
        currentIndex += direction;
    } else {
        currentIndex = nextIndex;
    }

    const nextCoords = routeCoordinates[currentIndex];

    // Pindahkan marker bus ke koordinat berikutnya
    busMarker.setLatLng(nextCoords);

    // Kirim posisi bus yang baru ke server
    socket.emit("send-bus-location", {
        latitude: nextCoords[0],
        longitude: nextCoords[1]
    });

    // Atur interval pergerakan (misalnya 1000ms atau 1 detik)
    setTimeout(animateBus, 1000);
}

// Mulai animasi
animateBus();

// === Terima lokasi bus dari pengguna lain (opsional) ===
const busMarkers = {};

socket.on("receiveBusLocation", (data) => {
    const {id, latitude, longitude} = data;

    if (busMarkers[id]) {
        busMarkers[id].setLatLng([latitude, longitude]);
    } else {
        // Buat marker bus baru untuk pengguna lain
        busMarkers[id] = L.marker([latitude, longitude], {icon: busIcon}).addTo(map);
    }
});

socket.on("Client disconnected", (id) => {
    if (busMarkers[id]) {
        map.removeLayer(busMarkers[id]);
        delete busMarkers[id];
    }
});