import { generateMnemonic, mnemonicToAccount } from 'viem/accounts';
import { wordlist } from '@scure/bip39/wordlists/english';
import { bytesToHex } from 'viem';

function createWallet() {
  // Generate a new mnemonic
  const mnemonic = generateMnemonic(wordlist, 256);

  // Derive an account from the mnemonic
  const account = mnemonicToAccount(mnemonic);

   // Get the private key and address
  const privateKeyBytes = account.getHdKey().privateKey;

  if (!privateKeyBytes) {
    throw new Error('Failed to generate private key');
  }
	
  const privateKey = bytesToHex(privateKeyBytes);
  const address = account.address;

  // Log the wallet details
  console.log('Mnemonic:', mnemonic);
  console.log('Private Key:', privateKey);
  console.log('Address:', address);
}

export default createWallet;