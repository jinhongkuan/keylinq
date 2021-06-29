// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.0;

import "../Collaterize.sol"; 
import "../ILiquidationCheck.sol";

contract KeyDelegator {

    enum Mode {
        none,
        payToClaim,
        timedDelegatedKey 
    }

    struct payToClaim {
        address token;
        uint256 amount;
    }

    struct timedDelegatedKey {
        uint256 expiryBlock;
        address delegatedTo;
    }

    Collaterize _collateral; 
    mapping(uint256 => Mode) modes;
    mapping(uint256 => payToClaim) payToClaims;
    mapping(uint256 => timedDelegatedKey) timedDelegatedKeys;
    mapping(uint256 => uint256) _key;
    mapping(uint256 => address) _owner;

    uint256 private _counter;

    constructor(address collateral_) {
        _collateral = Collaterize(collateral_);
    }

    function entrust(uint256 id, uint256 index, Mode _mode, bytes memory _args) external {
        require(_collateral.ownerOf(id, index) == msg.sender);
        _collateral.transferFrom(msg.sender, id, index);
        
    }

}