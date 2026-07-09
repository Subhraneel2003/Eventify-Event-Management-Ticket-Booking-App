export const formatStatus = (status) => {
  if (!status) return 'N/A';
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const getStatusColor = (status, colors) => {
  if (status === 'confirmed') return '#4CAF50';
  if (status === 'cancelled' || status === 'cancelled_by_organizer')
    return colors.danger;
  if (status === 'used') return colors.textSecondary;
  return colors.primary;
};

export const getRefundStatusColor = (refStatus, colors) => {
  switch (refStatus) {
    case 'completed':
    case 'refunded':
    case 'issued':
      return '#4CAF50';
    case 'pending':
      return '#FF9800';
    case 'failed':
      return colors.danger;
    default:
      return colors.primary;
  }
};
