// SPDX-License-Identifier: UNLICENSED
// Jin Hong Kuan 2021 Copyrighted
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol"; 
import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; 

import "./ILiquidationCheck.sol"; 
import "./IDelegator.sol"; 


contract Keylinq {

    event Created(address from, uint256 id);
    event TransferKey(address from, address to, uint256 id);
    event Liquidated(address by, uint256 id);

    struct Collateral {
        address token; 
        uint256 amount;
        address[] accounts;
        string uri;
        ILiquidationCheck liquidation;
        bytes args;
    }

    mapping(address => uint256) private _ownedBalance; 
    mapping(address => uint256) private _delegateBalance; 
    mapping(uint256 => mapping(uint256=>address)) private _collateralApprovals; 
    mapping(uint256 => mapping(uint256=>address)) private _collateralDelegates; 
    mapping(uint256 => Collateral) public _collaterals;
    mapping(address => bool) _isDelegator; 

    uint256 private _counter;

    constructor() {
    }

    modifier isOwner(address caller, uint256 id, uint256 index) {
        require(_collaterals[id].accounts[index] == caller, "Ownership criteria not fulfilled");
        _;
    }

    modifier isEffectiveOwner(address caller, uint256 id, uint256 index) {
        require(getEffectiveOwner(id, index) == caller, "Effective ownership criteria not fulfilled");
        _;
    }

    function ownerOf(uint256 id, uint256 index) view external returns(address) {
        return _collaterals[id].accounts[index];
    }


    function createCollateralERC20(address token, uint256 amount, uint256 accounts, string memory uri, address liquidation, bytes memory args) external {
        IERC20 tokenContract = IERC20(token);
        require(tokenContract.allowance(msg.sender, address(this)) >= amount, "Insufficient approved amount.");
        tokenContract.transferFrom(msg.sender, address(this), amount); 
        _create(msg.sender, token, amount, accounts, uri, liquidation, args);
    }

    function createCollateralETH(uint256 accounts, string memory uri, address liquidation, bytes memory args) external payable {
        _create(msg.sender, address(0), msg.value, accounts, uri, liquidation, args);
    }

    function getOwnedCollaterals(address account) external view returns(uint256[] memory) {
        uint256[] memory idList = new uint256[](_ownedBalance[account]); 
        uint256 counter = 0;
        for (uint i = 0; i<_counter; i++) {
            for (uint j = 0; j < _collaterals[i].accounts.length; j++) {
                if (_collaterals[i].accounts[j] == account) {
                    idList[counter++] = i;
                    break;
                } 
            }
        }
        return idList;
    }

    function getDelegatedCollaterals(address account) external view returns(uint256[] memory) {
        uint256[] memory idList = new uint256[](_delegateBalance[account]); 
        uint256 counter = 0;
        for (uint i = 0; i<_counter; i++) {
            for (uint j = 0; j < _collaterals[i].accounts.length; j++) {
                if (_collateralDelegates[i][j] == account) {
                    idList[counter++] = i;
                    break;
                } 
            }
        }
        return idList;
    }

    function getCollateral(uint256 id) external view returns (Collateral memory) {
        return _collaterals[id];
    }

    function getEffectiveOwners(uint256 id) public view returns(address[] memory) {
        address[] memory accounts = new address[](_collaterals[id].accounts.length); 
        for (uint i = 0; i < _collaterals[id].accounts.length; i++) {
            accounts[i] = getEffectiveOwner(id, i);
        }
        return accounts;
    }

    function getEffectiveOwner(uint256 id, uint256 index) public view returns(address) {
        address owner = _collaterals[id].accounts[index];
        address delegatedTo = _isDelegator[owner] ? IDelegator(owner).delegatedTo(id, index) : _collateralDelegates[id][index]; 
        if (delegatedTo == address(0)) {
            return owner;
        } else {
            return delegatedTo;
        }
    }

    function transfer(address to, uint256 id, uint256 index) isOwner(msg.sender, id, index) public {
        _transfer(msg.sender, to, id, index);
    }

    function approve(address to, uint256 id, uint256 index) isOwner(msg.sender, id, index) public {
        _collateralApprovals[id][index] = to;
    }

    function delegate(address to, uint256 id, uint256 index) isOwner(msg.sender, id, index) public {
        _collateralDelegates[id][index] = to;
    }

    function transferFrom(address to, uint256 id, uint256 index) public {
        require(_collateralApprovals[id][index] == msg.sender, "You have not been approved to transfer."); 
        address previousOwner = _collaterals[id].accounts[index];
        _transfer(previousOwner, to, id, index);
    }

    function liquidate(uint256 id, uint256 index) isEffectiveOwner(msg.sender, id, index) public {
        require(ILiquidationCheck(_collaterals[id].liquidation)
        .liquidationCheck(
            getEffectiveOwners(id), 
            index, 
            _collaterals[id].args), "Liquidation criteria not met.");
        if (_collaterals[id].token == address(0)) {
            address payable recepient = payable(msg.sender);
            recepient.transfer(_collaterals[id].amount);
        } else {
            IERC20(_collaterals[id].token).transfer(msg.sender, _collaterals[id].amount);
        }
        _remove(id);
    }

    function _transfer(address from, address to, uint256 id, uint256 index) internal {
        _isDelegator[to] = _callDelegationCheck(to);
        
        bool gainedOwnership = true;
        for (uint i = 0; i < _collaterals[id].accounts.length; i++) {
            if (_collaterals[id].accounts[i] == to) {
                gainedOwnership = false;
            }
        }
        _collaterals[id].accounts[index] = to;
        bool lostOwnership = true;
        for (uint i = 0; i < _collaterals[id].accounts.length; i++) {
            if (_collaterals[id].accounts[i] == from) {
                lostOwnership = false;
            }
        }
        if (gainedOwnership) _ownedBalance[to] += 1;
        if (lostOwnership) _ownedBalance[from] -= 1;

        _collateralApprovals[id][index] == address(0);
        _collateralDelegates[id][index] == address(0);
    }

    function _create(address from, address token, uint256 amount, uint256 accounts, string memory uri, address liquidation, bytes memory args) internal {
        address[] memory holders = new address[](accounts);
        for (uint i = 0; i < accounts; i++) holders[i] = from; 
        _collaterals[_counter] = Collateral(
            token, amount, holders, uri, ILiquidationCheck(liquidation), args
        );
        _ownedBalance[from] += 1;
        emit Created(from, _counter);
        _counter++;
    }

    function _remove(uint256 id) internal {
        for (uint i = 0; i < _collaterals[id].accounts.length; i++) {
            address owner = _collaterals[id].accounts[i];
            address shadowedAddress = _collateralDelegates[id][i]; 
            if (owner != address(0)) {
                _ownedBalance[owner] -= 1;
                for (uint j = i; j < _collaterals[id].accounts.length; j++) {
                    if (_collaterals[id].accounts[j] == owner) {
                        _collaterals[id].accounts[j] = address(0); 
                    }
                }
            }
            if (shadowedAddress != address(0)) {
                _delegateBalance[shadowedAddress] -= 1;
                for (uint j = i; j < _collaterals[id].accounts.length; j++) {
                    if (_collateralDelegates[id][j] == shadowedAddress) {
                        _collateralDelegates[id][j] = address(0); 
                    }
                }
            }
           
        }
        delete _collaterals[id]; 
    }

    function _callDelegationCheck(address holder) public returns (bool) {

        bool success;
        bytes memory data = abi.encodeWithSignature("isDelegator()");

        assembly {
            success := call(
                gas(),            // gas remaining
                holder,         // destination address
                0,              // no ether
                add(data, 32),  // input buffer (starts after the first 32 bytes in the `data` array)
                mload(data),    // input length (loaded from the first 32 bytes in the `data` array)
                0,              // output buffer
                0               // output length
            )
        }

        require(success, "delegation chck failed");

        return success;
    }


}