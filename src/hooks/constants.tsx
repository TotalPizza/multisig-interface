export const multisigABI = [
    {
      "constant": false,
      "inputs": [
        {
          "name": "to",
          "type": "uint256",
        },
        {
          "name": "selector",
          "type": "uint256",
        },
        {
          "name": "calldata",
          "type": "uint256[]",
        }
      ],
      "name": "multicall",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];