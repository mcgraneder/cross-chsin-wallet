import { Chain } from "./chains";

export enum Asset {
  AURORA = "AURORA",
  AVAX = "AVAX",
  BNB = "BNB",
  CRO = "CRO",
  ETH = "ETH",
  FTM = "FTM",
  GLMR = "GLMR",
  KAVA = "KAVA",
  KLAY = "KLAY",
  MATIC = "MATIC",
}

export type AssetConfig = {
  chains: Chain[];
};

export const assets: Record<Asset, AssetConfig> = {
  AURORA: { chains: [Chain.Aurora] },
  AVAX: { chains: [Chain.Avalanche] },
  BNB: { chains: [Chain.BNBChain] },
  CRO: { chains: [Chain.Cronos] },
  ETH: { chains: [Chain.Arbitrum, Chain.Ethereum, Chain.Optimism] },
  FTM: { chains: [Chain.Fantom] },
  GLMR: { chains: [Chain.Moonbeam] },
  KAVA: { chains: [Chain.KavaEVM] },
  KLAY: { chains: [Chain.Klaytn] },
  MATIC: { chains: [Chain.Polygon] },
};
