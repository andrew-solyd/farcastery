import {
  FarcasterNetwork,
  getSSLHubRpcClient,
  makeCastAdd,
  NobleEd25519Signer
} from "@farcaster/hub-nodejs";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();


const SIGNER = process.env.USER_FARCASTER_PRIVATE_KEY;
const FID = parseInt(process.env.USER_FARCASTER_FID!);
const HUB_URL = process.env.HUBBLE_NODE || "813fe8.hubs.neynar.com:2283";
const NETWORK = FarcasterNetwork.MAINNET;

async function createMessage(text: string) {
  // Set up the signer
  const privateKeyBytes = Buffer.from(SIGNER!.slice(2), 'hex');
  const ed25519Signer = new NobleEd25519Signer(privateKeyBytes);

  const dataOptions = {
    fid: FID,
    network: NETWORK,
  };

  // Create an insecure client (change to getSSLHubRpcClient if using SSL)
  const client = getSSLHubRpcClient(HUB_URL!);

  try {
    // Create a cast
    const cast = await makeCastAdd(
       {
				type: 0,
      	text,
      	embeds: [],
      	embedsDeprecated: [],
      	mentions: [],
      	mentionsPositions: [],
    	},
      dataOptions,
      ed25519Signer,
    );
		
    // Submit the cast
    if (cast.isOk()) {
      const result = await client.submitMessage(cast.value);
      if (result.isOk()) {
        console.log("Cast submitted successfully");
        return result.value;
      } else {
        console.error("Submit error details:", result.error);
        throw new Error(`Failed to submit cast: ${result.error}`);
      }
    } else {
      console.error("Cast creation error details:", cast.error);
      throw new Error(`Failed to create cast: ${cast.error}`);
    }
  } finally {
    client.close();
  }
}

export default createMessage;