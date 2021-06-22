// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; 
import "./ILiquidationCheck.sol"; 

contract Collateralize {

    event Created(address from, uint256 id);
    event Transfer(address from, address to, uint256 id);
    event Liquidated(address by, uint256 id);

    struct Collateral {
        address token; 
        uint256 amount;
        address[] accounts;
        ILiquidationCheck liquidation;
        bytes args;
    }

    mapping(address => uint256) public ownedBalance; 
    mapping(uint256 => mapping(uint256=>address)) public collateralApprovals; 
    mapping(uint256 => Collateral) public collaterals;

    uint256 _counter;

    constructor() {
    }

    modifier isOwner(address caller, uint256 id, uint256 index) {
        require(collaterals[id].accounts[index] == caller, "Ownership criteria not fulfilled");
        _;
    }


    function createCollateralERC20(address token, uint256 amount, uint256 accounts, address liquidation, bytes memory args) external {
        IERC20(token).transferFrom(msg.sender, address(this), amount); 
        _create(msg.sender, token, amount, accounts, liquidation, args);
    }

    function createCollateralETH(uint256 accounts, address liquidation, bytes memory args) external payable {
        _create(msg.sender, address(0), msg.value, accounts, liquidation, args);
    }

    function getOwnedCollaterals(address account) external view returns(uint256[] memory) {
        uint256[] memory idList = new uint256[](ownedBalance[account]); 
        uint256 counter = 0;
        for (uint i = 0; i<_counter; i++) {
            for (uint j = 0; j < collaterals[i].accounts.length; j++) {
                if (collaterals[i].accounts[j] == account) {
                    idList[counter++] = i;
                    break;
                } 
            }
        }
        return idList;
    }

    function transfer(address to, uint256 id, uint256 index) isOwner(msg.sender, id, index) public {
        _transfer(msg.sender, to, id, index);
    }

    function approve(address to, uint256 id, uint256 index) isOwner(msg.sender, id, index) public {
        collateralApprovals[id][index] = to;
    }

    function transferFrom(address to, uint256 id, uint256 index) public {
        require(collateralApprovals[id][index] == msg.sender, "You have not been approved to transfer."); 
        address previousOwner = collaterals[id].accounts[index];
        _transfer(previousOwner, to, id, index);
    }

    function liquidate(uint256 id, uint256 index) isOwner(msg.sender, id, index) public {
        require(ILiquidationCheck(collaterals[id].liquidation)
        .liquidationCheck(
            collaterals[id].accounts, 
            index, 
            collaterals[id].args), "Liquidation criteria not met.");
        if (collaterals[id].token == address(0)) {
            address payable recepient = payable(msg.sender);
            recepient.transfer(collaterals[id].amount);
        } else {
            IERC20(collaterals[id].token).transfer(msg.sender, collaterals[id].amount);
        }
        _remove(id);
    }

    function _transfer(address from, address to, uint256 id, uint256 index) internal {
        bool gainedOwnership = true;
        for (uint i = 0; i < collaterals[id].accounts.length; i++) {
            if (collaterals[id].accounts[i] == to) {
                gainedOwnership = false;
            }
        }
        collaterals[id].accounts[index] = to;
        bool lostOwnership = true;
        for (uint i = 0; i < collaterals[id].accounts.length; i++) {
            if (collaterals[id].accounts[i] == to) {
                lostOwnership = false;
            }
        }
        if (gainedOwnership) ownedBalance[to] += 1;
        if (lostOwnership) ownedBalance[from] -= 1;
    }

    function _create(address from, address token, uint256 amount, uint256 accounts, address liquidation, bytes memory args) internal {
        address[] memory holders = new address[](accounts);
        for (uint i = 0; i < accounts; i++) holders[i] = from; 
        collaterals[_counter] = Collateral(
            token, amount, holders, ILiquidationCheck(liquidation), args
        );
        ownedBalance[from] += 1;
        emit Created(from, _counter);
        _counter++;
    }

    function _remove(uint256 id) internal {
        for (uint i = 0; i < collaterals[id].accounts.length; i++) {
            address owner = collaterals[id].accounts[i];
            for (uint j = i; j < collaterals[id].accounts.length; j++) {
                if (collaterals[id].accounts[j] == owner) collaterals[id].accounts[j] = address(0); 
            }
            if (owner != address(0)) ownedBalance[owner] -= 1;
        }
        delete collaterals[id]; 
    }


}