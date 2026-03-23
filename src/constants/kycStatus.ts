export const KYC_STATUS_LABELS: Record<string, string> = {
  pending_kyc: 'En attente KYC',
  under_review: 'En cours de vérification',
  approved: 'Approuvé',
  rejected: 'Refusé',
  suspended: 'Suspendu',
};

export const KYC_STATUS_COLORS: Record<string, string> = {
  pending_kyc: 'bg-gray-100 text-gray-700 ring-gray-600/20',
  under_review: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
  approved: 'bg-green-50 text-green-700 ring-green-600/20',
  rejected: 'bg-red-50 text-red-700 ring-red-600/20',
  suspended: 'bg-red-50 text-red-700 ring-red-600/20',
};

export const KYC_REJECTION_REASONS = [
  { value: 'Image floue ou illisible', label: 'Image floue ou illisible' },
  { value: 'Document expiré', label: 'Document expiré' },
  { value: 'Âge non réglementaire (moins de 18 ans)', label: 'Âge non réglementaire' },
  { value: 'Document non valide', label: 'Document non valide' },
  { value: 'Informations ne correspondent pas', label: 'Informations incorrectes' },
];
