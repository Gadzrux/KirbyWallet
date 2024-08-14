import {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { generateMnemonic} from 'bip39';
import { Buffer } from 'buffer';

if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
}

function LandingPage():JSX.Element {
  const [isModalOpen, setisModalOpen] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [mnemonics, setMnemonics] = useState<string[]>([]);
  const navigate = useNavigate();

  const toWallet = () => navigate('/wallet')

  const copyText = () => {
    let text: string = "";
    mnemonics.forEach(word => {
      text += word + " ";
    });
    navigator.clipboard.writeText(text).then(() => {
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000); // Hide alert after 3 seconds
    })
    .catch(err => {
      console.error('Failed to copy: ', err);
    });
  }
  const gen = () => {
    setisModalOpen(isModalOpen => !isModalOpen);
    const str: string = generateMnemonic();
    localStorage.setItem("mnemonics",str);
    const wordArr = str.split(" ");
    setMnemonics(wordArr);
  };

  return (
    <div>
      {showAlert && (
        <div role="alert" className="alert alert-success mt-4 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="text-white h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="ml-2 text-white font-bold">Text Copied, Save it Somewhere SAFE!!!</span>
        </div>
      )}
      <div id='Screen-Div' className='h-screen bg-slate-900 p-40'>
      <div id='Kirby-Text' className='flex justify-center items-center'>
        <div className="avatar">
          <div className="mask mask-squircle w-24">
            <img src="https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/46eed4a7-d15f-4522-bbd6-be6270aaa855/dge6nek-faee3429-9667-4cc7-9ed4-158767201d4f.png/v1/fill/w_800,h_780/kirby_png_by_kosiscorruptedsomtim_dge6nek-fullview.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9NzgwIiwicGF0aCI6IlwvZlwvNDZlZWQ0YTctZDE1Zi00NTIyLWJiZDYtYmU2MjcwYWFhODU1XC9kZ2U2bmVrLWZhZWUzNDI5LTk2NjctNGNjNy05ZWQ0LTE1ODc2NzIwMWQ0Zi5wbmciLCJ3aWR0aCI6Ijw9ODAwIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmltYWdlLm9wZXJhdGlvbnMiXX0.yK7l2SYKbBWaA4PFE8NqxPrWQF2LaSzjMb35R3_CaDU" />
          </div>
        </div>
            <h1 className ='ml-4 text-white text-4xl font-sans'>Welcome to Kirby Wallet</h1>
      </div>
      <div className='flex flex-col justify-center items-center'>
          <button onClick={gen}className=" m-10 btn btn-outline btn-secondary">Generate Mnemonics</button>
          {isModalOpen &&
          <div className="border-red-500 border-2 rounded-lg p-5 mb-10 "key={Math.random()}>
          {mnemonics.map((word, index) => 
              index % 3 === 0 ? (
              <div key={index} className="flex space-x-10 mb-4">
                <div>{word}</div>
                {mnemonics[index + 1] && <div>{mnemonics[index + 1]}</div>}
                {mnemonics[index + 2] && <div>{mnemonics[index + 2]}</div>}
              </div>
            ) : null
          )}
        <button onClick={copyText} className="ml-16 btn btn-primary">Copy</button>
        </div>}
          <button onClick={toWallet} className="btn btn-outline btn-info">See your wallets</button>
      </div>
    </div>
    </div>
  );
}

export default LandingPage;