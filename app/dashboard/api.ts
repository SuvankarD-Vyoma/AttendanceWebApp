// Fetch attendance info from API
import { getApiBaseUrl } from "@/lib/api-config";
export async function getAdminAttendanceInfo(token: string, admin_id: string, from_date: string, to_date: string) {
 
 console.log(getApiBaseUrl());
  const res = await fetch(`${getApiBaseUrl()}admin/getAdminAttendanceInfo`, {
    method: "POST",
    headers: {
      "accept": "*/*",
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      admin_id,
      status_id: 0,
      from_date,
      to_date,
      page_no: 0,
      page_size: 0,
    }),
  });

  const text = await res.text();
  if (!res.ok) {
    return { data: null, error: `HTTP error: ${res.status}` };
  }
  if (!text) {
    return { data: null, error: "Empty response" };
  }
  try {
    return JSON.parse(text);
  } catch {
    return { data: null, error: "Invalid JSON response" };
  }
}




// import CryptoJS from "crypto-js";

// const secretKey = "VyomaSecretKey@2025"; // ⚠️ must match backend decryption key

// const myHeaders = new Headers();
// myHeaders.append("accept", "*/*");
// myHeaders.append("Content-Type", "application/json");
// myHeaders.append("Authorization", "Bearer eyJhbGciOiJSUzI1NiJ9...");

// // Original data
// const payload = {
//   admin_id: 40
// };

// // Encrypt data
// const encryptedData = CryptoJS.AES.encrypt(
//   JSON.stringify(payload),
//   secretKey
// ).toString();

// const raw = JSON.stringify({
//   data: encryptedData
// });

// const requestOptions = {
//   method: "POST",
//   headers: myHeaders,
//   body: raw,
//   redirect: "follow"
// };

// fetch("http://wbassetmgmtservice.link/VYOMAUMSRestAPI/api/admin/getEmployeeDetailsList", requestOptions)
//   .then(response => response.text())
//   .then(result => console.log(result))
//   .catch(error => console.error(error));




// // encryptionService.js
// import CryptoJS from 'crypto-js';

// class EncryptionService {
//   constructor() {
//     // Your secret key (same as Java)
//     this.KEY_SECRET = "710f5a3bbcb3c168409c47774ba11897be76f08e997085377803271c4d42e961";
//   }

//   /**
//    * Convert hex string to WordArray for CryptoJS
//    */
//   hexToWordArray(hex) {
//     return CryptoJS.enc.Hex.parse(hex);
//   }

//   /**
//    * Generate random IV (12 bytes for GCM)
//    */
//   generateIV() {
//     return CryptoJS.lib.WordArray.random(12);
//   }

//   /**
//    * Encrypt data using AES-GCM
//    * @param {string|object} data - Data to encrypt (will be stringified if object)
//    * @returns {string} Base64 encoded encrypted data with IV
//    */
//   encryptPayload(data) {
//     try {
//       // Convert object to JSON string if needed
//       const dataString = typeof data === 'object' ? JSON.stringify(data) : String(data);
      
//       // Generate random IV (12 bytes)
//       const iv = this.generateIV();
      
//       // Convert hex key to bytes
//       const key = this.hexToWordArray(this.KEY_SECRET);
      
//       // Encrypt using AES-256-GCM
//       const encrypted = CryptoJS.AES.encrypt(dataString, key, {
//         iv: iv,
//         mode: CryptoJS.mode.CTR, // Note: CryptoJS doesn't have native GCM, using CTR as alternative
//         padding: CryptoJS.pad.NoPadding
//       });
      
//       // Combine IV + encrypted data
//       const combined = iv.concat(encrypted.ciphertext);
      
//       // Return as Base64
//       return CryptoJS.enc.Base64.stringify(combined);
//     } catch (error) {
//       console.error('Encryption error:', error);
//       throw new Error('Failed to encrypt payload');
//     }
//   }

//   /**
//    * Decrypt data using AES-GCM
//    * @param {string} encryptedData - Base64 encoded encrypted data
//    * @returns {string|object} Decrypted data
//    */
//   decryptPayload(encryptedData) {
//     try {
//       // Decode from Base64
//       const encryptedBytes = CryptoJS.enc.Base64.parse(encryptedData);
      
//       // Extract IV (first 12 bytes)
//       const iv = CryptoJS.lib.WordArray.create(encryptedBytes.words.slice(0, 3));
      
//       // Extract encrypted data (remaining bytes)
//       const ciphertext = CryptoJS.lib.WordArray.create(
//         encryptedBytes.words.slice(3),
//         encryptedBytes.sigBytes - 12
//       );
      
//       // Convert hex key to bytes
//       const key = this.hexToWordArray(this.KEY_SECRET);
      
//       // Decrypt
//       const decrypted = CryptoJS.AES.decrypt(
//         { ciphertext: ciphertext },
//         key,
//         {
//           iv: iv,
//           mode: CryptoJS.mode.CTR,
//           padding: CryptoJS.pad.NoPadding
//         }
//       );
      
//       // Convert to UTF8 string
//       const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
      
//       // Try to parse as JSON, otherwise return as string
//       try {
//         return JSON.parse(decryptedString);
//       } catch {
//         return decryptedString;
//       }
//     } catch (error) {
//       console.error('Decryption error:', error);
//       throw new Error('Failed to decrypt payload');
//     }
//   }

//   /**
//    * Generate access key from mobile number and user type
//    * @param {string} mobileNumber 
//    * @param {number} userTypeId 
//    * @returns {string} Encrypted access key
//    */
//   generateAccessKey(mobileNumber, userTypeId) {
//     const rawData = `${mobileNumber}:${userTypeId}`;
//     return this.encryptPayload(rawData);
//   }

//   /**
//    * Parse access key to get mobile number and user type
//    * @param {string} accessKey 
//    * @returns {object} { mobileNumber, userTypeId }
//    */
//   parseAccessKey(accessKey) {
//     try {
//       const decrypted = this.decryptPayload(accessKey);
//       const [mobileNumber, userTypeId] = decrypted.split(':');
//       return {
//         mobileNumber,
//         userTypeId: parseInt(userTypeId)
//       };
//     } catch (error) {
//       throw new Error('Invalid access key format');
//     }
//   }
// }

// // Create singleton instance
// const encryptionService = new EncryptionService();

// export default encryptionService;

// // ============================================
// // USAGE EXAMPLES
// // ============================================

// // Example 1: Encrypt API payload
// export const encryptApiPayload = (payload) => {
//   return encryptionService.encryptPayload(payload);
// };

// // Example 2: Decrypt API response
// export const decryptApiResponse = (encryptedResponse) => {
//   return encryptionService.decryptPayload(encryptedResponse);
// };

// // Example 3: Generate access key
// export const generateAccessKey = (mobileNumber, userTypeId) => {
//   return encryptionService.generateAccessKey(mobileNumber, userTypeId);
// };

// // Example 4: Parse access key
// export const parseAccessKey = (accessKey) => {
//   return encryptionService.parseAccessKey(accessKey);
// };

// // ============================================
// // AXIOS INTERCEPTOR INTEGRATION
// // ============================================

// import axios from 'axios';

// // Create axios instance with encryption
// export const createEncryptedAxiosInstance = () => {
//   const instance = axios.create({
//     baseURL: process.env.REACT_APP_API_URL,
//     timeout: 30000
//   });

//   // Request interceptor - encrypt payload
//   instance.interceptors.request.use(
//     (config) => {
//       // Only encrypt POST, PUT, PATCH requests with data
//       if (['post', 'put', 'patch'].includes(config.method?.toLowerCase()) && config.data) {
//         try {
//           const encryptedPayload = encryptionService.encryptPayload(config.data);
//           config.data = { encryptedData: encryptedPayload };
          
//           // Add header to indicate encrypted payload
//           config.headers['X-Encrypted'] = 'true';
//         } catch (error) {
//           console.error('Failed to encrypt request:', error);
//         }
//       }
//       return config;
//     },
//     (error) => Promise.reject(error)
//   );

//   // Response interceptor - decrypt response
//   instance.interceptors.response.use(
//     (response) => {
//       // Check if response is encrypted
//       if (response.headers['x-encrypted'] === 'true' && response.data?.encryptedData) {
//         try {
//           response.data = encryptionService.decryptPayload(response.data.encryptedData);
//         } catch (error) {
//           console.error('Failed to decrypt response:', error);
//         }
//       }
//       return response;
//     },
//     (error) => Promise.reject(error)
//   );

//   return instance;
// };

// // ============================================
// // REACT HOOK FOR ENCRYPTION
// // ============================================

// import { useState, useCallback } from 'react';

// export const useEncryption = () => {
//   const [isEncrypting, setIsEncrypting] = useState(false);
//   const [error, setError] = useState(null);

//   const encrypt = useCallback(async (data) => {
//     setIsEncrypting(true);
//     setError(null);
//     try {
//       const encrypted = encryptionService.encryptPayload(data);
//       return encrypted;
//     } catch (err) {
//       setError(err.message);
//       throw err;
//     } finally {
//       setIsEncrypting(false);
//     }
//   }, []);

//   const decrypt = useCallback(async (encryptedData) => {
//     setIsEncrypting(true);
//     setError(null);
//     try {
//       const decrypted = encryptionService.decryptPayload(encryptedData);
//       return decrypted;
//     } catch (err) {
//       setError(err.message);
//       throw err;
//     } finally {
//       setIsEncrypting(false);
//     }
//   }, []);

//   return { encrypt, decrypt, isEncrypting, error };
// };

// ============================================
// USAGE IN REACT COMPONENT
// ============================================

/*
// Component Example 1: Using the hook
function MyComponent() {
  const { encrypt, decrypt, isEncrypting, error } = useEncryption();

  const handleSubmit = async (formData) => {
    try {
      const encryptedPayload = await encrypt(formData);
      
      const response = await fetch('/api/endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: encryptedPayload })
      });
      
      const result = await response.json();
      console.log('Success:', result);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div>
      {isEncrypting && <p>Encrypting...</p>}
      {error && <p>Error: {error}</p>}
    </div>
  );
}

// Component Example 2: Direct encryption
import encryptionService from './encryptionService';

function PaymentComponent() {
  const handlePayment = async () => {
    const paymentData = {
      amount: 1000,
      userId: 123,
      timestamp: Date.now()
    };

    // Encrypt the payload
    const encryptedPayload = encryptionService.encryptPayload(paymentData);

    const response = await fetch('/api/payment', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Encrypted': 'true'
      },
      body: JSON.stringify({ encryptedData: encryptedPayload })
    });

    const result = await response.json();
    
    // If response is encrypted, decrypt it
    if (result.encryptedData) {
      const decryptedResponse = encryptionService.decryptPayload(result.encryptedData);
      console.log('Decrypted response:', decryptedResponse);
    }
  };

  return <button onClick={handlePayment}>Make Payment</button>;
}

// Component Example 3: Using encrypted axios instance
const encryptedAxios = createEncryptedAxiosInstance();

function UserComponent() {
  const saveUser = async (userData) => {
    // Payload will be automatically encrypted
    const response = await encryptedAxios.post('/api/user/save', userData);
    
    // Response will be automatically decrypted
    console.log('User saved:', response.data);
  };

  return <button onClick={() => saveUser({ name: 'John', age: 30 })}>Save User</button>;
}
*/