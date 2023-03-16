/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../common";
import type {
  ERC20Wrapper,
  ERC20WrapperInterface,
} from "../../wrapper/ERC20Wrapper";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "_owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "_operator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "_approved",
        type: "bool",
      },
    ],
    name: "ApprovalForAll",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "token_address",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "token_id",
        type: "uint256",
      },
    ],
    name: "TokenRegistration",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "_operator",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "_from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "_to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256[]",
        name: "_ids",
        type: "uint256[]",
      },
      {
        indexed: false,
        internalType: "uint256[]",
        name: "_amounts",
        type: "uint256[]",
      },
    ],
    name: "TransferBatch",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "_operator",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "_from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "_to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_id",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "TransferSingle",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_owner",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_id",
        type: "uint256",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "_owners",
        type: "address[]",
      },
      {
        internalType: "uint256[]",
        name: "_ids",
        type: "uint256[]",
      },
    ],
    name: "balanceOfBatch",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_token",
        type: "address",
      },
      {
        internalType: "address",
        name: "_recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_value",
        type: "uint256",
      },
    ],
    name: "deposit",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_id",
        type: "uint256",
      },
    ],
    name: "getIdAddress",
    outputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getNTokens",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_token",
        type: "address",
      },
    ],
    name: "getTokenID",
    outputs: [
      {
        internalType: "uint256",
        name: "tokenID",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "_operator",
        type: "address",
      },
    ],
    name: "isApprovedForAll",
    outputs: [
      {
        internalType: "bool",
        name: "isOperator",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address payable",
        name: "_from",
        type: "address",
      },
      {
        internalType: "uint256[]",
        name: "_ids",
        type: "uint256[]",
      },
      {
        internalType: "uint256[]",
        name: "_values",
        type: "uint256[]",
      },
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    name: "onERC1155BatchReceived",
    outputs: [
      {
        internalType: "bytes4",
        name: "",
        type: "bytes4",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address payable",
        name: "_from",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_id",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_value",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    name: "onERC1155Received",
    outputs: [
      {
        internalType: "bytes4",
        name: "",
        type: "bytes4",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_from",
        type: "address",
      },
      {
        internalType: "address",
        name: "_to",
        type: "address",
      },
      {
        internalType: "uint256[]",
        name: "_ids",
        type: "uint256[]",
      },
      {
        internalType: "uint256[]",
        name: "_amounts",
        type: "uint256[]",
      },
      {
        internalType: "bytes",
        name: "_data",
        type: "bytes",
      },
    ],
    name: "safeBatchTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_from",
        type: "address",
      },
      {
        internalType: "address",
        name: "_to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_id",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "_data",
        type: "bytes",
      },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_operator",
        type: "address",
      },
      {
        internalType: "bool",
        name: "_approved",
        type: "bool",
      },
    ],
    name: "setApprovalForAll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceID",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_token",
        type: "address",
      },
      {
        internalType: "address payable",
        name: "_to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_value",
        type: "uint256",
      },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
] as const;

const _bytecode =
  "0x6080604052600160025534801561001557600080fd5b50600160008190527fa15bc60c955c405d20d9149c709e2460f1c2d9a497496a7f46004d1772c3054c81905560046020527fabd6e7cb50984ff9c2f3e18a2660c3353dadf4e3291deeb275dae2cd1e44fe0580547fffffffffffffffffffffffff00000000000000000000000000000000000000001690911790556124678061009f6000396000f3fe6080604052600436106100e05760003560e01c80639040a9491161007f578063d9caed1211610059578063d9caed12146102a6578063e985e9c5146102c6578063f23a6e611461031c578063f242432a1461033c57600080fd5b80639040a94914610220578063a22cb46514610235578063bc197c811461025557600080fd5b80634e1273f4116100bb5780634e1273f41461017b57806363f8071c146101a85780637358e9a5146101c85780638340f5491461020d57600080fd5b8062fdd58e146100f857806301ffc9a71461012b5780632eb2c2d61461015b57600080fd5b366100f3576100f16001333461035c565b005b600080fd5b34801561010457600080fd5b50610118610113366004611cc9565b610789565b6040519081526020015b60405180910390f35b34801561013757600080fd5b5061014b610146366004611d23565b6107bf565b6040519015158152602001610122565b34801561016757600080fd5b506100f1610176366004611edb565b6108a3565b34801561018757600080fd5b5061019b610196366004611f89565b610a47565b6040516101229190612086565b3480156101b457600080fd5b506101186101c3366004612099565b610be7565b3480156101d457600080fd5b506101e86101e33660046120b6565b610ca2565b60405173ffffffffffffffffffffffffffffffffffffffff9091168152602001610122565b6100f161021b3660046120cf565b61035c565b34801561022c57600080fd5b50600254610118565b34801561024157600080fd5b506100f161025036600461211e565b610d54565b34801561026157600080fd5b50610275610270366004611edb565b610deb565b6040517fffffffff000000000000000000000000000000000000000000000000000000009091168152602001610122565b3480156102b257600080fd5b506100f16102c13660046120cf565b610f27565b3480156102d257600080fd5b5061014b6102e1366004612157565b73ffffffffffffffffffffffffffffffffffffffff918216600090815260016020908152604080832093909416825291909152205460ff1690565b34801561032857600080fd5b50610275610337366004612185565b610f40565b34801561034857600080fd5b506100f1610357366004612185565b611012565b73ffffffffffffffffffffffffffffffffffffffff8216610404576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602760248201527f455243323057726170706572236465706f7369743a20494e56414c49445f524560448201527f43495049454e540000000000000000000000000000000000000000000000000060648201526084015b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff84166001146106d55734156104b2576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602860248201527f455243323057726170706572236465706f7369743a204e4f4e5f4e554c4c5f4d60448201527f53475f56414c554500000000000000000000000000000000000000000000000060648201526084016103fb565b6040517f23b872dd0000000000000000000000000000000000000000000000000000000081523360048201523060248201526044810183905273ffffffffffffffffffffffffffffffffffffffff8516906323b872dd906064016020604051808303816000875af115801561052b573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061054f91906121ee565b506105586111af565b6105e4576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602560248201527f455243323057726170706572236465706f7369743a205452414e534645525f4660448201527f41494c454400000000000000000000000000000000000000000000000000000060648201526084016103fb565b73ffffffffffffffffffffffffffffffffffffffff8416600090815260036020526040812054908190036106cb57600160026000828254610625919061223a565b9091555050600254600081815260046020908152604080832080547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff8b16908117909155808452600383529281902084905580519283529082018390529193507ff977d54986414fc91816901629d1d788ad95448ab4198dcb9b6dc5ed2b930c1f910160405180910390a16106cf565b8091505b50610768565b348214610764576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602960248201527f455243323057726170706572236465706f7369743a20494e434f52524543545f60448201527f4d53475f56414c5545000000000000000000000000000000000000000000000060648201526084016103fb565b5060015b610783838284604051806020016040528060008152506111e3565b50505050565b73ffffffffffffffffffffffffffffffffffffffff82166000908152602081815260408083208484529091529020545b92915050565b60007fffffffff0000000000000000000000000000000000000000000000000000000082167f01ffc9a700000000000000000000000000000000000000000000000000000000148061085257507fffffffff0000000000000000000000000000000000000000000000000000000082167fd9b67a2600000000000000000000000000000000000000000000000000000000145b806107b957507fffffffff0000000000000000000000000000000000000000000000000000000082167f4e2312e0000000000000000000000000000000000000000000000000000000001492915050565b3373ffffffffffffffffffffffffffffffffffffffff861614806108f7575073ffffffffffffffffffffffffffffffffffffffff8516600090815260016020908152604080832033845290915290205460ff165b610983576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602f60248201527f45524331313535237361666542617463685472616e7366657246726f6d3a204960448201527f4e56414c49445f4f50455241544f52000000000000000000000000000000000060648201526084016103fb565b73ffffffffffffffffffffffffffffffffffffffff8416610a26576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152603060248201527f45524331313535237361666542617463685472616e7366657246726f6d3a204960448201527f4e56414c49445f524543495049454e540000000000000000000000000000000060648201526084016103fb565b610a328585858561128b565b610a40858585855a866114f0565b5050505050565b60608151835114610ada576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602c60248201527f455243313135352362616c616e63654f6642617463683a20494e56414c49445f60448201527f41525241595f4c454e475448000000000000000000000000000000000000000060648201526084016103fb565b6000835167ffffffffffffffff811115610af657610af6611d40565b604051908082528060200260200182016040528015610b1f578160200160208202803683370190505b50905060005b8451811015610bdf57600080868381518110610b4357610b4361224d565b602002602001015173ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000858381518110610b9957610b9961224d565b6020026020010151815260200190815260200160002054828281518110610bc257610bc261224d565b602090810291909101015280610bd78161227c565b915050610b25565b509392505050565b73ffffffffffffffffffffffffffffffffffffffff811660009081526003602052604081205490819003610c9d576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602b60248201527f45524332305772617070657223676574546f6b656e49443a20554e524547495360448201527f54455245445f544f4b454e00000000000000000000000000000000000000000060648201526084016103fb565b919050565b60008181526004602052604090205473ffffffffffffffffffffffffffffffffffffffff1680610c9d576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602d60248201527f455243323057726170706572236765744964416464726573733a20554e52454760448201527f495354455245445f544f4b454e0000000000000000000000000000000000000060648201526084016103fb565b33600081815260016020908152604080832073ffffffffffffffffffffffffffffffffffffffff87168085529083529281902080547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff001686151590811790915590519081529192917f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31910160405180910390a35050565b6000333014610e7c576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152603d60248201527f455243323057726170706572236f6e455243313135354261746368526563656960448201527f7665643a20494e56414c49445f455243313135355f524543454956454400000060648201526084016103fb565b60005b8451811015610efb57610eaa858281518110610e9d57610e9d61224d565b6020026020010151610ca2565b50610ee93087878481518110610ec257610ec261224d565b6020026020010151878581518110610edc57610edc61224d565b6020026020010151611679565b80610ef38161227c565b915050610e7f565b507fbc197c81000000000000000000000000000000000000000000000000000000009695505050505050565b6000610f3284610be7565b905061078333848385611679565b6000333014610fd1576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152603860248201527f455243323057726170706572236f6e4552433131353552656365697665643a2060448201527f494e56414c49445f455243313135355f5245434549564544000000000000000060648201526084016103fb565b610fda84610ca2565b50610fe730868686611679565b507ff23a6e610000000000000000000000000000000000000000000000000000000095945050505050565b3373ffffffffffffffffffffffffffffffffffffffff86161480611066575073ffffffffffffffffffffffffffffffffffffffff8516600090815260016020908152604080832033845290915290205460ff165b6110f2576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602a60248201527f4552433131353523736166655472616e7366657246726f6d3a20494e56414c4960448201527f445f4f50455241544f520000000000000000000000000000000000000000000060648201526084016103fb565b73ffffffffffffffffffffffffffffffffffffffff8416611195576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602b60248201527f4552433131353523736166655472616e7366657246726f6d3a20494e56414c4960448201527f445f524543495049454e5400000000000000000000000000000000000000000060648201526084016103fb565b6111a185858585611969565b610a40858585855a86611a4d565b6000803d80156111c657602081146111cf576111db565b600191506111db565b60206000803e60005191505b501515919050565b73ffffffffffffffffffffffffffffffffffffffff84166000908152602081815260408083208684529091528120805484929061122190849061223a565b9091555050604080518481526020810184905273ffffffffffffffffffffffffffffffffffffffff86169160009133917fc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62910160405180910390a461078360008585855a86611a4d565b805182511461131c576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152603560248201527f45524331313535235f7361666542617463685472616e7366657246726f6d3a2060448201527f494e56414c49445f4152524159535f4c454e475448000000000000000000000060648201526084016103fb565b815160005b8181101561146a5782818151811061133b5761133b61224d565b60200260200101516000808873ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008684815181106113955761139561224d565b6020026020010151815260200190815260200160002060008282546113ba91906122b4565b925050819055508281815181106113d3576113d361224d565b60200260200101516000808773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600086848151811061142d5761142d61224d565b602002602001015181526020019081526020016000206000828254611452919061223a565b909155508190506114628161227c565b915050611321565b508373ffffffffffffffffffffffffffffffffffffffff168573ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167f4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb86866040516114e19291906122c7565b60405180910390a45050505050565b61150f8573ffffffffffffffffffffffffffffffffffffffff16611bcc565b156116715760008573ffffffffffffffffffffffffffffffffffffffff1663bc197c8184338a8989886040518763ffffffff1660e01b8152600401611558959493929190612359565b60206040518083038160008887f1158015611577573d6000803e3d6000fd5b50505050506040513d601f19601f8201168201806040525081019061159c91906123c4565b90507fffffffff0000000000000000000000000000000000000000000000000000000081167fbc197c81000000000000000000000000000000000000000000000000000000001461166f576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152603f60248201527f45524331313535235f63616c6c6f6e455243313135354261746368526563656960448201527f7665643a20494e56414c49445f4f4e5f524543454956455f4d4553534147450060648201526084016103fb565b505b505050505050565b611684848383611c06565b600182146117d6576000828152600460208190526040918290205491517fa9059cbb00000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff8681169282019290925260248101849052911690819063a9059cbb906044016020604051808303816000875af1158015611717573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061173b91906121ee565b506117446111af565b6117d0576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602660248201527f4552433230577261707065722377697468647261773a205452414e534645525f60448201527f4641494c4544000000000000000000000000000000000000000000000000000060648201526084016103fb565b50610783565b73ffffffffffffffffffffffffffffffffffffffff8316611879576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602860248201527f4552433230577261707065722377697468647261773a20494e56414c49445f5260448201527f4543495049454e5400000000000000000000000000000000000000000000000060648201526084016103fb565b60008373ffffffffffffffffffffffffffffffffffffffff168260405160006040518083038185875af1925050503d80600081146118d3576040519150601f19603f3d011682016040523d82523d6000602084013e6118d8565b606091505b5050905080610a40576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602660248201527f4552433230577261707065722377697468647261773a205452414e534645525f60448201527f4641494c4544000000000000000000000000000000000000000000000000000060648201526084016103fb565b73ffffffffffffffffffffffffffffffffffffffff8416600090815260208181526040808320858452909152812080548392906119a79084906122b4565b909155505073ffffffffffffffffffffffffffffffffffffffff8316600090815260208181526040808320858452909152812080548392906119ea90849061223a565b9091555050604080518381526020810183905273ffffffffffffffffffffffffffffffffffffffff808616929087169133917fc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62910160405180910390a450505050565b611a6c8573ffffffffffffffffffffffffffffffffffffffff16611bcc565b156116715760008573ffffffffffffffffffffffffffffffffffffffff1663f23a6e6184338a8989886040518763ffffffff1660e01b8152600401611ab59594939291906123e1565b60206040518083038160008887f1158015611ad4573d6000803e3d6000fd5b50505050506040513d601f19601f82011682018060405250810190611af991906123c4565b90507fffffffff0000000000000000000000000000000000000000000000000000000081167ff23a6e61000000000000000000000000000000000000000000000000000000001461166f576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152603a60248201527f45524331313535235f63616c6c6f6e4552433131353552656365697665643a2060448201527f494e56414c49445f4f4e5f524543454956455f4d45535341474500000000000060648201526084016103fb565b6000813f8015801590611bff57507fc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a4708114155b9392505050565b73ffffffffffffffffffffffffffffffffffffffff831660009081526020818152604080832085845290915281208054839290611c449084906122b4565b9091555050604080518381526020810183905260009173ffffffffffffffffffffffffffffffffffffffff86169133917fc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62910160405180910390a4505050565b73ffffffffffffffffffffffffffffffffffffffff81168114611cc657600080fd5b50565b60008060408385031215611cdc57600080fd5b8235611ce781611ca4565b946020939093013593505050565b7fffffffff0000000000000000000000000000000000000000000000000000000081168114611cc657600080fd5b600060208284031215611d3557600080fd5b8135611bff81611cf5565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b604051601f82017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe016810167ffffffffffffffff81118282101715611db657611db6611d40565b604052919050565b600067ffffffffffffffff821115611dd857611dd8611d40565b5060051b60200190565b600082601f830112611df357600080fd5b81356020611e08611e0383611dbe565b611d6f565b82815260059290921b84018101918181019086841115611e2757600080fd5b8286015b84811015611e425780358352918301918301611e2b565b509695505050505050565b600082601f830112611e5e57600080fd5b813567ffffffffffffffff811115611e7857611e78611d40565b611ea960207fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0601f84011601611d6f565b818152846020838601011115611ebe57600080fd5b816020850160208301376000918101602001919091529392505050565b600080600080600060a08688031215611ef357600080fd5b8535611efe81611ca4565b94506020860135611f0e81611ca4565b9350604086013567ffffffffffffffff80821115611f2b57600080fd5b611f3789838a01611de2565b94506060880135915080821115611f4d57600080fd5b611f5989838a01611de2565b93506080880135915080821115611f6f57600080fd5b50611f7c88828901611e4d565b9150509295509295909350565b60008060408385031215611f9c57600080fd5b823567ffffffffffffffff80821115611fb457600080fd5b818501915085601f830112611fc857600080fd5b81356020611fd8611e0383611dbe565b82815260059290921b84018101918181019089841115611ff757600080fd5b948201945b8386101561201e57853561200f81611ca4565b82529482019490820190611ffc565b9650508601359250508082111561203457600080fd5b5061204185828601611de2565b9150509250929050565b600081518084526020808501945080840160005b8381101561207b5781518752958201959082019060010161205f565b509495945050505050565b602081526000611bff602083018461204b565b6000602082840312156120ab57600080fd5b8135611bff81611ca4565b6000602082840312156120c857600080fd5b5035919050565b6000806000606084860312156120e457600080fd5b83356120ef81611ca4565b925060208401356120ff81611ca4565b929592945050506040919091013590565b8015158114611cc657600080fd5b6000806040838503121561213157600080fd5b823561213c81611ca4565b9150602083013561214c81612110565b809150509250929050565b6000806040838503121561216a57600080fd5b823561217581611ca4565b9150602083013561214c81611ca4565b600080600080600060a0868803121561219d57600080fd5b85356121a881611ca4565b945060208601356121b881611ca4565b93506040860135925060608601359150608086013567ffffffffffffffff8111156121e257600080fd5b611f7c88828901611e4d565b60006020828403121561220057600080fd5b8151611bff81612110565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b808201808211156107b9576107b961220b565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b60007fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82036122ad576122ad61220b565b5060010190565b818103818111156107b9576107b961220b565b6040815260006122da604083018561204b565b82810360208401526122ec818561204b565b95945050505050565b6000815180845260005b8181101561231b576020818501810151868301820152016122ff565b5060006020828601015260207fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0601f83011685010191505092915050565b600073ffffffffffffffffffffffffffffffffffffffff808816835280871660208401525060a0604083015261239260a083018661204b565b82810360608401526123a4818661204b565b905082810360808401526123b881856122f5565b98975050505050505050565b6000602082840312156123d657600080fd5b8151611bff81611cf5565b600073ffffffffffffffffffffffffffffffffffffffff808816835280871660208401525084604083015283606083015260a0608083015261242660a08301846122f5565b97965050505050505056fea2646970667358221220fbfcc6c75862742e9d0faa511dfeaf78ac2b9ae75928eeb41187adee5c14cbf964736f6c63430008120033";

type ERC20WrapperConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ERC20WrapperConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class ERC20Wrapper__factory extends ContractFactory {
  constructor(...args: ERC20WrapperConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ERC20Wrapper> {
    return super.deploy(overrides || {}) as Promise<ERC20Wrapper>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): ERC20Wrapper {
    return super.attach(address) as ERC20Wrapper;
  }
  override connect(signer: Signer): ERC20Wrapper__factory {
    return super.connect(signer) as ERC20Wrapper__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ERC20WrapperInterface {
    return new utils.Interface(_abi) as ERC20WrapperInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ERC20Wrapper {
    return new Contract(address, _abi, signerOrProvider) as ERC20Wrapper;
  }
}
