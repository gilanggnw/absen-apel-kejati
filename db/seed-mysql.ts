import 'dotenv/config';
import { db } from './mysql';
import { usersTable, employeesTable } from './schema-mysql';

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

// Sample employees data
const employeeData = [
  { 
    nip: '198503152010011001', 
    nama: 'Budi Santoso', 
    jabatan: 'Kepala Bagian', 
    pangkat: 'Pembina Utama Muda',
    status: 'aktif'
  },
  { 
    nip: '199008202015032002', 
    nama: 'Citra Lestari', 
    jabatan: 'Staf Administrasi', 
    pangkat: 'Penata Muda',
    status: 'aktif'
  },
  { 
    nip: '198712102005011003', 
    nama: 'Dedi Firmansyah', 
    jabatan: 'Jaksa Madya', 
    pangkat: 'Pembina',
    status: 'aktif'
  },
  { 
    nip: '199205152017022004', 
    nama: 'Erni Kartini', 
    jabatan: 'Staf Keuangan', 
    pangkat: 'Penata Muda Tingkat I',
    status: 'aktif'
  },
  { 
    nip: '198801012009011005', 
    nama: 'Farid Rahman', 
    jabatan: 'Jaksa Muda', 
    pangkat: 'Penata',
    status: 'aktif'
  },
];

export async function seedEmployees() {
  try {
    console.log('🌱 Starting to seed employees table...');
    
    await db.insert(employeesTable).values(employeeData);
    console.log(`✅ Successfully inserted ${employeeData.length} employees`);
  } catch (error) {
    console.error('❌ Error seeding employees:', error);
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  Promise.all([seedUsers(), seedEmployees()])
    .then(() => {
      console.log('✨ Seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}
