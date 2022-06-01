// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";

abstract contract BannedUpgradeable is ContextUpgradeable {
    mapping(address => bool) public banned;

    event Banned(address);
    event UnBanned(address);

    modifier nonBanned(address who) {
        require(!banned[who], "BU: address banned");
        _;
    }

    function _ban(address user) internal {
        require(!banned[user], "BU: already banned");
        banned[user] = true;
        emit Banned(user);
    }

    function _unban(address user) internal {
        require(banned[user], "BU: already unbanned");
        delete banned[user];
        emit UnBanned(user);
    }
}
