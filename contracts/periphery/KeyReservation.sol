// SPDX-License-Identifier: Unlicensed
// Jin Hong Kuan 2021 Copyrighted
pragma solidity ^0.8.0;

import "../Keylinq.sol"; 
import "../ILiquidationCheck.sol";
import "../IDelegator.sol";
import "../libraries/BytesLib.sol"; 
import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; 

contract KeyReservation is IDelegator {

    struct Record {
        address token;
        uint256 depositAmount;
        uint256 validDuration;
        uint256 expiryBlock;
        address delegatedTo;
    }

    event Entrusted(address owner, uint256 id);
    event Returned(address claimant, uint256 id);

    Keylinq _keylinq; 
    mapping(uint256 => Record) private _records;
    mapping(uint256 => uint256[]) private _keys;
    mapping(uint256 => address) private _owners;
    mapping(uint256 => address) private _approvals;

    uint256 private _counter = 0;

    constructor(address keylinq_) {
        _keylinq = Keylinq(keylinq_);
    }

    function isDelegator() external override pure returns(bool) {
        return true;
    }

    function entrust(uint256 id, uint256 index, bytes memory _args) external {
        require(_keylinq.ownerOf(id, index) == msg.sender);
        _keylinq.transferFrom(address(this), id, index);
        require(_args.length == 84, "KeyDelegator: Supplied arguments does not match mode"); 
        address token; 
        assembly {
            token := mload(add(_args, 20))
        }
        _records[_counter] = Record(token, BytesLib.toUint256(_args, 20), BytesLib.toUint256(_args, 52), 0, address(0));
        _owners[_counter] = msg.sender;
        _keys[_counter] = new uint256[](2); 
        _keys[_counter][0] = id;
        _keys[_counter][1] = index; 

        emit Entrusted(msg.sender, _counter);
        _counter++;

    }

    function reserve(uint256 id) payable external {
        require (_approvals[id] == msg.sender, "KeyDelegator: You have not been approved to acquire this key");
        _handlePayment(id);
        _delegateKey(id);
    }

    function returnKey(uint256 id) public {
        require(_records[id].delegatedTo == msg.sender, "KeyDelegator: This can only be called by claimant.");
        _handleReturn(id);
    }

    function delegatedTo(uint256 id, uint256 index) external view override returns(address) {
        uint256 i = _search(id, index);
        if (block.timestamp > _records[i].expiryBlock) {
            return address(this); 
        } else {
            return _records[id].delegatedTo;
        }
    }

    function _search(uint256 id, uint256 index) internal view returns(uint256 ret) {
        for (uint i = 0; i < _counter; i++) {
            if (_keys[i][0] == id && _keys[i][1] == index) {
                return i;
            }
        }
        require(false, "Non-existent pair");
    }

    
    function _handlePayment(uint256 id) internal {
        if (_records[id].token == address(0)) {
            require(msg.value >= _records[id].depositAmount, "KeyDelegator: Insufficient deposit payment");
            address payable sender = payable(msg.sender);
            sender.transfer(msg.value - _records[id].depositAmount);
        } else {
            IERC20 token = IERC20(_records[id].token);
            require(token.allowance(msg.sender, address(this)) >= _records[id].depositAmount, "KeyDelegator: Insufficient deposit payment");
            token.transferFrom(msg.sender, address(this), _records[id].depositAmount);
        } 
        _records[id].delegatedTo = msg.sender; 
    }

    function _handleReturn(uint256 id) public {
        if (_records[id].token == address(0)) {
            address payable returnTo = payable(_records[id].delegatedTo);
            returnTo.transfer(_records[id].depositAmount);
        } else {
            IERC20 token = IERC20(_records[id].token);
            token.transfer(_records[id].delegatedTo, _records[id].depositAmount);
        }
        emit Returned(_records[id].delegatedTo, id);
        _records[id].expiryBlock = 0;
        _records[id].delegatedTo = address(0);        
    }


    function _delegateKey(uint256 id) internal {
        require(_records[id].delegatedTo == address(0) || _records[id].expiryBlock < block.timestamp, "KeyDelegator: Key unavailable, currently delegated to another user");
        // Return deposit if previous claimant hasn't requested return
        if (_records[id].delegatedTo != address(0)) {
            _handleReturn(id);
        }
        _records[id].delegatedTo = msg.sender; 
        _records[id].expiryBlock = block.timestamp + _records[id].validDuration;
    }

    function _erase(uint256 id) internal {
        _owners[id] = address(0);
        _keys[id][0] = 0;
        _keys[id][1] = 0;
        delete _records[id];
        delete _records[id];
        _approvals[id] = address(0);
    }

    

}