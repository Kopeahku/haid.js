document.addEventListener('DOMContentLoaded', function() {
    fetchJadwalShalat('Jakarta'); // Ganti 'Jakarta' dengan kota Anda
    fetchDoaData();
});

function fetchJadwalShalat(kota) {
    const url = `https://api.aladhan.com/v1/timingsByCity?city=${kota}&amp;country=Indonesia&amp;method=11`;
    fetch(url)
        .then(response =&gt; response.json())
        .then(data =&gt; {
            const times = data.data.timings;
            const jadwalText = `Jadwal Shalat Hari Ini Daerah Jakarta ( Subuh: ${times.Fajr} | Dzhur: ${times.Dhuhr} | Ashar: ${times.Asr} | Maghrib: ${times.Maghrib} | Isya: ${times.Isha} )`;
            const runningTextContainer = document.getElementById('jadwalShalat');
            // Gunakan innerHTML untuk memasukkan jadwal ke dalam div dan wrap dengan div tambahan untuk animasi
            runningTextContainer.innerHTML = `<div>${jadwalText}</div>`;
        })
        .catch(err =&gt; console.error('Error fetching prayer times:', err));
}

function fetchDoaData() {
    fetch('https://api.myquran.com/v2/doa/all')
        .then(response =&gt; response.json())
        .then(data =&gt; {
            const selector = document.getElementById('doaSelector');
            data.data.forEach((doa, index) =&gt; {
                let option = document.createElement('option');
                option.value = index;
                option.textContent = doa.judul;
                selector.appendChild(option);
            });

            // Tampilkan doa pertama secara default jika data doa tersedia
            if(data.data.length &gt; 0) {
                displayDoa(data.data[0]);
            }

            selector.addEventListener('change', function() {
                const selectedDoa = data.data[this.value];
                displayDoa(selectedDoa);
            });
        })
        .catch(err =&gt; console.error('Error fetching doa data:', err));
}


function displayDoa(doa) {
    const container = document.getElementById('doaContainer');
    container.innerHTML = `
        <h2>${doa.judul}</h2>
        <p class="arab">${doa.arab}</p>
        <p>${doa.indo}</p>
        <button onclick="shareDoa('${doa.judul}: ${doa.arab} - ${doa.indo}')">Share ke WhatsApp</button>
    `;
}

function shareDoa(doa) {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(doa)}`;
    window.open(whatsappUrl, '_blank');
}

function changeFontSize(action) {
    const body = document.body;
    let currentFontSize = parseFloat(window.getComputedStyle(body, null).getPropertyValue('font-size'));

    if (action === 'increase') {
        body.style.fontSize = (currentFontSize + 2) + 'px';
    } else if (action === 'decrease') {
        body.style.fontSize = (currentFontSize - 2) + 'px';
    }
    document.addEventListener('DOMContentLoaded', function() {
    fetch('doapilihan.json')
        .then(response =&gt; response.json())
        .then(data =&gt; {
            setupMenu(data);
        })
        .catch(error =&gt; console.log('Error loading JSON:', error));
});

}
