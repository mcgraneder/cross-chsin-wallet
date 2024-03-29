import { WagmiConfig, createClient } from "wagmi";
import { getDefaultProvider } from "ethers";
import Account from "./components/Account";

const client = createClient({
  autoConnect: true,
  provider: getDefaultProvider(),
});

function App() {
  return (
    <WagmiConfig client={client}>
      <Account />
    </WagmiConfig>
  );
}

export default App;
