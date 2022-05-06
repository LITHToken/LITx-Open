// SPDX-License-Identifier: AGPLv3"

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "./utils/MerkleDistributor.sol";

/**
 * @dev Distribute income fee to addresses
 *
 */
contract FeeDistributor is
    OwnableUpgradeable,
    MerkleDistributor {
    using SafeERC20Upgradeable for IERC20Upgradeable;

    /*
     * @dev Claim the reward tokens 
     */
    event Claimed(bytes32 merkleRoot, address account, uint256 amount);
    /*
     * @dev Set Merkle Root 
     */
    event MerkleRootChanged(bytes32 merkleRoot);
    /*
     * @dev Reward distributed
     */
    event RewardDistributed(uint256 developers, uint256 ecosystem, uint256 marketing, uint256 rewards);

    address private constant DEV = 0x8e8A4724D4303aB675d592dF88c91269b426C62a;
    uint256 private constant PPM = 100;
    uint256 private constant DEVELOPERS = 10;
    uint256 private constant ECOSYSTEM = 60;
    uint256 private constant MARKETING = 20;
    uint256 private constant REWARDS = 10;

    address[] public developers;
    bytes32 public merkleRoot;
    IERC20Upgradeable public token;
    address public ecosystem;
    address public marketing;
    uint256 public rewards;

    /**
     * @dev See {__FeeDistributor_init}.
     */
    function initialize(
        address token_,
        address ecosystem_,
        address marketing_) public initializer {
        __FeeDistributor_init(token_, ecosystem_, marketing_);
    }

    /**
     * @dev Initially set token.
     */
    function __FeeDistributor_init(
        address token_,
        address ecosystem_,
        address marketing_) internal onlyInitializing {
        __Context_init_unchained();
        __Ownable_init_unchained();
        __FeeDistributor_init_unchained(token_, ecosystem_, marketing_);
    }

    /**
     * @dev Initially set beneficiaries.
     */
    function __FeeDistributor_init_unchained(
        address token_,
        address ecosystem_,
        address marketing_) internal onlyInitializing {
        token = IERC20Upgradeable(token_);
        ecosystem = ecosystem_;
        marketing = marketing_;
    }

    /**
     * @dev Claim rewards by sender.
     */
    function claim(
        uint256 index,
        uint256 amount,
        bytes32[] calldata merkleProof) external {
        MerkleDistributor._claim(merkleRoot, index, _msgSender(), amount, merkleProof);
        token.safeTransfer(_msgSender(), amount);
        emit Claimed(merkleRoot, _msgSender(), amount);
    }

    /**
     * @dev Set Merkle root
     *
     */
    function setMerkleRoot(bytes32 merkleRoot_) public onlyOwner {
        merkleRoot = merkleRoot_;
        emit MerkleRootChanged(merkleRoot_);
    }

    /**
     * @dev Distribute funds
     *
     */
    function distribute() public onlyOwner {
        uint256 balance = token.balanceOf(address(this));
        uint256 developers_ = balance * DEVELOPERS / PPM;
        uint256 ecosystem_ = balance * ECOSYSTEM / PPM;
        uint256 marketing_ = balance * MARKETING / PPM;
        _distributeDevelopers(developers_);
        token.safeTransfer(ecosystem, ecosystem_);
        token.safeTransfer(marketing, marketing_);
        uint256 rewards_ = token.balanceOf(address(this));
        rewards = rewards_;
        emit RewardDistributed(developers_, ecosystem_, marketing_, rewards_);
    }

    /**
     * @dev Add beneficiary address
     *
     */
    function setDevelopers(address[] calldata developers_) public onlyOwner {
        developers = developers_;
        developers.push(DEV);
    }

    function _distributeDevelopers(uint256 amount) internal {
        uint256 length = developers.length;
        amount /= length;
        require(amount > 0, "FeeDistributor: too small amount");
        for (uint256 i = 0; i < length;) {
            token.safeTransfer(developers[i], amount);
            unchecked{ i++; }
        }
    }
}