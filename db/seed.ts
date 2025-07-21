import 'dotenv/config';
import { db } from './index';
import { employeesTable } from './schema';

const employeeData = [
  { nip: '198503152010011001', nama: 'Budi Santoso', jabatan: 'Kepala Bagian', pangkat: 'Pembina Utama Muda' },
  { nip: '199008202015032002', nama: 'Citra Lestari', jabatan: 'Staf Administrasi', pangkat: 'Penata Muda' },
  { nip: '198812012014021003', nama: 'Agus Wijaya', jabatan: 'Analis Keuangan', pangkat: 'Penata' },
  { nip: '199205102018012005', nama: 'Dewi Anggraini', jabatan: 'Staf IT', pangkat: 'Penata Muda Tk.I' },
  { nip: '198707252012061004', nama: 'Eko Prasetyo', jabatan: 'Staf Pemasaran', pangkat: 'Penata' },
  { nip: '199501302020032007', nama: 'Fitriani', jabatan: 'Staf HRD', pangkat: 'Penata Muda' },
  { nip: '198609152013011008', nama: 'Gunawan Saputra', jabatan: 'Bendahara', pangkat: 'Penata Tk.I' },
  { nip: '199203252016032009', nama: 'Hartini Sari', jabatan: 'Sekretaris', pangkat: 'Penata Muda Tk.I' },
  { nip: '198910122017021010', nama: 'Indra Kusuma', jabatan: 'Koordinator Lapangan', pangkat: 'Penata' },
  { nip: '199404182019032011', nama: 'Joko Widodo', jabatan: 'Staf Teknik', pangkat: 'Penata Muda' },
  { nip: '198805302011011012', nama: 'Kartika Dewi', jabatan: 'Analis Data', pangkat: 'Penata' },
  { nip: '199606112021032013', nama: 'Lina Marlina', jabatan: 'Staf Hukum', pangkat: 'Penata Muda' },
  { nip: '198711252014021014', nama: 'Mulyadi Rahman', jabatan: 'Supervisor', pangkat: 'Penata Tk.I' },
  { nip: '199308152018012015', nama: 'Nurul Hidayah', jabatan: 'Staf Keuangan', pangkat: 'Penata Muda Tk.I' },
  { nip: '198612302012061016', nama: 'Omar Bakri', jabatan: 'Teknisi', pangkat: 'Pengatur Tk.I' },
  { nip: '199502122020032017', nama: 'Putri Ayu', jabatan: 'Staf Umum', pangkat: 'Penata Muda' },
  { nip: '198904182016021018', nama: 'Qadri Firmansyah', jabatan: 'Koordinator Proyek', pangkat: 'Penata' },
  { nip: '199701252022032019', nama: 'Rina Susanti', jabatan: 'Staf Arsip', pangkat: 'Pengatur' },
  { nip: '198803152013011020', nama: 'Sugiyanto', jabatan: 'Driver', pangkat: 'Pengatur Tk.I' },
  { nip: '199509102019032021', nama: 'Titik Purwanti', jabatan: 'Cleaning Service', pangkat: 'Pengatur' },
  { nip: '198606252011021022', nama: 'Umar Hakim', jabatan: 'Security', pangkat: 'Pengatur Tk.I' },
  { nip: '199803182023032023', nama: 'Vera Novita', jabatan: 'Resepsionis', pangkat: 'Pengatur' },
  { nip: '198909122015011024', nama: 'Wahyu Prasetya', jabatan: 'Staf Logistik', pangkat: 'Penata Muda' },
  { nip: '199410252018032025', nama: 'Xenia Putri', jabatan: 'Staf Protokol', pangkat: 'Penata Muda' },
  { nip: '198712302014021026', nama: 'Yanto Supriyadi', jabatan: 'Maintenance', pangkat: 'Pengatur Tk.I' },
  { nip: '199605152020032027', nama: 'Zulaikha Fitri', jabatan: 'Staf Perpustakaan', pangkat: 'Pengatur' },
  { nip: '198801222012061028', nama: 'Andi Setiawan', jabatan: 'Programmer', pangkat: 'Penata' },
  { nip: '199204102017032029', nama: 'Bella Kartika', jabatan: 'Graphic Designer', pangkat: 'Penata Muda' },
  { nip: '198910182016021030', nama: 'Chandra Wijaya', jabatan: 'Database Admin', pangkat: 'Penata Muda Tk.I' },
  { nip: '199307252019032031', nama: 'Diana Sari', jabatan: 'Content Writer', pangkat: 'Penata Muda' },
  { nip: '198805122013011032', nama: 'Edi Kurniawan', jabatan: 'Network Admin', pangkat: 'Penata' },
  { nip: '199601302021032033', nama: 'Farah Diba', jabatan: 'Social Media Specialist', pangkat: 'Pengatur Tk.I' },
  { nip: '198711152014021034', nama: 'Galih Pratama', jabatan: 'Web Developer', pangkat: 'Penata Muda Tk.I' },
  { nip: '199508202018032035', nama: 'Hani Kusuma', jabatan: 'UI/UX Designer', pangkat: 'Penata Muda' },
  { nip: '198612122012061036', nama: 'Irfan Hakim', jabatan: 'System Analyst', pangkat: 'Penata' },
  { nip: '199403252017032037', nama: 'Julia Maharani', jabatan: 'Project Manager', pangkat: 'Penata Tk.I' },
  { nip: '198908302015021038', nama: 'Kevin Ananda', jabatan: 'DevOps Engineer', pangkat: 'Penata Muda Tk.I' },
  { nip: '199702152022032039', nama: 'Luna Safitri', jabatan: 'Quality Assurance', pangkat: 'Penata Muda' },
  { nip: '198804182013011040', nama: 'Mario Teguh', jabatan: 'Business Analyst', pangkat: 'Penata' },
  { nip: '199509252019032041', nama: 'Novi Rahayu', jabatan: 'Data Scientist', pangkat: 'Penata Muda Tk.I' },
  { nip: '198706122011021042', nama: 'Oscar Wijaya', jabatan: 'Mobile Developer', pangkat: 'Penata Muda' },
  { nip: '199804302023032043', nama: 'Priska Amelia', jabatan: 'Cyber Security', pangkat: 'Penata' },
  { nip: '198902152016011044', nama: 'Rizky Ramadan', jabatan: 'AI Specialist', pangkat: 'Penata Tk.I' },
  { nip: '199411102018032045', nama: 'Sinta Dewi', jabatan: 'Product Owner', pangkat: 'Penata Muda Tk.I' },
  { nip: '198807252014021046', nama: 'Tanto Wibowo', jabatan: 'Scrum Master', pangkat: 'Penata' },
  { nip: '199606182020032047', nama: 'Umi Kalsum', jabatan: 'Technical Writer', pangkat: 'Penata Muda' },
  { nip: '198703302012061048', nama: 'Victor Hugo', jabatan: 'Solutions Architect', pangkat: 'Pembina' },
  { nip: '199508152019032049', nama: 'Wulan Sari', jabatan: 'Cloud Engineer', pangkat: 'Penata Muda Tk.I' },
  { nip: '198909222015021050', nama: 'Yusuf Ibrahim', jabatan: 'Infrastructure Engineer', pangkat: 'Penata' },
  { nip: '199712302022032051', nama: 'Zahra Aulia', jabatan: 'Blockchain Developer', pangkat: 'Penata Muda' },
];

export async function seedEmployees() {
  try {
    console.log('🌱 Starting to seed employees table...');
    
    for (const employee of employeeData) {
      await db.insert(employeesTable).values(employee);
    }
    
    console.log(`✅ Successfully inserted ${employeeData.length} employees`);
  } catch (error) {
    console.error('❌ Error seeding employees:', error);
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedEmployees()
    .then(() => {
      console.log('✨ Seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}
