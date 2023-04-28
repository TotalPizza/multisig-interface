// InteractWithContract.tsx
import React from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import Web3 from 'web3';
import styles from '@/styles/Home.module.css'
import {SignMessageProps} from '@/components/signButton';
import {uint256} from 'starknet'

interface InteractWithContractProps {
  contract_address: string;
  abi: any;
  calldata: SignMessageProps | undefined;
}

const ExecuteTransaction: React.FC<InteractWithContractProps> = ({
  contract_address,
  abi,
  calldata,
}) => {
  const interactWithContract = async () => {
    const provider: any = await detectEthereumProvider();
    
    if (provider && calldata) {
      // MetaMask is detected
      const web3 = new Web3(provider);

      const accounts = await web3.eth.getAccounts();
      if (accounts.length === 0) {
        alert('Please connect to MetaMask.');
        return;
      }

      const signer = accounts[0];
      const contract = new web3.eth.Contract(abi, contract_address);

      // transform calldata.selector to hex string
      const selector = web3.utils.asciiToHex(calldata.selector);

      // transform calldata.calldata array to array of hex strings
      // this doesn't cover all cases
      let calldataArr = calldata.calldata.map((data) => {
        if (isNaN(Number(data))) {
          return web3.utils.asciiToHex(data);
        }else{
          return data;
        }
      });

      // Split signatures into uint256 high and low
      let transformed_signatures: string[] = [];
      transformed_signatures.push(uint256.bnToUint256(calldata.signatures[0]).low.toString());
      transformed_signatures.push(uint256.bnToUint256(calldata.signatures[0]).high.toString());
      transformed_signatures.push(uint256.bnToUint256(calldata.signatures[1]).low.toString());
      transformed_signatures.push(uint256.bnToUint256(calldata.signatures[1]).high.toString());
      transformed_signatures.push(calldata.signatures[2].toString());
      
      // Attach the calldata to the end of the signature array
      calldataArr = transformed_signatures.concat(calldataArr);

      // Call the contract function
      const transactionParameters = {
        to: contract_address,
        from: signer,
        data: contract.methods["multicall"](calldata.contract_address,selector,calldataArr).encodeABI(),
      };

      // Send the transaction via MetaMask
      provider.sendAsync(
        {
          method: 'eth_sendTransaction',
          params: [transactionParameters],
          from: signer,
        },
        (err: any, result: any) => {
          if (err) {
            console.error(err);
            alert('Error interacting with contract');
            return;
          }

          console.log('Transaction hash:', result.result);
        }
      );
    } else {
      alert('Please install MetaMask to interact with contracts.');
    }
  };

  if (!calldata) {
    return <button className={styles.txButton} disabled>Execute Transaction</button>;
  }
  return <button className={styles.txButton} onClick={interactWithContract}>Execute Transaction</button>;
};

export default ExecuteTransaction;
