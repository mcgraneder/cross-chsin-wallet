interface HistoryProps {
  signerAddress: string;
}

function History(props: HistoryProps) {
  return (
    <>
      <span className="font-medium text-gray-700">Recent transactions</span>
    </>
  );
}

export default History;
