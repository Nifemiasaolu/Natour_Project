const crypto = require("crypto");

const { TextEncoder, TextDecoder } = require("text-encoding");
const logger = require("./logger");

function byteArrayToString1(byteArray) {
  let hex = "";
  byteArray.forEach((byte) => {
    hex += ("0" + (byte & 0xff).toString(16)).slice(-2);
  });
  return hex;
}

// Generate apiKey
export async function generateAESKey() {
  return crypto.randomBytes(32).toString("hex").toUpperCase();
}

// Generate IV Key
export function generateIV() {
  return crypto.randomBytes(16).toString("hex").toUpperCase();
}

// Encryption
async function encryptWithAES(data, key, iv) {
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  return encrypted;
}

async function importKey(apiKey) {
  const keyBuffer = Buffer.alloc(32);
  const encodedKey = new TextEncoder().encode(apiKey);
  keyBuffer.set(encodedKey.slice(0, 32));
  return keyBuffer;
}

export async function encryptText(item, APIKey, IVKey) {
  const wordBytes = new TextEncoder().encode(item);
  const key = await importKey(APIKey);
  const iv = Buffer.from(IVKey, "hex"); //Ensure the IV is correctly formatted as a buffer. Converts it to a hex string

  // const iv = new TextEncoder().encode(IVKey);
  // const iv = Buffer.from(IVKey, "hex");

  const encryptedBytes = await encryptWithAES(wordBytes, key, iv);
  const encryptedHex = byteArrayToString1(
    new Uint8Array(encryptedBytes),
  ).toUpperCase();
  return encryptedHex;
}

// Example usage on encryption
const plaintext = `{
    "Phone": "07063261377",
    "OTPCode": "253643",
    "BVN": "22209795196"
}`;
const apiKey = "zTFRMAj+c7TUfWX+";
const iVKey = "GgLktwbY/8uw5fs/";

encryptText(plaintext, apiKey, iVKey)
  .then((ciphertext) => {
    logger.info(
      ` ============ Encrypted ciphertext: ${ciphertext} ================`,
    );
  })
  .catch((error) => {
    logger.info(`Encryption error: ${error}`);
  });

////////////////////////////////////////////////////////
// Decryption

// Decrypt the cipher text

async function decryptWithAES(data, key, iv) {
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted;
}

async function decryptCipher(cipher, apiKey, ivKey) {
  const key = await importKey(apiKey);
  const iv = Buffer.from(ivKey, "hex"); // Ensure the IV is correctly formatted as a buffer
  const decryptedBytes = await decryptWithAES(cipher, key, iv);
  return new TextDecoder().decode(decryptedBytes);
}

// Example usage on decryption
const cipherText =
  "B98770B9E8FCA1A685E70A036D3175C0A1615FAB249810FF1211386BBBC4D317F829C4C26EC559A3857690DA7BBCEEEE12AF58F2537C07FEF840618757662CE888536632E3D7CAE035480A0D2DA5EF56";
const apiKey = "zTFRMAj+c7TUfWX+";
const ivKey = "GgLktwbY/8uw5fs/";
//
// Convert API key and IV key from UTF-8 to Uint8Array
const apiKeyUint8 = new TextEncoder().encode(apiKey);
const ivKeyUint8 = new TextEncoder().encode(ivKey);

// Convert cipher text from hex string to Uint8Array
const cipherUint8 = new Uint8Array(
  cipherText.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)),
);

decryptCipher(cipherUint8, apiKeyUint8, ivKeyUint8)
  .then((decryptedText) => {
    console.log("Decrypted plaintext:", decryptedText);
  })
  .catch((error) => {
    console.error("Decryption error:", error);
  });

// Ways of implementation

////////////////////////////////////////////////////////////////////
// Immediately Invoke An Async Function (IIFE)
(async () => {
  const APIKey = await generateAESKey();
  logger.info(`********** Generated API key: ${APIKey} *********`);
})();
/////////
const ivKey = generateIV();
logger.info(`*************** Generated IV Key: ${ivKey} ************`);

// Example
const plaintext = `{
    "Phone": "07063261377",
    "OTPCode": "253643",
    "BVN": "22209795196"
}`;
const apiKey = "zTFRMfiSIT94875+";
const iVKey = "GgLkSDVLKHW0324LS9/";

// Named Async Function with Explicit Call
async function encryptionText() {
  const cipherText = await encryptText(plaintext, apiKey, iVKey);
  logger.info(`++++++++++++++ Encrypted Ciphertext: ${cipherText} +++++++++++`);
}
encryptText();
///////////////////////////////////////////////////////////////////

// *************** Generated IV Key: E41FCDE98B7BC2746DA56AB4B935B200 ************
