import {
  ViemLocalEip712Signer,
  NobleEd25519Signer,
  BUNDLER_ADDRESS,
  bundlerABI,
  KEY_GATEWAY_ADDRESS,
  keyGatewayABI,
} from '@farcaster/hub-nodejs';
import { bytesToHex, createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount, generateMnemonic, mnemonicToAccount } from 'viem/accounts';
import { optimism } from 'viem/chains';
import { wordlist } from '@scure/bip39/wordlists/english';
import readline from 'readline';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Retrieve sensitive data from environment variables
const APP_PRIVATE_KEY = process.env.APP_PRIVATE_KEY;
const APP_FID = process.env.APP_FID;
const USER_PRIVATE_KEY = process.env.USER_PRIVATE_KEY;

// Validate environment variables
if (!APP_PRIVATE_KEY || !APP_FID) {
  throw new Error('APP_PRIVATE_KEY and APP_FID must be set in the environment variables');
}

if (!USER_PRIVATE_KEY) {
  throw new Error('USER_PRIVATE_KEY must be set in the environment variables');
}

// Ensure private keys are in the correct format (0x prefixed)
const appPrivateKey = APP_PRIVATE_KEY.startsWith('0x') ? APP_PRIVATE_KEY as `0x${string}` : `0x${APP_PRIVATE_KEY}` as `0x${string}`;
const appFid = BigInt(APP_FID);
const userPrivateKey = USER_PRIVATE_KEY.startsWith('0x') ? USER_PRIVATE_KEY as `0x${string}` : `0x${USER_PRIVATE_KEY}` as `0x${string}`;

// Create Viem clients for interacting with the Optimism blockchain
const publicClient = createPublicClient({
  chain: optimism,
  transport: http(),
});

const walletClient = createWalletClient({
  chain: optimism,
  transport: http(),
});

// Create account objects and signers for the app and user
const app = privateKeyToAccount(appPrivateKey);
const appAccountKey = new ViemLocalEip712Signer(app);

const user = privateKeyToAccount(userPrivateKey);
const userAccountKey = new ViemLocalEip712Signer(user as any);

// Set the deadline for signatures (1 hour from now)
const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);

// Warpcast recovery proxy address
const WARPCAST_RECOVERY_PROXY = '0x00000000FcB080a4D6c39a9354dA9EB9bC104cd7';

async function registerUser() {
  // Display user account and private key on Optimism
  console.log(`User account on Optimism: ${user.address}`);
  console.log(`User private key on Optimism: ${userPrivateKey}`);

  // Step 3: Collect Register signature from User
  let nonce = await publicClient.readContract({
    address: KEY_GATEWAY_ADDRESS,
    abi: keyGatewayABI,
    functionName: 'nonces',
    args: [user.address],
  });

  const registerSignatureResult = await userAccountKey.signRegister({
    to: user.address as `0x${string}`,
    recovery: WARPCAST_RECOVERY_PROXY,
    nonce,
    deadline,
  });

  let registerSignature;
  if (registerSignatureResult.isOk()) {
    registerSignature = registerSignatureResult.value;
    console.log(`Register signature: ${bytesToHex(registerSignature)}`);
    if (bytesToHex(registerSignature).length !== 132) {
      throw new Error('Invalid register signature length');
    }
  } else {
    throw new Error('Failed to generate register signature');
  }

  // Step 4: Create a new account key pair for the user
  const mnemonic = generateMnemonic(wordlist, 256);
  const account = mnemonicToAccount(mnemonic);
  const privateKeyBytes = account.getHdKey().privateKey;
  
  if (!privateKeyBytes || privateKeyBytes.length !== 32) {
    throw new Error('Failed to generate valid 32-byte private key');
  }

  const accountKey = new NobleEd25519Signer(privateKeyBytes);

  const accountKeyResult = await accountKey.getSignerKey();
  if (accountKeyResult.isOk()) {
    const accountPubKey = accountKeyResult.value;

    // Display user account and private key on Farcaster
    console.log(`User account on Farcaster: ${bytesToHex(accountPubKey)}`);
    console.log(`User account mnemonic on Farcaster: ${mnemonic}`);
    console.log(`User private key on Farcaster: ${bytesToHex(privateKeyBytes)}`);

    // Step 5: Use app account to create a Signed Key Request
    const signedKeyRequestMetadata = await appAccountKey.getSignedKeyRequestMetadata({
      requestFid: appFid,
      key: accountPubKey,
      deadline,
    });

    if (signedKeyRequestMetadata.isOk()) {
      const metadata = bytesToHex(signedKeyRequestMetadata.value);

      // Step 6: Collect Add signature from User
      nonce = await publicClient.readContract({
        address: KEY_GATEWAY_ADDRESS,
        abi: keyGatewayABI,
        functionName: 'nonces',
        args: [user.address],
      });

      const addSignatureResult = await userAccountKey.signAdd({
        owner: user.address as `0x${string}`,
        keyType: 1,
        key: accountPubKey,
        metadataType: 1,
        metadata,
        nonce,
        deadline,
      });

      if (addSignatureResult.isOk()) {
        const addSignature = addSignatureResult.value;
        console.log(`Add signature: ${bytesToHex(addSignature)}`);

        // Get the current registration price
        const price = await publicClient.readContract({
          address: BUNDLER_ADDRESS,
          abi: bundlerABI,
          functionName: 'price',
          args: [0n],
        });

        const priceInEth = Number(price) / 1e18; // Convert wei to ETH
        console.log(`The current registration price is: ${price.toString()} wei (${priceInEth.toFixed(6)} ETH)`);

        // Ask for user confirmation before proceeding
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        });

        rl.question('Do you want to proceed with the registration? (yes/no): ', async (answer) => {
          if (answer.toLowerCase() === 'yes') {
            // Step 7: Call the Bundler contract to register onchain
            const { request } = await publicClient.simulateContract({
              account: app,
              address: BUNDLER_ADDRESS,
              abi: bundlerABI,
              functionName: 'register',
              args: [
                {
                  to: user.address,
                  recovery: WARPCAST_RECOVERY_PROXY,
                  sig: bytesToHex(registerSignature),
                  deadline,
                },
                [
                  {
                    keyType: 1,
                    key: bytesToHex(accountPubKey),
                    metadataType: 1,
                    metadata: metadata,
                    sig: bytesToHex(addSignature),
                    deadline,
                  },
                ],
                0n,
              ],
              value: price,
            });
            // Uncomment the following line to actually execute the transaction
            await walletClient.writeContract(request);
            console.log('Registration successful!');
          } else {
            console.log('Registration aborted.');
          }
          rl.close();
        });
      }
    }
  }
}

export default registerUser;
