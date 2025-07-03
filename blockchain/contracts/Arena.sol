// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@chainlink/contracts/src/v0.8/automation/KeeperCompatible.sol";

contract Arena is Ownable(msg.sender), ReentrancyGuard, AccessControl, KeeperCompatibleInterface {
    bytes32 public constant BACKEND_ROLE = keccak256("BACKEND_ROLE");

    uint256 public hackathonCounter;

    struct Hackathon {
        uint256 id;
        uint256 startTime;
        uint256 endTime;
        uint256 prizePool;
        address[] players;
        address winner;
        bool ended;
    }

    mapping(uint256 => Hackathon) public hackathons;
    event PrizePoolUpdated(uint256 indexed hackathonId, uint256 prizePool);
    event HackathonCreated(uint256 indexed id, uint256 startTime, uint256 endTime);
    event PlayerJoined(uint256 indexed id, address indexed player);
    event HackathonEnded(uint256 indexed id, address indexed winner, uint256 prize);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(BACKEND_ROLE, msg.sender);
    }

    modifier hackathonExists(uint256 id) {
        require(hackathons[id].startTime != 0, "Hackathon does not exist");
        _;
    }

    function createHackathon(uint256 startTime) external onlyOwner {
        require(startTime > block.timestamp, "Start time must be in future");

        uint256 id = hackathonCounter++;
        Hackathon storage h = hackathons[id];

        h.id = id;
        h.startTime = startTime;
        h.endTime = startTime + 1 hours;
        h.ended = false;

        emit HackathonCreated(id, h.startTime, h.endTime);
    }

    function joinHackathon(uint256 id) external payable hackathonExists(id) {
        Hackathon storage h = hackathons[id];
        require(block.timestamp < h.endTime, "Hackathon already ended");
        require(msg.value > 0, "Stake required");

        h.players.push(msg.sender);
        h.prizePool += msg.value;

        emit PlayerJoined(id, msg.sender);
    }

    // --- CHAINLINK AUTOMATION LOGIC ---
    function checkUpkeep(bytes calldata) external view override returns (bool upkeepNeeded, bytes memory performData) {
        for (uint256 i = 0; i < hackathonCounter; i++) {
            if (!hackathons[i].ended && block.timestamp >= hackathons[i].endTime) {
                return (true, abi.encode(i));
            }
        }
        return (false, "");
    }

   receive() external payable {
    if (hackathonCounter > 0) {
        uint256 currentHackathonId = hackathonCounter - 1;
        if (!hackathons[currentHackathonId].ended) {
            hackathons[currentHackathonId].prizePool += msg.value;
            
            // Optional: Emit event for tracking
            emit PrizePoolUpdated(currentHackathonId, hackathons[currentHackathonId].prizePool);
        }
    }
}


    function performUpkeep(bytes calldata performData) external override {
        uint256 hackathonId = abi.decode(performData, (uint256));
        require(!hackathons[hackathonId].ended, "Already ended");
        // Now Chainlink Functions should be triggered separately (off-chain JS code)
        // Winner will be submitted via `fulfill(...)`
    }

    // --- CHAINLINK FUNCTIONS CALLBACK ---
    function fulfill(bytes memory data) external onlyRole(BACKEND_ROLE) {
        (uint256 hackathonId, address winner) = abi.decode(data, (uint256, address));
        finalizeHackathon(hackathonId, winner);
    }

    // --- INTERNAL WINNER FINALIZATION ---
    function finalizeHackathon(uint256 id, address winner) internal nonReentrant hackathonExists(id) {
        Hackathon storage h = hackathons[id];
        require(!h.ended, "Hackathon already finalized");

        // ADD WINNER VALIDATION HERE - BEFORE ANY STATE CHANGES
        require(winner != address(0), "Invalid winner address");

        // Verify winner was a participant
        bool isParticipant = false;
        for(uint i = 0; i < h.players.length; i++) {
            if(h.players[i] == winner) {
                isParticipant = true;
                break;
            }
        }
        require(isParticipant, "Winner must be a participant");

        // EXISTING CODE CONTINUES...
        uint256 prize = (h.prizePool * 70) / 100;
        uint256 platformShare = h.prizePool - prize;

        h.ended = true;
        h.winner = winner;

        (bool sentWinner, ) = payable(winner).call{value: prize}("");
        require(sentWinner, "Failed to send prize");

        (bool sentOwner, ) = payable(owner()).call{value: platformShare}("");
        require(sentOwner, "Failed to send platform fee");

        emit HackathonEnded(id, winner, prize);
}

    // Utility for frontend
    function getPlayers(uint256 id) external view returns (address[] memory) {
        return hackathons[id].players;
    }
}
