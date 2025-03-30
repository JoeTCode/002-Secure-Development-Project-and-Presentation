// Outlined by: https://stackoverflow.com/questions/78687009/how-to-encrypt-decrypt-with-node-js-crypto-module
// and: https://stackoverflow.com/questions/63125747/how-to-use-async-await-using-crypto-randombytes-in-nodejs
// and the offical crypto docs


import {
    scrypt,
    randomFill,
    createDecipheriv,
    createCipheriv,
} from 'crypto';
import { promisify } from 'util';
  
// Convert to promise returning function
const scryptAsync = promisify(scrypt);
const randomFillAsync = promisify(randomFill);

// const algorithm = 'aes-192-cbc';
//const password = 'Password used to generate key';


export async function encrypt(text, keyPassword, algorithm='aes-192-cbc') {
    try {
        // Generate a random salt
        const salt = await randomFillAsync(new Uint8Array(16));

        // Generate a key. The key length is dependent on the algorithm.
        // In this case for the aes192 algorithm, it is 24 bytes (192 bits).
        const key = await scryptAsync(keyPassword, salt, 24);

        // Generate a random initialization vector
        const iv = await randomFillAsync(new Uint8Array(16));

        const cipher = createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        // Concatenate the IV, salt, and encrypted text (converted into a buffer from hex). The IV and salt are 16 bytes long.
        const encryptedBuffer = Buffer.concat([iv, salt, Buffer.from(encrypted, 'hex')]);
        
        // Convert to hex value to avoid formatting issues when storing in db.
        return encryptedBuffer.toString('hex');

    } catch (err) {
        console.error('Error encrypting data:', err);
    };
};


export async function decrypt(encryptedData, keyPassword, algorithm='aes-192-cbc') {
    try {
        // Convert hex data into buffer
        const encryptedBuffer = Buffer.from(encryptedData, 'hex');
        
        // Extract IV, salt, and the text from the buffer
        const iv = encryptedBuffer.subarray(0, 16);
        const salt = encryptedBuffer.subarray(16, 32);
        const encryptedText = encryptedBuffer.subarray(32);

        // Create the key
        const key = await scryptAsync(keyPassword, salt, 24);

        // Decipher encrypted text
        const decipher = createDecipheriv(algorithm, key, iv);
        
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;

    } catch (err) {
        console.error('Error decrypting data:', err);
    }  
}