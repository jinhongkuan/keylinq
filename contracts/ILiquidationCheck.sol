pragma solidity ^0.8.3; 

interface ILiquidationCheck {
    function liquidationCheck(address[] memory accounts, uint256 index, bytes memory args) external returns(bool);
}