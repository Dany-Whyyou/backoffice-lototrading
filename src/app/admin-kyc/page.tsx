'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { getStoredUser, getKycStatus } from '@/lib/auth';
import { ShieldCheck, Upload, Camera, Loader2, CheckCircle, Clock, XCircle } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function AdminKycPage() {
  const router = useRouter();
  const user = getStoredUser();
  const kycStatus = getKycStatus();

  const [document, setDocument] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!document || !selfie) {
      setError('Veuillez fournir votre piece d\'identite et un selfie.');
      return;
    }

    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('document', document);
      formData.append('selfie', selfie);

      await api.post('/admin/kyc/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      localStorage.setItem('admin_kyc_status', 'under_review');
      localStorage.setItem('admin_kyc_required', '1');
      setSuccess(true);
    } catch {
      setError('Erreur lors de l\'envoi. Veuillez reessayer.');
    } finally {
      setUploading(false);
    }
  };

  // Already under review
  if (kycStatus === 'under_review' || success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg text-center">
          <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Verification en cours</h1>
          <p className="text-sm text-gray-500 mb-6">
            Vos documents ont ete soumis avec succes. Un superviseur va examiner votre dossier.
            Vous serez notifie des que votre compte sera active.
          </p>
          <p className="text-xs text-gray-400 mb-4">
            Connecte en tant que: <strong>{user?.name}</strong> ({user?.role})
          </p>
          <button
            onClick={() => {
              localStorage.removeItem('admin_token');
              localStorage.removeItem('admin_user');
              localStorage.removeItem('admin_kyc_required');
              localStorage.removeItem('admin_kyc_status');
              router.push('/login');
            }}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Se deconnecter
          </button>
        </div>
      </div>
    );
  }

  // Rejected - can resubmit
  if (kycStatus === 'rejected') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
          <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2 text-center">Verification refusee</h1>
          <p className="text-sm text-gray-500 mb-6 text-center">
            Votre verification a ete refusee. Veuillez soumettre de nouveaux documents.
          </p>
          {renderUploadForm()}
        </div>
      </div>
    );
  }

  // Pending KYC - first time
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <div className="mx-auto w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
          <ShieldCheck className="h-8 w-8 text-indigo-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2 text-center">Verification d&apos;identite</h1>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Pour acceder a votre espace, veuillez fournir une piece d&apos;identite et un selfie.
        </p>
        {renderUploadForm()}
      </div>
    </div>
  );

  function renderUploadForm() {
    return (
      <div className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        {/* Document upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Piece d&apos;identite</label>
          <label className="flex items-center gap-3 rounded-lg border-2 border-dashed border-gray-300 p-4 cursor-pointer hover:border-blue-400 transition-colors">
            <Upload className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-500">
              {document ? document.name : 'Choisir un fichier...'}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setDocument(e.target.files?.[0] || null)}
            />
          </label>
        </div>

        {/* Selfie upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Selfie</label>
          <label className="flex items-center gap-3 rounded-lg border-2 border-dashed border-gray-300 p-4 cursor-pointer hover:border-blue-400 transition-colors">
            <Camera className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-500">
              {selfie ? selfie.name : 'Prendre ou choisir un selfie...'}
            </span>
            <input
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={(e) => setSelfie(e.target.files?.[0] || null)}
            />
          </label>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={uploading || !document || !selfie}
          className="w-full"
        >
          {uploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {uploading ? 'Envoi en cours...' : 'Soumettre mes documents'}
        </Button>
      </div>
    );
  }
}
