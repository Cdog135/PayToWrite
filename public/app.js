const contractAddress = "0xe581001275a96135b1fcd374c4ee4f80ee489";
const contractABI = [
    {
        "inputs": [],
        "name": "__init__",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [{"internalType": "string", "name": "text", "type": "string"}],
        "name": "submitMessage",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "messageId", "type": "uint256"}],
        "name": "getMessage",
        "outputs": [
            {"internalType": "address", "name": "", "type": "address"},
            {"internalType": "string", "name": "", "type": "string"},
            {"internalType": "uint256", "name": "", "type": "uint256"},
            {"internalType": "uint256", "name": "", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "withdraw",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "newOwner", "type": "address"}],
        "name": "changeOwner",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getCostPerCharacter",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "newCost", "type": "uint256"}],
        "name": "setCostPerCharacter",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "messageCount",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    }
];

let web3;
let contract;
let accounts;

async function init() {
    console.log("init function started");
    if (typeof window.ethereum !== 'undefined') {
        console.log("MetaMask detected");
        web3 = new Web3(window.ethereum);
        console.log("Web3 initialized");
        contract = new web3.eth.Contract(contractABI, contractAddress);
        console.log("Contract initialized");
        
        const networkId = await web3.eth.net.getId();
        console.log("Connected to network ID:", networkId);
        if (networkId !== 11155111) {
            alert("Please switch MetaMask to the Sepolia testnet (network ID: 11155111)");
            console.log("Network mismatch, stopping init");
            return;
        }

        console.log("Setting up connectButton event listener");
        document.getElementById('connectButton').onclick = async () => {
            console.log("Connect Wallet button clicked");
            try {
                accounts = await ethereum.request({ method: 'eth_requestAccounts' });
                document.getElementById('connectButton').innerText = `Connected: ${accounts[0].slice(0,6)}...`;
                document.getElementById('submitButton').disabled = false;
                loadMessages();
            } catch (error) {
                console.error('Wallet connection failed:', error);
            }
        };

        console.log("Calling updateCostDisplay");
        updateCostDisplay();

        console.log("Setting up messageInput event listener");
        const messageInput = document.getElementById('messageInput');
        messageInput.oninput = async () => {
            console.log("Text box input detected");
            try {
                const costPerChar = await contract.methods.getCostPerCharacter().call();
                const message = messageInput.value;
                const totalCost = (message.length * costPerChar) / 1e18;
                document.getElementById('totalCost').innerText = totalCost.toFixed(6);
            } catch (error) {
                console.error('Error calculating total cost:', error);
            }
        };

        console.log("Setting up submitButton event listener");
        document.getElementById('submitButton').onclick = submitMessage;
    } else {
        console.log("MetaMask not detected");
        alert('Please install MetaMask to use this dApp!');
    }
}

async function updateCostDisplay() {
    try {
        const cost = await contract.methods.getCostPerCharacter().call();
        console.log("Cost per character:", cost);
        document.getElementById('costDisplay').innerText = (cost / 1e18).toFixed(6);
    } catch (error) {
        console.error('Error fetching cost:', error);
    }
}

async function submitMessage() {
    const message = document.getElementById('messageInput').value;
    if (!message) return alert('Please enter a message');

    try {
        const costPerChar = await contract.methods.getCostPerCharacter().call();
        const totalCost = message.length * costPerChar;
        console.log("Submitting with value:", web3.utils.fromWei(totalCost.toString(), 'ether'), "ETH");

        await contract.methods.submitMessage(message)
            .send({
                from: accounts[0],
                value: totalCost.toString()
            })
            .on('receipt', () => {
                console.log("Transaction successful, loading messages");
                document.getElementById('messageInput').value = '';
                document.getElementById('totalCost').innerText = '0';
                loadMessages(); // Ensure this is called
            })
            .on('error', (error) => {
                console.error('Transaction error:', error);
                alert('Transaction failed: ' + error.message);
            });
    } catch (error) {
        console.error('Transaction failed:', error);
        alert('Transaction failed: ' + error.message);
    }
}

async function loadMessages() {
    try {
        console.log("Loading messages...");
        const messageCount = await contract.methods.messageCount().call();
        console.log("Message count:", messageCount);
        const messagesDiv = document.getElementById('messages');
        if (!messagesDiv) {
            console.error("Messages div not found!");
            return;
        }
        messagesDiv.innerHTML = ''; // Clear existing messages

        for (let i = 0; i < messageCount; i++) {
            const [sender, text, timestamp, amountPaid] = await contract.methods.getMessage(i).call();
            console.log(`Message ${i}:`, { sender, text, timestamp, amountPaid });
            const date = new Date(timestamp * 1000).toLocaleString();
            const ethPaid = web3.utils.fromWei(amountPaid, 'ether');

            const messageDiv = document.createElement('div');
            messageDiv.className = 'message';
            messageDiv.innerHTML = `
                <strong>${sender.slice(0,6)}...</strong> (${date})<br>
                ${text}<br>
                <span class="cost">Paid: ${ethPaid} ETH</span>
            `;
            messagesDiv.appendChild(messageDiv);
        }
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

window.addEventListener('load', () => {
    console.log("DOM fully loaded");
    init();
});