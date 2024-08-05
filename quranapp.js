$(document).ready(function() {
    console.log("Script loaded successfully");
    let currentPlayingAudio = null;

    const surahList = $('#surahList');
    const surahDetails = $('#surahDetails');
    const navigation = $('#navigation');
    const qariSelector = $('#qariChoice');

    navigation.hide();
    qariSelector.prop('disabled', true);

    // Fetch the list of surahs from the API
    $.get('https://equran.id/api/v2/surat', function(data) {
        if (data.code === 200) {
            data.data.forEach(surah => {
                surahList.append(`
                    <div class="col-md-4 text-center p-2 surah" data-nomor="${surah.nomor}">
                        <div class="p-3 shadow-sm bg-white rounded">${surah.namaLatin} - ${surah.nama}</div>
                    </div>
                `);
            });
            $('.surah').click(function() {
                if (currentPlayingAudio) {
                    currentPlayingAudio.pause();
                    currentPlayingAudio = null;
                }
                const nomor = $(this).data('nomor');
                loadSurahDetails(nomor);
            });
        }
    });

    qariSelector.change(function() {
        const currentSurahNumber = surahDetails.data('surahNumber');
        if (currentSurahNumber) {
            loadSurahDetails(currentSurahNumber);
        }
    });

    function loadSurahDetails(nomor) {
        $.get(`https://equran.id/api/v2/surat/${nomor}`, function(data) {
            if (data.code === 200) {
                const surah = data.data;
                let surahHTML = `<div class="text-center mb-4"><h2>${surah.namaLatin} - ${surah.nama}</h2><p>${surah.deskripsi}</p></div>`;
                surahHTML += surah.ayat.map((ayat, index) => generateAyahHTML(ayat, nomor, qariSelector.val(), index + 1)).join('');
                surahDetails.html(surahHTML);
                surahDetails.data('surahNumber', nomor);
                surahDetails.show();
                surahList.hide();
                qariSelector.prop('disabled', false);
                navigation.show();
            }
        });
    }

    function generateAyahHTML(ayat, surahNumber, qari, ayahNumber) {
        const audioLink = `https://equran.nos.wjv-1.neo.id/audio-partial/${qari}/${surahNumber.toString().padStart(3, '0')}${ayahNumber.toString().padStart(3, '0')}.mp3`;
        let bismillahHTML = "";
        if (surahNumber !== 1 && surahNumber !== 9 && ayahNumber === 1) {
            bismillahHTML = `
                <div class="ayah" data-ayah-index="0">
                    <div class="arabic">Ø¨ÙØ³Ù’Ù…Ù Ø§Ù„Ù„Ù‘ÙŽÙ‡Ù Ø§Ù„Ø±Ù‘ÙŽØ­Ù’Ù…ÙŽÙ°Ù†Ù Ø§Ù„Ø±Ù‘ÙŽØ­ÙÙŠÙ…Ù</div>
                    <div class="translation">
                        <p><strong>Latin:</strong> Bismillahirrahmanirrahim</p>
                        <p><strong>Terjemahan:</strong> Dengan nama Allah, Yang Maha Pengasih, Maha Penyayang.</p>
                    </div>
                </div>
            `;
        }
    
        let ayahHTML = `
            <div id="ayah-${ayahNumber}" class="ayah" data-ayah-index="${ayahNumber}">
                <div class="arabic">${ayat.teksArab}</div>
                <div class="translation">
                    <p><strong>Ayat:</strong> ${ayahNumber}</p>
                    <p><strong>Latin:</strong> ${ayat.teksLatin}</p>
                    <p><strong>Terjemahan:</strong> ${ayat.teksIndonesia}</p>
                    <span class="tafsir-icon" data-idsurat="${surahNumber}" data-idayah="${ayahNumber}"><i class="fa fa-info-circle"></i> Tafsir </span>
                </div>
                <audio controls src="${audioLink}"></audio>
            </div>
        `;
    
        return bismillahHTML + ayahHTML;
    }
    

    $(document).on('click', '.tafsir-icon', function() {
        const idSurat = $(this).data('idsurat');
        const idAyah = $(this).data('idayah');
        fetchTafsir(idSurat, idAyah);
    });

    function fetchTafsir(idSurat, idAyah) {
        $.get(`https://equran.id/api/v2/tafsir/${idSurat}`, function(response) {
            console.log("API Response:", response);  // Debugging: Confirm the data structure
    
            if (response.code === 200 && response.data && response.data.tafsir) {
                const tafsirData = response.data.tafsir.find(t => parseInt(t.ayat) === parseInt(idAyah));
                if (tafsirData) {
                    // Replace newline characters with HTML break line tags for clear separation
                    let formattedText = tafsirData.teks.replace(/(\r\n|\r|\n)+/g, '<br><br>');
    
                    // Replace asterisks with bold tags to format bold text
                    formattedText = formattedText.replace(/\*([^*]+)\*/g, '<strong>$1</strong>');
    
                    showAlertTafsir(`Tafsir Ayat ${idAyah}`, formattedText);
                } else {
                    console.error(`Tafsir for Ayat ${idAyah} not found.`);
                    showAlertTafsir(`Tafsir Ayat ${idAyah}`, "Tafsir tidak ditemukan.");
                }
            } else {
                console.error("Failed to retrieve Tafsir data: " + (response.message || "No data found"));
                showAlertTafsir("Error", "Failed to retrieve Tafsir data.");
            }
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.error("API Request Failed: " + textStatus + ", " + errorThrown);
            showAlertTafsir("Error", "Failed to retrieve Tafsir data due to network error.");
        });
    }
    
    
    
    function showAlertTafsir(title, text) {
        $('#tafsirModal .modal-title').text(title);
        $('#tafsirModal .modal-body').html(text);  // Ensure using .html() to interpret the HTML content if any
        $('#tafsirModal').modal('show');
    }
    
    $('#playButton').click(function() {
        if (currentPlayingAudio) {
            currentPlayingAudio.pause();
        }
        const surahNumber = surahDetails.data('surahNumber');
        const qari = qariSelector.val();
        const formattedSurahNumber = surahNumber.toString().padStart(3, '0');
        const audioLink = `https://equran.nos.wjv-1.neo.id/audio-full/${qari}/${formattedSurahNumber}.mp3`;
        currentPlayingAudio = new Audio(audioLink);
        currentPlayingAudio.play();
    });

    $('#pauseButton').click(function() {
        if (currentPlayingAudio && !currentPlayingAudio.paused) {
            currentPlayingAudio.pause();
        }
    });

    $('#stopButton').click(function() {
        if (currentPlayingAudio) {
            currentPlayingAudio.pause();
            currentPlayingAudio.currentTime = 0;
        }
    });

    $('#ayatChoice').change(function() {
        const ayatId = $(this).val();
        const scrollToElement = $(`#${ayatId}`);
    
        if (scrollToElement.length) {
            $('html, body').animate({
                scrollTop: scrollToElement.offset().top - 20  // Adjust this value as needed
            }, 1000);  // Smooth scroll duration
        }
    });
        

    $('#backToSurahList').click(function() {
        surahDetails.hide();
        surahList.show();
        qariSelector.prop('disabled', true);
        navigation.hide();
        if (currentPlayingAudio) {
            currentPlayingAudio.pause();
            currentPlayingAudio = null;
        }
    });
});
