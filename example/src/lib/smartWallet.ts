import axios from "axios";
import { BigNumber } from "ethers";
import { signTypedData } from "@wagmi/core";
import { defaultAbiCoder } from "@ethersproject/abi";

const api = "https://wallet.catalog.fi";

export interface SmartWallet {
  address: string;
  nonce: number;
}

export interface UserOp {
  to: string;
  amount: string;
  data: string;
}

export interface Transaction {
  userOps: UserOp[];
  chainID: number;
  signature: string;
}

export const getRelayer = async (): Promise<string> => {
  const response = await axios.get(`${api}/relayer`);
  return response.data.address;
};

export const getSmartWallet = async (address: string): Promise<SmartWallet> => {
  const response = await axios.get(`${api}/addresses/${address}`);
  return response.data;
};

export const buildAndSignTx = async (
  signerAddress: string,
  recipientAddress: string,
  amount: BigNumber,
  gasCost: BigNumber,
  chainID: number,
  signatureChainID: number
): Promise<Transaction> => {
  const smartWallet = await getSmartWallet(signerAddress);
  const relayer = await getRelayer();
  const userOps: UserOp[] = [
    // Pay relayer for submission.
    {
      to: relayer,
      amount: gasCost.toString(),
      data: "0x",
    },
    // Send the remaining amount to the recipient.
    {
      to: recipientAddress,
      amount: amount.toString(),
      data: "0x",
    },
  ];

  const signature = await signTx(
    userOps,
    smartWallet.address,
    smartWallet.nonce,
    chainID,
    signatureChainID
  );

  const transaction: Transaction = {
    userOps,
    chainID,
    signature,
  };

  return transaction;
};

export const signTx = async (
  userOps: UserOp[],
  smartWalletAddress: string,
  nonce: number,
  chainID: number,
  signatureChainID: number
) => {
  const domain = {
    name: "ECDSAWallet",
    version: "0.0.1",
    chainId: 5,
    verifyingContract: smartWalletAddress as `0x${string}`,
  };

  const types = {
    UserOp: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "data", type: "bytes" },
    ],
    ECDSAExec: [
      { name: "userOps", type: "UserOp[]" },
      { name: "nonce", type: "uint256" },
      { name: "chainID", type: "uint256" },
      { name: "sigChainID", type: "uint256" },
    ],
  };

  const value = {
    userOps: userOps,
    nonce: nonce,
    chainID: chainID,
    sigChainID: signatureChainID,
  };

  const signature = await signTypedData({ domain, types, value });
  const signatureEncoded = defaultAbiCoder.encode(
    ["uint256", "bytes"],
    [signatureChainID, signature]
  );

  return signatureEncoded;
};

export const submitTx = async (
  signerAddress: string,
  transaction: Transaction
) => {
  // const data = JSON.stringify(transaction);
  await axios.post(`${api}/transactions/${signerAddress}`, transaction);
};
