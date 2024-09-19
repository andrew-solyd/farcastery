import {
  ID_GATEWAY_ADDRESS,
  ID_REGISTRY_ADDRESS,
  ViemLocalEip712Signer,
  idGatewayABI,
  idRegistryABI,
} from '@farcaster/hub-nodejs';
import { createPublicClient, createWalletClient, http, formatEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { optimism } from 'viem/chains';
import readline from 'readline';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();


const APP_PRIVATE_KEY = process.env.APP_PRIVATE_KEY; 
const WARPCAST_RECOVERY_PROXY = '0x00000000FcB080a4D6c39a9354dA9EB9bC104cd7';

const publicClient = createPublicClient({
  chain: optimism,
  transport: http(),
});

const walletClient = createWalletClient({
  chain: optimism,
  transport: http(),
});

const app = privateKeyToAccount(APP_PRIVATE_KEY as `0x${string}`);
const appAccountKey = new ViemLocalEip712Signer(app);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function confirmCost(cost: bigint): Promise<boolean> {
  return new Promise((resolve) => {
    rl.question(`The cost to register is ${cost} wei. Do you want to proceed? (y/n) `, (answer) => {
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

async function registerFarcasterApp() {
  try {
    console.log('Starting Farcaster app registration process...');
    console.log(`Using app address: ${app.address}`);

    console.log('Fetching current registration price...');
    const price = await publicClient.readContract({
      address: ID_GATEWAY_ADDRESS,
      abi: idGatewayABI,
      functionName: 'price',
      args: [0n],
    });

    console.log(`Current registration price: ${price} wei (${formatEther(price)} ETH)`);

    // Ask for confirmation
    const confirmed = await confirmCost(price);
    if (!confirmed) {
      console.log('Registration cancelled by user.');
      return;
    }

    console.log('Preparing to register FID...');
    console.log(`Using Warpcast Recovery Proxy: ${WARPCAST_RECOVERY_PROXY}`);

    console.log('Simulating contract interaction...');
    const { request } = await publicClient.simulateContract({
      account: app,
      address: ID_GATEWAY_ADDRESS,
      abi: idGatewayABI,
      functionName: 'register',
      args: [WARPCAST_RECOVERY_PROXY, 0n],
      value: price,
    });

    console.log('Simulation successful. Sending transaction...');
    const hash = await walletClient.writeContract(request);
    console.log(`Transaction sent. Hash: ${hash}`);

    console.log('Waiting for transaction to be mined...');
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log('Transaction mined successfully.');
    console.log(`Gas used: ${receipt.gasUsed}`);
    console.log(`Block number: ${receipt.blockNumber}`);

    console.log('Reading app FID from Id Registry contract...');
    const APP_FID = await publicClient.readContract({
      address: ID_REGISTRY_ADDRESS,
      abi: idRegistryABI,
      functionName: 'idOf',
      args: [app.address],
    });

    console.log(`Your app's FID is: ${APP_FID}`);
    console.log('Registration process completed successfully!');
  } catch (error) {
    console.error('An error occurred during the registration process:');
    console.error(error);
  } finally {
    rl.close();
  }
}

export default registerFarcasterApp;

registerFarcasterApp();