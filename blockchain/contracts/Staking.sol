// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Staking is Ownable(msg.sender), ReentrancyGuard {
    IERC20 public token;
    uint256 public entryStakeAmount;
    uint256 public minimumModelStake;

    mapping(address => bool) public hasEntered;
    mapping(address => uint256) public modelStakes;

    // Investor data: investor => hackathonId => (model => amount)
    mapping(address => mapping(uint256 => mapping(address => uint256))) public bets;

    // Total bets per model per hackathon
    mapping(uint256 => mapping(address => uint256)) public totalBetsOnModel;

    event EnteredPlatform(address indexed user, uint256 amount);
    event ModelStaked(address indexed user, uint256 amount);
    event BetPlaced(address indexed investor, uint256 indexed hackathonId, address indexed model, uint256 amount);

    constructor(address _token, uint256 _entryStake, uint256 _minModelStake) {
        token = IERC20(_token);
        entryStakeAmount = _entryStake;
        minimumModelStake = _minModelStake;
    }

    function enterPlatform() external nonReentrant {
        require(!hasEntered[msg.sender], "Already entered");
        require(entryStakeAmount > 0, "Entry stake not set");

        hasEntered[msg.sender] = true;

        bool success = token.transferFrom(msg.sender, address(this), entryStakeAmount);
        require(success, "Transfer failed");

        emit EnteredPlatform(msg.sender, entryStakeAmount);
    }

    function stakeForModel(uint256 amount) external nonReentrant {
        require(hasEntered[msg.sender], "Must enter platform first");
        require(amount >= minimumModelStake, "Below minimum model stake");

        modelStakes[msg.sender] += amount;

        bool success = token.transferFrom(msg.sender, address(this), amount);
        require(success, "Transfer failed");

        emit ModelStaked(msg.sender, amount);
    }

    function placeBet(uint256 hackathonId, address modelOwner, uint256 amount) external nonReentrant {
        require(hasEntered[msg.sender], "Investor must enter platform first");
        require(hasEntered[modelOwner], "Model must exist on platform");
        require(amount > 0, "Bet amount must be positive");

        bets[msg.sender][hackathonId][modelOwner] += amount;
        totalBetsOnModel[hackathonId][modelOwner] += amount;

        bool success = token.transferFrom(msg.sender, address(this), amount);
        require(success, "Transfer failed");

        emit BetPlaced(msg.sender, hackathonId, modelOwner, amount);
    }

    function totalStakeOf(address user) external view returns (uint256) {
        return hasEntered[user] ? entryStakeAmount + modelStakes[user] : 0;
    }

    function getBet(address investor, uint256 hackathonId, address model) external view returns (uint256) {
        return bets[investor][hackathonId][model];
    }

    function getTotalBetsOnModel(uint256 hackathonId, address model) external view returns (uint256) {
        return totalBetsOnModel[hackathonId][model];
    }
}
