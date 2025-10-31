 
export const decryptAESGCM = async (base64CipherText) => {
  try {
    const keyHex =
      "710f5a3bbcb3c168409c47774ba11897be76f08e997085377803271c4d42e961"; // secret key in hex
 
    const hexToUint8Array = (hex) =>
      new Uint8Array(hex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
 
    const base64ToUint8Array = (base64) => {
      try {
        const normalized = base64.replace(/-/g, "+").replace(/_/g, "/");
        const padded = normalized + "===".slice((normalized.length + 3) % 4);
        const buffer = Buffer.from(padded, "base64");
        return new Uint8Array(buffer);
      } catch (error) {
        throw new Error("Invalid Base64 encoding: " + error.message);
      }
    };
 
    const keyBytes = hexToUint8Array(keyHex);
    const cipherTextWithIv = base64ToUint8Array(base64CipherText);
 
    if (cipherTextWithIv.length < 13) throw new Error("Ciphertext too short");
 
    const iv = cipherTextWithIv.slice(0, 12);
    const encryptedData = cipherTextWithIv.slice(12);
 
    const cryptoObj = globalThis.crypto || (await import("node:crypto")).webcrypto;
    const cryptoKey = await cryptoObj.subtle.importKey(
      "raw",
      keyBytes,
      { name: "AES-GCM" },
      false,
      ["decrypt"]
    );
 
    const decryptedData = await cryptoObj.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      cryptoKey,
      encryptedData
    );
 
    return new TextDecoder().decode(decryptedData);
  } catch (error) {
    console.error("Decryption error:", error.message);
    return null;
  }
};
 
 
const dec = async () => {
  const response = await decryptAESGCM("xQ6f+5JI0b8U5ABowM0MBdNLFUTVcji1Was9mgw=") // base64 decryption
  console.log(response);
}
 
dec()