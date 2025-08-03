# Token Faucet dApp

**Day 13 Project** - A testnet token faucet that distributes free ERC20 tokens to users for testing purposes on Base Sepolia.

## 🎯 Project Overview

The Token Faucet is a beginner-friendly dApp that allows users to claim free testnet tokens with rate limiting to prevent spam. This project teaches fundamental concepts like:

- ERC20 token interaction
- Rate limiting mechanisms
- User balance tracking
- Time-based cooldowns
- Frontend blockchain integration

## ✨ Features

### Core Functionality
- **Token Distribution**: Claim free testnet tokens (100 tokens per claim)
- **Rate Limiting**: 24-hour cooldown between claims
- **Real-time Countdown**: Live timer showing when next claim is available
- **Balance Tracking**: Display user's current token balance
- **Claim History**: Track number of claims per user

### User Interface
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Live countdown timer and balance updates
- **Connection Status**: Clear wallet connection indicators
- **Loading States**: Visual feedback during transactions
- **Error Handling**: User-friendly error messages

### Statistics Dashboard
- Personal token balance
- Number of claims made
- Total tokens distributed by faucet
- Time until next claim available

## 🛠 Technical Stack

### Smart Contract
- **Solidity**: Contract development language
- **OpenZeppelin**: ERC20 and security standards
- **Rate Limiting**: Time-based claim restrictions
- **Access Control**: Admin functions for faucet management

### Frontend
- **React 18**: UI framework with hooks
- **Tailwind CSS**: Utility-first styling
- **ethers.js**: Blockchain interaction
- **Lucide React**: Icon components

### Blockchain
- **Network**: Base Sepolia Testnet
- **Chain ID**: 84532
- **RPC**: https://sepolia.base.org

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- MetaMask browser extension
- Base Sepolia testnet ETH for gas fees

### Installation

1. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd token-faucet
   npm install
   ```

2. **Environment Configuration**
   ```bash
   # .env file
   REACT_APP_FAUCET_ADDRESS=0x...
   REACT_APP_TOKEN_ADDRESS=0x...
   REACT_APP_CHAIN_ID=84532
   ```

3. **Start Development Server**
   ```bash
   npm start
   ```

### Smart Contract Deployment

1. **Install Hardhat**
   ```bash
   npm install --save-dev hardhat
   npx hardhat init
   ```

2. **Contract Code**
   ```solidity
   // contracts/TokenFaucet.sol
   pragma solidity ^0.8.19;
   
   import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
   import "@openzeppelin/contracts/access/Ownable.sol";
   
   contract TokenFaucet is Ownable {
       IERC20 public token;
       uint256 public tokensPerClaim = 100 * 10**18; // 100 tokens
       uint256 public claimCooldown = 24 hours;
       
       mapping(address => uint256) public lastClaimTime;
       mapping(address => uint256) public userClaimCount;
       uint256 public totalClaimed;
       
       event TokensClaimed(address indexed user, uint256 amount);
       
       constructor(address _token) {
           token = IERC20(_token);
       }
       
       function requestTokens() external {
           require(
               block.timestamp >= lastClaimTime[msg.sender] + claimCooldown,
               "Must wait before next claim"
           );
           require(
               token.balanceOf(address(this)) >= tokensPerClaim,
               "Insufficient faucet balance"
           );
           
           lastClaimTime[msg.sender] = block.timestamp;
           userClaimCount[msg.sender]++;
           totalClaimed += tokensPerClaim;
           
           token.transfer(msg.sender, tokensPerClaim);
           emit TokensClaimed(msg.sender, tokensPerClaim);
       }
       
       function getNextClaimTime(address user) external view returns (uint256) {
           return lastClaimTime[user] + claimCooldown;
       }
   }
   ```

3. **Deploy Script**
   ```javascript
   // scripts/deploy.js
   async function main() {
     const [deployer] = await ethers.getSigners();
     
     // Deploy test token first
     const TestToken = await ethers.getContractFactory("TestToken");
     const token = await TestToken.deploy();
     
     // Deploy faucet
     const TokenFaucet = await ethers.getContractFactory("TokenFaucet");
     const faucet = await TokenFaucet.deploy(token.address);
     
     // Transfer tokens to faucet
     await token.transfer(faucet.address, ethers.utils.parseEther("1000000"));
     
     console.log("Faucet deployed to:", faucet.address);
   }
   ```

4. **Deploy to Base Sepolia**
   ```bash
   npx hardhat run scripts/deploy.js --network baseSepolia
   ```

## 📱 How to Use

### For Users
1. **Connect Wallet**: Click "Connect Wallet" and approve MetaMask connection
2. **Switch Network**: Ensure you're on Base Sepolia testnet
3. **Claim Tokens**: Click "Claim Tokens" to receive 100 TEST tokens
4. **Wait Period**: Wait 24 hours between claims (countdown timer shown)
5. **Check Balance**: View your token balance in the statistics section

### For Developers
1. **Customize Parameters**: Modify tokens per claim and cooldown period
2. **Add Features**: Implement referral bonuses or multiple token support
3. **Enhance UI**: Add animations, better responsive design
4. **Security**: Add additional rate limiting or anti-bot measures

## 🔧 Configuration Options

### Contract Parameters
```solidity
uint256 public tokensPerClaim = 100 * 10**18;    // Tokens per claim
uint256 public claimCooldown = 24 hours;         // Time between claims
```

### Frontend Configuration
```javascript
// Faucet settings
const TOKENS_PER_CLAIM = 100;
const COOLDOWN_HOURS = 24;
const MAX_CLAIMS_PER_USER = 10; // Optional limit
```

## 🧪 Testing

### Unit Tests
```javascript
describe("TokenFaucet", function () {
  it("Should allow users to claim tokens", async function () {
    await faucet.requestTokens();
    expect(await token.balanceOf(user.address)).to.equal(tokensPerClaim);
  });
  
  it("Should enforce cooldown period", async function () {
    await faucet.requestTokens();
    await expect(faucet.requestTokens()).to.be.revertedWith("Must wait");
  });
});
```

### Frontend Testing
- Test wallet connection flow
- Verify cooldown timer accuracy
- Check error message display
- Test responsive design

## 🚀 Deployment

### Frontend Deployment (Vercel)
```bash
npm run build
# Deploy to Vercel
vercel --prod
```

### Contract Verification
```bash
npx hardhat verify --network baseSepolia FAUCET_ADDRESS TOKEN_ADDRESS
```

## 🔒 Security Considerations

### Smart Contract Security
- **Rate Limiting**: Prevents users from draining faucet
- **Balance Checks**: Ensures sufficient tokens before transfer
- **Access Control**: Owner-only functions for management
- **Reentrancy Protection**: Use of OpenZeppelin standards

### Frontend Security
- **Input Validation**: Sanitize all user inputs
- **Error Handling**: Graceful failure modes
- **Network Verification**: Ensure correct network connection

## 🎯 Learning Objectives

After completing this project, you'll understand:

1. **ERC20 Token Interaction**: How to read balances and transfer tokens
2. **Time-based Logic**: Implementing cooldown periods in smart contracts
3. **State Management**: Tracking user claims and faucet statistics
4. **User Experience**: Building intuitive blockchain interfaces
5. **Rate Limiting**: Preventing spam and abuse in dApps

## 🚀 Extensions

### Beginner Enhancements
- Multiple token support
- Referral bonuses
- Daily claim limits
- Social media verification

### Advanced Features
- Proof of humanity integration
- Dynamic token amounts based on network activity
- Cross-chain faucet support
- Governance token distribution

## 📚 Additional Resources

- [OpenZeppelin ERC20 Documentation](https://docs.openzeppelin.com/contracts/4.x/erc20)
- [Base Sepolia Testnet Guide](https://docs.base.org/tools/network-faucets)
- [ethers.js Documentation](https://docs.ethers.org/v5/)
- [Tailwind CSS Guide](https://tailwindcss.com/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter issues:
1. Check the console for error messages
2. Verify your wallet is connected to Base Sepolia
3. Ensure you have sufficient ETH for gas fees
4. Try refreshing the page or reconnecting your wallet

---

**Built with ❤️ for the Base ecosystem**