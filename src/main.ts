import inquirer from 'inquirer';
import createWallet from './create-wallet';
import registerFarcasterApp from './create-app';
import registerUser from './create-account';
import registerUserName from './create-username';
import updateProfile from './create-profile';
import createMessage from './create-message';

async function mainMenu() {
  const choices = [
		{ name: 'Create Optimism Wallet', value: 'createWallet' },
    { name: 'Register Farcaster App', value: 'registerFarcasterApp' },
    { name: 'Register User', value: 'registerUser' },
    { name: 'Register Username', value: 'registerUserName' },
    { name: 'Update Profile', value: 'updateProfile' },
    { name: 'Create Message', value: 'createMessage' },
  ];

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Choose an action:',
      choices,
    },
  ]);

  try {
    switch (action) {
			case 'createWallet':
        createWallet();
        console.log('Optimism wallet created successfully');
        break;
      case 'registerFarcasterApp':
        await registerFarcasterApp();
        console.log('Farcaster App registered successfully');
        break;
      case 'registerUser':
        await registerUser();
        console.log('User registered successfully');
        break;
      case 'registerUserName':
        await registerUserName();
        console.log('Username registered successfully');
        break;
      case 'updateProfile':
        const profileData = await inquirer.prompt([
          { type: 'input', name: 'displayName', message: 'Enter display name:' },
          { type: 'input', name: 'bio', message: 'Enter bio:' },
          { type: 'input', name: 'pfpUrl', message: 'Enter profile picture URL:' },
          { type: 'input', name: 'username', message: 'Enter username:' },
        ]);
        await updateProfile(
          profileData.displayName,
          profileData.bio,
          profileData.pfpUrl,
          profileData.username
        );
        console.log('Profile updated successfully');
        break;
      case 'createMessage':
        const { message } = await inquirer.prompt([
          { type: 'input', name: 'message', message: 'Enter your message:' },
        ]);
        await createMessage(message);
        console.log('Message created successfully');
        break;
      default:
        console.log('Invalid action');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

mainMenu();