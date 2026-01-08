// Utility function to convert Google Drive links to direct image URLs
export const convertGoogleDriveUrl = (url) => {
  if (!url) return url;
  
  // Check if it's a Google Drive sharing link
  if (url.includes('drive.google.com/file/d/')) {
    const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
    if (fileIdMatch) {
      const fileId = fileIdMatch[1];
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
  }
  
  // Check if it's already a Google Drive direct link
  if (url.includes('drive.google.com/uc?')) {
    return url;
  }
  
  // Return original URL if it's not a Google Drive link
  return url;
};

// STOCK IMAGES FORBIDDEN - Real photos only
export const getFallbackImage = (name, type = 'venue') => {
  console.warn(`No real image found for "${name}" (${type}) - stock images disabled`);
  return null; // Return null instead of stock images
};