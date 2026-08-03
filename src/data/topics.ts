export interface SubType {
  id: string;
  desc: string;
}

export interface Topic {
  id: number;
  name: string;
  subtypes: SubType[];
}

export const TOPICS: Topic[] = [
  {
    id: 1,
    name: "Perkalian Bilangan Berpangkat",
    subtypes: [
      { id: "1a", desc: "Basis angka sama, pangkat positif" },
      { id: "1b", desc: "Basis angka sama, ada pangkat negatif" },
      { id: "1c", desc: "Basis angka sama, ada pangkat nol" },
      { id: "1d", desc: "Basis angka sama, ada pangkat pecahan" },
      { id: "1e", desc: "Basis variabel sama, pangkat positif" },
      { id: "1f", desc: "Basis variabel sama, ada pangkat negatif" },
      { id: "1g", desc: "Basis variabel sama, ada pangkat pecahan" },
      { id: "1h", desc: "Multi variabel" },
      { id: "1i", desc: "Campuran angka dan variabel" },
      { id: "1j", desc: "Lebih dari 2 suku basis sama" },
      { id: "1k", desc: "Basis angka sama, pangkat negatif semua" },
      { id: "1l", desc: "Basis angka sama, pangkat pecahan semua" },
      { id: "1m", desc: "Multi variabel dengan pangkat pecahan" },
    ],
  },
  {
    id: 2,
    name: "Pembagian Bilangan Berpangkat",
    subtypes: [
      { id: "2a", desc: "Basis angka sama, pangkat positif" },
      { id: "2b", desc: "Basis angka sama, ada pangkat negatif" },
      { id: "2c", desc: "Basis angka sama, ada pangkat pecahan" },
      { id: "2d", desc: "Basis variabel sama" },
      { id: "2e", desc: "Basis variabel sama, ada pangkat negatif" },
      { id: "2f", desc: "Basis variabel sama, ada pangkat pecahan" },
      { id: "2g", desc: "Multi variabel" },
      { id: "2h", desc: "Campuran angka dan variabel" },
      { id: "2i", desc: "Hasil pangkat negatif" },
      { id: "2j", desc: "Basis angka sama, pangkat negatif semua" },
      { id: "2k", desc: "Multi variabel dengan pangkat pecahan" },
    ],
  },
  {
    id: 3,
    name: "Pangkat dari Pangkat (Power of Power)",
    subtypes: [
      { id: "3a", desc: "Basis angka, pangkat positif" },
      { id: "3b", desc: "Basis angka, pangkat luar negatif" },
      { id: "3c", desc: "Basis angka, pangkat dalam negatif" },
      { id: "3d", desc: "Basis angka, pangkat luar pecahan" },
      { id: "3e", desc: "Basis angka, pangkat dalam pecahan" },
      { id: "3f", desc: "Basis variabel, pangkat positif" },
      { id: "3g", desc: "Basis variabel, pangkat negatif" },
      { id: "3h", desc: "Basis variabel, pangkat pecahan" },
      { id: "3i", desc: "Gabungan dengan perkalian" },
      { id: "3j", desc: "Gabungan dengan pembagian" },
      { id: "3k", desc: "Pangkat dari pangkat berlapis" },
      { id: "3l", desc: "Kedua pangkat negatif" },
      { id: "3m", desc: "Kedua pangkat pecahan" },
      { id: "3n", desc: "Pangkat dalam negatif, luar pecahan" },
    ],
  },
  {
    id: 4,
    name: "Bilangan Pecahan Dipangkatkan",
    subtypes: [
      { id: "4a", desc: "Pecahan angka, pangkat positif" },
      { id: "4b", desc: "Pecahan angka, pangkat negatif" },
      { id: "4c", desc: "Pecahan angka, pangkat pecahan" },
      { id: "4d", desc: "Pecahan angka, pangkat nol" },
      { id: "4e", desc: "Pecahan variabel, pangkat positif" },
      { id: "4f", desc: "Pecahan variabel, pangkat negatif" },
      { id: "4g", desc: "Pecahan variabel, pangkat pecahan" },
      { id: "4h", desc: "Pecahan campuran (angka di atas)" },
      { id: "4i", desc: "Pecahan campuran (variabel di atas)" },
      { id: "4j", desc: "Pecahan campuran, pangkat negatif" },
      { id: "4k", desc: "Gabungan dengan perkalian" },
      { id: "4l", desc: "Gabungan dengan pembagian" },
      { id: "4m", desc: "Gabungan dengan pangkat dari pangkat" },
    ],
  },
  {
    id: 5,
    name: "Bilangan Negatif Dipangkatkan",
    subtypes: [
      { id: "5a", desc: "Pangkat genap (hasil positif)" },
      { id: "5b", desc: "Pangkat ganjil (hasil negatif)" },
      { id: "5c", desc: "Pangkat nol" },
      { id: "5d", desc: "Pangkat satu" },
      { id: "5e", desc: "Gabungan perkalian basis negatif sama" },
      { id: "5f", desc: "Gabungan pembagian basis negatif sama" },
      { id: "5g", desc: "Pangkat negatif dari basis negatif" },
      { id: "5h", desc: "Membedakan (-a)^n dengan -a^n" },
    ],
  },
  {
    id: 6,
    name: "Pangkat Negatif",
    subtypes: [
      { id: "6a", desc: "Angka biasa" },
      { id: "6b", desc: "Variabel" },
      { id: "6c", desc: "Basis pecahan angka" },
      { id: "6d", desc: "Basis pecahan variabel" },
      { id: "6e", desc: "Gabungan perkalian" },
      { id: "6f", desc: "Gabungan pembagian" },
      { id: "6g", desc: "Gabungan pangkat dari pangkat" },
      { id: "6h", desc: "Hasil jadi pecahan biasa" },
      { id: "6i", desc: "Gabungan perkalian dan pembagian" },
      { id: "6j", desc: "Multi variabel" },
    ],
  },
  {
    id: 7,
    name: "Pangkat Nol",
    subtypes: [
      { id: "7a", desc: "Angka biasa" },
      { id: "7b", desc: "Variabel" },
      { id: "7c", desc: "Ekspresi perkalian dalam kurung" },
      { id: "7d", desc: "Pecahan" },
      { id: "7e", desc: "Bilangan negatif" },
      { id: "7f", desc: "Gabungan dengan perkalian" },
      { id: "7g", desc: "Gabungan dengan pembagian (hasil nol)" },
      { id: "7h", desc: "Gabungan lebih kompleks" },
      { id: "7i", desc: "Ekspresi variabel dalam kurung" },
      { id: "7j", desc: "Gabungan pangkat nol lebih dari satu" },
      { id: "7k", desc: "Pangkat nol dalam pembagian" },
    ],
  },
  {
    id: 8,
    name: "Pangkat Pecahan",
    subtypes: [
      { id: "8a", desc: "Akar kuadrat sederhana" },
      { id: "8b", desc: "Akar kubik sederhana" },
      { id: "8c", desc: "Pangkat pecahan pembilang > 1 (basis kecil)" },
      { id: "8d", desc: "Pangkat pecahan pembilang > 1 (basis lebih besar)" },
      { id: "8e", desc: "Variabel pangkat pecahan" },
      { id: "8f", desc: "Gabungan perkalian" },
      { id: "8g", desc: "Gabungan pembagian" },
      { id: "8h", desc: "Gabungan pangkat dari pangkat" },
      { id: "8i", desc: "Pangkat pecahan negatif" },
      { id: "8j", desc: "Basis pecahan dengan pangkat pecahan" },
      { id: "8k", desc: "Gabungan perkalian dan pembagian" },
      { id: "8l", desc: "Multi variabel pangkat pecahan" },
    ],
  },
  {
    id: 9,
    name: "Konversi Bentuk Akar ke Pangkat Pecahan",
    subtypes: [
      { id: "9a", desc: "Akar kuadrat angka" },
      { id: "9b", desc: "Akar kubik angka" },
      { id: "9c", desc: "Akar ke-4 angka" },
      { id: "9d", desc: "Akar kuadrat variabel" },
      { id: "9e", desc: "Akar kubik variabel" },
      { id: "9f", desc: "Akar dengan pangkat di dalam" },
      { id: "9g", desc: "Akar ke-n campuran multi variabel" },
      { id: "9h", desc: "Akar dari pecahan" },
      { id: "9i", desc: "Akar dalam akar" },
      { id: "9j", desc: "Akar dari bilangan berpangkat" },
      { id: "9k", desc: "Akar dari bilangan berpangkat negatif" },
      { id: "9l", desc: "Akar campuran angka dan variabel" },
    ],
  },
  {
    id: 10,
    name: "Campuran",
    subtypes: [
      { id: "10a", desc: "Campuran 2 sifat" },
      { id: "10b", desc: "Campuran 3 sifat" },
      { id: "10c", desc: "Campuran 4 sifat" },
      { id: "10d", desc: "Penyebut lebih kompleks" },
      { id: "10e", desc: "Keduanya kompleks" },
    ],
  },
];

export function getTopicById(id: number): Topic | undefined {
  return TOPICS.find(t => t.id === id);
}

export function getSubTypeById(topicId: number, subtypeId: string): SubType | undefined {
  const topic = getTopicById(topicId);
  return topic?.subtypes.find(s => s.id === subtypeId);
}
