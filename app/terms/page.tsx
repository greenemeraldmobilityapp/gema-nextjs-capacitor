'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Scale, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const sections = [
  {
    num: 1,
    title: 'Definisi',
    content:
      'Dalam Syarat & Ketentuan ini, istilah berikut memiliki arti sebagai berikut:\n\n'
        + 'a. GEMA — aplikasi Green Emerald Mobility Apps yang mempertemukan Pelanggan dengan Mitra penyedia jasa.\n'
        + 'b. Pelanggan — pengguna yang mencari dan memesan layanan melalui aplikasi GEMA.\n'
        + 'c. Mitra — penyedia jasa yang terdaftar dan telah melewati verifikasi di aplikasi GEMA.\n'
        + 'd. Layanan — jasa yang ditawarkan oleh Mitra dan dipesan oleh Pelanggan melalui aplikasi.\n'
        + 'e. Pesanan — permintaan layanan yang dibuat oleh Pelanggan dan diterima oleh Mitra.\n'
        + 'f. GemaPay — dompet digital dalam aplikasi yang digunakan untuk bertransaksi.\n'
        + 'g. Saldo GemaPay — jumlah dana yang tersimpan dalam akun GemaPay pengguna.\n'
        + 'h. Sistem Escrow — mekanisme penahanan dana pembayaran sampai Pesanan selesai dan dikonfirmasi.\n'
        + 'i. Biaya Layanan — komisi yang dikenakan GEMA atas setiap transaksi yang berhasil.\n'
        + 'j. Xendit — penyedia jasa pembayaran pihak ketiga yang memproses transaksi.',
  },
  {
    num: 2,
    title: 'Akun Pengguna',
    content:
      '2.1 Pengguna wajib mendaftar dengan data yang benar, lengkap, dan akurat. '
        + 'GEMA berhak meminta verifikasi tambahan termasuk verifikasi email.\n\n'
        + '2.2 Pengguna bertanggung jawab penuh atas kerahasiaan kredensial akun, termasuk password dan OTP. '
        + 'GEMA tidak bertanggung jawab atas kerugian akibat penyalahgunaan akun oleh pihak ketiga.\n\n'
        + '2.3 Setiap pengguna hanya diperbolehkan memiliki satu akun. Pembuatan akun ganda dilarang dan '
        + 'dapat mengakibatkan penonaktifan seluruh akun.\n\n'
        + '2.4 GEMA berhak menonaktifkan atau menangguhkan akun apabila terdapat indikasi pelanggaran '
        + 'terhadap ketentuan ini atau aktivitas mencurigakan.',
  },
  {
    num: 3,
    title: 'Verifikasi Mitra',
    content:
      '3.1 Calon Mitra wajib menyerahkan dokumen verifikasi yang diminta, termasuk Kartu Tanda Penduduk (KTP) '
        + 'dan sertifikasi keahlian (jika relevan), serta mengikuti proses verifikasi identitas melalui selfie.\n\n'
        + '3.2 GEMA berhak menolak atau menunda pendaftaran Mitra apabila dokumen tidak lengkap, tidak valid, '
        + 'atau terdapat indikasi pemalsuan.\n\n'
        + '3.3 Mitra wajib memperbarui data diri jika terjadi perubahan, termasuk alamat, nomor telepon, '
        + 'dan dokumen pendukung.\n\n'
        + '3.4 GEMA tidak bertanggung jawab atas kebenaran informasi yang diberikan Mitra kepada Pelanggan, '
        + 'namun akan melakukan tindakan jika terbukti terdapat pelanggaran.',
  },
  {
    num: 4,
    title: 'Layanan',
    content:
      '4.1 Pelanggan dapat mencari layanan, melihat profil Mitra, dan melakukan pemesanan melalui aplikasi.\n\n'
        + '4.2 Mitra wajib menyelesaikan layanan sesuai dengan deskripsi, harga, dan waktu yang telah disepakati '
        + 'dalam Pesanan.\n\n'
        + '4.3 Pelanggan wajib membayar sejumlah biaya yang tercantum dalam Pesanan sesuai metode pembayaran '
        + 'yang tersedia.\n\n'
        + '4.4 Setiap perubahan atau penambahan layanan di luar Pesanan awal harus disepakati kedua belah pihak '
        + 'dan dicatat melalui fitur chat atau perubahan Pesanan di aplikasi.',
  },
  {
    num: 5,
    title: 'Biaya & Pembayaran',
    content:
      '5.1 GEMA menerapkan Sistem Escrow untuk seluruh transaksi. Dana pembayaran dari Pelanggan akan ditahan '
        + 'oleh sistem sampai Pesanan selesai dan Pelanggan memberikan konfirmasi.\n\n'
        + '5.2 GEMA mengenakan Biaya Layanan (fee platform) yang akan diinformasikan sebelum Pelanggan '
        + 'melakukan pembayaran.\n\n'
        + '5.3 Pelanggan dapat melakukan pembayaran melalui berbagai metode yang tersedia, termasuk GemaPay, '
        + 'transfer bank, dan metode lain yang difasilitasi oleh Xendit.\n\n'
        + '5.4 Mitra dapat melakukan penarikan (withdraw) dana yang telah masuk ke Saldo GemaPay ke rekening '
        + 'bank yang terdaftar, dengan mematuhi ketentuan dan jadwal pencairan yang berlaku.',
  },
  {
    num: 6,
    title: 'Pembatalan',
    content:
      '6.1 Pelanggan dapat membatalkan Pesanan sebelum Mitra memulai perjalanan menuju lokasi tanpa '
        + 'dikenakan biaya.\n\n'
        + '6.2 Pembatalan setelah Mitra dalam perjalanan atau sudah di lokasi dapat dikenakan biaya '
        + 'pembatalan yang besarnya akan ditampilkan sebelum konfirmasi pembatalan.\n\n'
        + '6.3 Apabila Mitra membatalkan Pesanan secara sepihak tanpa alasan yang sah, Mitra akan '
        + 'dikenakan sanksi sesuai kebijakan GEMA yang berlaku.\n\n'
        + '6.4 GEMA berhak membatalkan Pesanan jika terdapat indikasi pelanggaran atau penipuan.',
  },
  {
    num: 7,
    title: 'Pengembalian Dana',
    content:
      '7.1 Pengembalian dana (refund) dapat diajukan oleh Pelanggan dengan alasan yang sah, seperti '
        + 'Mitra tidak hadir, layanan tidak sesuai, atau pembatalan dari pihak Mitra.\n\n'
        + '7.2 Refund akan diproses sesuai kebijakan: refund penuh apabila layanan belum dimulai, '
        + 'atau refund sebagian apabila layanan telah dimulai namun tidak sesuai.\n\n'
        + '7.3 Dana refund akan dikembalikan ke Saldo GemaPay Pelanggan dalam waktu 1×24 jam setelah '
        + 'disetujui, atau ke rekening bank asal dalam 3–7 hari kerja tergantung kebijakan Xendit.\n\n'
        + '7.4 Biaya administrasi refund dapat dikenakan sesuai kebijakan yang berlaku dan akan '
        + 'diinformasikan sebelum proses refund.',
  },
  {
    num: 8,
    title: 'Penyelesaian Pekerjaan',
    content:
      '8.1 Pelanggan wajib melakukan konfirmasi penyelesaian pekerjaan setelah Mitra menyelesaikan '
        + 'layanan dan Pelanggan puas dengan hasilnya.\n\n'
        + '8.2 Apabila Pelanggan tidak memberikan konfirmasi dalam waktu 24 jam setelah Mitra melaporkan '
        + 'penyelesaian, sistem secara otomatis akan melepaskan dana escrow kepada Mitra (auto-release).\n\n'
        + '8.3 Pelanggan yang memiliki keberatan terhadap hasil pekerjaan wajib mengajukan sengketa '
        + 'sebelum batas waktu auto-release.',
  },
  {
    num: 9,
    title: 'Sengketa',
    content:
      '9.1 Apabila terjadi perselisihan antara Pelanggan dan Mitra, para pihak dapat mengajukan sengketa '
        + 'melalui fitur Sengketa di aplikasi dalam waktu maksimal 3×24 jam setelah Penyelesaian Pekerjaan.\n\n'
        + '9.2 GEMA akan bertindak sebagai mediator dengan mempertimbangkan bukti yang diajukan kedua belah '
        + 'pihak, termasuk foto, tangkapan layar chat, dan bukti pendukung lainnya.\n\n'
        + '9.3 Keputusan GEMA dalam penyelesaian sengketa bersifat final dan mengikat kedua belah pihak.\n\n'
        + '9.4 GEMA berhak menggunakan sistem deteksi kecurangan (fraud detection) untuk menganalisis '
        + 'pola transaksi mencurigakan dan mengambil tindakan yang diperlukan.',
  },
  {
    num: 10,
    title: 'Ulasan & Rating',
    content:
      '10.1 Pelanggan dapat memberikan ulasan dan rating atas layanan yang telah selesai.\n\n'
        + '10.2 Ulasan harus bersifat jujur, objektif, dan tidak mengandung unsur pelecehan, fitnah, '
        + 'atau informasi palsu.\n\n'
        + '10.3 Manipulasi rating, termasuk memberikan ulasan palsu atau mengatur rating secara tidak wajar, '
        + 'dilarang dan dapat dikenakan sanksi.\n\n'
        + '10.4 GEMA berhak menghapus ulasan yang melanggar ketentuan ini tanpa pemberitahuan terlebih dahulu.',
  },
  {
    num: 11,
    title: 'Dompet GemaPay',
    content:
      '11.1 Pengguna dapat melakukan top up Saldo GemaPay melalui metode pembayaran yang tersedia.\n\n'
        + '11.2 Saldo GemaPay dapat digunakan untuk membayar Pesanan, dan dapat ditarik (withdraw) ke '
        + 'rekening bank yang terdaftar dengan mematuhi ketentuan minimum saldo dan biaya administrasi.\n\n'
        + '11.3 Promo dan voucher yang tersedia di aplikasi tunduk pada syarat dan ketentuan masing-masing '
        + 'yang akan diinformasikan sebelum digunakan.\n\n'
        + '11.4 GEMA berhak membatasi saldo maksimal GemaPay sesuai kebijakan yang berlaku.\n\n'
        + '11.5 Saldo GemaPay yang tidak digunakan dalam jangka waktu tertentu dapat dikenakan '
        + 'kebijakan daluwarsa sesuai ketentuan yang berlaku.',
  },
  {
    num: 12,
    title: 'Larangan',
    content:
      'Pengguna dilarang:\n\n'
        + 'a. Melakukan kekerasan, ancaman, atau pelecehan terhadap pengguna lain.\n'
        + 'b. Melakukan penipuan atau pemalsuan data.\n'
        + 'c. Melakukan transaksi di luar platform GEMA (TOPI) untuk menghindari Biaya Layanan.\n'
        + 'd. Menyalahgunakan promo, voucher, atau program insentif lainnya.\n'
        + 'e. Menyebarkan spam, konten tidak pantas, atau informasi yang melanggar hukum.\n'
        + 'f. Menggunakan aplikasi untuk tujuan ilegal atau melanggar peraturan perundang-undangan.\n'
        + 'g. Melakukan peretasan, reverse engineering, atau mengganggu keamanan sistem GEMA.',
  },
  {
    num: 13,
    title: 'Kekayaan Intelektual',
    content:
      '13.1 Seluruh merek dagang, logo, nama aplikasi, dan konten yang terdapat dalam aplikasi GEMA '
        + 'adalah milik Green Emerald Mobility Apps dan dilindungi oleh undang-undang hak kekayaan intelektual.\n\n'
        + '13.2 Pengguna tidak diperbolehkan menggunakan, menggandakan, memodifikasi, atau mendistribusikan '
        + 'konten GEMA tanpa izin tertulis.\n\n'
        + '13.3 Konten yang diunggah oleh pengguna (termasuk foto, ulasan, dan chat) tetap menjadi milik '
        + 'pengguna, namun pengguna memberikan lisensi kepada GEMA untuk menggunakan konten tersebut '
        + 'sehubungan dengan operasional aplikasi.',
  },
  {
    num: 14,
    title: 'Batasan Tanggung Jawab',
    content:
      '14.1 GEMA adalah platform penghubung antara Pelanggan dan Mitra. GEMA tidak menyediakan '
        + 'layanan jasa secara langsung dan tidak bertanggung jawab atas kualitas, keamanan, ketepatan '
        + 'waktu, atau hasil dari layanan yang diberikan oleh Mitra.\n\n'
        + '14.2 GEMA tidak bertanggung jawab atas kerugian yang timbul akibat force majeure, termasuk '
        + 'bencana alam, pemadaman listrik, gangguan jaringan, atau kebijakan pemerintah.\n\n'
        + '14.3 Tanggung jawab GEMA dibatasi pada nilai transaksi yang diproses melalui aplikasi.',
  },
  {
    num: 15,
    title: 'Perubahan Ketentuan',
    content:
      '15.1 GEMA dapat mengubah Syarat & Ketentuan ini sewaktu-waktu. Perubahan akan diberitahukan '
        + 'kepada pengguna melalui notifikasi dalam aplikasi dan/atau email.\n\n'
        + '15.2 Perubahan akan berlaku 14 (empat belas) hari setelah pemberitahuan. Pengguna yang tetap '
        + 'menggunakan aplikasi setelah perubahan berlaku dianggap menyetujui perubahan tersebut.',
  },
  {
    num: 16,
    title: 'Kontak',
    content:
      'Apabila Anda memiliki pertanyaan, keluhan, atau memerlukan bantuan terkait Syarat & Ketentuan ini, '
        + 'silakan hubungi kami melalui:\n\n'
        + 'Email: support@gema.app\n'
        + 'WhatsApp: +62-xxx-xxxx-xxxx\n'
        + 'Alamat: [Alamat Kantor Green Emerald Mobility Apps]',
  },
];

export default function TermsPage() {
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
            <Scale size={28} className="text-white" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-gray-900 mb-1">Syarat &amp; Ketentuan</h1>
          <p className="text-sm text-gray-500">Ketentuan penggunaan aplikasi GEMA</p>
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
