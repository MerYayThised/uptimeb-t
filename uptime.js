const fetch = require('node-fetch');
const { Database } = require('croxydb');
const db = new Database({ databaseName: 'croxydb.json' });

// Zamanlayıcıyı başlat
setInterval(() => {
  // CroxyDB'den tüm linkleri çek
  const allLinks = db.all();
  
  // Her bir link için HTTP GET isteği yap
  for (const [userId, userLinks] of Object.entries(allLinks)) {
    userLinks.forEach(async (link) => {
      try {
        // Linki ziyaret et
        const response = await fetch(link);
        
        // Başarılıysa logla
        if (response.ok) {
          console.log(`Link ziyaret edildi: ${link}`);
        } else {
          console.error(`Link ziyareti başarısız: ${link}`);
        }
      } catch (error) {
        console.error(`Link ziyareti sırasında bir hata oluştu: ${link}`);
        console.error(error);
      }
    });
  }
}, 3 * 60 * 1000); // Her 3 dakikada bir çalıştır (3 * 60 * 1000 milisaniye)
