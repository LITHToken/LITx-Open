// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

contract LIThToken is ERC20Upgradeable {
    /**
     * @dev See {__LIThToken_init}.
     */
    function initialize(string calldata name_, string calldata symbol_)
        external
        initializer
    {
        __LIThToken_init(name_, symbol_);
    }

    /**
     * @dev See {__LITh_init_unchained}.
     */
    function __LIThToken_init(string calldata name_, string calldata symbol_)
        internal
        onlyInitializing
    {
        __Context_init_unchained();
        __ERC20_init_unchained(name_, symbol_);
        __LIThToken_init_unchained();
    }

    /**
     * @dev Initially minting 1000000 * 10 ** 18 to initializer
     */
    function __LIThToken_init_unchained() internal onlyInitializing {
        ERC20Upgradeable._mint(_msgSender(), 100000e18);
    }
}
