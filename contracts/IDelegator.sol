//SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.0;

interface IDelegator {
    function isDelegator() external pure returns(bool);
    function delegatedTo(uint256 id, uint256 index) external view returns(address);
}