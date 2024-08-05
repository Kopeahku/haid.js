function printPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const titleElement = document.getElementById('ketkota');
    if (titleElement) {
        const title = titleElement.textContent;
        const table = document.getElementById('prayerTimes');
        let y = 30;  // posisi awal di PDF

        doc.text(title, 10, 15); // Menambahkan judul
        doc.setFont("helvetica", "normal");

        // Menambahkan tabel
        for (let row of table.rows) {
            let x = 10;  // posisi awal kolom di PDF
            for (let cell of row.cells) {
                doc.text(cell.textContent, x, y);
                x += 30;  // lebar kolom
            }
            y += 10;  // tinggi baris
        }

        // Simpan PDF
        doc.save('jadwal_shalat.pdf');
    } else {
        console.error("Element 'title' not found!");
    }
}

document.addEventListener("DOMContentLoaded", function() {
    fetchCities(() => fetchPrayerTimes(1301)); // ID 267 untuk Jakarta
});

function fetchCities(callback) {
    fetch('https://api.myquran.com/v2/sholat/kota/semua')
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById('citySelect');
            data.data.forEach(city => {
                const option = document.createElement('option');
                option.value = city.id;
                option.textContent = city.lokasi;
                select.appendChild(option);
                if (city.lokasi === 'KOTA JAKARTA') {
                    select.value = city.id;  // Set default to Jakarta
                }
            });
            updateTitle(); // Update title on load
            if (typeof callback === 'function') callback();
        })
        .catch(error => console.error('Error fetching cities:', error));
}

function fetchPrayerTimes() {
    const cityId = document.getElementById('citySelect').value;
    updateTitle();
    const today = new Date();
    const yearMonth = today.toISOString().split('T')[0].slice(0, 7); // YYYY-MM
    const tbody = document.getElementById('prayerTimes');
    tbody.innerHTML = '';  // Bersihkan tabel

    let promises = [];
    for (let day = 1; day <= new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate(); day++) {
        const date = `${yearMonth}-${day.toString().padStart(2, '0')}`;
        const promise = fetch(`https://api.myquran.com/v2/sholat/jadwal/${cityId}/${date}`)
            .then(response => response.json())
            .then(data => ({
                date: date,
                data: data.data.jadwal
            }));
        promises.push(promise);
    }

    Promise.all(promises)
        .then(results => {
            results.sort((a, b) => new Date(a.date) - new Date(b.date));  // Sort results by date
            results.forEach(({ date, data }) => {
                const times = data;
                const row = document.createElement('tr');
                if (date === today.toISOString().split('T')[0]) {
                    row.classList.add('today');  // Highlight today
                    setTimeout(() => row.scrollIntoView({ behavior: 'smooth', block: 'center' }), 500);
                }
                row.innerHTML = `
                    <td>${times.tanggal}</td>
                    <td>${times.subuh}</td>
                    <td>${times.dzuhur}</td>
                    <td>${times.ashar}</td>
                    <td>${times.maghrib}</td>
                    <td>${times.isya}</td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching prayer times:', error));
}



function updateTitle() {
    const selectedCity = document.getElementById('citySelect').selectedOptions[0].text;
    const now = new Date(); // Mendapatkan tanggal saat ini
    const monthName = new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(now); // Mendapatkan nama bulan dalam Bahasa Indonesia

    // Memastikan elemen dengan ID 'ketkota' ada di DOM
    const titleElement = document.getElementById('ketkota');
    if (titleElement) {
        titleElement.textContent = 'JADWAL SHALAT BULAN ' + monthName.toUpperCase() + ' ' + selectedCity;
    } else {
        console.error("Element 'ketkota' not found!"); // Menampilkan error jika elemen tidak ditemukan
    }
}
