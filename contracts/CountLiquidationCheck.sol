pragma solidity ^0.8.3; 

import "./Collaterize.sol"; 
import "./ILiquidationCheck.sol";

contract CountLiquidationCheck is ILiquidationCheck {

    
    constructor() ILiquidationCheck() {}

    function liquidationCheck(address[] memory accounts, uint256 index, bytes memory args) 
    external 
    view 
    override 
    returns(bool) {
        uint256 threshold;
        for(uint i=0;i<args.length;i++){
            threshold = threshold + uint(uint8(args[i]))*(2**(8*(args.length-(i+1))));
        }
        
        uint256 count = 0;
        for (uint i = 0; i < accounts.length; i++) {
            if (accounts[i] == accounts[index]) count++;
        }
        return count >= threshold;
    }


}