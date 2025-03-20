# PayToWrite
Overview
Pay-to-Write Wall is a decentralized application (dApp) built on the Ethereum blockchain using the Sepolia testnet. Users can connect their MetaMask wallet, pay a small fee in ETH per character, and submit messages that are stored on the blockchain. The messages are then displayed on the webpage for everyone to see. The project is deployed on Firebase Hosting and interacts with a smart contract written in Solidity.

Features
Connect to MetaMask wallet on the Sepolia testnet.
Submit messages to the blockchain by paying a fee (0.001 ETH per character).
View all submitted messages on the webpage, including the sender’s address, timestamp, and amount paid.
Smart contract includes owner-only functions like withdrawing funds and changing the cost per character.
Smart Contract
Address: 0x0e5881001275a96a135b1fcd374c4ee4f80ee489
Network: Sepolia Testnet
Functions:
submitMessage(string text): Submit a message by paying ETH (cost per character * message length).
getMessage(uint256 messageId): Retrieve a message by ID (returns sender, text, timestamp, amount paid).
messageCount(): Get the total number of messages.
getCostPerCharacter(): View the cost per character (default: 0.001 ETH).
setCostPerCharacter(uint256 newCost): Owner-only function to update the cost per character.
withdraw(): Owner-only function to withdraw contract balance.
changeOwner(address newOwner): Owner-only function to transfer ownership.
Prerequisites
MetaMask: Installed and configured with Sepolia testnet ETH.
Node.js: For Firebase CLI installation.
Firebase CLI: To deploy the project to Firebase Hosting.