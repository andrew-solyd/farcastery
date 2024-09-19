import inquirer from 'inquirer';
import registerFarcasterApp from './create-app';
import registerUser from './create-account';
import registerUserName from './create-username';
import updateProfile from './create-profile';
import createMessage from './create-message';

async function mainMenu() {
  const choices = [
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
        await updateProfile(
          "Andrew Yakovlev",
          "Growth at BlockApps",
          "https://cdn.prod.website-files.com/62bdc93e9cccfb43e155104c/66c9c1099e822b4c12713a91_Killua%20pfp%20400x400%20(7).png",
          "ayakovlev"
        );
        console.log('Profile updated successfully');
        break;
      case 'createMessage':
        await createMessage("Bing bong!");
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