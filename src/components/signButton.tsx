// SignMessage.tsx
import React from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import Web3 from 'web3';
import styles from '@/styles/Home.module.css';
import { ethers } from "ethers";
import {uint256,hash} from 'starknet'
import { keccak256 } from 'ethers/lib/utils';

export interface SignMessageProps {
  contract_address: string;
  selector: string;
  calldata: string[];
  signatures: string[];
}

export default function SignMessage(props: {contract_address: string, selector: string, nonce: number, calldata: string[], calldataNames: string[], verifyingContract: string, onSign: (message: SignMessageProps) => void}){
  const signTransaction = async () => {
    const provider: any = await detectEthereumProvider();

    if (provider) {
      // MetaMask is detected
      const web3 = new Web3(provider);

      const accounts = await web3.eth.getAccounts();
      if (accounts.length === 0) {
        alert('Please connect to MetaMask.');
        return;
      }
      const signer = accounts[0];

      const contract_address = props.contract_address.padStart(64, '0');
      const selector = hash.getSelectorFromName(props.selector).padStart(64, '0');
      let types: Array<string> = [];
      for (let i = 0; i < props.calldata.length; i++) {
        types.push("uint256");
      }
      const coder = ethers.utils.defaultAbiCoder;

      // Encode the values according to their types
      const encoded = coder.encode(types, props.calldata);

      // use keccak to encode byes
      const calldata = keccak256(encoded);
      let message: {[key: string]: string} = {"contract": contract_address};
      message["selector"] = selector;
      message["calldata"] = calldata;

      // Create the typed data object
      const typedData = {
        types: {
          EIP712Domain: [
            //{ name: 'name', type: 'uint256' },
            //{ name: 'version', type: 'uint256' },
            { name: 'chainId', type: 'uint256' },
            { name: 'nonce', type: 'uint256' },
            //{ name: 'verifyingContract', type: 'uint256' },
          ],
          Multisig: [
            { name: 'contract', type: 'uint256' },
            { name: 'selector', type: 'uint256' },
            { name: 'calldata', type: 'uint256' },
          ],
        },
        domain: {
          //name: 'StarkSAFE',
          //version: 1,
          chainId: 1263227476,
          nonce: props.nonce,
          //verifyingContract: props.verifyingContract,
        },
        primaryType: 'Multisig',
        message: message,
      };
      
      console.log("contract_address: ",contract_address);
      console.log("selector: ",selector);
      console.log("bytes: ",calldata);
      console.log("EIP712Domain: ",keccak256(ethers.utils.toUtf8Bytes("EIP712Domain(uint256 chainId,uint256 nonce)")));
      console.log("Multisig: ",keccak256(ethers.utils.toUtf8Bytes("Multisig(uint256 contract,uint256 selector,uint256 calldata)")));
      console.log("Multisig_low: ",uint256.bnToUint256(keccak256(ethers.utils.toUtf8Bytes("Multisig(uint256 contract,uint256 selector,uint256 calldata)"))).low.toString())
      console.log("Multisig_high: ",uint256.bnToUint256(keccak256(ethers.utils.toUtf8Bytes("Multisig(uint256 contract,uint256 selector,uint256 calldata)"))).high.toString())
      console.log("EIP712Domain_low: ",uint256.bnToUint256(keccak256(ethers.utils.toUtf8Bytes("EIP712Domain(uint256 chainId,uint256 nonce)"))).low.toString())
      console.log("EIP712Domain_high: ",uint256.bnToUint256(keccak256(ethers.utils.toUtf8Bytes("EIP712Domain(uint256 chainId,uint256 nonce)"))).high.toString())

      
      console.log("txHash: ",uint256.bnToUint256("0xc4ad1f9867b0b8c026f3572907d031d65d4ec64d7908d0458223317db56d4115").low.toString())
      console.log("txHash: ",uint256.bnToUint256("0xc4ad1f9867b0b8c026f3572907d031d65d4ec64d7908d0458223317db56d4115").high.toString())
      console.log("Calldata Hash: ",uint256.bnToUint256("0x75a73d60def61281bda33e865bfa22d3b1c01fc500b39cbda1c5cf5ac16251d3").low.toString())
      console.log("Calldata txHash: ",uint256.bnToUint256("0x75a73d60def61281bda33e865bfa22d3b1c01fc500b39cbda1c5cf5ac16251d3").high.toString())

      // Sign the typed data object
      provider.sendAsync(
        {
          method: 'eth_signTypedData_v4',
          params: [signer, JSON.stringify(typedData)],
        },
        (err: any, result: any) => {
          if (err) {
            console.error(err);
            alert('Error signing message');
            return;
          }
          let signatures = ethers.utils.splitSignature(result.result);
          props.onSign({
            contract_address: props.contract_address,
            selector: props.selector,
            calldata: props.calldata,
            signatures: [signatures.r,signatures.s,String(signatures.v)]
          });
          console.log("r: ",signatures.r);
          console.log("s: ",signatures.s);
          console.log("v: ",signatures.v);
          console.log(
            uint256.bnToUint256(signatures.r).low.toString(),
            uint256.bnToUint256(signatures.r).high.toString(),
            uint256.bnToUint256(signatures.s).low.toString(),
            uint256.bnToUint256(signatures.s).high.toString(),
            String(signatures.v)
          );
        }
      );
    } else {
      alert('Please install MetaMask to sign messages.');
    }
  };

  return (
    <button className={styles.txButton} onClick={signTransaction}>
      Add Transaction
    </button>
  );
};

export function SignMessageBasic(props: {contract_address: string, selector: string, calldata: string[], calldataNames: string[], verifyingContract: string, onSign: (message: SignMessageProps) => void}){
  const signTransaction = async () => {
    const provider: any = await detectEthereumProvider();

    if (provider) {
      // MetaMask is detected
      const web3 = new Web3(provider);

      const accounts = await web3.eth.getAccounts();
      if (accounts.length === 0) {
        alert('Please connect to MetaMask.');
        return;
      }
      const signer = accounts[0];

      let contractInteractionArr = [{ name: 'contract', type: 'string'}];
      let message: {[key: string]: string} = {"contract": props.contract_address};
      for (let i = 0; i < props.calldata.length; i++) {
        contractInteractionArr.push({ name: props.calldataNames[i], type: 'string' });
        message[props.calldataNames[i]] = props.calldata[i];
      }

      //const prefixedMessage = `\x19Ethereum Signed Message:\n${message.length}${message}`;
      //const messageHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(prefixedMessage));

      // Sign the typed data object
      provider.sendAsync(
        {
          method: 'personal_sign',
          params: ["0x123ac",signer],
        },
        (err: any, result: any) => {
          console.log("Signature: ", result)
          if (err) {
            console.error(err);
            alert('Error signing message');
            return;
          }
          props.onSign({
            contract_address: props.contract_address,
            selector: props.selector,
            calldata: props.calldata,
            signatures: [result.result]
          });
        }
      );
    } else {
      alert('Please install MetaMask to sign messages.');
    }
  };
  return (
    <button className={styles.txButton} onClick={signTransaction}>
      Add Transaction
    </button>
  );
};
