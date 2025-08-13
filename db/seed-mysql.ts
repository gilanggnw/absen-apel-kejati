import 'dotenv/config';
import { db } from './mysql';
import { usersTable, employeesTable, attendanceTable, accountsTable, sessionsTable } from './schema-mysql';

// Clean up all tables in correct order (respecting foreign key constraints)
export async function cleanupDatabase() {
  try {
    console.log('🗑️ Cleaning up database...');
    
    // Delete in reverse dependency order
    console.log('  - Clearing attendance records...');
    await db.delete(attendanceTable);
    
    console.log('  - Clearing auth sessions...');
    await db.delete(sessionsTable);
    
    console.log('  - Clearing auth accounts...');
    await db.delete(accountsTable);
    
    console.log('  - Clearing users...');
    await db.delete(usersTable);
    
    console.log('  - Clearing employees...');
    await db.delete(employeesTable);
    
    console.log('✅ Database cleanup completed');
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
    throw error;
  }
}

export async function seedUsers() {
  try {
    console.log('🌱 Starting to seed users...');
    
    const users = [
      { 
        name: 'Super Admin Kejati', 
        email: 'admin@kejati.go.id', 
        password: 'super123', 
        role: 'superadmin' 
      },
      { 
        name: 'Admin Verifikasi', 
        email: 'verif@kejati.go.id', 
        password: 'verif123', 
        role: 'adminverif' 
      },
      { 
        name: 'Absensi', 
        email: 'absensi@kejati.go.id', 
        password: 'absensi123', 
        role: 'user' 
      },
    ];

    await db.insert(usersTable).values(users);
    console.log(`✅ Successfully created ${users.length} users`);
  } catch (error) {
    console.error('❌ Error seeding users:', error);
  }
}

// Employee data from CSV
const employeeData = [
  { 
    nip: '197702152000032001', 
    nama: 'SILVIA DESTY ROSALINA, S.H., M.H.', 
    jabatan: 'Asisten Pembinaan', 
    pangkat: 'IV/b (Jaksa Utama Pratama)',
    status: 'aktif'
  },
  { 
    nip: '196606271991032001', 
    nama: 'YUNIARTI SETYORINI SARDJAN, S.H.', 
    jabatan: 'Jaksa Fungsional', 
    pangkat: 'IV/c (Jaksa Utama Muda)',
    status: 'aktif'
  },
  { 
    nip: '197005061996032005', 
    nama: 'ADE ELVI TRISNAWATI, S.H.', 
    jabatan: 'Jaksa Fungsional', 
    pangkat: 'IV/c (Jaksa Utama Muda)',
    status: 'aktif'
  },
  { 
    nip: '196711081990032002', 
    nama: 'TYAS PRABHAWATI, S.H.', 
    jabatan: 'Jaksa Fungsional', 
    pangkat: 'IV/c (Jaksa Utama Muda)',
    status: 'aktif'
  },
  { 
    nip: '197011141996032001', 
    nama: 'NOOR AFIFA, S.H.', 
    jabatan: 'Jaksa Fungsional', 
    pangkat: 'IV/c (Jaksa Utama Muda)',
    status: 'aktif'
  },
  { 
    nip: '197111221997032005', 
    nama: 'FANITA KURNIATI, S.H.', 
    jabatan: 'Jaksa Fungsional', 
    pangkat: 'IV/b (Jaksa Utama Pratama)',
    status: 'aktif'
  },
  { 
    nip: '196308111989031002', 
    nama: 'AGUSTINUS WIJONO DOSOSEPUTRO, S.H.', 
    jabatan: 'Jaksa Fungsional', 
    pangkat: 'IV/b (Jaksa Utama Pratama)',
    status: 'aktif'
  },
  { 
    nip: '196306081985021001', 
    nama: 'TRIYONO, S.H.', 
    jabatan: 'Jaksa Fungsional', 
    pangkat: 'IV/a (Jaksa Madya)',
    status: 'aktif'
  },
  { 
    nip: '196908041994032002', 
    nama: 'DWI RINI PUSPITA, S.H.', 
    jabatan: 'Pengelola Penanganan Perkara', 
    pangkat: 'III/d (Sena Wira)',
    status: 'aktif'
  },
  { 
    nip: '199802012022032002', 
    nama: 'DIAH AYU FITRIYANI, S.M.', 
    jabatan: 'Fungsional Perencana Ahli Pertama', 
    pangkat: 'III/a (Yuana Wira)',
    status: 'aktif'
  },
  { 
    nip: '199004132020121015', 
    nama: 'DAVID NURHADI KUSUMA', 
    jabatan: 'Pengadministrasi Perkantoran', 
    pangkat: 'II/b (Muda Darma)',
    status: 'aktif'
  },
  { 
    nip: '197308241993031001', 
    nama: 'SYAIFUL ANAM, S.H., M.Hum.', 
    jabatan: 'Kepala Sub Bagian Kepegawaian', 
    pangkat: 'IV/a (Jaksa Madya)',
    status: 'aktif'
  },
  { 
    nip: '196710251989031001', 
    nama: 'SUTIS, S.H.', 
    jabatan: 'Kepala Urusan Kepangkatan Dan Mutasi Pegawai', 
    pangkat: 'III/c (Madya Wira TU)',
    status: 'aktif'
  },
  { 
    nip: '197705282000032001', 
    nama: 'IDA NINGRUM, S.H.', 
    jabatan: 'Kepala Urusan Pengembangan dan Kesejahteraan Pegawai', 
    pangkat: 'III/c (Madya Wira TU)',
    status: 'aktif'
  },
  { 
    nip: '198107202005012008', 
    nama: 'LUCIA MAYA CONDESSA, S.H.', 
    jabatan: 'Penelaah Teknis Kebijakan', 
    pangkat: 'III/d (Sena Wira)',
    status: 'aktif'
  },
  { 
    nip: '198604242008122001', 
    nama: 'REZKI HAYATUL ISMA, S.H., M.M.', 
    jabatan: 'Penelaah Teknis Kebijakan', 
    pangkat: 'III/c (Madya Wira)',
    status: 'aktif'
  },
  { 
    nip: '198501202009122002', 
    nama: 'WIDA TANIA RACHMAWATI, S.Kom., M.M', 
    jabatan: 'Penelaah Teknis Kebijakan', 
    pangkat: 'III/c (Madya Wira)',
    status: 'aktif'
  },
  { 
    nip: '197508062005011010', 
    nama: 'JONI PURNOMO', 
    jabatan: 'Pengelola Penanganan Perkara', 
    pangkat: 'III/b Muda Wira',
    status: 'aktif'
  },
  { 
    nip: '199604152020121015', 
    nama: 'ARYA PUTRA KURNIAWAN, S.Kom', 
    jabatan: 'Fungsional Pranata Komputer Ahli Pertama', 
    pangkat: 'III/b Muda Wira',
    status: 'aktif'
  },
  { 
    nip: '199207192020121017', 
    nama: 'RENDY NUGROHO', 
    jabatan: 'Penjaga Tahanan ', 
    pangkat: 'II/b (Muda Darma)',
    status: 'aktif'
  },
  { 
    nip: '199512242025051001', 
    nama: 'FAJAR SETYA KURNIAWAN, S.M.', 
    jabatan: 'Fungsional Analis Sumber Daya Manusia Keahlian', 
    pangkat: 'III/a (Yuana Wira)',
    status: 'aktif'
  },
  { 
    nip: '200104072025052008', 
    nama: 'PUTRI AMALIA ALFIANA, S.M.', 
    jabatan: 'Fungsional Analis Sumber Daya Manusia Keahlian', 
    pangkat: 'III/a (Yuana Wira)',
    status: 'aktif'
  },
  { 
    nip: '196910011998032008', 
    nama: 'NURYANI', 
    jabatan: 'Pengelola Penanganan Perkara', 
    pangkat: 'III/b (Muda Wira)',
    status: 'aktif'
  },
  { 
    nip: '198002012005011007', 
    nama: 'TAUFIQUL HAKIM, A.Md.', 
    jabatan: 'Kaur Anggaran, Perjalanan, Perbendaharaan, dan Pendapatan dan  Piutang Negara', 
    pangkat: 'III/c (Madya Wira)',
    status: 'aktif'
  },
  { 
    nip: '198403292008121001', 
    nama: 'DHANY ANDRIE WARDIANTO, S.Kom.', 
    jabatan: 'Kaur Akuntansi dan Pelapora', 
    pangkat: 'III/c (Madya Wira)',
    status: 'aktif'
  },
  { 
    nip: '198408042008122004', 
    nama: 'AGUSTINA PENY YUNIASTRI, A.Md.', 
    jabatan: 'Penelaah Teknis Kebijakan', 
    pangkat: 'III/b (Muda Wira)',
    status: 'aktif'
  },
  { 
    nip: '197107032000031003', 
    nama: 'DAUD, S.H.', 
    jabatan: 'Fungsional Pranata Keuangan Anggaran Pendapatan Dan Belanja Negara Penyelia', 
    pangkat: 'III/c (Madya Wira)',
    status: 'aktif'
  },
  { 
    nip: '198509142005012002', 
    nama: 'MURNI HARMUNTARI, S.H.', 
    jabatan: 'Fungsional Analis Pengelolaan Keuangan Anggaran Pendapatan dan Belanja Negara Pertama ', 
    pangkat: 'III/c (Madya Wira)',
    status: 'aktif'
  },
  { 
    nip: '198709162010122002', 
    nama: 'CHRISTINA SEPTY LUKITASARI KERONG, SE.,M.M.', 
    jabatan: 'Fungsional Pranata Keuangan APBN Penyelia', 
    pangkat: 'III/c (Madya Wira)',
    status: 'aktif'
  },
  { 
    nip: '199806262022032004', 
    nama: 'RIRIN MAULIDIANI, A.Md.Ak.', 
    jabatan: 'Auditor Pelaksana Lanjutan ', 
    pangkat: 'II/c (Madya Darma)',
    status: 'aktif'
  },
  { 
    nip: '199808162025051005', 
    nama: 'RIKO AGUS PRAMONO, S.Ak.', 
    jabatan: 'Analis Pengelola Keuangan APBN Keahlian', 
    pangkat: 'III/a (Yuana Wira)',
    status: 'aktif'
  },
  { 
    nip: '197711082005011002', 
    nama: 'NOVIAR BAYU HARLITUNDRA, S.H.,M.Kn', 
    jabatan: 'Kepala Sub Bagian Umum', 
    pangkat: 'III/d (Sena Wira)',
    status: 'aktif'
  },
  { 
    nip: '198704092006041002', 
    nama: 'ANDRIAWAN, S.H., M.Kn.', 
    jabatan: 'Kepala Urusan Kaur Perlengkapan dan BMN', 
    pangkat: 'III/c (Madya Wira)',
    status: 'aktif'
  },
  { 
    nip: '198505032008121001', 
    nama: 'MOCHAMAD BAGUS KURNIAWAN, S.E.', 
    jabatan: 'Kaur Rumah Tangga, Sarana Prasarana, dan Kearsipan', 
    pangkat: 'III/c (Madya Wira)',
    status: 'aktif'
  },
  { 
    nip: '198507042008122001', 
    nama: 'SUCI RAHMANIA, A.Md.', 
    jabatan: 'Penyusun Kebutuhan Barang Inventaris', 
    pangkat: 'III/b (Muda Wira)',
    status: 'aktif'
  },
  { 
    nip: '198603152009122001', 
    nama: 'DANAMUNDI LAGAMINDO, S.E.', 
    jabatan: 'Pengadministrasi BMN', 
    pangkat: 'III/b (Muda Wira)',
    status: 'aktif'
  },
  { 
    nip: '199506302022032005', 
    nama: 'ISABELLA RUTH, S.T', 
    jabatan: 'Fungsional Penilai Pemerintah Pertama', 
    pangkat: 'III/a (Yuana Wira)',
    status: 'aktif'
  },
  { 
    nip: '200203202025052003', 
    nama: 'NAFACHATUS SHACHARIYAH, S.Akun.', 
    jabatan: 'Pengelola Pengadaan Barang/Jasa Keahlian', 
    pangkat: 'III/a (Yuana Wira)',
    status: 'aktif'
  },
  { 
    nip: '196808141994031003', 
    nama: 'MOH NURSOLIKIN', 
    jabatan: 'Kepala Sub Bagian Daskrimti dan Perpustakaan', 
    pangkat: 'III/d (Sena Wira TU)',
    status: 'aktif'
  },
  { 
    nip: '198511252010121001', 
    nama: 'MUHAMMAD SHOLEHUDIN, S.Kom., M.M.', 
    jabatan: 'Kaur Daskrimti dan Teknologi Informasi', 
    pangkat: 'III/c (Madya Wira)',
    status: 'aktif'
  },
  { 
    nip: '198501172008122001', 
    nama: 'BUNGA PRIANA LARASATI, S.Kom', 
    jabatan: 'Kaur Perpustakaan dan Dokumentasi Hukum', 
    pangkat: 'III/c (Madya Wira)',
    status: 'aktif'
  },
  { 
    nip: '198707242014031003', 
    nama: 'ANGGER WICAKSONO, S.Kom.', 
    jabatan: 'Pengelola Penanganan Perkara', 
    pangkat: 'III/a (Yuana Wira)',
    status: 'aktif'
  },
  { 
    nip: '200001042022032003', 
    nama: 'PRINSISLAMSHEENY BRILLIANTDIANTY EBELARISTRA, S.Kom.', 
    jabatan: 'Fungsional Pranata Komputer Pertama', 
    pangkat: 'III/b (Muda Wira)',
    status: 'aktif'
  },
  { 
    nip: '200107102025052007', 
    nama: 'SAFITA SEKAR PERTIWI, S.IIP.', 
    jabatan: 'Pustakawan Keahlian', 
    pangkat: 'III/a (Yuana Wira)',
    status: 'aktif'
  },
  { 
    nip: '198405122009122002', 
    nama: 'FRIZKANA MEILIA, S.E.,M.A.', 
    jabatan: 'Kepala Sub Bagian Perencanaan', 
    pangkat: 'III/d (Sena Wira)',
    status: 'aktif'
  },
  { 
    nip: '199105212010121001', 
    nama: 'ERWIN CHRISTIONO, S.H.', 
    jabatan: 'Penelaah Teknis Kebijakan', 
    pangkat: 'III/a (Yuana Wira)',
    status: 'aktif'
  },
  { 
    nip: '198710242014031002', 
    nama: 'RENDY BRIAN FIRNANTA, A.Md.', 
    jabatan: 'Pengelola Penanganan Perkara', 
    pangkat: 'III/a (Yuana Wira)',
    status: 'aktif'
  },
  { 
    nip: '199007292015022001', 
    nama: 'RAHMAWATI WIDYA WIGUNA, A.Md.', 
    jabatan: 'Pengolah Data dan Informasi', 
    pangkat: 'III/a (Yuana Wira)',
    status: 'aktif'
  },
  { 
    nip: '199708302022032005', 
    nama: 'RADIYATAN MARDHIYAH, S.E.', 
    jabatan: 'Fungsional Perencana Ahli Pertama', 
    pangkat: 'III/a (Yuana Wira)',
    status: 'aktif'
  },
  { 
    nip: '200006022022032002', 
    nama: 'VINKANIA EKNI RISQIRANA, A.Md.', 
    jabatan: 'Auditor Pelaksana ', 
    pangkat: 'II/c (Madya Darma)',
    status: 'aktif'
  },
  { 
    nip: '199506262025052006', 
    nama: 'ETIKA BELLAWATI, S.E.', 
    jabatan: 'Perencana Keahlian', 
    pangkat: 'III/a (Yuana Wira)',
    status: 'aktif'
  },
  { 
    nip: '199805032025052002', 
    nama: 'MARIA CRISTINE, S.Ak.', 
    jabatan: 'Perencana Keahlian', 
    pangkat: 'III/a (Yuana Wira)',
    status: 'aktif'
  },
  { 
    nip: '199809072025051002', 
    nama: 'ALIF PUTRA DHARMAWAN ABIDIN, S.Ak.', 
    jabatan: 'Perencana Keahlian', 
    pangkat: 'III/a (Yuana Wira)',
    status: 'aktif'
  },
  { 
    nip: '200104062025052010', 
    nama: 'ALIFAH APRILIA ANANDA, S.Ak.', 
    jabatan: 'Perencana Keahlian', 
    pangkat: 'III/a (Yuana Wira)',
    status: 'aktif'
  },
  { 
    nip: '199103312020122021', 
    nama: 'SYARIFAH FITRIA RAMADHANI', 
    jabatan: 'Fungsional Dokter Gigi Muda', 
    pangkat: 'III/c (Madya Wira)',
    status: 'aktif'
  },
  { 
    nip: '199311302020122027', 
    nama: 'TASYA AISYAH PRATIWI MAASBA', 
    jabatan: 'Fungsional Dokter Muda', 
    pangkat: 'III/c (Madya Wira)',
    status: 'aktif'
  },
  { 
    nip: '199405202020122025', 
    nama: 'DEVINA MARTINA SWANTARA', 
    jabatan: 'Fungsional Dokter Muda', 
    pangkat: 'III/c (Madya Wira)',
    status: 'aktif'
  },
  { 
    nip: '199406232022032001', 
    nama: 'YOHANA VITA MELODY HUTAPEA', 
    jabatan: 'Fungsional Dokter Gigi Pertama', 
    pangkat: 'III/b (Muda Wira)',
    status: 'aktif'
  },
  { 
    nip: '198307202006042004', 
    nama: 'VERA ANDRIYANA, S.H.', 
    jabatan: 'Pengolah Data Administrasi Pemeriksaan', 
    pangkat: 'III/c (Madya Wira)',
    status: 'aktif'
  },
  { 
    nip: '199312172019021004', 
    nama: 'DEVA ARIF SAPUTRA, A.Md., Kep.', 
    jabatan: 'Fungsional Perawat Terampil', 
    pangkat: 'II/d (Sena Darma)',
    status: 'aktif'
  },
  { 
    nip: '199401202019022008', 
    nama: 'EMA DWI SULISTYORINI, A.Md., Keb.', 
    jabatan: 'Fungsional Bidan Terampil', 
    pangkat: 'II/d (Sena Darma)',
    status: 'aktif'
  },
  { 
    nip: '199309022020122039', 
    nama: 'RENI SEPTIANI, A.Md., Kep', 
    jabatan: 'Fungsional Perawat Terampil', 
    pangkat: 'II/d (Sena Darma)',
    status: 'aktif'
  },
  { 
    nip: '199402052020122020', 
    nama: 'FELLISIYAH KUSUMA WATI, A.Md.Far.', 
    jabatan: 'Fungsional Asisten Apoteker Terampil PEMBINAAN', 
    pangkat: 'II/d (Sena Darma)',
    status: 'aktif'
  },
  { 
    nip: '199403052020121017', 
    nama: 'TAUFIK KUROHMAN, A.Md.Kep.', 
    jabatan: 'Fungsional Perawat Terampil PEMBINAAN', 
    pangkat: 'II/d (Sena Darma)',
    status: 'aktif'
  },
  { 
    nip: '199201072025052001', 
    nama: 'ZULFA VINANTA', 
    jabatan: 'Dokter Keahlian', 
    pangkat: 'III/b (Muda Wira)',
    status: 'aktif'
  },
  { 
    nip: '199509022025052002', 
    nama: 'AYUNI DINA SAWITRI', 
    jabatan: 'Dokter Keahlian', 
    pangkat: 'III/b (Muda Wira)',
    status: 'aktif'
  },
  { 
    nip: '199710252025052007', 
    nama: 'INNANISA NUR AZMI HANAFI', 
    jabatan: 'Dokter Gigi Keahlian', 
    pangkat: 'III/b (Muda Wira)',
    status: 'aktif'
  },
  { 
    nip: '199509222025052004', 
    nama: 'ANA MAULIDA SEPTIANI, S.Farm.', 
    jabatan: 'Apoteker Keahlian', 
    pangkat: 'III/b (Muda Wira)',
    status: 'aktif'
  },
  { 
    nip: '199702252025052008', 
    nama: 'DIAN PITALOKA TUZZAHRA, A.Md.Keb.', 
    jabatan: 'Bidan Keterampilan', 
    pangkat: 'II/c (Madya Darma)',
    status: 'aktif'
  },
  { 
    nip: '200003302025052010', 
    nama: 'SHINTA CHOIRUN NISYAK, A.Md. Kes.', 
    jabatan: 'Terapis Gigi dan Mulut Keterampilan', 
    pangkat: 'II/c (Madya Darma)',
    status: 'aktif'
  },
  { 
    nip: '200005232025052003', 
    nama: 'SALFIYA NURUL ARDIYANIK, A.Md.', 
    jabatan: 'Pranata Laboratorium Kesehatan Keterampilan', 
    pangkat: 'II/c (Madya Darma)',
    status: 'aktif'
  },
  { 
    nip: '200104242025052010', 
    nama: 'KEMBANG WILUJENG PUSPITASARI, A.Md.Kep.', 
    jabatan: 'Perawat Keterampilan', 
    pangkat: 'II/c (Madya Darma)',
    status: 'aktif'
  },
  { 
    nip: '200204242025051005', 
    nama: 'SATRIO WICAKSONO, A.Md.Farm.', 
    jabatan: 'Asisten Apoteker Keterampilan', 
    pangkat: 'II/c (Madya Darma)',
    status: 'aktif'
  },
];

export async function seedEmployees() {
  try {
    console.log('🌱 Starting to seed employees table...');
    
    // Add foto field to each employee record based on their NIP
    const employeeDataWithPhotos = employeeData.map(employee => ({
      ...employee,
      foto: `${employee.nip}.jpg`
    }));
    
    await db.insert(employeesTable).values(employeeDataWithPhotos);
    console.log(`✅ Successfully inserted ${employeeDataWithPhotos.length} employees with photo filenames`);
  } catch (error) {
    console.error('❌ Error seeding employees:', error);
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  cleanupDatabase()
    .then(() => Promise.all([seedUsers(), seedEmployees()]))
    .then(() => {
      console.log('✨ Seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}
