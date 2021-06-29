// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.3; 

interface ILiquidationCheck {
    
    function liquidationCheck(address[] memory accounts, uint256 index, bytes memory args) external view returns(bool);
}