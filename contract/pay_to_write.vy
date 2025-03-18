# @version 0.4.0
# A simple Pay-to-Write contract where users must pay ETH per character to submit a message.

# Message structure
struct Message:
    sender: address
    text: String[280]  # Limit message length to 280 characters
    timestamp: uint256
    amountPaid: uint256

# State variables
messages: public(HashMap[uint256, Message])  # Message ID -> Message
messageCount: public(uint256)  # Total messages stored
costPerCharacter: public(uint256)  # Cost per character in Wei
owner: public(address)  # Contract owner

# Events
event MessageSubmitted:
    sender: address
    messageId: uint256
    text: String[280]
    amountPaid: uint256
    timestamp: uint256

event OwnershipTransferred:
    previousOwner: address
    newOwner: address

# Initialize contract
@deploy
def __init__():
    self.owner = msg.sender
    self.messageCount = 0
    self.costPerCharacter = 10**15  # Default cost (0.001 ETH per character)

# Submit a message (requires payment)
@external
@payable
def submitMessage(text: String[280]):
    assert len(text) > 0, "Message cannot be empty"
    requiredPayment: uint256 = len(text) * self.costPerCharacter
    assert msg.value >= requiredPayment, "Not enough ETH sent"

    messageId: uint256 = self.messageCount
    self.messages[messageId] = Message({
        sender: msg.sender,
        text: text,
        timestamp: block.timestamp,
        amountPaid: msg.value
    })
    self.messageCount += 1

    log MessageSubmitted(msg.sender, messageId, text, msg.value, block.timestamp)

# Get message details by ID
@view
@external
def getMessage(messageId: uint256) -> (address, String[280], uint256, uint256):
    assert messageId < self.messageCount, "Invalid message ID"
    m: Message = self.messages[messageId]
    return (m.sender, m.text, m.timestamp, m.amountPaid)

# Owner can withdraw contract balance
@external
def withdraw():
    assert msg.sender == self.owner, "Only owner can withdraw"
    send(self.owner, self.balance)

# Change contract owner (only current owner)
@external
def changeOwner(newOwner: address):
    assert msg.sender == self.owner, "Only owner can change ownership"
    assert newOwner != empty(address), "New owner cannot be zero address"
    assert newOwner != self.owner, "New owner must be different"
    previousOwner: address = self.owner
    self.owner = newOwner
    log OwnershipTransferred(previousOwner, newOwner)

# Get the current cost per character
@view
@external
def getCostPerCharacter() -> uint256:
    return self.costPerCharacter

# Change cost per character (only owner)
@external
def setCostPerCharacter(newCost: uint256):
    assert msg.sender == self.owner, "Only owner can change cost"
    assert newCost > 0, "Cost must be greater than zero"
    self.costPerCharacter = newCost
