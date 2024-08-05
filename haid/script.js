let jadwalHaid;
let displayedYear = new Date().getFullYear();
let displayedMonth = new Date().getMonth();

$(document).ready(function () {
  $("#haidForm").submit(function (event) {
    event.preventDefault();
    const tanggalHaidTerakhir = new Date($("#tanggalHaidTerakhir").val());
    const durasiHaid = parseInt($("#durasiHaid").val());
    const durasiSiklus = parseInt($("#durasiSiklus").val());

    if (!isNaN(tanggalHaidTerakhir.getTime()) && durasiHaid && durasiSiklus) {
      jadwalHaid = hitungJadwalHaid(
        tanggalHaidTerakhir,
        durasiHaid,
        durasiSiklus
      );
      tampilkanKalender();
    }
  });

  $("#prevMonth").click(function () {
    displayedMonth--;
    if (displayedMonth < 0) {
      displayedMonth = 11;
      displayedYear--;
    }
    tampilkanKalender();
  });

  $("#nextMonth").click(function () {
    displayedMonth++;
    if (displayedMonth > 11) {
      displayedMonth = 0;
      displayedYear++;
    }
    tampilkanKalender();
  });

  tampilkanKalender();
});

function hitungJadwalHaid(tanggalHaidTerakhir, durasiHaid, durasiSiklus) {
  const currentDate = new Date();
  let haidDate = new Date(tanggalHaidTerakhir);

  while (haidDate < currentDate) {
    haidDate.setDate(haidDate.getDate() + durasiSiklus);
  }

  const masaSuburStart = new Date(haidDate);
  masaSuburStart.setDate(masaSuburStart.getDate() - 14 - 5);
  const masaSuburEnd = new Date(masaSuburStart);
  masaSuburEnd.setDate(masaSuburEnd.getDate() + 5);

  return {
    start: new Date(haidDate),
    end: new Date(haidDate.setDate(haidDate.getDate() + durasiHaid - 1)),
    masaSuburStart: masaSuburStart,
    masaSuburEnd: masaSuburEnd
  };
}

function tampilkanKalender() {
  const firstDate = new Date(displayedYear, displayedMonth, 1);
  const lastDate = new Date(displayedYear, displayedMonth + 1, 0);

  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember"
  ];
  $("#monthLabel").text(`${monthNames[displayedMonth]} ${displayedYear}`);

  let html = '<table class="table table-bordered">';
  html +=
    "<thead><tr><th>Minggu</th><th>Senin</th><th>Selasa</th><th>Rabu</th><th>Kamis</th><th>Jumat</th><th>Sabtu</th></tr></thead><tbody><tr>";

  for (let i = 1 - firstDate.getDay(); i <= lastDate.getDate(); i++) {
    const currentDate = new Date(displayedYear, displayedMonth, i);

    if (currentDate.getDay() === 0 && i !== 1) {
      html += "</tr><tr>";
    }

    if (i < 1 || i > lastDate.getDate()) {
      html += "<td></td>";
    } else {
      let cellClass = "";
      if (
        jadwalHaid &&
        currentDate >= jadwalHaid.start &&
        currentDate <= jadwalHaid.end
      ) {
        cellClass = "haid-date";
      } else if (
        jadwalHaid &&
        currentDate >= jadwalHaid.masaSuburStart &&
        currentDate <= jadwalHaid.masaSuburEnd
      ) {
        cellClass = "masa-subur";
      }
      html += `<td${cellClass ? ` class="${cellClass}"` : ""}>${i}</td>`;
    }
  }

  html += "</tr></tbody></table>";

  $("#calendar").html(html);
}
