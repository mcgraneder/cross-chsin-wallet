import { JsonRpcProvider } from "@ethersproject/providers";

export enum Chain {
  Arbitrum = "Arbitrum",
  Aurora = "Aurora",
  Avalanche = "Avalanche",
  BNBChain = "BNBChain",
  Cronos = "Cronos",
  Ethereum = "Ethereum",
  Fantom = "Fantom",
  KavaEVM = "KavaEVM",
  Klaytn = "Klaytn",
  Moonbeam = "Moonbeam",
  Optimism = "Optimism",
  Polygon = "Polygon",
}

export type ChainConfig = {
  rpcs: string[];
};

export const chains: Record<Chain, ChainConfig> = {
  Arbitrum: { rpcs: ["https://goerli-rollup.arbitrum.io/rpc"] },
  Aurora: { rpcs: ["https://testnet.aurora.dev"] },
  Avalanche: {
    rpcs: [
      "https://rpc.ankr.com/avalanche_fuji",
      "https://api.avax-test.network/ext/bc/C/rpc",
    ],
  },
  BNBChain: {
    rpcs: [
      "https://data-seed-prebsc-1-s1.binance.org:8545",
      "https://data-seed-prebsc-1-s2.binance.org:8545",
      "https://data-seed-prebsc-1-s3.binance.org:8545",
    ],
  },
  Cronos: {
    rpcs: [
      "https://evm-t3.cronos.org",
      "https://cronos-testnet-3.crypto.org:8545",
    ],
  },
  Ethereum: {
    rpcs: [
      "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
      "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    ],
  },
  Fantom: {
    rpcs: [
      "https://rpc.ankr.com/fantom_testnet",
      "https://rpc.testnet.fantom.network",
    ],
  },
  KavaEVM: { rpcs: ["https://evm.testnet.kava.io"] },
  Klaytn: { rpcs: ["https://api.baobab.klaytn.net:8651"] },
  Moonbeam: {
    rpcs: [
      "https://rpc.testnet.moonbeam.network",
      "https://rpc.api.moonbase.moonbeam.network",
    ],
  },
  Optimism: { rpcs: ["https://goerli.optimism.io"] },
  Polygon: {
    rpcs: [
      "https://rpc.ankr.com/polygon_mumbai",
      "https://rpc-mumbai.maticvigil.com",
    ],
  },
};

export const getProvider = async (
  chain: Chain
): Promise<JsonRpcProvider | undefined> => {
  let provider: JsonRpcProvider;
  for (const rpc of chains[chain].rpcs) {
    provider = new JsonRpcProvider(rpc);
    const blockNumber = await provider.getBlockNumber();
    if (blockNumber > 0) {
      return provider;
    }
  }
};
