import { useEffect, useState } from "react";
import { BigNumber } from "ethers";
import { formatEther, isAddress, parseUnits } from "ethers/lib/utils";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Asset, assets } from "../lib/assets";
import { Chain, getProvider } from "../lib/chains";
import { buildAndSignTx, getSmartWallet, submitTx } from "../lib/smartWallet";
import { useAccount, useProvider, useSigner } from "wagmi";

interface TransferProps {
  signerAddress: string;
  smartWalletAddress: string;
}

enum TransactionStatus {
  Ready = "Send",
  Sending = "Sending...",
  Complete = "Sent!",
}

function Transfer(props: TransferProps) {
  const { connector } = useAccount();
  const [provider, setProvider] = useState<JsonRpcProvider>();
  const [balance, setBalance] = useState<BigNumber>();
  const [amount, setAmount] = useState("");
  const [asset, setAsset] = useState(Asset.ETH);
  const [chain, setChain] = useState(assets[asset].chains[0]);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [error, setError] = useState("");
  const [transactionStatus, setTransactionStatus] = useState(
    TransactionStatus.Ready
  );

  useEffect(() => {
    if (!provider) {
      updateChainInfo(chain);
    }
  });

  const validateAndSend = async () => {
    // Validate chain connection.
    if (!provider || !connector) {
      setError(`Error connecting to chain`);
      return;
    }
    if (!balance) {
      setError(`Error fetching balance`);
      return;
    }

    // Validate inputs.
    const amountBig = parseUnits(amount);
    if (!amount) {
      setError(`Invalid amount`);
      return;
    }
    if (balance.lt(amountBig)) {
      setError(`Insufficient balance`);
      return;
    }
    if (!recipientAddress || !isAddress(recipientAddress)) {
      setError(`Invalid recipient address`);
      return;
    }

    setTransactionStatus(TransactionStatus.Sending);

    // Fetch gas cost and ensure amount is sufficient.
    let gasCost = BigNumber.from("0");
    try {
      const gasPrice = await provider.getGasPrice();
      gasCost = gasPrice.mul(300000);

      if (amountBig.lt(gasCost)) {
        setError(`Minimum amount is ${formatEther(gasCost)} ${asset}`);
        setTransactionStatus(TransactionStatus.Ready);
        return;
      }
    } catch (error) {
      setError(`Error fetching gas price`);
      setTransactionStatus(TransactionStatus.Ready);
      console.error(error);
      return;
    }
    const receiveAmount = amountBig.sub(gasCost);

    // Build, sign, and submit transaction.
    try {
      const chainID = provider.network.chainId;
      const signatureChainID = await connector.getChainId();
      const transaction = await buildAndSignTx(
        props.signerAddress,
        recipientAddress,
        receiveAmount,
        gasCost,
        chainID,
        signatureChainID
      );
      await submitTx(props.signerAddress, transaction);

      setTransactionStatus(TransactionStatus.Complete);
      setTimeout(() => {
        setTransactionStatus(TransactionStatus.Ready);
      }, 5000);
    } catch (error) {
      setError(`Error submitting transaction`);
      setTransactionStatus(TransactionStatus.Ready);
      console.error(error);
      return;
    }
  };

  const updateChainInfo = async (newChain: Chain) => {
    try {
      const newProvider = await getProvider(newChain);
      setProvider(newProvider);
      if (newProvider) {
        const newBalance = await newProvider.getBalance(
          props.smartWalletAddress
        );
        setBalance(newBalance);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  const handleAsset = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newAsset = e.target.value as Asset;
    const newChain = assets[newAsset].chains[0];
    setAsset(newAsset);
    setChain(newChain);
    setBalance(undefined);
    updateChainInfo(newChain);
  };

  const handleChain = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newChain = e.target.value as Chain;
    setChain(newChain);
    setBalance(undefined);
    updateChainInfo(newChain);
  };

  const handleRecipient = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRecipientAddress(e.target.value);
  };

  return (
    <>
      <span className="font-medium text-gray-700">Transfer without gas</span>
      <div className="flex items-center mt-1">
        <input
          type="number"
          className="w-28 h-14 text-right bg-gray-100 rounded-md outline-none px-6 focus:bg-gray-200"
          value={amount}
          placeholder="100"
          onChange={handleAmount}
          required
        />
        <select
          className="h-14 bg-gray-100 rounded-md outline-none px-6 ml-2 focus:bg-gray-200"
          value={asset}
          onChange={handleAsset}
        >
          {Object.entries(assets).map(([k], i) => {
            return <option key={i}>{k}</option>;
          })}
        </select>
        <span className="font-medium text-gray-700 ml-2">from</span>
        <select
          className="w-40 h-14 bg-gray-100 rounded-md outline-none px-6 ml-2 focus:bg-gray-200"
          value={chain}
          onChange={handleChain}
        >
          {assets[asset].chains.map((chain, i) => {
            return <option key={i}>{chain}</option>;
          })}
        </select>
        <span className="font-medium text-gray-700 ml-2">to</span>
        <input
          type="text"
          className="grow h-14 bg-gray-100 rounded-md outline-none px-6 ml-2 focus:bg-gray-200"
          value={recipientAddress}
          placeholder="0xblah"
          onChange={handleRecipient}
          required
        />
        <button
          className="font-medium text-white bg-indigo-600 rounded-md px-10 py-4 ml-2 hover:bg-indigo-700"
          onClick={() => validateAndSend()}
        >
          {transactionStatus}
        </button>
      </div>
      <p className="font-medium text-xs text-gray-500 uppercase mt-1">{`Max: ${
        balance ? formatEther(balance) : "-"
      } ${asset}`}</p>
      {error && <p className="font-medium text-red-400 mt-1">{error}</p>}
    </>
  );
}

export default Transfer;
