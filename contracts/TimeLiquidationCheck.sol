pragma solidity ^0.8.3; 

import "./ILiquidationCheck.sol"; 

contract TimeLiquidationCheck is ILiquidationCheck {

    constructor() ILiquidationCheck() {}

    function liquidationCheck(address[] memory accounts, uint256 index, bytes memory args) 
    external 
    view 
    override 
    returns(bool) {
        uint256 timeStamp;
        for(uint i=0;i<args.length;i++){
            timeStamp = timeStamp + uint(uint8(args[i]))*(2**(8*(args.length-(i+1))));
        }
        if (accounts[0] == accounts[0] || accounts[1] == accounts[1]) return false;
        
        return (index == 1 && block.timestamp >= timeStamp);
    }
}