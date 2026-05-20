'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const sections = [
  {
    num: 1,
    title: 'Pendahuluan',
    content:
      'Green Emerald Mobility Apps ("GEMA", "kami", "milik kami") berkomitmen untuk melindungi '
        + 'data pribadi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, '
        + 'menggunakan, menyimpan, dan melindungi data pribadi Anda sesuai dengan Undang-Undang '
        + 'Perlindungan Data Pribadi (UU PDP) No. 27 Tahun 2022 dan peraturan perundang-undangan '
        + 'terkait lainnya di Indonesia.\n\n'
        + 'Dengan menggunakan aplikasi GEMA, Anda menyetujui praktik pengumpulan dan penggunaan '
        + 'data yang dijelaskan dalam Kebijakan Privasi ini.',
  },
  {
    num: 2,
    title: 'Data yang Dikumpulkan',
    content:
      'Kami mengumpulkan data berikut:\n\n'
        + 'a. Data Identitas — nama lengkap, alamat email, nomor telepon, alamat domisili.\n'
        + 'b. Data Verifikasi (khusus Mitra) — foto KTP, selfie verifikasi, sertifikasi keahlian.\n'
        + 'c. Data Lokasi — lokasi real-time saat Anda membuat pesanan atau menggunakan fitur berbasis lokasi.\n'
        + 'd. Data Perangkat — jenis perangkat, sistem operasi, IP address, browser yang digunakan.\n'
        + 'e. Data Transaksi — riwayat pesanan, riwayat top up dan penarikan GemaPay, metode pembayaran.\n'
        + 'f. Data Komunikasi — riwayat chat dengan Mitra atau Pelanggan melalui fitur pesan dalam aplikasi.\n'
        + 'g. Data Penggunaan — halaman yang dikunjungi, fitur yang digunakan, durasi sesi.',
  },
  {
    num: 3,
    title: 'Cara Pengumpulan Data',
    content:
      'Kami mengumpulkan data Anda melalui:\n\n'
        + 'a. Pendaftaran Akun — data yang Anda berikan saat mendaftar dan melengkapi profil.\n'
        + 'b. Upload Dokumen — KTP, selfie, dan sertifikasi yang Anda unggah untuk verifikasi.\n'
        + 'c. Data Lokasi — izin lokasi perangkat Anda (dapat diatur melalui pengaturan perangkat).\n'
        + 'd. Penggunaan Aplikasi — data yang dikumpulkan secara otomatis saat Anda menggunakan GEMA.\n'
        + 'e. Komunikasi — pesan yang Anda kirim dan terima melalui fitur chat aplikasi.\n'
        + 'f. Cookie dan Teknologi Serupa — seperti yang dijelaskan dalam Pasal 9 Kebijakan ini.',
  },
  {
    num: 4,
    title: 'Dasar Pemrosesan Data',
    content:
      'Kami memproses data pribadi Anda berdasarkan:\n\n'
        + 'a. Persetujuan (Consent) — Anda memberikan persetujuan eksplisit saat mendaftar dan '
        + 'menyetujui Kebijakan Privasi ini.\n'
        + 'b. Kontrak — pemrosesan data diperlukan untuk memenuhi kewajiban kontraktual, '
        + 'termasuk memproses pesanan dan pembayaran.\n'
        + 'c. Kewajiban Hukum — pemrosesan data untuk memenuhi kewajiban perpajakan, '
        + 'pencegahan pencucian uang, dan kepatuhan hukum lainnya.',
  },
  {
    num: 5,
    title: 'Tujuan Penggunaan Data',
    content:
      'Data pribadi Anda digunakan untuk:\n\n'
        + 'a. Memproses pendaftaran dan verifikasi akun Anda.\n'
        + 'b. Memfasilitasi pemesanan layanan dan menghubungkan Anda dengan Mitra atau Pelanggan.\n'
        + 'c. Memproses pembayaran melalui mitra pembayaran kami, Xendit.\n'
        + 'd. Mengirimkan notifikasi terkait pesanan, promo, dan pembaruan aplikasi.\n'
        + 'e. Melakukan verifikasi Mitra untuk menjaga keamanan dan kualitas layanan.\n'
        + 'f. Mendeteksi dan mencegah kecurangan (fraud detection).\n'
        + 'g. Menganalisis penggunaan aplikasi untuk meningkatkan kualitas layanan.',
  },
  {
    num: 6,
    title: 'Pembagian Data',
    content:
      'Kami tidak menjual data pribadi Anda kepada pihak ketiga. Data Anda dapat kami bagikan '
        + 'kepada:\n\n'
        + 'a. Mitra — nama dan lokasi Anda akan terlihat oleh Mitra saat Anda membuat pesanan. '
        + 'Sebaliknya, nama dan profil Mitra akan terlihat oleh Anda.\n'
        + 'b. Xendit — data pembayaran Anda dibagikan dengan Xendit untuk memproses transaksi.\n'
        + 'c. Pihak Berwajib — apabila diwajibkan oleh hukum atau peraturan yang berlaku.\n'
        + 'd. Penyedia Layanan — mitra teknologi yang membantu operasional aplikasi (hosting, '
        + 'analytics) dengan ikatan kerahasiaan yang ketat.',
  },
  {
    num: 7,
    title: 'Penyimpanan & Keamanan Data',
    content:
      '7.1 Data pribadi Anda disimpan secara aman di server Supabase yang berlokasi di AWS (Amazon Web Services) '
        + 'dengan enkripsi TLS untuk melindungi data selama transmisi.\n\n'
        + '7.2 Kami menerapkan langkah-langkah keamanan teknis dan organisasi yang memadai, termasuk '
        + 'akses terbatas oleh staf yang berwenang, enkripsi data, dan pemantauan keamanan berkala.\n\n'
        + '7.3 Data pribadi Anda akan disimpan selama akun Anda aktif, dan maksimal 5 (lima) tahun '
        + 'setelah akun dinonaktifkan, sesuai dengan ketentuan UU PDP. Setelah itu, data akan dihapus '
        + 'atau dianonimkan secara permanen.',
  },
  {
    num: 8,
    title: 'Hak Pengguna',
    content:
      'Berdasarkan UU PDP, Anda memiliki hak-hak berikut:\n\n'
        + 'a. Hak Akses — meminta informasi tentang data pribadi yang kami miliki.\n'
        + 'b. Hak Koreksi — meminta perbaikan data yang tidak akurat atau tidak lengkap.\n'
        + 'c. Hak Hapus — meminta penghapusan data pribadi Anda (hak untuk dilupakan).\n'
        + 'd. Hak Batasi Pemrosesan — meminta pembatasan pemrosesan data Anda.\n'
        + 'e. Hak Portabilitas — meminta salinan data Anda dalam format yang dapat dibaca mesin.\n'
        + 'f. Hak Cabut Persetujuan — mencabut persetujuan pemrosesan data kapan saja.\n\n'
        + 'Untuk menjalankan hak-hak di atas, silakan buka Pengaturan Akun di aplikasi atau '
        + 'hubungi kami melalui kontak yang tercantum pada Pasal 11.',
  },
  {
    num: 9,
    title: 'Cookie & Tracking',
    content:
      '9.1 Kami menggunakan cookie dan teknologi pelacakan serupa untuk:\n'
        + '- Menjaga sesi login Anda (cookie wajib).\n'
        + '- Menganalisis penggunaan aplikasi untuk perbaikan layanan (cookie analytics).\n\n'
        + '9.2 Cookie wajib diperlukan untuk fungsionalitas dasar aplikasi dan tidak dapat dinonaktifkan.\n\n'
        + '9.3 Cookie analytics bersifat opsional. Anda dapat menonaktifkannya melalui pengaturan '
        + 'perangkat atau browser Anda.\n\n'
        + '9.4 Kami tidak menggunakan cookie untuk pelacakan iklan lintas-situs (cross-site tracking).',
  },
  {
    num: 10,
    title: 'Perubahan Kebijakan',
    content:
      '10.1 GEMA dapat mengubah Kebijakan Privasi ini sewaktu-waktu. Perubahan akan diberitahukan '
        + 'kepada Anda melalui notifikasi dalam aplikasi.\n\n'
        + '10.2 Perubahan akan berlaku 14 (empat belas) hari setelah pemberitahuan. Dengan terus '
        + 'menggunakan aplikasi setelah perubahan berlaku, Anda dianggap menyetujui perubahan tersebut.',
  },
  {
    num: 11,
    title: 'Kontak & Data Protection Officer',
    content:
      'Apabila Anda memiliki pertanyaan, keluhan, atau ingin menjalankan hak Anda terkait data pribadi, '
        + 'silakan hubungi Data Protection Officer (DPO) kami:\n\n'
        + 'Email DPO: dpo@gema.app\n'
        + 'Email Dukungan: support@gema.app\n'
        + 'WhatsApp: +62-xxx-xxxx-xxxx\n'
        + 'Alamat: [Alamat Kantor Green Emerald Mobility Apps]\n\n'
        + 'Kami akan merespons permintaan Anda dalam waktu 1×24 jam pada hari kerja.',
  },
];

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="relative flex flex-col min-h-screen bg-gray-50 pb-safe overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-100 rounded-full opacity-40 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-emerald-50 rounded-full opacity-60 blur-3xl" />
      </div>

      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-gray-100 px-4 py-3 flex items-center justify-center">
        <button
          onClick={() => router.back()}
          className="absolute left-4 w-10 h-10 rounded-full flex items-center justify-center text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer"
          aria-label="Kembali"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-heading text-lg font-bold text-emerald-700 tracking-[0.15em]">GEMA</h1>
      </header>

      <div className="relative flex-1 p-6 z-10">
        <div className="mb-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-md shadow-emerald-200">
            <ShieldCheck size={28} className="text-white" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-gray-900 mb-1">Kebijakan Privasi</h1>
          <p className="text-sm text-gray-500">Bagaimana GEMA melindungi data pribadi Anda</p>
        </div>

        <div className="space-y-3 max-w-2xl mx-auto">
          {sections.map((section) => (
            <Card key={section.num} className="rounded-2xl border border-gray-100 bg-white shadow-sm">
              <CardContent className="px-5 py-4">
                <h2 className="font-heading text-base font-bold text-emerald-700 mb-2">
                  Pasal {section.num}: {section.title}
                </h2>
                <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center pb-6">
          <p className="text-xs text-gray-400">
            Terakhir diperbarui: Mei 2026
          </p>
        </div>
      </div>
    </div>
  );
}
