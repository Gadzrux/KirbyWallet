import { useState, useEffect } from 'react';
import { Buffer } from 'buffer';
import { clusterApiUrl, 
  Connection, 
  Keypair, 
  LAMPORTS_PER_SOL,
   PublicKey, 
   sendAndConfirmTransaction, 
   SystemProgram, 
   Transaction} from "@solana/web3.js";
import { HDNodeWallet, computeAddress, JsonRpcProvider, parseEther, parseUnits } from "ethers";
import { mnemonicToSeed } from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import nacl from 'tweetnacl';
import axios from 'axios';
import bs58 from 'bs58'
import { Wallet } from 'ethers';

interface ETHAccount {
  privateKey: string; 
  publicKey: string; 
  ethTokens: number; 
  sendETHAmount: number; 
  sendETHAddress: string;
}

interface SOLAccount {
  privateKey: string;
  publicKey: string;
  solTokens: number;
  sendSOLAmount: number;
  sendSOLAddress: string;
}

function WalletPage(): JSX.Element {

  const [ethAccounts, setethAccounts] = useState<number>(0);
  const [solAccounts, setsolAccounts] = useState<number>(0);
  const [ethKeys, setEthKeys] = useState<ETHAccount[]>([]);
  const [solKeys, setSolKeys] = useState<SOLAccount[]>([]);
  const [seed, setSeed] = useState<Uint8Array>();

  useEffect(() => {
      const mnemonics = localStorage.getItem("mnemonics");
      if (mnemonics) {
        mnemonicToSeed(mnemonics).then((seed) => {
        setSeed(seed);
        });
      }
  },[]);

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
        sendETHAmount: 0,
        sendETHAddress: "",
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
        privateKey: bs58.encode(keypair.secretKey),
        publicKey: keypair.publicKey.toString(),
        solTokens,
        sendSOLAmount: 0,
        sendSOLAddress: "",
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

  const setSOLamount = (index: number, amount: number) => {
    const updatedSolKeys = [...solKeys];
    updatedSolKeys[index].sendSOLAmount = amount;
    setSolKeys(updatedSolKeys);
  };

  const setSOLaddress = (index: number, address: string) => {
    const updatedSolKeys = [...solKeys];
    updatedSolKeys[index].sendSOLAddress = address;
    setSolKeys(updatedSolKeys);
    // console.log(`SOL address for ${index}: ${address}`)
  };

  const setETHamount = (index: number, amount: number) => {
    const updatedEthKeys = [...ethKeys];
    updatedEthKeys[index].sendETHAmount = amount;
    setEthKeys(updatedEthKeys);
    // console.log(`ETH amount for ${index}: ${amount}`)
  };

  const setETHaddress = (index: number, address: string) => {
    const updatedEthKeys = [...ethKeys];
    updatedEthKeys[index].sendETHAddress = address;
    setEthKeys(updatedEthKeys);
    // console.log(`ETH address for ${index}: ${address}`)
  };


  const sendSOL = async (index: number) => {
    if (solKeys[index]) {
        const decodedPrivateKey = bs58.decode(solKeys[index].privateKey);
        const from = Keypair.fromSecretKey(decodedPrivateKey);
        const to = new PublicKey(solKeys[index].sendSOLAddress);
        const amount = LAMPORTS_PER_SOL * solKeys[index].sendSOLAmount;
  
        const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
        const { blockhash} = await connection.getLatestBlockhash();
  
        const transaction = new Transaction().add(SystemProgram.transfer({
          fromPubkey: from.publicKey,
          toPubkey: to,
          lamports: amount
        }));
  
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = from.publicKey;
        transaction.sign(from);

        const signature = await sendAndConfirmTransaction(connection, transaction, [from])
        if(signature) {
          alert("Transaction Successfull, signature: " + signature +"\n Reload the Website and generate Wallets again");
        }
    }
  };

  const sendETH = async (index: number) => {
    const providerUrl = 'https://eth-holesky.g.alchemy.com/v2/atNVG8-veYm43Ng99fSUIFOixbOyPPZe'
    const provider = new JsonRpcProvider(providerUrl);

    const privateKey = ethKeys[index].privateKey;
    const wallet = new Wallet(privateKey,provider)

    const transaction = {
      to : ethKeys[index].sendETHAddress,
      value: parseEther(ethKeys[index].sendETHAmount.toString()),
      gasLimit: 21000,
      gasPrice: parseUnits('10','gwei')
    }

    const transactionResponse = await wallet.sendTransaction(transaction);
    if(transactionResponse) {
      alert('Transaction Complete! reload to see balance');
    }
  }

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
                    value={solKeys[index].sendSOLAmount}
                    onChange={(e) => setSOLamount(index, Number(e.target.value))} />
                  <input type="text"
                    placeholder="Enter Wallet Address"
                    className="m-2 input input-bordered w-full max-w-xs"
                    value = {solKeys[index].sendSOLAddress}
                    onChange= {(e) => setSOLaddress(index, e.target.value)} />
                  <button onClick={() => sendSOL(index)} className="btn btn-active">SEND SOL</button>
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
                    value={ethKeys[index].sendETHAmount}
                    onChange={(e) => setETHamount(index, Number(e.target.value))} />
                    <input type="text"
                    placeholder="Enter Wallet Address"
                    className="m-2 input input-bordered w-full max-w-xs"
                    value={ethKeys[index].sendETHAddress}
                    onChange={(e) => setETHaddress(index, e.target.value)} />
                  <button onClick={() => sendETH(index)} className="btn btn-active">SEND ETH</button>
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