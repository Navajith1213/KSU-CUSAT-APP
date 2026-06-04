// Helper functions for safe base64 UTF-8 conversion in browser
export const encodeBase64Utf8 = (str) => {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

export const decodeBase64Utf8 = (base64) => {
  const binaryString = atob(base64.replace(/\s/g, ''));
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
};

export const replaceSection = (text, start, end, replacement) => {
  const startIdx = text.indexOf(start);
  const endIdx = text.indexOf(end, startIdx);
  if (startIdx === -1 || endIdx === -1) {
    throw new Error(`Markers not found in source structure: ${start} to ${end}`);
  }
  return text.substring(0, startIdx + start.length) + "\n" + replacement + "\n" + text.substring(endIdx);
};

export const sanitizeUrl = (url) => {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.toLowerCase().startsWith('javascript:') || trimmed.toLowerCase().startsWith('data:')) {
    return '#';
  }
  return trimmed;
};
