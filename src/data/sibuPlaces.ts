/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Dias.Ai - Data Tempat Menarik Sibu (My Kampung, My Pride)
 * Struktur data direka ringkas dan mudah diedit oleh sesiapa sahaja.
 */

export type PlaceCategory = 'Makanan' | 'Budaya' | 'Alam' | 'Kampung';
export type HalalStatus = 'Halal' | 'Muslim-Friendly' | 'Vegetarian' | 'Non-Halal' | 'General';
export type DietaryOption = 'All' | 'Halal' | 'Muslim-Friendly' | 'Vegetarian' | 'Non-Halal';

export interface PlaceLocation {
  id: string;
  name: string;
  category: PlaceCategory;
  halalStatus?: HalalStatus; // Status Halal / Vegetarian untuk panduan makanan
  halalDetailsBM?: string;   // Penjelasan khusus status halal & bahan masakan
  halalDetailsEN?: string;
  isVegetarian?: boolean;    // Pilihan atau menu khas vegetarian
  dietaryDetailsBM?: string; // Penjelasan menu sayuran / vegetarian
  dietaryDetailsEN?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  images: string[];
  descriptionBM: string;
  descriptionEN: string;
  interestingFactBM: string;
  interestingFactEN: string;
  bestTimeToVisitBM: string;
  bestTimeToVisitEN: string;
  estimatedMinutes: number; // Anggaran minit melawat
  localTipsBM: string;
  localTipsEN: string;
  openingHoursNoteBM?: string;
  openingHoursNoteEN?: string;
  address?: string;
}

export const INITIAL_SIBU_PLACES: PlaceLocation[] = [
  {
    id: 'pasar-pusat-sibu',
    name: 'Pasar Pusat Sibu (Sibu Central Market)',
    category: 'Makanan',
    halalStatus: 'Muslim-Friendly',
    isVegetarian: true,
    dietaryDetailsBM: 'Tingkat bawah dan luar pasar kaya dengan sayur liar hutan Borneo (pucuk midin, paku pakis), buah eksotik dabai dan kuih tradisional sayuran.',
    dietaryDetailsEN: 'Ground floor and perimeter host abundant wild Borneo greens (midin, wild ferns), exotic dabai fruits, and plant-based traditional snacks.',
    halalDetailsBM: 'Tingkat 1 menempatkan zon medan selera Melayu & Melanau berasingan dengan puluhan gerai Muslim menjual Laksa Sarawak, Mee Jawa, Pulut Panggang dan Kuih Penyaram (bebas sentuhan dengan gerai bukan halal di sayap bertentangan).',
    halalDetailsEN: '1st floor features a dedicated separate Malay & Melanau halal food court wing with dozens of Muslim stalls serving Laksa Sarawak, Mee Jawa, and local kuih, partitioned from non-halal stalls.',
    coordinates: {
      lat: 2.2903,
      lng: 111.8285,
    },
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/5/5b/Sibu_Central_Market_%28230924-0816%29.jpg',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=80',
    ],
    descriptionBM: 'Pasar basah berbumbung terbesar di Malaysia dengan lebih 1,200 gerai menjual kuih-muih tradisional Foochow, buah-buahan eksotik Borneo seperti dabai dan engkala, serta kraf tangan Iban dan Melanau.',
    descriptionEN: 'The largest indoor market in Malaysia hosting over 1,200 stalls offering traditional Foochow pastries, exotic seasonal Borneo fruits like dabai and engkala, and authentic indigenous handicrafts.',
    interestingFactBM: 'Di sini anda boleh melihat cara unik peniaga membungkus ayam hidup menggunakan surat khabar lama dan tali rafia, tradisi pasar Sibu yang terkenal di seluruh dunia.',
    interestingFactEN: 'Famous for the unique and historic Sibu market tradition of wrapping live chickens securely in newspaper parcels tied with raffia string.',
    bestTimeToVisitBM: 'Pagi awal (6:30 pagi - 9:30 pagi) untuk suasana paling meriah dan kuih muih segar.',
    bestTimeToVisitEN: 'Early morning (6:30 AM - 9:30 AM) for the liveliest buzz and freshest breakfast treats.',
    estimatedMinutes: 90,
    localTipsBM: 'Naik ke tingkat atas (sayap gerai Melayu) untuk sarapan Laksa Sarawak dan Kopi O Peng tempatan. Sediakan tunai kecil.',
    localTipsEN: 'Head to the first floor Malay food wing for authentic Sarawak Laksa and iced kopi. Carry small cash.',
    address: 'Jalan Channel, Pekan Sibu, 96000 Sibu, Sarawak',
    openingHoursNoteBM: 'Kebiasaannya beroperasi dari awal pagi hingga petang (sila sahkan sebelum pergi).',
    openingHoursNoteEN: 'Generally active from early morning until late afternoon (please verify before visiting).'
  },
  {
    id: 'medan-selera-harmoni',
    name: 'Medan Selera Harmoni Sibu (Pusat Makanan Halal & Melanau)',
    category: 'Makanan',
    halalStatus: 'Halal',
    halalDetailsBM: '100% Halal - Pusat tumpuan kuliner Muslim terulung di Sibu. Semua gerai dikendalikan oleh peniaga Muslim Sarawak dengan bahan mentah halal, tiada daging atau bahan terlarang.',
    halalDetailsEN: '100% Halal - Sibu’s flagship Muslim dining hub. All stalls operated by local Sarawak Muslim chefs using halal-certified poultry, seafood and ingredients with zero non-halal contamination.',
    coordinates: {
      lat: 2.2952,
      lng: 111.8318,
    },
    images: [
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80',
    ],
    descriptionBM: 'Pusat tumpuan makanan Halal terkemuka di Sibu yang menghimpunkan hidangan warisan Melanau dan Melayu Sarawak, termasuk Umai Ikan segar, Linut dengan sambal belacan, Ikan Terubok bakar, Mee Jawa dan Sate Sibu.',
    descriptionEN: 'Sibu’s premier Halal food destination celebrating authentic Melanau and Sarawak Malay heritage dishes, featuring fresh Umai (Sarawak fish ceviche), Linut with spicy sambal, grilled Terubok, Mee Jawa, and aromatic satay.',
    interestingFactBM: 'Umai adalah hidangan tradisi nelayan Melanau yang disediakan daripada hirisan ikan tenggiri segar yang diperap bersama limau nipis, cili padi dan bawang merah tanpa dimasak di atas api.',
    interestingFactEN: 'Umai is a celebrated indigenous Melanau delicacy of fresh raw mackerel or prawn cured purely with calamansi lime juice, bird’s eye chilies, and shallots.',
    bestTimeToVisitBM: '5:00 petang - 10:00 malam untuk makan malam santai dan suasana meriah.',
    bestTimeToVisitEN: '5:00 PM - 10:00 PM for dinner atmosphere with fresh barbecued seafood and satay.',
    estimatedMinutes: 75,
    localTipsBM: 'Wajib cuba Umai Jeb (ikan campur obor-obor) bersama pulut panggang panas dan air kelapa pandan.',
    localTipsEN: 'Must try Umai Jeb (fresh fish & jellyfish) paired with freshly grilled pulut panggang.',
    address: 'Jalan Tuanku Osman / Awang Ramli Amit, 96000 Sibu, Sarawak',
    openingHoursNoteBM: 'Dibuka setiap hari dari petang hingga lewat malam (sila sahkan sebelum pergi).',
    openingHoursNoteEN: 'Open daily from late afternoon until night (please verify before visiting).'
  },
  {
    id: 'mee-kampua-halal-sibu',
    name: 'Mee Kampua & Masakan Warisan Halal Sibu',
    category: 'Makanan',
    halalStatus: 'Halal',
    halalDetailsBM: '100% Halal - Mee Kampua diadun menggunakan minyak bawang sayuran/bawang goreng wangi asli, ayam cincang berempah dan sup herba jernih, serta Kompia bakar berinti daging halal khas untuk dinikmati tanpa was-was.',
    halalDetailsEN: '100% Halal - Authentic handmade Kampua noodles tossed in aromatic shallot oil, seasoned minced chicken, clear herbal broth, and halal-filled Kompia flatbreads prepared in dedicated Muslim kitchens.',
    coordinates: {
      lat: 2.2918,
      lng: 111.8335,
    },
    images: [
      '/assets/aistudio/71589366749_MeeKampua_558492a1.webp',
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=1000&q=80',
    ],
    descriptionBM: 'Restoran khas yang menyajikan citarasa legenda Foochow versi 100% Halal. Mee Kampua kenyal buatan tangan disalut minyak bawang wangi, ayam cincang perap manis dan wantan sup segar.',
    descriptionEN: 'Specialty eatery serving Sibu’s iconic Foochow noodle culture in 100% Halal preparation. Springy noodles tossed in fragrant shallot oil, seasoned tender chicken, and savory dumpling broth.',
    interestingFactBM: 'Mee Kampua versi halal ini diinovasi agar pelancong Muslim dan masyarakat berbilang kaum dapat merasai jiwa makanan Sibu bersama-sama tanpa ragu-ragu.',
    interestingFactEN: 'Halal Kampua was innovated by local passionate cooks to allow Muslim travelers to relish Sibu’s iconic noodle tradition with complete peace of mind.',
    bestTimeToVisitBM: '7:30 pagi - 12:30 tengah hari untuk sarapan dan makan tengah hari.',
    bestTimeToVisitEN: '7:30 AM - 12:30 PM for prime breakfast or lunch servings.',
    estimatedMinutes: 50,
    localTipsBM: 'Pesan "Kampua Spesial" dengan sambal cili kicap dan sup wantan ayam panas.',
    localTipsEN: 'Order the "Special Kampua" with house-made spicy soy dip and warm chicken dumpling soup.',
    address: 'Pekan Sibu, 96000 Sibu, Sarawak',
    openingHoursNoteBM: 'Buka dari pagi hingga tengah hari (sila sahkan sebelum pergi).',
    openingHoursNoteEN: 'Open from morning until midday (please verify before visiting).'
  },
  {
    id: 'kedai-kopi-foochow',
    name: 'Kedai Kopi Foochow Warisan',
    category: 'Makanan',
    halalStatus: 'Non-Halal',
    halalDetailsBM: 'Bukan Halal (Non-Halal) - Menyajikan hidangan tradisional Cina Foochow yang mengandungi daging dan minyak babi (lard). Untuk pelancong Muslim, disyorkan ke Medan Selera Harmoni atau Mee Kampua Halal Sibu.',
    halalDetailsEN: 'Non-Halal - Serves traditional Chinese Foochow noodles prepared with pork slices and pork lard. Muslim visitors are warmly guided to Medan Selera Harmoni or Halal Kampua Sibu.',
    coordinates: {
      lat: 2.2895,
      lng: 111.8290,
    },
    images: [
      '/assets/aistudio/71589366749_MeeKampua_558492a1.webp',
      'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1579684947550-22e945225d9a?auto=format&fit=crop&w=1000&q=80',
    ],
    descriptionBM: 'Menikmati hidangan ikonik identiti Sibu: Mee Kampua (mi buatan tangan kenyal dengan minyak bawang wangi dan hirisan daging) serta Kompia panas yang dibakar dalam ketuhar tanah liat tradisional.',
    descriptionEN: 'Savor Sibu’s quintessential culinary soul: springy Kampua noodles tossed in fragrant shallot oil and freshly baked crispy Kompia flatbreads from traditional clay ovens.',
    interestingFactBM: 'Kompia sering digelar "Bagel Foochow" dan dicipta oleh Jeneral Qi Jiguang pada zaman Dinasti Ming sebagai bekalan tentera yang tahan lama.',
    interestingFactEN: 'Kompia is known as the "Foochow Bagel", historically baked with a hole in the center so soldiers could string them along their belts as food rations.',
    bestTimeToVisitBM: '7:00 pagi - 11:00 pagi sewaktu Kompia baru keluar dari ketuhar.',
    bestTimeToVisitEN: '7:00 AM - 11:00 AM when the charcoal oven churns out fresh batches of steaming Kompia.',
    estimatedMinutes: 60,
    localTipsBM: 'Minta "Kampua Sup" atau "Kampua Kicap Hitam" untuk merasai variasi kegemaran orang tempatan.',
    localTipsEN: 'Try ordering your Kampua "dark sauce" or paired with clear soup for local style.',
    address: 'Sekitar Jalan Blacksmith / Jalan Market, Sibu',
    openingHoursNoteBM: 'Buka dari sarapan pagi hingga tengah hari (sila sahkan sebelum pergi).',
    openingHoursNoteEN: 'Open from breakfast until midday (please verify before visiting).'
  },
  {
    id: 'restoran-vegetarian-tian-en',
    name: 'Restoran Vegetarian Tian En Sibu (Tian En Vegetarian)',
    category: 'Makanan',
    halalStatus: 'Vegetarian',
    isVegetarian: true,
    halalDetailsBM: '100% Sayuran / Vegetarian & Mesra Muslim - Bebas daging haiwan, tiada lemak babi, menggunakan minyak sayuran tulen. Menyajikan Mee Kampua Sayuran, Wantan cendawan, dan masakan vegetarian Foochow.',
    halalDetailsEN: '100% Plant-Based & Vegetarian Friendly - Meatless, zero lard, cooked with pure vegetable oil. Serving vegetarian Foochow Kampua noodles and plant-based dishes.',
    dietaryDetailsBM: 'Menu Mee Kampua Sayuran, Ding Bian Hu cendawan, dan lauk-pauk berasaskan tauhu dan sayur segar.',
    dietaryDetailsEN: 'Vegetarian Kampua noodles, mushroom Ding Bian Hu, and fresh vegetable & tofu selection.',
    coordinates: {
      lat: 2.3025,
      lng: 111.8385,
    },
    images: [
      '/assets/aistudio/71589366749_MeeKampua_558492a1.webp',
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=80',
    ],
    descriptionBM: 'Restoran vegetarian terkemuka di Sibu yang menyajikan citarasa legenda Foochow versi 100% tanpa daging. Terkenal dengan Mee Kampua Sayuran kenyal bersama wantan cendawan dan sup herba wangi.',
    descriptionEN: 'Renowned Sibu vegetarian dining spot celebrating Foochow flavors in 100% meatless craft. Signature handmade vegetarian Kampua noodles with savory mushroom dumplings and herbal broth.',
    interestingFactBM: 'Mee Kampua di sini diadun khas menggunakan minyak bijan dan bawang sayuran, dipadankan dengan "char siu" soya rangup yang digemari oleh komuniti vegetarian dan bukan vegetarian.',
    interestingFactEN: 'Their vegetarian Kampua is tossed in fragrant sesame-vegetable reduction and topped with crispy soy-protein mock char siu that tastes authentically nostalgic.',
    bestTimeToVisitBM: '8:00 pagi - 1:30 tengah hari untuk sarapan mi atau hidangan tengah hari.',
    bestTimeToVisitEN: '8:00 AM - 1:30 PM for fresh morning noodles or lunchtime plant-based dining.',
    estimatedMinutes: 50,
    localTipsBM: 'Pesan "Mee Kampua Sayur Spesial" bersama wantan sup dan sayur midin goreng halia.',
    localTipsEN: 'Order the Special Vegetarian Kampua with mushroom dumpling soup and stir-fried ginger midin fern.',
    address: 'Jalan Pahlawan / Jalan Pedada, 96000 Sibu, Sarawak',
    openingHoursNoteBM: 'Buka setiap hari untuk sarapan dan makan tengah hari (sila sahkan sebelum pergi).',
    openingHoursNoteEN: 'Open daily for breakfast and lunch (please verify before visiting).'
  },
  {
    id: 'cafe-all-the-best-vegetarian',
    name: 'Cafe All The Best Vegetarian Restaurant (万德林素食館)',
    category: 'Makanan',
    halalStatus: 'Vegetarian',
    isVegetarian: true,
    halalDetailsBM: '100% Sayuran / Vegetarian & Mesra Muslim - Restoran vegetarian bebas daging dan bebas lemak babi, menggunakan minyak sayuran tulen. Suasana berhawa dingin yang selesa dan bersih.',
    halalDetailsEN: '100% Vegetarian & Plant-Based - Meatless, zero lard, cooked with pure vegetable oils. Comfortable air-conditioned dining and dedicated vegetarian kitchen.',
    dietaryDetailsBM: 'Menyajikan Mee Kampua Vegetarian, Tauhu Periuk Tanah (Claypot Tofu), sup cendawan herba, wantan sayuran dan aneka masakan Foochow tanpa daging.',
    dietaryDetailsEN: 'Signature Vegetarian Kampua noodles, savory Claypot Tofu, herbal mushroom soup, vegetarian dumplings, and a wide array of meatless Foochow dishes.',
    coordinates: {
      lat: 2.3168,
      lng: 111.8472,
    },
    images: [
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80',
    ],
    descriptionBM: 'Restoran vegetarian berhawa dingin popular di kawasan Pahlawan, Sibu yang dikenali sebagai Wan De Lin (万德林). Terkenal dengan hidangan vegetarian Foochow yang lazat seperti Mee Kampua sayuran, hidangan periuk tanah, dan lauk-pauk berasaskan cendawan segar.',
    descriptionEN: 'A highly regarded air-conditioned vegetarian restaurant in Sibu’s Pahlawan area, locally known as Wan De Lin (万德林). Famed for delicious Foochow vegetarian comfort fare, springy meatless Kampua noodles, savory claypot tofu, and mushroom delicacies.',
    interestingFactBM: 'Dikenali masyarakat tempatan sebagai salah satu restoran vegetarian paling konsisten dan lengkap di Sibu, menyajikan masakan ala-carte dan hidangan panas yang memikat selera vegetarian mahupun bukan vegetarian.',
    interestingFactEN: 'Cherished by Sibu locals for its extensive menu of plant-based Foochow comfort cooking, celebrated for rich aromatic broths and authentic textures created without meat.',
    bestTimeToVisitBM: '11:30 pagi - 1:30 tengah hari untuk makan tengah hari, atau 6:00 petang - 8:30 malam untuk makan malam.',
    bestTimeToVisitEN: '11:30 AM - 1:30 PM for lunch or 6:00 PM - 8:30 PM for relaxed evening dining.',
    estimatedMinutes: 60,
    localTipsBM: 'Wajib cuba Mee Kampua Sayur, Sup Herba Cendawan, dan Claypot Tauhu Cendawan istimewa. Ruang makan berhawa dingin selesa berhampiran kawasan Pahlawan.',
    localTipsEN: 'Must-order items include Vegetarian Kampua noodles, Herbal Mushroom Soup, and their signature Claypot Tofu. Clean air-conditioned setting near Pahlawan.',
    address: 'No. 11, Tingkat Bawah, Lorong Pahlawan 7G, 96000 Sibu, Sarawak',
    openingHoursNoteBM: 'Selasa - Ahad: 7:30 pagi - 2:00 petang & 5:30 petang - 9:00 malam (Tutup hari Isnin; sila sahkan sebelum pergi).',
    openingHoursNoteEN: 'Tuesday - Sunday: 7:30 AM - 2:00 PM & 5:30 PM - 9:00 PM (Closed Mondays; please verify before visiting).'
  },
  {
    id: 'kuil-tua-pek-kong',
    name: 'Kuil Tua Pek Kong & Pagoda 7 Tingkat',
    category: 'Budaya',
    coordinates: {
      lat: 2.2882,
      lng: 111.8267,
    },
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/b/b6/Pagoda_of_Tua_Pek_Kong_Temple%2C_Sibu.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/1/10/Facade_of_Tua_Pek_Kong_Temple%2C_Sibu.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/2/23/Pagoda_of_Tua_Pek_Kong_Temple.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/6/62/Tua_Pek_Kong_Temple%2C_Sibu_%28230922-1241%29.jpg',
    ],
    descriptionBM: 'Kuil Cina tertua di Sibu yang dibina sejak tahun 1871, tersergam megah di tebing Sungai Rajang dengan Pagoda Dewi Guan Yin setinggi 7 tingkat yang menawarkan panorama indah bandar.',
    descriptionEN: 'The oldest Chinese temple in Sibu founded in 1871, perched gracefully along the Rejang River riverbank with an iconic 7-storey Goddess of Mercy pagoda overlooking the waterway.',
    interestingFactBM: 'Kuil ini kekal selamat tanpa musnah sewaktu kebakaran besar Sibu pada tahun 1928 dan serangan semasa Perang Dunia Kedua, dianggap keajaiban oleh masyarakat tempatan.',
    interestingFactEN: 'Miraculously survived untouched during the great Sibu fire of 1928 and the bombings of WWII, earning deep spiritual reverence among locals.',
    bestTimeToVisitBM: 'Lewat petang (5:00 petang - 6:30 petang) untuk menyaksikan matahari terbenam di Sungai Batang Rajang.',
    bestTimeToVisitEN: 'Late afternoon (5:00 PM - 6:30 PM) to catch the golden sunset across the majestic Batang Rajang.',
    estimatedMinutes: 45,
    localTipsBM: 'Pakai kasut yang mudah ditanggalkan jika ingin menaiki tangga ke tingkat atas pagoda.',
    localTipsEN: 'Wear easy slip-on shoes if climbing the interior steps for the riverside viewpoint.',
    address: 'Jalan Temple, 96000 Sibu, Sarawak',
    openingHoursNoteBM: 'Dibuka setiap hari dari pagi hingga senja (sila sahkan sebelum pergi).',
    openingHoursNoteEN: 'Open daily from morning until dusk (please verify before visiting).'
  },
  {
    id: 'pusat-warisan-sibu',
    name: 'Pusat Warisan Sibu (Sibu Heritage Centre)',
    category: 'Budaya',
    coordinates: {
      lat: 2.2885,
      lng: 111.8277,
    },
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/d/de/Sibu_Heritage_Centre.JPG',
      'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
    ],
    descriptionBM: 'Muzium warisan yang menempatkan khazanah sejarah peneroka awal Foochow di bawah pimpinan Wong Nai Siong pada 1901, artifak tradisi kaum Iban, Melanau, Orang Ulu dan Melayu Sarawak.',
    descriptionEN: 'A rich heritage museum chronicling the arrival of early Foochow settlers led by Wong Nai Siong in 1901, alongside treasured cultural artifacts of the Iban, Melanau, Orang Ulu, and Malay communities.',
    interestingFactBM: 'Bangunan muzium ini dahulunya merupakan Dewan Bandaran Sibu yang dibina dengan seni bina kolonial yang dipelihara rapi.',
    interestingFactEN: 'The building was originally Sibu’s historic Municipal Town Hall, beautifully preserved with colonial civic architectural charm.',
    bestTimeToVisitBM: '10:00 pagi - 3:00 petang untuk meluangkan masa membaca diorama dan pameran berhawa dingin.',
    bestTimeToVisitEN: '10:00 AM - 3:00 PM during the day to comfortably explore the air-conditioned historical exhibits.',
    estimatedMinutes: 60,
    localTipsBM: 'Ambil peluang melihat pameran tembikar antik dan peralatan memburu tradisi pribumi Sarawak.',
    localTipsEN: 'Take time to view the ancient heirloom ceramics and traditional native blowpipes and beadwork.',
    address: 'Jalan Iban, 96000 Sibu, Sarawak',
    openingHoursNoteBM: 'Biasanya dibuka Selasa hingga Ahad (tutup hari Isnin; sila sahkan sebelum pergi).',
    openingHoursNoteEN: 'Typically open Tuesday to Sunday (closed Mondays; please verify before visiting).'
  },
  {
    id: 'taman-tasik-sibu',
    name: 'Taman Tasik Sibu (Taman Tasik Permai)',
    category: 'Alam',
    coordinates: {
      lat: 2.3275,
      lng: 111.8540,
    },
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=1000&q=80',
    ],
    descriptionBM: 'Oasis hijau seluas 24 ekar dengan tasik buatan yang tenang, trek joging berturap, jambatan kayu gantung, serta taman herba dan pokok-pokok teduh untuk rekreasi seisi keluarga.',
    descriptionEN: 'A lush 24-acre green sanctuary featuring scenic lakes, jogging tracks, wooden bridges, lotus ponds, and manicured tropical botanical gardens perfect for peaceful walks.',
    interestingFactBM: 'Tasik di taman ini menjadi habitat semulajadi pelbagai spesies burung air tropika dan teratai merah jambu yang mekar segar setiap pagi.',
    interestingFactEN: 'The lake is a natural haven for native waterfowls and blooming lotus lilies that open vibrantly with the morning sunrise.',
    bestTimeToVisitBM: 'Awal pagi (7:00 pagi) atau petang (5:00 petang) untuk cuaca redup dan angin segar.',
    bestTimeToVisitEN: 'Early morning (7:00 AM) or gentle evening (5:00 PM) for cool breeze and sunset reflection.',
    estimatedMinutes: 75,
    localTipsBM: 'Sesuai untuk berjoging, mengambil gambar OOTD di atas jambatan kayu, atau berkelah santai.',
    localTipsEN: 'Great for photography on the arched wooden bridge and unwinding away from city hustle.',
    address: 'Jalan Permai, 96000 Sibu, Sarawak',
    openingHoursNoteBM: 'Taman awam dibuka setiap hari percuma (sila sahkan sebelum pergi).',
    openingHoursNoteEN: 'Public park open daily with free entry (please verify before visiting).'
  },
  {
    id: 'tebing-sungai-rejang',
    name: 'Tebing Sungai Rejang (Rajang Esplanade)',
    category: 'Kampung',
    coordinates: {
      lat: 2.2872,
      lng: 111.8250,
    },
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/8/85/Swan_statue_of_Sibu.jpg',
      'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
    ],
    descriptionBM: 'Laluan pejalan kaki di sepanjang Sungai Batang Rajang—sungai terpanjang di Malaysia. Menjadi saksi urat nadi perhubungan kampung pedalaman, bot ekspres, dan tugu angsa putih lambang Sibu.',
    descriptionEN: 'Scenic waterfront promenade along Batang Rajang—Malaysia’s longest river. The historic lifeline connecting riverine longhouses, cargo barges, express boats, and Sibu’s iconic Swan statue.',
    interestingFactBM: 'Sungai Rajang merentang sejauh 563 km dan sejak berabad menjadi laluan hidup utama masyarakat Dayak, Iban dan Orang Ulu ke laut lepas.',
    interestingFactEN: 'The Rajang stretches 563 km, historically serving as the grand highway for Sarawak tribes between deep rainforest heartlands and the South China Sea.',
    bestTimeToVisitBM: '5:30 petang - 7:00 malam untuk angin sungai petang dan pemandangan bot lalu-lalang.',
    bestTimeToVisitEN: '5:30 PM - 7:00 PM to catch riverside evening breezes and watch traditional riverboats cruise by.',
    estimatedMinutes: 50,
    localTipsBM: 'Ambil swafoto di hadapan Tugu Angsa Sibu dan nikmati ais kacang di gerai berdekatan.',
    localTipsEN: 'Snap your signature photo with the Majestic Swan statue and enjoy shaved ice dessert nearby.',
    address: 'Jalan Maju, Waterfront, 96000 Sibu, Sarawak',
    openingHoursNoteBM: 'Kawasan awam terbuka 24 jam (sila sahkan sebelum pergi).',
    openingHoursNoteEN: 'Open public area accessible round the clock (please verify before visiting).'
  },
  {
    id: 'pasar-malam-sibu',
    name: 'Pasar Malam Sibu (Sibu Night Market)',
    category: 'Makanan',
    halalStatus: 'Muslim-Friendly',
    halalDetailsBM: 'Mesra Muslim - Pasar malam ini mempunyai deretan gerai peniaga Muslim tempatan yang menjual sate ayam/daging halal, kepak ayam BBQ madu Sarawak, dim sum halal, pau kukus, jagung bakar dan pelbagai kuih muih tradisi.',
    halalDetailsEN: 'Muslim-Friendly - Features dedicated local Muslim food stalls serving certified halal beef/chicken satay, Sarawak honey BBQ wings, halal dim sum, steamed pau, and traditional delicacies.',
    coordinates: {
      lat: 2.2880,
      lng: 111.8315,
    },
    images: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1000&q=80',
    ],
    descriptionBM: 'Syurga makanan jalanan malam dengan aroma sate panggang, pau kukus, dim sum halal & Foochow, kuih apam balik, mee sua sup, dan aneka minuman buah segar pada harga sangat berpatutan.',
    descriptionEN: 'A vibrant evening street food bazaar packed with the aroma of charcoal-grilled satay, steamed dumplings, Foochow Mee Sua, fluffy peanut pancakes, and fresh tropical shakes.',
    interestingFactBM: 'Pasar malam ini telah beroperasi sejak tahun 1973 dan merupakan salah satu pasar malam harian tertua dan paling meriah di Sarawak.',
    interestingFactEN: 'Operating continuously since 1973, it is one of Sarawak’s oldest and most buzzing daily evening open-air markets.',
    bestTimeToVisitBM: '7:00 malam - 9:30 malam semasa semua gerai sedang panas membakar dan menggoreng.',
    bestTimeToVisitEN: '7:00 PM - 9:30 PM when the night air is alive with sizzling grills and local banter.',
    estimatedMinutes: 75,
    localTipsBM: 'Cuba kuih Siput (Sibu peanut pancake) dan ayam BBQ madu Sarawak. Datang dengan perut kosong!',
    localTipsEN: 'Sample freshly folded peanut pancakes and Sarawak-style honey BBQ skewers. Arrive hungry!',
    address: 'Jalan Butterfly, Pekan Sibu, 96000 Sibu, Sarawak',
    openingHoursNoteBM: 'Dibuka setiap hari bermula 5:30 petang hingga 10:30 malam (sila sahkan sebelum pergi).',
    openingHoursNoteEN: 'Open daily from around 5:30 PM to 10:30 PM (please verify before visiting).'
  }
];

export interface SibuFact {
  id: string;
  titleBM: string;
  titleEN: string;
  factBM: string;
  factEN: string;
  iconName: string;
}

export const SIBU_FACTS: SibuFact[] = [
  {
    id: 'f1',
    titleBM: 'Bandar Angsa (Swan City)',
    titleEN: 'The Swan City',
    factBM: 'Sibu digelar "Bandar Angsa". Kononnya apabila kebuluran berlaku dahulu, sekumpulan angsa terbang melintasi langit membawa tanda rahmat dan petanda pulihnya rezeki penduduk.',
    factEN: 'Sibu is affectionately known as the "Swan City". Local lore says a majestic flock of swans flew across during hard times, symbolizing renewed hope and blessing for the community.',
    iconName: 'Sparkles'
  },
  {
    id: 'f2',
    titleBM: 'Pekan Foochow Baru (New Fuzhou)',
    titleEN: 'New Fuzhou Heritage',
    factBM: 'Pada tahun 1901, Wong Nai Siong membawa lebih 1,000 imigran Foochow dari wilayah Minqing, China ke Sibu untuk meneroka tanah pertanian dan getah, membentuk budaya Foochow yang kukuh hari ini.',
    factEN: 'In 1901, pioneer Wong Nai Siong led over 1,000 Foochow settlers to Sibu to establish agriculture and rubber, laying the rich linguistic and culinary foundation of Sibu today.',
    iconName: 'Landmark'
  },
  {
    id: 'f3',
    titleBM: 'Urat Nadi Batang Rajang',
    titleEN: 'The Mighty Rajang River',
    factBM: 'Sungai Batang Rajang di Sibu adalah sungai terpanjang di Malaysia (563 km), menjadi pintu gerbang perhubungan bot ekspres ke pekan pedalaman seperti Kapit, Belaga dan rumah panjang Dayak.',
    factEN: 'The Batang Rajang flowing through Sibu is Malaysia\'s longest river (563 km), serving as the historic gateway to inland communities like Kapit, Belaga, and traditional longhouses.',
    iconName: 'Compass'
  },
  {
    id: 'f4',
    titleBM: 'Keharmonian "My Kampung, My Pride"',
    titleEN: 'Harmony & Unity',
    factBM: 'Masyarakat Sibu terdiri daripada kaum Iban, Cina (Foochow, Hokkien), Melayu, Melanau dan Orang Ulu yang hidup erat bersatu hati berkongsi meja kopi dan tradisi perayaan.',
    factEN: 'Sibu is celebrated for authentic communal camaraderie, where Iban, Foochow, Malay, Melanau, and Orang Ulu locals share morning coffees, festivals, and cultural pride together.',
    iconName: 'HeartHandshake'
  },
  {
    id: 'f5',
    titleBM: 'Syurga Gastronomi Tulen',
    titleEN: 'Culinary Heritage',
    factBM: 'Makanan di Sibu seperti Kampua Mee, Kompia arang, Mee Sua Wain Merah Foochow, dan Dian Bian Hu mengekalkan resipi tradisi turun-temurun lebih 100 tahun yang sukar ditemui di tempat lain.',
    factEN: 'Unique foods like hand-tossed Kampua, claypot Kompia, fragrant Red Wine Mee Sua, and Dian Bian Hu rice broth keep century-old culinary recipes alive with uncompromised authenticity.',
    iconName: 'Utensils'
  }
];
