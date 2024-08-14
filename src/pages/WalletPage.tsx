import { useState, useEffect } from 'react';
import { Buffer } from 'buffer';
import { Keypair} from "@solana/web3.js";
import { HDNodeWallet } from "ethers";
import { mnemonicToSeed } from 'bip39';

function WalletPage(): JSX.Element {

  const [ethAccounts, setethAccounts] = useState(0);
  const [solAccounts, setsolAccounts] = useState(0);
  const [ethKeys, setEthKeys] = useState<{ privateKey: string; publicKey: string; }[]>([]);
  const [solKeys, setSolKeys] = useState<{ privateKey: string; publicKey: string; }[]>([]);
  const [seed, setSeed] = useState<Uint8Array>();

  useEffect(() => {
    const mnemonics = localStorage.getItem("mnemonics");
    if (mnemonics) {
      mnemonicToSeed(mnemonics).then((seed) => {
        setSeed(seed);
      });
    }
  }, []);

  useEffect(() => {
    if (seed) {
      const hdNode = HDNodeWallet.fromSeed(seed);
      const path = `m/44'/60'/${ethAccounts}'/0`;
      const wallet = hdNode.derivePath(path);
      setEthKeys([...ethKeys, {
        privateKey: wallet.privateKey,
        publicKey: wallet.publicKey,
      }]);
    }
  }, [ethAccounts]);

  useEffect(() => {
    if(seed) {
      const solSeed = seed.slice(0, 32);
      const keypair = Keypair.fromSeed(solSeed);
      setSolKeys([...solKeys, {
      privateKey: (Buffer.from(keypair.secretKey) as Buffer).toString('hex'),
      publicKey: (keypair.publicKey as unknown as Buffer).toString('hex'),
    }]);
    }
  }, [solAccounts]);

  const addSolAcc = () => {
    setsolAccounts(solAccounts + 1);
  };

  const addEthAcc = () => {
    setethAccounts(ethAccounts + 1);
  };

  return (
    <div className='min-h-screen h-auto w-full p-20 bg-slate-900'>
      <div id='Kirby-Text' className='flex justify-center items-center mb-4'>
        <div className="avatar">
          <div className="mask mask-squircle w-24">
            <img src="https://www.pngall.com/wp-content/uploads/2016/05/Kirby-PNG-Image.png" />
          </div>
        </div>
        <h1 className='ml-4 text-white text-4xl font-sans'>Checkout your Wallets</h1>
      </div>
      <div className="collapse bg-base-100">
        <input type="checkbox" />
        <div className="collapse-title text-xl font-medium">Show your HD wallet seed</div>
        <div className="collapse-content">
          <div className=' break-all text-green-300'>{"Hex: " + (seed as Buffer)?.toString('hex')}</div>
        </div>
      </div>
      <div className='mt-10 flex justify-evenly'>
        <div id="SOL-WALLET" className='m-4 p-5 border-2 border-white rounded-3xl'>
          <div className='text-white font-semibold font-sans m-10 text-4xl'>SOL WALLET</div>
          {Array.from({ length: solAccounts }).map((_, index) => (
            solKeys[index] && (
              <div id="m-2 show-sol-accounts" key={Math.random()}>
                <div className="collapse bg-base-200">
                  <input type="checkbox" />
                  <div className="collapse-title text-xl font-medium">Account {index + 1}</div>
                  <div className="collapse-content">
                    <p className=' bg-green-500 rounded-3xl p-3 text-white'>Public Key:</p>
                    <div className='overflow-x-auto w-72 border border-white m-2 p-2 text-white font-bold rounded-md'>{solKeys[index].publicKey}</div>
                    <p className='bg-red-500 rounded-3xl p-3 text-white'>Private Key:</p>
                    <div className='overflow-x-auto w-72 border border-white m-2 p-2 text-white font-bold rounded-md'>{solKeys[index].privateKey}</div>
                  </div>
                </div>
              </div>
            )
          ))}
          <div id="button-center-sol" className='flex items-center justify-center mt-4'>
            <button onClick={addSolAcc} className="btn btn-circle btn-outline">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-plus" viewBox="0 0 16 16">
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
              </svg>
            </button>
          </div>
        </div>
        <div id="ETH-WALLET" className='m-4 p-5 border-2 border-white rounded-3xl'>
          <div className='text-white font-semibold font-sans m-10 text-4xl'>ETH WALLET</div>
          {Array.from({ length: ethAccounts }).map((_, index) => (
            ethKeys[index] && (
              <div key={Math.random()}>
                <div className="m-2 collapse bg-base-200">
                  <input type="checkbox" />
                  <div className="collapse-title text-xl font-medium">Account {index + 1}</div>
                  <div className="collapse-content">
                    <p className=' bg-green-500 rounded-3xl p-3 text-white'>Public Key:</p>
                    <div className='overflow-x-auto w-72 border border-white m-2 p-2 text-white font-bold rounded-md'>{ethKeys[index].publicKey}</div>
                    <p className='bg-red-500 rounded-3xl p-3 text-white'>Private Key:</p>
                    <div className='overflow-x-auto w-72 border border-white m-2 p-2 text-white font-bold rounded-md'>{ethKeys[index].privateKey}</div>
                  </div>
                </div>
              </div>
            )
          ))}
          <div id="button-center-eth" className='flex items-center justify-center mt-4'>
            <button onClick={addEthAcc} className="btn btn-circle btn-outline">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-plus" viewBox="0 0 16 16">
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WalletPage;