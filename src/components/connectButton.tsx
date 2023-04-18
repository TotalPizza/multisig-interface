// ConnectWallet.tsx
import React, { useState, useEffect } from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import styles from '@/styles/Home.module.css'

const ConnectWallet: React.FC = () => {
  const [account, setAccount] = useState<string | null>(null);

  useEffect(() => {
    const checkAccount = async () => {
      const provider: any = await detectEthereumProvider();
      if (provider) {
        const accounts = await provider.request({ method: 'eth_accounts' });
        if (accounts.length) {
          setAccount(accounts[0]);
        }
      }
    };

    checkAccount();
  }, []);

  const connectWallet = async () => {
    const provider: any = await detectEthereumProvider();

    if (provider) {
      try {
        const accounts = await provider.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
      } catch (error) {
        console.error(error);
        alert('Error connecting wallet');
      }
    } else {
      alert('Please install MetaMask to connect wallet.');
    }
  };

  return (
    <div className={styles.buttonContainer}>
      {account ? (
        <p>Connected Account: {account}</p>
      ) : (
        <button className={styles.txButton} onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
};

export default ConnectWallet;
