# LITx

The ERC-20 Token for ShopLITH.com and the LITH Token ESG based ecosystem.

# INSTALL TASKS

npm install --safe-dev hardhat
yarn

# COMPILE & TEST TASKS

yarn hardhat compile
yarn hardhat coverage
yarn hardhat test

# DEPLOYMENT

create .env file from .env.example updated contents

yarn hardhat run scripts/deploy-litx.js --network ropsten

# CONTRACT SIZES

yarn hardhat size-contracts
