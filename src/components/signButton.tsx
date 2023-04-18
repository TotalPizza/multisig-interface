// SignMessage.tsx
import React from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import Web3 from 'web3';
import styles from '@/styles/Home.module.css';
import { ethers } from "ethers";

export interface SignMessageProps {
  contract_address: string;
  selector: string;
  calldata: string[];
  signatures: string[];
}

export default function SignMessage(props: {contract_address: string, selector: string, calldata: string[], calldataNames: string[], verifyingContract: string, onSign: (message: SignMessageProps) => void}){
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

      // Create the typed data object
      const typedData = {
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'string' },
          ],
          ContractInteraction: contractInteractionArr
        },
        domain: {
          name: 'StarkSAFE',
          version: '1',
          chainId: 1263227476,
          verifyingContract: props.verifyingContract, // Replace with your contract's address
        },
        primaryType: 'ContractInteraction',
        message: message,
      };

      // Sign the typed data object
      provider.sendAsync(
        {
          method: 'eth_signTypedData_v4',
          params: [signer, JSON.stringify(typedData)],
          from: signer,
        },
        (err: any, result: any) => {
          console.log("Signatures: ", result)
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
