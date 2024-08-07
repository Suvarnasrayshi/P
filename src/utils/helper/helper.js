export const generateUUID = () => {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
  let uuid = '';

  for (let i = 0; i < 32; i++) {
    if (i === 8 || i === 12 || i === 16 || i === 20) {
      uuid += '-';
    }
    uuid += chars[Math.floor(Math.random() * chars.length)];
  }

  return uuid;
};
