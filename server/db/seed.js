require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const db = require('./database');

db.init().then(() => {
  console.log('🌱 Seeding database...');

  // Admin
  const adminPass = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10);
  db.prepare('INSERT OR IGNORE INTO admins (username,password,email) VALUES (?,?,?)')
    .run(process.env.ADMIN_USERNAME || 'admin', adminPass, process.env.ADMIN_EMAIL || 'admin@technova.ua');

  // Products
  const ins = db.prepare(`INSERT OR IGNORE INTO products
    (id,name_ua,name_en,description_ua,description_en,category,price,old_price,image,
     in_stock,badge,rating,reviews_count,warranty,sku,specs,featured)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);

  const prods = [
    [1,'Apple MacBook Pro 14" M3 Pro','Apple MacBook Pro 14" M3 Pro',
     'Ноутбук із чіпом M3 Pro, 18 ГБ unified memory, 512 ГБ SSD, дисплей Liquid Retina XDR 120Hz.',
     'Laptop with M3 Pro chip, 18GB unified memory, 512GB SSD, Liquid Retina XDR 120Hz.',
     'laptops',89990,99990,'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=700&q=80',
     1,'new',4.9,312,'2 роки / 2 years','TN-MBP-M3',
     '{"CPU":"Apple M3 Pro 12-core","RAM":"18 GB Unified","Storage":"512 GB SSD","Display":"14.2 Retina XDR","Battery":"22 год","OS":"macOS Sonoma"}',1],
    [2,'ASUS ROG Zephyrus G16 2025','ASUS ROG Zephyrus G16 2025',
     'Ігровий ноутбук із RTX 4090, Intel Core i9-14900HX, 32 ГБ DDR5, OLED 240Hz.',
     'Gaming laptop with RTX 4090, Intel Core i9-14900HX, 32GB DDR5, OLED 240Hz.',
     'laptops',129990,149990,'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=700&q=80',
     1,'sale',4.7,189,'2 роки / 2 years','TN-ASUS-G16',
     '{"CPU":"Intel Core i9-14900HX","GPU":"NVIDIA RTX 4090 16GB","RAM":"32 GB DDR5","Storage":"2 TB NVMe","Display":"16 OLED 240Hz"}',0],
    [3,'Dell XPS 15 OLED 2025','Dell XPS 15 OLED 2025',
     'Ультрапреміум ноутбук із OLED-дисплеєм 3.5K, Intel Ultra 9, NVIDIA RTX 4070.',
     'Ultra-premium laptop with 3.5K OLED, Intel Ultra 9, NVIDIA RTX 4070.',
     'laptops',95990,null,'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=700&q=80',
     1,null,4.6,97,'1 рік / 1 year','TN-DELL-XPS15',
     '{"CPU":"Intel Core Ultra 9 185H","GPU":"NVIDIA RTX 4070 8GB","RAM":"32 GB LPDDR5x","Storage":"1 TB NVMe"}',0],
    [4,'LG UltraFine 27" 4K OLED','LG UltraFine 27" 4K OLED',
     'Бездоганний 4K OLED монітор, 120Hz, DCI-P3 99%, HDR10 True Black.',
     'Impeccable 4K OLED monitor, 120Hz, DCI-P3 99%, HDR10 True Black.',
     'monitors',52990,59990,'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=700&q=80',
     1,'new',4.8,254,'3 роки / 3 years','TN-LG-OLED27',
     '{"Panel":"OLED","Resolution":"3840x2160 (4K)","Refresh Rate":"120 Hz","Color Gamut":"DCI-P3 99%","HDR":"HDR10 True Black"}',1],
    [5,'Samsung Odyssey G9 57" OLED','Samsung Odyssey G9 57" OLED',
     'Ігровий монітор 57", 7680x2160, 240Hz, DisplayHDR 1000.',
     'Gaming monitor 57", 7680x2160, 240Hz, DisplayHDR 1000.',
     'monitors',149990,179990,'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=700&q=80',
     1,'sale',4.7,178,'3 роки / 3 years','TN-SAMSUNG-G9',
     '{"Panel":"OLED","Resolution":"7680x2160","Refresh Rate":"240 Hz","HDR":"DisplayHDR 1000","Curvature":"1000R"}',0],
    [6,'TechNova Titan Gaming PC','TechNova Titan Gaming PC',
     'Флагманський ігровий ПК: i9-14900K, RTX 4090, 64 ГБ DDR5, 4 ТБ NVMe.',
     'Flagship gaming PC: i9-14900K, RTX 4090, 64GB DDR5, 4TB NVMe.',
     'desktops',199990,null,'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=700&q=80',
     1,'new',4.9,76,'2 роки / 2 years','TN-TITAN-PC',
     '{"CPU":"Intel Core i9-14900K","GPU":"NVIDIA RTX 4090 24GB","RAM":"64 GB DDR5-6000","Storage":"4 TB NVMe Gen5","Cooling":"360mm AIO Liquid","PSU":"1200W 80+ Platinum"}',0],
    [7,'MSI GeForce RTX 4090 SUPRIM X','MSI GeForce RTX 4090 SUPRIM X',
     'Найпотужніша відеокарта: 24 ГБ GDDR6X, трипроцесорне охолодження TORX 5.0.',
     'Most powerful GPU: 24GB GDDR6X, tri-fan TORX 5.0 cooling.',
     'components',79990,89990,'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=700&q=80',
     1,'new',4.8,521,'3 роки / 3 years','TN-RTX4090',
     '{"Memory":"24 GB GDDR6X","Memory Bus":"384-bit","Boost Clock":"2640 MHz","TDP":"450W","Outputs":"3x DP 1.4a, HDMI 2.1"}',0],
    [8,'Samsung 990 Pro NVMe 2 ТБ','Samsung 990 Pro NVMe 2TB',
     'PCIe 4.0 NVMe SSD: читання до 7450 МБ/с, запис до 6900 МБ/с.',
     'PCIe 4.0 NVMe SSD: read up to 7450 MB/s, write up to 6900 MB/s.',
     'components',8490,9990,'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=700&q=80',
     1,null,4.7,398,'5 років / 5 years','TN-990PRO-2T',
     '{"Interface":"PCIe 4.0 NVMe","Capacity":"2 TB","Seq Read":"7450 MB/s","Seq Write":"6900 MB/s","Form":"M.2 2280","Endurance":"1200 TBW"}',0],
    [9,'Keychron Q3 Pro Wireless','Keychron Q3 Pro Wireless',
     'Механічна TKL клавіатура з Bluetooth 5.1, hot-swap перемикачами, RGB підсвіткою та алюмінієвим корпусом.',
     'Mechanical TKL keyboard, Bluetooth 5.1, hot-swap switches, RGB backlight, aluminium body.',
     'peripherals',9990,null,'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=700&q=80',
     1,'new',4.9,1247,'2 роки / 2 years','TN-Q3PRO',
     '{"Layout":"TKL 87%","Switch":"Gateron G Pro 3.0","Connection":"BT 5.1 / USB-C","Backlight":"Per-key RGB","Battery":"4000 mAh"}',0],
    [10,'Razer Viper V3 HyperSpeed','Razer Viper V3 HyperSpeed',
     'Бездротова ігрова миша 35K DPI, Focus Pro оптичний сенсор, 280 годин автономності.',
     'Wireless gaming mouse 35K DPI, Focus Pro optical sensor, 280 hours battery life.',
     'peripherals',4990,5990,'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=700&q=80',
     1,'sale',4.8,892,'2 роки / 2 years','TN-VIPER-V3',
     '{"DPI":"100-35,000","Sensor":"Focus Pro Optical","Connection":"HyperSpeed 2.4GHz","Battery":"280 hrs","Weight":"55g"}',0],
    [11,'Sony WH-1000XM6 Wireless','Sony WH-1000XM6 Wireless',
     'Бездротові навушники ANC нового покоління. Автоадаптивне шумозаглушення. Hi-Res Audio.',
     'Next-gen wireless ANC headphones. Auto-adaptive noise cancelling. Hi-Res Audio.',
     'headphones',14990,17990,'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=700&q=80',
     1,'new',4.9,567,'2 роки / 2 years','TN-XM6-WH',
     '{"Driver":"40mm HD","ANC":"Adaptive Multi-Point","Battery":"40 hrs","Charging":"USB-C 10min-5hrs","Codec":"LDAC","Weight":"254g"}',1],
    [12,'Corsair Dominator Titanium DDR5-6400 64 ГБ','Corsair Dominator Titanium DDR5-6400 64GB',
     'Комплект 2x32 ГБ DDR5 із iCUE підсвіткою, сертифікований Intel XMP 3.0.',
     '2x32GB DDR5 kit with iCUE RGB lighting, Intel XMP 3.0 certified.',
     'components',19990,null,'https://images.unsplash.com/photo-1541029071515-84cc54f84dc5?w=700&q=80',
     0,null,4.6,210,'Lifetime','TN-DDR5-64G',
     '{"Type":"DDR5","Capacity":"64 GB (2x32)","Speed":"6400 MT/s","Latency":"CL32-39-39-76","Voltage":"1.4V","Profile":"Intel XMP 3.0"}',0],
  ];

  for (const p of prods) ins.run(...p);

  const pc = db.prepare('SELECT COUNT(*) as c FROM products').get();
  const ac = db.prepare('SELECT COUNT(*) as c FROM admins').get();
  console.log(`✅ Seed complete! Products: ${pc.c} | Admins: ${ac.c}`);
  console.log(`   Login: ${process.env.ADMIN_USERNAME || 'admin'} / ${process.env.ADMIN_PASSWORD || 'admin123'}`);
}).catch(e => { console.error('❌ Seed error:', e.message); process.exit(1); });
