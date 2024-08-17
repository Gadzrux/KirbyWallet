import { useState, useEffect } from 'react';
import { Buffer } from 'buffer';
import { Keypair} from "@solana/web3.js";
import { HDNodeWallet, encodeBase58, computeAddress } from "ethers";
import { mnemonicToSeed } from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import nacl from 'tweetnacl';
import axios from 'axios';

function WalletPage(): JSX.Element {
  const [ethAccounts, setethAccounts] = useState<number>(0);
  const [solAccounts, setsolAccounts] = useState<number>(0);
  const [ethKeys, setEthKeys] = useState<{ privateKey: string; publicKey: string; ethTokens: number;}[]>([]);
  const [solKeys, setSolKeys] = useState<{ privateKey: string; publicKey: string; solTokens: number;}[]>([]);
  const [seed, setSeed] = useState<Uint8Array>();

  const [sendSOLAmount, setSendSOLAmount] = useState<number>(0);
  const [sendSOLAddress, setSendSOLAddress] = useState<string>("");
  const [sendETHAmount, setSendETHAmount] = useState<number>(0);
  const [sendETHAddress, setSendETHAddress] = useState<string>("");

  useEffect(() => {
    const mnemonics = localStorage.getItem("mnemonics");
    if (mnemonics) {
      mnemonicToSeed(mnemonics).then((seed) => {
        setSeed(seed);
      });
    }
  }, []);

  const fetchEthData = async () => {
    if (seed) {
      const hdNode = HDNodeWallet.fromSeed(seed);
      const path = `m/44'/60'/${ethAccounts}'/0`;
      const wallet = hdNode.derivePath(path);
      const data = await axios.post("https://eth-holesky.g.alchemy.com/v2/atNVG8-veYm43Ng99fSUIFOixbOyPPZe", {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "eth_getBalance",
        "params": [`${computeAddress(wallet.publicKey)}`, "latest"]
      });
      const ethTokensHex = data.data.result;
      const ethTokens = Number(ethTokensHex) / Math.pow(10, 18);
      setEthKeys([...ethKeys, {
        privateKey: wallet.privateKey,
        publicKey: computeAddress(wallet.publicKey),
        ethTokens,
      }]);
    }
  };

  const fetchSolData = async () => {
    if (seed) {
      const path = `m/44'/501'/${solAccounts}'/0'`;
      const hexSeed = Buffer.from(seed).toString('hex');
      const derivedSeed = derivePath(path, hexSeed).key;
      const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
      const keypair = Keypair.fromSecretKey(secret);
      const data = await axios.post("https://solana-devnet.g.alchemy.com/v2/atNVG8-veYm43Ng99fSUIFOixbOyPPZe", {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getBalance",
        "params": [`${keypair.publicKey.toString()}`]
      });
      const solTokens = data.data.result.value / Math.pow(10, 9);
      setSolKeys([...solKeys, {
        privateKey: encodeBase58(keypair.secretKey),
        publicKey: keypair.publicKey.toString(),
        solTokens,
      }]);
    }
  };

  useEffect(() => {
    fetchEthData();
  }, [ethAccounts]);

  useEffect(() => {
    fetchSolData();
  }, [solAccounts]);

  const addSolAcc = () => {
    setsolAccounts(solAccounts + 1);
  };

  const addEthAcc = () => {
    setethAccounts(ethAccounts + 1);
  };

  const sendETH = async () => {

  };

  const sendSOL = async () => {
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
              <div id="m-2 show-sol-accounts p-2" key={Math.random()}>
                <div className="collapse bg-base-200">
                  <input type="checkbox" />
                  <div className="flex flex-row justify-between collapse-title text-xl font-medium">
                    <div>Account: {index + 1}</div>
                    <div>SOL: {solKeys[index].solTokens}</div>
                  </div>
                  <div className="collapse-content">
                    <p className=' text-green-500 p-3'>Public Key:</p>
                    <div className='overflow-x-auto w-72 border border-white m-2 p-2 text-white font-bold rounded-md'>
                      {solKeys[index].publicKey}
                    </div>
                    <p className='text-red-500 p-3'>Private Key:</p>
                    <div className='overflow-x-auto w-72 border border-white m-2 p-2 text-white font-bold rounded-md'>
                      {solKeys[index].privateKey}
                    </div>
                  </div>
                  <input type="number"
                    className="m-2 input input-bordered w-full max-w-xs"
                    value={sendSOLAmount}
                    onChange={(e) => setSendSOLAmount(Number(e.target.value))} />
                  <input type="text"
                    placeholder="Enter Wallet Address"
                    className="m-2 input input-bordered w-full max-w-xs"
                    value={sendSOLAddress}
                    onChange={(e) => setSendSOLAddress(e.target.value)} />
                  <button onClick={() => sendSOL()} className="btn btn-active">SEND SOL</button>
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
                  <div className="flex flex-row justify-between collapse-title text-xl font-medium">
                    <div>
                      Account {index + 1}
                    </div>
                    <div>
                      ETH: {ethKeys[index].ethTokens}
                    </div>
                  </div>
                  <div className="collapse-content">
                    <p className=' text-green-500 p-3'>Public Key:</p>
                    <div className='overflow-x-auto w-72 border border-white m-2 p-2 text-white font-bold rounded-md'>
                      {ethKeys[index].publicKey}
                    </div>
                    <p className=' text-red-500 p-3'>Private Key:</p>
                    <div className='overflow-x-auto w-72 border border-white m-2 p-2 text-white font-bold rounded-md'>
                      {ethKeys[index].privateKey}
                    </div>
                  </div>
                  <input type="number"
                    className="m-2 input input-bordered w-full max-w-xs"
                    value={sendETHAmount}
                    onChange={(e) => setSendETHAmount(Number(e.target.value))} />
                  <input type="text"
                    placeholder="Enter Wallet Address"
                    className="m-2 input input-bordered w-full max-w-xs"
                    value={sendETHAddress}
                    onChange={(e) => setSendETHAddress(e.target.value)} />
                  <button onClick={() => sendETH()} className="btn btn-active">SEND ETH</button>
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