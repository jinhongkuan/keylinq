pragma solidity ^0.8.3;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; 
import "./ILiquidationCheck.sol"; 

contract Collaterize {

    event Created(address from, uint256 id);
    event Transfer(address from, address to, uint256 id);
    event Liquidated(address by, uint256 id);

    struct Collateral {
        address token; 
        uint256 amount;
        ILiquidationCheck liquidation;
        bytes args;
    }

    mapping(address => uint256) public createdBalance; 
    mapping(address => uint256) public ownedBalance; 
    mapping(uint256 => address) public collateralOwners; 
    mapping(uint256 => address) public collateralCreators; 
    mapping(uint256 => address) public collateralApprovals; 
    mapping(uint256 => Collateral) public collaterals;

    uint256 _counter;

    constructor() {
    }


    function createCollateralERC20(address token, uint256 amount, address liquidationCheck, bytes memory args) external {
        IERC20(token).transferFrom(msg.sender, address(this), amount); 
        Collateral memory newCollateral = Collateral(
            token, 
            amount, 
            ILiquidationCheck(liquidationCheck), 
            args);
        _create(newCollateral);
    }

    function createCollateralETH(address liquidationCheck, bytes memory args) external payable {
        Collateral memory newCollateral = Collateral(
            address(0), 
            msg.value, 
            ILiquidationCheck(liquidationCheck), 
            args);
        _create(newCollateral);
    }

    function getCreatedCollaterals(address account) external view returns(uint256[] memory) {
        uint256[] memory idList = new uint256[](createdBalance[account]); 
        uint256 counter = 0;
        for (uint i = 0; i<_counter; i++) {
            if (collateralCreators[i] == account) idList[counter++] = i;
        }
        return idList;
    }

    function getOwnedCollaterals(address account) external view returns(uint256[] memory) {
        uint256[] memory idList = new uint256[](ownedBalance[account]); 
        uint256 counter = 0;
        for (uint i = 0; i<_counter; i++) {
            if (collateralOwners[i] == account) idList[counter++] = i;
        }
        return idList;
    }

    function transfer(address to, uint256 id) public {
        require(collateralOwners[id] == msg.sender); 
        collateralOwners[id] = to;
        ownedBalance[msg.sender] -= 1;
        ownedBalance[to] += 1;
    }

    function approve(address to, uint256 id) public {
        require(collateralOwners[id] == msg.sender); 
        collateralApprovals[id] = to;
    }

    function transferFrom(address to, uint256 id) public {
        require(collateralApprovals[id] == msg.sender); 
        address previousOwner = collateralOwners[id];
        collateralOwners[id] = to;
        collateralApprovals[id] = address(0);
        ownedBalance[previousOwner] -= 1;
        ownedBalance[to] += 1;
    }

    function liquidate(uint256 id) public {
        require(collateralOwners[id] == msg.sender);
        if (collateralCreators[id] == msg.sender || 
        collaterals[id].liquidation.liquidationCheck(collateralCreators[id], collateralOwners[id], collaterals[id].args)) {
            if (collaterals[id].token == address(0)) {
                address payable recepient = payable(msg.sender);
                recepient.transfer(collaterals[id].amount);
            } else {
                IERC20(collaterals[id].token).transfer(msg.sender, collaterals[id].amount);
            }
            _remove(id);
            emit Liquidated(msg.sender, id);
        }
    }

    function _create(Collateral memory newCollateral) internal {
        collaterals[_counter] = newCollateral;
        collateralOwners[_counter] = msg.sender; 
        collateralCreators[_counter] = msg.sender;
        createdBalance[msg.sender] += 1;
        ownedBalance[msg.sender] += 1;
        emit Created(msg.sender, _counter);
        _counter++;
    }

    function _remove(uint256 id) internal {
        createdBalance[msg.sender] -= 1;
        ownedBalance[msg.sender] -= 1;
        collateralCreators[id] = address(0);
        collateralOwners[id] = address(0);
        collateralApprovals[id] = address(0);
    }


}