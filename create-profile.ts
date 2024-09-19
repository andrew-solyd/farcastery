import {
  FarcasterNetwork,
  getSSLHubRpcClient,
  makeUserDataAdd,
  NobleEd25519Signer,
	UserDataType
} from "@farcaster/hub-nodejs";
import dotenv from 'dotenv';
dotenv.config();

const SIGNER = process.env.USER_FARCASTER_PRIVATE_KEY;
const FID = parseInt(process.env.USER_FARCASTER_FID!);
const HUB_URL = process.env.HUBBLE_NODE;
const NETWORK = FarcasterNetwork.MAINNET;

async function updateProfile(displayName: string, bio: string, pfpUrl: string, username: string) {
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
		
    // Update display name
    const displayNameMessageResult = await makeUserDataAdd(
      { type: UserDataType.DISPLAY, value: displayName },
      dataOptions,
      ed25519Signer
    );
    const bioMessageResult = await makeUserDataAdd(
      { type: UserDataType.BIO, value: bio },
      dataOptions,
      ed25519Signer
    );
    const pfpMessageResult = await makeUserDataAdd(
      { type: UserDataType.PFP, value: pfpUrl },
      dataOptions,
      ed25519Signer
    );


		const usernameMessageResult = await makeUserDataAdd(
      { type: UserDataType.USERNAME, value: username },
      dataOptions,
      ed25519Signer
    );

    // Unwrap results and submit messages
    const results = await Promise.all([
			
      displayNameMessageResult.isOk() ? client.submitMessage(displayNameMessageResult.value) : Promise.resolve({ isOk: () => false, error: displayNameMessageResult.error }),
      bioMessageResult.isOk() ? client.submitMessage(bioMessageResult.value) : Promise.resolve({ isOk: () => false, error: bioMessageResult.error }),
      pfpMessageResult.isOk() ? client.submitMessage(pfpMessageResult.value) : Promise.resolve({ isOk: () => false, error: pfpMessageResult.error }),
			usernameMessageResult.isOk() ? client.submitMessage(usernameMessageResult.value) : Promise.resolve({ isOk: () => false, error: usernameMessageResult.error })

    ]);

		
    results.forEach((result, index) => {
      if (result.isOk()) {
        console.log(`Successfully updated ${['display name', 'bio', 'PFP', 'username'][index]}`);
      } else {
        console.error(`Failed to update ${['display name', 'bio', 'PFP', 'username'][index]}: ${result.error}`);
      }
    });

    return results;
  } finally {
    client.close();
  }
}

export default updateProfile;