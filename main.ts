import registerFarcasterApp from './create-app'
import registerUser from './create-account'
import registerUserName from './create-username'
import updateProfile from './create-profile'
import createMessage from './create-message'

registerFarcasterApp().catch(console.error)

registerUser().catch(console.error)

registerUserName()
  .then(() => console.log('Registration process completed'))
  .catch((error) => console.error('Registration failed:', error));

updateProfile("Andrew Yakovlev", "Growth at BlockApps", "https://cdn.prod.website-files.com/62bdc93e9cccfb43e155104c/66c9c1099e822b4c12713a91_Killua%20pfp%20400x400%20(7).png", "ayakovlev")
  .then((results) => console.log("Profile update complete:", results))
  .catch((error) => console.error("Error updating profile:", error));

createMessage("Bing bong!")
  .then((result) => console.log("Message created:", result))
  .catch((error) => console.error("Error creating message:", error));