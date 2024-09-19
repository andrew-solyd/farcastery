import { makeUserNameProofClaim, Eip712Signer, ViemLocalEip712Signer } from '@farcaster/hub-nodejs';
import { privateKeyToAccount } from 'viem/accounts';
import { bytesToHex } from "viem";
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();


const USER_PRIVATE_KEY = process.env.USER_PRIVATE_KEY!;
const USER_FARCASTER_NAME = process.env.USER_FARCASTER_NAME!;
const USER_FARCASTER_FID = parseInt(process.env.USER_FARCASTER_FID!, 10);

const account = privateKeyToAccount(USER_PRIVATE_KEY as `0x${string}`);
const accountKey= new ViemLocalEip712Signer(account);

async function registerFname(name: string, fid: number, custodyAddress: `0x${string}`, accountKey: Eip712Signer) {
  const checkResponse = await axios.get(`https://fnames.farcaster.xyz/transfers?name=${name}`);
  if (checkResponse.data.transfers.length > 0) {
    throw new Error('This name is already registered');
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const claim = makeUserNameProofClaim({
    name,
    owner: custodyAddress,
    timestamp,
  });

  // Sign the claim
  const signatureResult = await accountKey.signUserNameProofClaim(claim);

  if (signatureResult.isErr()) {
    throw new Error(`Failed to sign the claim: ${signatureResult.error}`);
  }

  // Convert the signature to a hexadecimal string
  const signatureHex = bytesToHex(signatureResult.value);

  const requestBody = {
    name,
    from: 0,
    to: fid,
    fid,
    owner: custodyAddress,
    timestamp,
    signature: signatureHex,
  };

	console.log('Request body:', JSON.stringify(requestBody, null, 2));

  try {
    const response = await axios.post('https://fnames.farcaster.xyz/transfers', requestBody);
    console.log('Name registered successfully:', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(JSON.stringify(error.response.data));
    } else {
      throw error;
    }
  }
}

async function registerUserName() {
  await registerFname(
    USER_FARCASTER_NAME,
    USER_FARCASTER_FID,
    account.address as `0x${string}`,
    accountKey
  );
}


export default registerUserName;