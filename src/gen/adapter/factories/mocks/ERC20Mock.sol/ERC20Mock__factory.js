"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.ERC20Mock__factory = void 0;
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
var ethers_1 = require("ethers");
var _abi = [
    {
        inputs: [],
        stateMutability: "nonpayable",
        type: "constructor"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "owner",
                type: "address"
            },
            {
                indexed: true,
                internalType: "address",
                name: "spender",
                type: "address"
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "value",
                type: "uint256"
            },
        ],
        name: "Approval",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "from",
                type: "address"
            },
            {
                indexed: true,
                internalType: "address",
                name: "to",
                type: "address"
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "value",
                type: "uint256"
            },
        ],
        name: "Transfer",
        type: "event"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "owner",
                type: "address"
            },
            {
                internalType: "address",
                name: "spender",
                type: "address"
            },
        ],
        name: "allowance",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "spender",
                type: "address"
            },
            {
                internalType: "uint256",
                name: "value",
                type: "uint256"
            },
        ],
        name: "approve",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool"
            },
        ],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "owner",
                type: "address"
            },
        ],
        name: "balanceOf",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "spender",
                type: "address"
            },
            {
                internalType: "uint256",
                name: "subtractedValue",
                type: "uint256"
            },
        ],
        name: "decreaseAllowance",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool"
            },
        ],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "spender",
                type: "address"
            },
            {
                internalType: "uint256",
                name: "addedValue",
                type: "uint256"
            },
        ],
        name: "increaseAllowance",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool"
            },
        ],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_address",
                type: "address"
            },
            {
                internalType: "uint256",
                name: "_amount",
                type: "uint256"
            },
        ],
        name: "mockMint",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [],
        name: "totalSupply",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "to",
                type: "address"
            },
            {
                internalType: "uint256",
                name: "value",
                type: "uint256"
            },
        ],
        name: "transfer",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool"
            },
        ],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "from",
                type: "address"
            },
            {
                internalType: "address",
                name: "to",
                type: "address"
            },
            {
                internalType: "uint256",
                name: "value",
                type: "uint256"
            },
        ],
        name: "transferFrom",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool"
            },
        ],
        stateMutability: "nonpayable",
        type: "function"
    },
];
var _bytecode = "0x608060405234801561001057600080fd5b506106ae806100206000396000f3fe608060405234801561001057600080fd5b50600436106100a35760003560e01c80633950935111610076578063a457c2d71161005b578063a457c2d714610153578063a9059cbb14610166578063dd62ed3e1461017957600080fd5b8063395093511461010a57806370a082311461011d57600080fd5b8063095ea7b3146100a857806318160ddd146100d057806323b872dd146100e2578063378934b4146100f5575b600080fd5b6100bb6100b6366004610568565b6101bf565b60405190151581526020015b60405180910390f35b6002545b6040519081526020016100c7565b6100bb6100f0366004610592565b6101d6565b610108610103366004610568565b610235565b005b6100bb610118366004610568565b610243565b6100d461012b3660046105ce565b73ffffffffffffffffffffffffffffffffffffffff1660009081526020819052604090205490565b6100bb610161366004610568565b610287565b6100bb610174366004610568565b6102cb565b6100d46101873660046105f0565b73ffffffffffffffffffffffffffffffffffffffff918216600090815260016020908152604080832093909416825291909152205490565b60006101cc3384846102d8565b5060015b92915050565b60006101e3848484610387565b73ffffffffffffffffffffffffffffffffffffffff841660009081526001602090815260408083203380855292529091205461022b918691610226908690610652565b6102d8565b5060019392505050565b61023f828261047c565b5050565b33600081815260016020908152604080832073ffffffffffffffffffffffffffffffffffffffff8716845290915281205490916101cc918590610226908690610665565b33600081815260016020908152604080832073ffffffffffffffffffffffffffffffffffffffff8716845290915281205490916101cc918590610226908690610652565b60006101cc338484610387565b73ffffffffffffffffffffffffffffffffffffffff82166102f857600080fd5b73ffffffffffffffffffffffffffffffffffffffff831661031857600080fd5b73ffffffffffffffffffffffffffffffffffffffff83811660008181526001602090815260408083209487168084529482529182902085905590518481527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92591015b60405180910390a3505050565b73ffffffffffffffffffffffffffffffffffffffff82166103a757600080fd5b73ffffffffffffffffffffffffffffffffffffffff8316600090815260208190526040812080548392906103dc908490610652565b909155505073ffffffffffffffffffffffffffffffffffffffff821660009081526020819052604081208054839290610416908490610665565b925050819055508173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef8360405161037a91815260200190565b73ffffffffffffffffffffffffffffffffffffffff821661049c57600080fd5b80600260008282546104ae9190610665565b909155505073ffffffffffffffffffffffffffffffffffffffff8216600090815260208190526040812080548392906104e8908490610665565b909155505060405181815273ffffffffffffffffffffffffffffffffffffffff8316906000907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9060200160405180910390a35050565b803573ffffffffffffffffffffffffffffffffffffffff8116811461056357600080fd5b919050565b6000806040838503121561057b57600080fd5b6105848361053f565b946020939093013593505050565b6000806000606084860312156105a757600080fd5b6105b08461053f565b92506105be6020850161053f565b9150604084013590509250925092565b6000602082840312156105e057600080fd5b6105e98261053f565b9392505050565b6000806040838503121561060357600080fd5b61060c8361053f565b915061061a6020840161053f565b90509250929050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b818103818111156101d0576101d0610623565b808201808211156101d0576101d061062356fea26469706673582212204ced6c7ee2b0d3c1112cef302fab58528283d0ddc8a261585864889235e8dd0c64736f6c63430008120033";
var isSuperArgs = function (xs) { return xs.length > 1; };
var ERC20Mock__factory = /** @class */ (function (_super) {
    __extends(ERC20Mock__factory, _super);
    function ERC20Mock__factory() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var _this = this;
        if (isSuperArgs(args)) {
            _this = _super.apply(this, args) || this;
        }
        else {
            _this = _super.call(this, _abi, _bytecode, args[0]) || this;
        }
        return _this;
    }
    ERC20Mock__factory.prototype.deploy = function (overrides) {
        return _super.prototype.deploy.call(this, overrides || {});
    };
    ERC20Mock__factory.prototype.getDeployTransaction = function (overrides) {
        return _super.prototype.getDeployTransaction.call(this, overrides || {});
    };
    ERC20Mock__factory.prototype.attach = function (address) {
        return _super.prototype.attach.call(this, address);
    };
    ERC20Mock__factory.prototype.connect = function (signer) {
        return _super.prototype.connect.call(this, signer);
    };
    ERC20Mock__factory.createInterface = function () {
        return new ethers_1.utils.Interface(_abi);
    };
    ERC20Mock__factory.connect = function (address, signerOrProvider) {
        return new ethers_1.Contract(address, _abi, signerOrProvider);
    };
    ERC20Mock__factory.bytecode = _bytecode;
    ERC20Mock__factory.abi = _abi;
    return ERC20Mock__factory;
}(ethers_1.ContractFactory));
exports.ERC20Mock__factory = ERC20Mock__factory;
