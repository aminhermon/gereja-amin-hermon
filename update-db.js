const fs = require('fs');
const dbPath = './data/db.json';
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

db.contact = {
  hero: {
    bgImage: 'assets/images/church-interior.png',
    eyebrow: 'Mari Terhubung',
    titleHTML: 'Hubungi <span class=\"text-gold\">Kami</span>',
    subtitle: 'Kami rindu menyambut dan melayani Anda. Silakan hubungi kami untuk informasi lebih lanjut mengenai kegiatan gereja atau pelayanan pastoral.'
  },
  info: {
    address: 'Jl. Contoh Alamat No. 123, Bekasi Utara, Kota Bekasi, Jawa Barat 17124',
    phone: '+62 812-3456-7890',
    email: 'info@gerejaaminhhermon.id'
  },
  cta: {
    waNumber: '6281234567890',
    waText: 'Halo Sekretariat Gereja AMIN Hermon, saya ingin bertanya tentang...',
    note: 'Jam operasional: Senin–Sabtu, 09.00–16.00 WIB'
  }
};

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log('DB updated with contact data');
