export const sanitizeUrl = (url) => {
  if (!url) return '';
  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();
  if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:') || lower.startsWith('blob:')) {
    return '#';
  }
  return trimmed;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';

  const parseSingleDate = (str) => {
    const trimmed = str.trim();
    const parts = trimmed.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // 0-indexed
      const year = parseInt(parts[2], 10);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        return new Date(year, month, day);
      }
    }
    const d = new Date(trimmed);
    return isNaN(d.getTime()) ? null : d;
  };

  const formatSingleDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Check if it's a range (DD/MM/YYYY - DD/MM/YYYY)
  const hasRange = dateStr.includes('-') && (dateStr.match(/\//g) || []).length > 2;

  if (hasRange) {
    const parts = dateStr.split('-');
    if (parts.length >= 2) {
      const startDate = parseSingleDate(parts[0]);
      const endDate = parseSingleDate(parts[1]);
      if (startDate && endDate) {
        if (startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()) {
          const monthStr = startDate.toLocaleDateString('en-US', { month: 'short' });
          const yearStr = startDate.getFullYear();
          return `${monthStr} ${startDate.getDate()} - ${endDate.getDate()}, ${yearStr}`;
        }
        return `${formatSingleDate(startDate)} - ${formatSingleDate(endDate)}`;
      }
    }
  }

  const singleDate = parseSingleDate(dateStr);
  if (singleDate) {
    return formatSingleDate(singleDate);
  }

  return dateStr;
};
