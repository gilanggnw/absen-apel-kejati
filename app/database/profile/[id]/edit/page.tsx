'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import NextImage from 'next/image';
import { getEmployeeById, updateEmployee, type UpdateEmployeeData, type DatabaseEmployee } from '../../../actions';
import Sidebar from '../../../../components/Sidebar';
import Header from '../../../../components/Header';

// --- Main Edit Page Component ---
const EditEmployeePage = () => {
    const router = useRouter();
    const params = useParams();
    const employeeId = params.id as string;
    
    const [employee, setEmployee] = useState<DatabaseEmployee | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<UpdateEmployeeData>({
        nama: '',
        jabatan: '',
        pangkat: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [photoPreview, setPhotoPreview] = useState<string>('');
    const [photoBase64, setPhotoBase64] = useState<string>('');
    const [photoDeleted, setPhotoDeleted] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch employee data
    useEffect(() => {
        const fetchEmployee = async () => {
            if (employeeId) {
                setLoading(true);
                try {
                    const data = await getEmployeeById(parseInt(employeeId));
                    if (data) {
                        setEmployee(data);
                        setFormData({
                            nama: data.nama,
                            jabatan: data.jabatan || '',
                            pangkat: data.pangkat || '',
                        });
                        // Set photo preview if exists
                        if (data.foto) {
                            // foto is already a base64 data URL from the server
                            setPhotoPreview(data.foto);
                        }
                    }
                } catch (error) {
                    console.error('Failed to fetch employee:', error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchEmployee();
    }, [employeeId]);

    // Validation function
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.nama.trim()) {
            newErrors.nama = 'Nama wajib diisi';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle photo file selection
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoDeleted(false);
            
            // Create preview and store base64
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                setPhotoPreview(result);
                setPhotoBase64(result); // Store base64 for server submission
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle photo deletion
    const handleDeletePhoto = () => {
        setPhotoPreview('');
        setPhotoBase64('');
        setPhotoDeleted(true);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setSaving(true);
        try {
            const updateData: UpdateEmployeeData = { ...formData };
            
            // Handle photo updates
            if (photoBase64) {
                updateData.foto = photoBase64; // Send base64 string
            } else if (photoDeleted) {
                updateData.foto = null;
            }
            
            const success = await updateEmployee(parseInt(employeeId), updateData);
            if (success) {
                router.push(`/database/profile/${employeeId}`);
            } else {
                alert('Gagal memperbarui data pegawai');
            }
        } catch (error) {
            console.error('Failed to update employee:', error);
            alert('Terjadi kesalahan saat memperbarui data');
        } finally {
            setSaving(false);
        }
    };

    // Handle input changes
    const handleInputChange = (field: keyof UpdateEmployeeData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col font-sans">
                <Header />
                <div className="flex flex-1">
                    <Sidebar />
                    <main className="flex-1 p-8">
                        <div className="flex justify-center items-center h-64">
                            <div className="text-xl text-gray-600">Loading...</div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col font-sans">
                <Header />
                <div className="flex flex-1">
                    <Sidebar />
                    <main className="flex-1 p-8">
                        <div className="flex justify-center items-center h-64">
                            <div className="text-xl text-red-600">Employee not found</div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col font-sans">
            <Header />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 p-8">
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                            <button
                                onClick={() => router.push(`/database/profile/${employeeId}`)}
                                className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg shadow hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
                            >
                                ← Kembali ke Profile
                            </button>
                        </div>

                        <h1 className="text-2xl font-bold mb-6">Edit Data Pegawai</h1>

                        {/* Form */}
                        <div className="bg-white p-8 rounded-xl shadow-lg border">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Nama */}
                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                                        Nama Pegawai <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nama}
                                        onChange={(e) => handleInputChange('nama', e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition text-black placeholder:text-gray-400 ${
                                            errors.nama 
                                                ? 'border-red-500 focus:ring-red-500' 
                                                : 'border-gray-300 focus:ring-blue-500'
                                        }`}
                                        placeholder="Masukkan nama pegawai"
                                    />
                                    {errors.nama && <p className="text-red-500 text-sm mt-1">{errors.nama}</p>}
                                </div>

                                {/* NIP - Read Only */}
                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                                        NIP
                                    </label>
                                    <input
                                        type="text"
                                        value={employee?.nip || ''}
                                        readOnly
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 font-mono cursor-not-allowed"
                                        placeholder="NIP tidak dapat diubah"
                                    />
                                    <p className="text-gray-500 text-xs mt-1">NIP tidak dapat diubah setelah data dibuat</p>
                                </div>

                                {/* Photo Section */}
                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                                        Foto Pegawai
                                    </label>
                                    <div className="flex items-start gap-4">
                                        {/* Photo Preview */}
                                        <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                                            {photoPreview ? (
                                                <NextImage
                                                    src={photoPreview}
                                                    alt="Preview"
                                                    width={128}
                                                    height={128}
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                            ) : (
                                                <div className="text-center text-gray-400">
                                                    <div className="text-3xl mb-1">📷</div>
                                                    <div className="text-xs">Tidak ada foto</div>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Photo Controls */}
                                        <div className="flex-1 space-y-2">
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handlePhotoChange}
                                                className="hidden"
                                            />
                                            <div className="space-y-2">
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                                >
                                                    {photoPreview ? 'Ganti Foto' : 'Upload Foto'}
                                                </button>
                                                {photoPreview && (
                                                    <button
                                                        type="button"
                                                        onClick={handleDeletePhoto}
                                                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                                                    >
                                                        Hapus Foto
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                Format: JPG, PNG, maksimal 2MB
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Jabatan */}
                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                                        Jabatan
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.jabatan}
                                        onChange={(e) => handleInputChange('jabatan', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-black placeholder:text-gray-400"
                                        placeholder="Masukkan jabatan"
                                    />
                                </div>

                                {/* Pangkat */}
                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                                        Pangkat
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.pangkat}
                                        onChange={(e) => handleInputChange('pangkat', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-black placeholder:text-gray-400"
                                        placeholder="Masukkan pangkat"
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => router.push(`/database/profile/${employeeId}`)}
                                        className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className={`px-6 py-3 rounded-lg font-semibold focus:outline-none focus:ring-2 transition ${
                                            saving
                                                ? 'bg-blue-400 text-white cursor-not-allowed'
                                                : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                                        }`}
                                    >
                                        {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default EditEmployeePage;
