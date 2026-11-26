const SENARAI_DEPO = ['NBCT', 'EAE', 'ENGKONG', 'MSD', 'COGENT', 'PSS', 'MMF1', 'MMF2', 'IPD', 'OCT', 'KONREP', 'BUMIKON', 'GL', 'TRILIMAHU', 'ICS', 'SSM'];

document.getElementById('tarikh').valueAsDate = new Date();

window.onload = function() {
  if (localStorage.getItem('platNo')) {
    document.getElementById('platNo').value = localStorage.getItem('platNo');
  }
  kemaskiniDropdownBulan();
  paparTrip();
  initKontenaPantas();
  initManualBadgeListener();
};

// Kemaskini badge lokasi secara live bila taip lokasi manual
function initManualBadgeListener() {
  ['dari', 'ke'].forEach(arah => {
    const manEl = document.getElementById(arah + 'Manual');
    const badgeEl = document.getElementById(arah + 'Badge');
    if (manEl && badgeEl) {
      manEl.addEventListener('input', function() {
        badgeEl.innerText = this.value.trim() ? this.value.toUpperCase() : 'MANUAL';
      });
    }
  });
}

// Tetapkan nilai depo pill (Dari / Ke)
function setDepoValue(arah, val, manualText = '') {
  const hiddenInput = document.getElementById(arah + 'Select');
  const manualInput = document.getElementById(arah + 'Manual');
  const badgeEl = document.getElementById(arah + 'Badge');
  const gridEl = document.getElementById(arah + 'Grid');

  if (hiddenInput) hiddenInput.value = val;

  if (gridEl) {
    gridEl.querySelectorAll('.depo-pill').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-val') === val);
    });
  }

  if (val === 'MANUAL') {
    if (manualInput) {
      manualInput.style.display = 'block';
      if (manualText) manualInput.value = manualText;
      if (!manualText) manualInput.focus();
    }
    if (badgeEl) {
      badgeEl.innerText = manualText ? manualText.toUpperCase() : 'MANUAL';
    }
  } else {
    if (manualInput) {
      manualInput.style.display = 'none';
      manualInput.value = '';
    }
    if (badgeEl) {
      badgeEl.innerText = val;
    }
  }
}

function pilihDepoPill(arah, namaDepo) {
  setDepoValue(arah, namaDepo);
}

// Tukar arah Dari <-> Ke sekali tekan
function swapLokasi() {
  const dariVal = document.getElementById('dariSelect').value;
  const keVal = document.getElementById('keSelect').value;
  const dariMan = document.getElementById('dariManual').value.toUpperCase().trim();
  const keMan = document.getElementById('keManual').value.toUpperCase().trim();

  setDepoValue('dari', keVal, keVal === 'MANUAL' ? keMan : '');
  setDepoValue('ke', dariVal, dariVal === 'MANUAL' ? dariMan : '');
}

// Auto-Format + Auto-Switch Keyboard Kontena (4 Huruf -> Pad Nombor)
function initKontenaPantas() {
  bindKontena('kontena1', 'kontena2');
  bindKontena('kontena2', 'notaTambahan');
}

function bindKontena(inputId, nextFocusId) {
  const input = document.getElementById(inputId);
  if (!input) return;

  let lastLetterCount = 0;

  input.addEventListener('input', function() {
    let raw = this.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    let letters = raw.slice(0, 4).replace(/[^A-Z]/g, '');
    let numbers = raw.slice(4, 11).replace(/[^0-9]/g, '');

    if (letters.length === 4) {
      this.value = numbers.length > 0 ? `${letters} ${numbers}` : `${letters} `;
      this.setAttribute('inputmode', 'numeric');

      if (lastLetterCount < 4) {
        this.blur();
        setTimeout(() => this.focus(), 10);
      }
    } else {
      this.value = letters;
      this.setAttribute('inputmode', 'text');
    }

    lastLetterCount = letters.length;

    if (letters.length === 4 && numbers.length === 7 && nextFocusId) {
      const nextEl = document.getElementById(nextFocusId);
      if (nextEl) nextEl.focus();
    }
  });

  input.addEventListener('focus', function() {
    let lettersOnly = this.value.replace(/[^A-Z]/g, '');
    this.setAttribute('inputmode', lettersOnly.length >= 4 ? 'numeric' : 'text');
  });
}

function savePlat() {
  let val = document.getElementById('platNo').value.toUpperCase();
  document.getElementById('platNo').value = val;
  localStorage.setItem('platNo', val);
}

function ambilDataBorang() {
  let dariVal = document.getElementById('dariSelect').value;
  if (dariVal === 'MANUAL') {
    dariVal = document.getElementById('dariManual').value.toUpperCase().trim();
  }

  let keVal = document.getElementById('keSelect').value;
  if (keVal === 'MANUAL') {
    keVal = document.getElementById('keManual').value.toUpperCase().trim();
  }

  const kontena1 = document.getElementById('kontena1').value.toUpperCase().trim();
  const kontena2 = document.getElementById('kontena2').value.toUpperCase().trim();
  const rawDate = document.getElementById('tarikh').value;

  if (!rawDate) {
    alert("SILA PILIH TARIKH TRIP!");
    return null;
  }

  if (!dariVal || !keVal) {
    alert("SILA ISI LOKASI 'DARI' DAN 'KE'!");
    return null;
  }

  let saiz1 = document.querySelector('input[name="saiz1"]:checked') ? document.querySelector('input[name="saiz1"]:checked').value : '';
  let saiz2 = document.querySelector('input[name="saiz2"]:checked') ? document.querySelector('input[name="saiz2"]:checked').value : '';

  let jobDipilih = document.querySelector('input[name="jenisJob"]:checked') ? document.querySelector('input[name="jenisJob"]:checked').value : '';
  let notaText = document.getElementById('notaTambahan').value.toUpperCase().trim();

  let gabungNota = '';
  if (jobDipilih && notaText) {
    gabungNota = `${jobDipilih} - ${notaText}`;
  } else if (jobDipilih) {
    gabungNota = jobDipilih;
  } else if (notaText) {
    gabungNota = notaText;
  }

  const now = new Date();
  const timeStr = `${rawDate} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return {
    rawDate: rawDate,
    timestamp: timeStr,
    plat: localStorage.getItem('platNo') || 'LORI SAYA',
    dari: dariVal,
    ke: keVal,
    kontena1: kontena1 ? `${kontena1} (${saiz1})` : '',
    kontena2: kontena2 ? `${kontena2} (${saiz2})` : '',
    nota: gabungNota || '-'
  };
}

function resetBorang() {
  document.getElementById('kontena1').value = '';
  document.getElementById('kontena2').value = '';
  document.getElementById('kontena1').setAttribute('inputmode', 'text');
  document.getElementById('kontena2').setAttribute('inputmode', 'text');
  document.getElementById('notaTambahan').value = '';
  document.getElementById('editId').value = '';

  setDepoValue('dari', 'NBCT');
  setDepoValue('ke', 'PSS');

  document.querySelectorAll('input[name="jenisJob"]').forEach(rb => rb.checked = false);

  const formTitleEl = document.getElementById('formTitle');
  if (formTitleEl) formTitleEl.innerText = 'HL Super Sdn Bhd';

  document.getElementById('btnSimpan').style.display = 'block';
  document.getElementById('btnUpdate').style.display = 'none';

  const isBatchMode = document.getElementById('chkBatchMode').checked;
  if (!isBatchMode) {
    document.getElementById('tarikh').valueAsDate = new Date();
  }
}

function simpanTrip() {
  let tripBaruData = ambilDataBorang();
  if (!tripBaruData) return;

  tripBaruData.id = Date.now();

  let trips = JSON.parse(localStorage.getItem('myTrips')) || [];
  trips.unshift(tripBaruData);
  localStorage.setItem('myTrips', JSON.stringify(trips));

  resetBorang();
  kemaskiniDropdownBulan();
  paparTrip();
}

function editTrip(id) {
  let trips = JSON.parse(localStorage.getItem('myTrips')) || [];
  let trip = trips.find(t => t.id === id);
  if (!trip) return;

  document.getElementById('tarikh').value = trip.rawDate;
  document.getElementById('editId').value = trip.id;

  if (SENARAI_DEPO.includes(trip.dari)) {
    setDepoValue('dari', trip.dari);
  } else {
    setDepoValue('dari', 'MANUAL', trip.dari);
  }

  if (SENARAI_DEPO.includes(trip.ke)) {
    setDepoValue('ke', trip.ke);
  } else {
    setDepoValue('ke', 'MANUAL', trip.ke);
  }

  if (trip.kontena1 && trip.kontena1 !== '-') {
    let parts1 = trip.kontena1.split(' (');
    document.getElementById('kontena1').value = parts1[0];
    if (parts1[1]) {
      let saizVal = parts1[1].replace(')', '');
      document.querySelectorAll('input[name="saiz1"]').forEach(rb => {
        if (rb.value === saizVal) rb.checked = true;
      });
    }
  } else {
    document.getElementById('kontena1').value = '';
  }

  if (trip.kontena2 && trip.kontena2 !== '') {
    let parts2 = trip.kontena2.split(' (');
    document.getElementById('kontena2').value = parts2[0];
    if (parts2[1]) {
      let saizVal2 = parts2[1].replace(')', '');
      document.querySelectorAll('input[name="saiz2"]').forEach(rb => {
        if (rb.value === saizVal2) rb.checked = true;
      });
    }
  } else {
    document.getElementById('kontena2').value = '';
  }

  document.getElementById('notaTambahan').value = trip.nota !== '-' ? trip.nota : '';

  const formTitleEl = document.getElementById('formTitle');
  if (formTitleEl) formTitleEl.innerText = 'Edit Trip';

  document.getElementById('btnSimpan').style.display = 'none';
  document.getElementById('btnUpdate').style.display = 'block';

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateTrip() {
  let editId = Number(document.getElementById('editId').value);
  let updatedData = ambilDataBorang();
  if (!updatedData) return;

  let trips = JSON.parse(localStorage.getItem('myTrips')) || [];
  let index = trips.findIndex(t => t.id === editId);

  if (index !== -1) {
    updatedData.id = editId;
    trips[index] = updatedData;
    localStorage.setItem('myTrips', JSON.stringify(trips));
    resetBorang();
    kemaskiniDropdownBulan();
    paparTrip();
    alert("TRIP BERJAYA DIKEMASKINI!");
  }
}

function padamSatuTrip(id) {
  if (confirm("PADAM REKOD TRIP NI?")) {
    let trips = JSON.parse(localStorage.getItem('myTrips')) || [];
    trips = trips.filter(t => t.id !== id);
    localStorage.setItem('myTrips', JSON.stringify(trips));
    kemaskiniDropdownBulan();
    paparTrip();
  }
}

function kemaskiniDropdownBulan() {
  let trips = JSON.parse(localStorage.getItem('myTrips')) || [];
  let filterSelect = document.getElementById('monthFilter');
  let currentVal = filterSelect.value;

  let setBulan = new Set();
  trips.forEach(t => {
    if (t.rawDate && t.rawDate.length >= 7) {
      setBulan.add(t.rawDate.substring(0, 7));
    }
  });

  let senaraiBulan = Array.from(setBulan).sort().reverse();
  let optionsHtml = '<option value="ALL">-- SEMUA REKOD BULAN --</option>';
  const namaBulan = ["Januari", "Februari", "Mac", "April", "Mei", "Jun", "Julai", "Ogos", "September", "Oktober", "November", "Disember"];

  senaraiBulan.forEach(b => {
    let parts = b.split('-');
    let year = parts[0];
    let monthIdx = parseInt(parts[1], 10) - 1;
    let label = `${namaBulan[monthIdx]} ${year}`;
    optionsHtml += `<option value="${b}">${label}</option>`;
  });

  filterSelect.innerHTML = optionsHtml;
  if (Array.from(filterSelect.options).some(o => o.value === currentVal)) {
    filterSelect.value = currentVal;
  }
}

function paparTrip() {
  let trips = JSON.parse(localStorage.getItem('myTrips')) || [];
  let selectedMonth = document.getElementById('monthFilter').value;

  let filteredTrips = trips;
  if (selectedMonth !== 'ALL') {
    filteredTrips = trips.filter(t => t.rawDate && t.rawDate.startsWith(selectedMonth));
  }

  const todayObj = new Date();
  const yyyy = todayObj.getFullYear();
  const mm = String(todayObj.getMonth() + 1).padStart(2, '0');
  const dd = String(todayObj.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;

  let todayCount = 0;
  trips.forEach(t => {
    if (t.rawDate === todayStr) {
      todayCount++;
    }
  });

  document.getElementById('countToday').innerText = todayCount;
  document.getElementById('countTotal').innerText = filteredTrips.length;

  if (filteredTrips.length === 0) {
    document.getElementById('listTrip').innerHTML = '<p style="color:#888; font-size:13px; padding: 10px 0;">BELUM ADA TRIP DIREKODKAN UNTUK BULAN INI.</p>';
    return;
  }

  let html = `
    <div class="table-responsive">
      <table class="trip-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Masa / Tarikh</th>
            <th>Dari ➔ Ke</th>
            <th>Kontena 1</th>
            <th>Kontena 2</th>
            <th>Nota / Kod</th>
            <th>Tindakan</th>
          </tr>
        </thead>
        <tbody>
  `;

  filteredTrips.forEach((t, index) => {
    let noTrip = filteredTrips.length - index;
    html += `
      <tr>
        <td><b>${noTrip}</b></td>
        <td style="white-space:nowrap;">${t.timestamp}</td>
        <td style="white-space:nowrap;"><b>${t.dari}</b> ➔ <b>${t.ke}</b></td>
        <td>${t.kontena1 || '-'}</td>
        <td>${t.kontena2 || '-'}</td>
        <td>${t.nota}</td>
        <td>
          <div class="action-btns">
            <button class="btn-edit-single" onclick="editTrip(${t.id || 0})">Edit</button>
            <button class="btn-del-single" onclick="padamSatuTrip(${t.id || 0})">Padam</button>
          </div>
        </td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  document.getElementById('listTrip').innerHTML = html;
}

function exportPDF() {
  let trips = JSON.parse(localStorage.getItem('myTrips')) || [];
  if (trips.length === 0) {
    alert("TIADA REKOD UNTUK DIEKSPORT KE PDF!");
    return;
  }

  const selectedMonth = document.getElementById('monthFilter').value;
  const plat = localStorage.getItem('platNo') || 'LORI SAYA';
  const listContainer = document.getElementById('listTrip');
  const tarikhCetak = new Date().toLocaleDateString('ms-MY');

  const printHeader = document.createElement('div');
  printHeader.id = 'pdfPrintHeader';
  printHeader.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <span><strong>NO. PLAT:</strong> ${plat} &nbsp;|&nbsp; <strong>REKOD:</strong> ${selectedMonth === 'ALL' ? 'SEMUA BULAN' : selectedMonth}</span>
      <span style="color:#e65100; font-weight:800;">HL SUPER SDN BHD • ${tarikhCetak}</span>
    </div>
  `;

  listContainer.prepend(printHeader);
  window.print();

  setTimeout(() => {
    const el = document.getElementById('pdfPrintHeader');
    if (el) el.remove();
  }, 500);
}

function buatTeksRingkasan() {
  let trips = JSON.parse(localStorage.getItem('myTrips')) || [];
  let selectedMonth = document.getElementById('monthFilter').value;
  let plat = localStorage.getItem('platNo') || 'LORI SAYA';

  let filteredTrips = trips;
  if (selectedMonth !== 'ALL') {
    filteredTrips = trips.filter(t => t.rawDate && t.rawDate.startsWith(selectedMonth));
  }

  if (filteredTrips.length === 0) return null;

  let mesej = `*REKOD TRIP LORI (${plat})*\n`;
  if (selectedMonth !== 'ALL') {
    mesej += `*BULAN: ${selectedMonth}*\n`;
  }
  mesej += `------------------------------\n`;

  filteredTrips.forEach((t, index) => {
    mesej += `*TRIP #${filteredTrips.length - index}*\n`;
    mesej += `⏱️ MASA: ${t.timestamp}\n`;
    mesej += `📍 DARI: ${t.dari}\n`;
    mesej += `🏁 KE: ${t.ke}\n`;
    mesej += `📦 KONTENA 1: ${t.kontena1 || 'KOSONG'}\n`;
    if (t.kontena2) mesej += `📦 KONTENA 2: ${t.kontena2}\n`;
    mesej += `📝 NOTA: ${t.nota}\n\n`;
  });

  return mesej;
}

function salinTeks() {
  let mesej = buatTeksRingkasan();
  if (!mesej) { alert("TIADA REKOD UNTUK DISALIN!"); return; }

  navigator.clipboard.writeText(mesej).then(() => {
    alert("RINGKASAN TEKS BERJAYA DISALIN!");
  }).catch(() => {
    alert("GAGAL SALIN TEKS.");
  });
}

function hantarWhatsApp() {
  let mesej = buatTeksRingkasan();
  if (!mesej) { alert("TIADA REKOD UNTUK DIHANTAR!"); return; }

  let url = "https://api.whatsapp.com/send?text=" + encodeURIComponent(mesej);
  window.open(url, '_blank');
}

function padamSemuaTrip() {
  let trips = JSON.parse(localStorage.getItem('myTrips')) || [];
  if (trips.length === 0) {
    alert("TIADA REKOD UNTUK DIPADAM!");
    return;
  }

  let pengesahan = confirm("ADAKAH ANDA PASTI NAK PADAM SEMUA REKOD TRIP?");
  if (pengesahan) {
    localStorage.removeItem('myTrips');
    kemaskiniDropdownBulan();
    paparTrip();
    alert("SEMUA REKOD BERJAYA DIPADAM!");
  }
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(() => console.log("Service Worker Berjaya!"))
    .catch((err) => console.log("Gagal:", err));
}
