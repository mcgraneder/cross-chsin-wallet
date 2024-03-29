import { useEffect, useRef, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { MdContentCopy } from "react-icons/md";
import { getSmartWallet } from "../lib/smartWallet";
import Transfer from "./Transfer";
import History from "./History";

function Account() {
  const { address } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { disconnect } = useDisconnect({
    onSuccess: () => {
      setSmartWalletAddress("");
    },
  });
  const [walletConnecting, setWalletConnecting] = useState(
    address ? true : false
  );
  const [smartWalletAddress, setSmartWalletAddress] = useState("");

  useEffect(() => {
    if (address) {
      setSmartWalletAddress("");
      setWalletConnecting(true);
      initSmartWallet(address);
    }
  }, [address]);

  const initSmartWallet = async (address: string) => {
    try {
      const smartWallet = await getSmartWallet(address);
      setSmartWalletAddress(smartWallet.address);
    } catch (error) {
      console.error(error);
    }
    setWalletConnecting(false);
  };

  return (
    <div className="grid h-screen place-items-center">
      {!address || !smartWalletAddress ? (
        <button
          className="rounded-md bg-indigo-600 px-10 py-4 font-medium text-white hover:bg-indigo-700"
          onClick={() => connect()}
        >
          {walletConnecting ? "Connecting..." : "Connect Wallet"}
        </button>
      ) : (
        <div className="w-[1000px]">
          <div>
            <span className="font-medium text-gray-700">Send any asset to</span>
            <div className="flex mt-1">
              <span className="flex items-center justify-between grow h-14 bg-gray-100 rounded-md px-6">
                {smartWalletAddress}
                <MdContentCopy
                  className="ml-2 hover:cursor-pointer"
                  onClick={() => {
                    navigator.clipboard.writeText(smartWalletAddress);
                  }}
                />
              </span>
              <button
                className="font-medium text-white bg-indigo-600 rounded-md px-10 py-4 ml-2 hover:bg-indigo-700"
                onClick={() => disconnect()}
              >
                Disconnect
              </button>
            </div>
          </div>
          <div className="mt-8">
            <Transfer
              signerAddress={address}
              smartWalletAddress={smartWalletAddress}
            />
          </div>
          <div className="mt-8">
            <History signerAddress={address} />
          </div>
        </div>
      )}
    </div>
  );
}

export default Account;
