# Farcaster Frackery

Farcaster Frackery is a collection of TypeScript functions to interact with the Farcaster protocol. It includes functionalities for registering a Farcaster app, creating user accounts, updating profiles, and sending messages.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A wallet on the Optimism network

## Setup

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/farcaster_frackery.git
    cd farcaster_frackery
    ```

2. Install dependencies:
    ```sh
    pnpm install
    ```

3. Create a `.env` file in the root directory and add the required environment variables (see [Environment Variables](#environment-variables)).

4. Build and run the project:
    ```sh
    npm run build && npm start
    ```

## Environment Variables

Create a `.env` file in the root directory and add the following environment variables as needed:

APP_PRIVATE_KEY=your_app_private_key
APP_FID=your_app_fid
USER_PRIVATE_KEY=your_user_private_key
USER_FARCASTER_PRIVATE_KEY=your_user_farcaster_private_key
USER_FARCASTER_FID=your_user_farcaster_fid
USER_FARCASTER_NAME=your_user_farcaster_name
HUBBLE_NODE=your_hubble_node_url