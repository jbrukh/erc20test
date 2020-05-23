/* Generated by ts-generator ver. 0.0.8 */
/* tslint:disable */

import { Contract, ContractFactory, Signer } from "ethers";
import { Provider } from "ethers/providers";
import { UnsignedTransaction } from "ethers/utils/transaction";

import { TransactionOverrides } from ".";
import { PredictionMarket } from "./PredictionMarket";

export class PredictionMarketFactory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(
    _niftyDollarAddr: string,
    overrides?: TransactionOverrides
  ): Promise<PredictionMarket> {
    return super.deploy(_niftyDollarAddr, overrides) as Promise<
      PredictionMarket
    >;
  }
  getDeployTransaction(
    _niftyDollarAddr: string,
    overrides?: TransactionOverrides
  ): UnsignedTransaction {
    return super.getDeployTransaction(_niftyDollarAddr, overrides);
  }
  attach(address: string): PredictionMarket {
    return super.attach(address) as PredictionMarket;
  }
  connect(signer: Signer): PredictionMarketFactory {
    return super.connect(signer) as PredictionMarketFactory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): PredictionMarket {
    return new Contract(address, _abi, signerOrProvider) as PredictionMarket;
  }
}

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_niftyDollarAddr",
        type: "address"
      }
    ],
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "predictor",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "assetPrice",
        type: "uint256"
      }
    ],
    name: "PredictPriceDown",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "predictor",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "assetPrice",
        type: "uint256"
      }
    ],
    name: "PredictPriceUp",
    type: "event"
  },
  {
    inputs: [],
    name: "allowedToBuy",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "buy",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "addr",
        type: "address"
      }
    ],
    name: "getBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getChallengeBlock",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getCurrentPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getExpirationBlock",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "niftyDollarAddr",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256"
      }
    ],
    name: "predictPriceDown",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256"
      }
    ],
    name: "predictPriceUp",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
];

const _bytecode =
  "0x6080604052600080557fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff60035560006004556001600555600560065534801561004757600080fd5b50604051610d67380380610d678339818101604052602081101561006a57600080fd5b810190808051906020019092919050505080600760006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550600760009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550600654430160038190555050610c2d8061013a6000396000f3fe608060405234801561001057600080fd5b506004361061009e5760003560e01c80637ad20af1116100665780637ad20af1146101495780638832bcad14610167578063a6f2ae3a146101b1578063eb91d37e146101bb578063f8b2cb4f146101d95761009e565b80633ccfd60b146100a35780634b98e4a8146100ad578063526958c9146100db57806360aa825a14610109578063778f26fb14610127575b600080fd5b6100ab610231565b005b6100d9600480360360208110156100c357600080fd5b81019080803590602001909291905050506104cc565b005b610107600480360360208110156100f157600080fd5b810190808035906020019092919050505061077d565b005b610111610a88565b6040518082815260200191505060405180910390f35b61012f610a92565b604051808215151515815260200191505060405180910390f35b610151610a9e565b6040518082815260200191505060405180910390f35b61016f610aa8565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b6101b9610ace565b005b6101c3610b2a565b6040518082815260200191505060405180910390f35b61021b600480360360208110156101ef57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610b33565b6040518082815260200191505060405180910390f35b60035443116102a8576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601b8152602001807f546865206d61726b6574206973207374696c6c206163746976652e000000000081525060200191505060405180910390fd5b6000600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020541161035d576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260168152602001807f53656e64657220686173206e6f2062616c616e63652e0000000000000000000081525060200191505060405180910390fd5b6000600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009055600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663a9059cbb33836040518363ffffffff1660e01b8152600401808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200182815260200192505050602060405180830381600087803b15801561048d57600080fd5b505af11580156104a1573d6000803e3d6000fd5b505050506040513d60208110156104b757600080fd5b81019080805190602001909291905050505050565b80600180821015610528576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526029815260200180610baa6029913960400191505060405180910390fd5b6003544311156105a0576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260198152602001807f546865206d61726b6574206973206e6f7720636c6f7365642e0000000000000081525060200191505060405180910390fd5b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166323b872dd3330866040518463ffffffff1660e01b8152600401808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018281526020019350505050602060405180830381600087803b15801561067d57600080fd5b505af1158015610691573d6000803e3d6000fd5b505050506040513d60208110156106a757600080fd5b81019080805190602001909291905050505082600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254019250508190555082600080828254019250508190555060055443016004819055503373ffffffffffffffffffffffffffffffffffffffff167f159ad49d4d5f1259778fa78a7e799ada24c06abf562be135d0dee65c721b5e3984600054604051808381526020018281526020019250505060405180910390a2505050565b806001808210156107d9576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526029815260200180610baa6029913960400191505060405180910390fd5b600354431115610851576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260198152602001807f546865206d61726b6574206973206e6f7720636c6f7365642e0000000000000081525060200191505060405180910390fd5b60005483106108ab576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602d815260200180610b7d602d913960400191505060405180910390fd5b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166323b872dd3330866040518463ffffffff1660e01b8152600401808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018281526020019350505050602060405180830381600087803b15801561098857600080fd5b505af115801561099c573d6000803e3d6000fd5b505050506040513d60208110156109b257600080fd5b81019080805190602001909291905050505082600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254019250508190555082600080828254039250508190555060055443016004819055503373ffffffffffffffffffffffffffffffffffffffff167f40e695958154bb32f8e89e039422fc733fceb8e5948d72236cecefb906de18d684600054604051808381526020018281526020019250505060405180910390a2505050565b6000600354905090565b60006004544311905090565b6000600454905090565b600760009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6004544311610b28576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526025815260200180610bd36025913960400191505060405180910390fd5b565b60008054905090565b6000600260008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905091905056fe54686520616d6f756e742063616e6e6f74206d65206d6f7265207468616e2063757272656e742070726963652e54686520616d6f756e74206d757374206265206d6f7265207468616e20746865206d696e696d756d2e546865206368616c6c656e676520706572696f64206973206e6f74206f766572207965742ea26469706673582212209da334e1abd1b74195bb450f5652ac1e2a348631e74617eec23e533a90acb91464736f6c63430006020033";
