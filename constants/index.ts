export const CONTRACT_ADDRESS = "0x12aCeCA2A8db549f99096f524905fbd6AAfeA77D";

export const ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function claimFaucet() returns (bool)",
    "function hasClaimedFaucet(address) view returns (bool)",
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "event Approval(address indexed owner, address indexed spender, uint256 value)",
    "function transferFrom(address from, address to, uint256 amount) returns (bool)",
    "function pause()",
    "function unpause()",
    "function owner() view returns (address)",
    "function paused() view returns (bool)",
    "function transferOwnership(address newOwner)"
];
