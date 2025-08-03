import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Droplets, Clock, Coins, Users, AlertCircle, CheckCircle } from 'lucide-react';

const TOKEN_FAUCET_ABI = [
  "function requestTokens() external",
  "function getNextClaimTime(address user) external view returns (uint256)",
  "function tokensPerClaim() external view returns (uint256)",
  "function claimCooldown() external view returns (uint256)",
  "function token() external view returns (address)",
  "function totalClaimed() external view returns (uint256)",
  "function userClaimCount(address user) external view returns (uint256)",
  "event TokensClaimed(address indexed user, uint256 amount)"
];

const ERC20_ABI = [
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function decimals() external view returns (uint8)",
  "function balanceOf(address account) external view returns (uint256)"
];

// Mock contract addresses for Base Sepolia
const FAUCET_ADDRESS = "0x1234567890123456789012345678901234567890";
const TOKEN_ADDRESS = "0x0987654321098765432109876543210987654321";

export default function TokenFaucet() {
  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState(null);
  const [faucetContract, setFaucetContract] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Faucet data
  const [tokensPerClaim, setTokensPerClaim] = useState('0');
  const [cooldownPeriod, setCooldownPeriod] = useState('0');
  const [nextClaimTime, setNextClaimTime] = useState('0');
  const [userBalance, setUserBalance] = useState('0');
  const [totalClaimed, setTotalClaimed] = useState('0');
  const [userClaimCount, setUserClaimCount] = useState('0');
  const [tokenInfo, setTokenInfo] = useState({ name: '', symbol: '', decimals: 18 });
  
  // Timer state
  const [timeUntilNextClaim, setTimeUntilNextClaim] = useState(0);

  useEffect(() => {
    if (window.ethereum) {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(web3Provider);
      
      // Mock contracts for demo
      const mockFaucet = {
        requestTokens: async () => {
          setClaiming(true);
          await new Promise(resolve => setTimeout(resolve, 2000));
          setSuccess('Successfully claimed 100 TEST tokens!');
          setUserBalance(prev => (parseFloat(prev) + 100).toString());
          setUserClaimCount(prev => (parseInt(prev) + 1).toString());
          setNextClaimTime(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
          setClaiming(false);
        },
        getNextClaimTime: async () => nextClaimTime,
        tokensPerClaim: async () => ethers.utils.parseEther('100'),
        claimCooldown: async () => 24 * 60 * 60, // 24 hours in seconds
        totalClaimed: async () => ethers.utils.parseEther('50000'),
        userClaimCount: async () => userClaimCount
      };
      
      const mockToken = {
        name: async () => 'Test Token',
        symbol: async () => 'TEST',
        decimals: async () => 18,
        balanceOf: async () => ethers.utils.parseEther(userBalance || '0')
      };
      
      setFaucetContract(mockFaucet);
      setTokenContract(mockToken);
    }
  }, [userBalance, userClaimCount, nextClaimTime]);

  useEffect(() => {
    let interval;
    if (nextClaimTime > Date.now()) {
      interval = setInterval(() => {
        const remaining = Math.max(0, nextClaimTime - Date.now());
        setTimeUntilNextClaim(remaining);
      }, 1000);
    } else {
      setTimeUntilNextClaim(0);
    }
    
    return () => clearInterval(interval);
  }, [nextClaimTime]);

  useEffect(() => {
    loadFaucetData();
  }, [faucetContract, tokenContract, account]);

  const connectWallet = async () => {
    try {
      setError('');
      if (!window.ethereum) throw new Error('MetaMask not found');
      
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      setAccount(accounts[0]);
      setSuccess('Wallet connected successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  const loadFaucetData = async () => {
    if (!faucetContract || !tokenContract) return;
    
    try {
      setLoading(true);
      
      // Load token info
      setTokenInfo({
        name: 'Test Token',
        symbol: 'TEST',
        decimals: 18
      });
      
      // Load faucet data
      setTokensPerClaim('100');
      setCooldownPeriod('86400'); // 24 hours
      setTotalClaimed('50000');
      
      if (account) {
        setUserBalance('500');
        setUserClaimCount('5');
        setNextClaimTime(Date.now() - 1000); // Allow immediate claim for demo
      }
    } catch (err) {
      setError('Failed to load faucet data');
    } finally {
      setLoading(false);
    }
  };

  const claimTokens = async () => {
    if (!faucetContract || !account) return;
    
    try {
      setError('');
      setSuccess('');
      
      if (timeUntilNextClaim > 0) {
        setError('You must wait before claiming again');
        return;
      }
      
      await faucetContract.requestTokens();
      
    } catch (err) {
      setError(err.reason || err.message || 'Failed to claim tokens');
      setClaiming(false);
    }
  };

  const formatTime = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const canClaim = timeUntilNextClaim === 0 && account && !claiming;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Droplets className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Token Faucet</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Claim free {tokenInfo.symbol} tokens for testing on Base Sepolia
          </p>
        </div>

        {/* Connection Status */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          {!account ? (
            <div className="text-center">
              <p className="text-gray-600 mb-4">Connect your wallet to start claiming tokens</p>
              <button
                onClick={connectWallet}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Connect Wallet
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Connected Account</p>
                <p className="font-mono text-gray-900">{account.slice(0, 6)}...{account.slice(-4)}</p>
              </div>
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span className="font-semibold">Connected</span>
              </div>
            </div>
          )}
        </div>

        {/* Main Faucet Section */}
        {account && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Claim Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Coins className="h-6 w-6 mr-2 text-blue-600" />
                Claim Tokens
              </h2>
              
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Tokens per claim:</span>
                    <span className="font-bold text-lg">{tokensPerClaim} {tokenInfo.symbol}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Cooldown period:</span>
                    <span className="font-semibold">24 hours</span>
                  </div>
                </div>

                {timeUntilNextClaim > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center text-yellow-800">
                      <Clock className="h-5 w-5 mr-2" />
                      <span className="font-semibold">Next claim in: {formatTime(timeUntilNextClaim)}</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={claimTokens}
                  disabled={!canClaim}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                    canClaim
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {claiming ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                      Claiming...
                    </div>
                  ) : canClaim ? (
                    `Claim ${tokensPerClaim} ${tokenInfo.symbol}`
                  ) : timeUntilNextClaim > 0 ? (
                    'Cooldown Active'
                  ) : (
                    'Connect Wallet'
                  )}
                </button>
              </div>
            </div>

            {/* Statistics Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Users className="h-6 w-6 mr-2 text-purple-600" />
                Statistics
              </h2>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Your Balance:</span>
                    <span className="font-bold text-xl text-blue-700">
                      {userBalance} {tokenInfo.symbol}
                    </span>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Your Claims:</span>
                    <span className="font-bold text-xl text-green-700">
                      {userClaimCount}
                    </span>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Distributed:</span>
                    <span className="font-bold text-xl text-purple-700">
                      {totalClaimed} {tokenInfo.symbol}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center text-red-800">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center text-green-800">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>{success}</span>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">How to Use</h3>
          <div className="space-y-3 text-gray-600">
            <p className="flex items-start">
              <span className="font-semibold text-blue-600 mr-2">1.</span>
              Connect your MetaMask wallet to the Base Sepolia testnet
            </p>
            <p className="flex items-start">
              <span className="font-semibold text-blue-600 mr-2">2.</span>
              Click "Claim Tokens" to receive {tokensPerClaim} {tokenInfo.symbol} tokens
            </p>
            <p className="flex items-start">
              <span className="font-semibold text-blue-600 mr-2">3.</span>
              Wait 24 hours between claims to prevent spam
            </p>
            <p className="flex items-start">
              <span className="font-semibold text-blue-600 mr-2">4.</span>
              Use these tokens for testing other dApps on Base Sepolia
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500">
          <p>This is a testnet faucet for Base Sepolia - tokens have no real value</p>
        </div>
      </div>
    </div>
  );
}