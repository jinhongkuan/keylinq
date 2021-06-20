pragma solidity ^0.8.3; 

interface ILiquidationCheck {
    function liquidationCheck(address creator, address owner, bytes memory args) external returns(bool);
    function toString(address creator, address owner, bytes memory args) external returns(string memory);

}