/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import { ToastContainer, toast } from 'react-toastify';
import './styles/app.scss';
import 'react-toastify/dist/ReactToastify.css';
import { PolyjuiceHttpProvider } from '@polyjuice-provider/web3';
import { AddressTranslator } from 'nervos-godwoken-integration';

import { SocialNetworkWrapper } from '../lib/contracts/SocialNetworkWrapper';
import { CONFIG } from '../config';
import Navbar from './components/navbar';

const CONTRACT_ADDRESS = '0xec1706d0A6b351784cADF40E91aCA8a56cd6adad';

interface IPost {
    id: string;
    content: string;
    tipAmount: string;
    author: string;
    0: string;
    1: string;
    2: string;
    3: string;
}

async function createWeb3() {
    // Modern dapp browsers...
    if ((window as any).ethereum) {
        const godwokenRpcUrl = CONFIG.WEB3_PROVIDER_URL;
        const providerConfig = {
            rollupTypeHash: CONFIG.ROLLUP_TYPE_HASH,
            ethAccountLockCodeHash: CONFIG.ETH_ACCOUNT_LOCK_CODE_HASH,
            web3Url: godwokenRpcUrl
        };

        const provider = new PolyjuiceHttpProvider(godwokenRpcUrl, providerConfig);
        const web3 = new Web3(provider || Web3.givenProvider);

        try {
            // Request account access if needed
            await (window as any).ethereum.enable();
        } catch (error) {
            toast.error('You rejected to connect metamask');
        }

        return web3;
    }

    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    return null;
}

export function App() {
    const [web3, setWeb3] = useState<Web3>(null);
    const [contract, setContract] = useState<SocialNetworkWrapper>();
    const [accounts, setAccounts] = useState<string[]>();
    const [l2Balance, setL2Balance] = useState<bigint>();
    const [existingContractIdInputValue, setExistingContractIdInputValue] = useState<string>();
    const [idea, setIdea] = useState<IPost>();
    const [deployTxHash, setDeployTxHash] = useState<string | undefined>();
    const [polyjuiceAddress, setPolyjuiceAddress] = useState<string | undefined>();
    const [transactionInProgress, setTransactionInProgress] = useState(false);
    const toastId = React.useRef(null);
    const [postContent, setPostContent] = useState<string | undefined>();
    const [ideaLoading, setIdeaLoading] = useState<boolean>(false);
    const [publishedPostCount, setPublishedPostCount] = useState<number>(0);

    const [userGivenId, setUserGivenId] = useState<string>('');

    useEffect(() => {
        if (accounts?.[0]) {
            const addressTranslator = new AddressTranslator();
            setPolyjuiceAddress(addressTranslator.ethAddressToGodwokenShortAddress(accounts?.[0]));
        } else {
            setPolyjuiceAddress(undefined);
        }
    }, [accounts?.[0]]);

    useEffect(() => {
        if (transactionInProgress && !toastId.current) {
            toastId.current = toast.info(
                'Transaction in progress. Confirm MetaMask signing dialog and please wait...',
                {
                    position: 'top-right',
                    autoClose: false,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    closeButton: false
                }
            );
        } else if (!transactionInProgress && toastId.current) {
            toast.dismiss(toastId.current);
            toastId.current = null;
        }
    }, [transactionInProgress, toastId.current]);

    const account = accounts?.[0];

    function generateRandomNumber(min: number, max: number) {
        return Math.floor(Math.random() * (max - min) + min);
    }

    async function getPostCount() {
        const postCount = await contract.postCount(account);
        setPublishedPostCount(postCount);
    }

    async function getRandomPost() {
        setIdeaLoading(true);
        // const postCount = await getPostCount();
        const index = generateRandomNumber(1, publishedPostCount);

        const newIdea = await contract.posts(index, account);

        setIdea(newIdea);
        toast('Successfully read a new idea.', { type: 'success' });
        setIdeaLoading(false);
    }

    async function getPostById() {
        setIdeaLoading(true);
        // const postCount = await getPostCount();

        const _userGivenId = parseInt(userGivenId, 10);
        const newIdea = await contract.posts(_userGivenId, account);

        setIdea(newIdea);
        toast('Successfully read a new idea.', { type: 'success' });
        setIdeaLoading(false);
    }

    async function setExistingContractAddress(contractAddress: string) {
        const _contract = new SocialNetworkWrapper(web3);
        _contract.useDeployed(contractAddress.trim());

        setContract(_contract);
    }

    async function createNewPost() {
        try {
            setTransactionInProgress(true);
            await contract.createPost(postContent, account);
            toast(
                'Your ideas successfully shared with Nervos Network. You can refresh the read value now manually.',
                { type: 'success' }
            );
        } catch (error) {
            console.error(error);
            toast.error(
                'There was an error sending your transaction. Please check developer console.'
            );
        } finally {
            setTransactionInProgress(false);
            setPostContent('');
            setPublishedPostCount(p => p + 1);
        }
    }

    useEffect(() => {
        if (web3) {
            return;
        }

        (async () => {
            const _web3 = await createWeb3();
            setWeb3(_web3);

            const _accounts = [(window as any).ethereum.selectedAddress];
            setAccounts(_accounts);

            console.log({ _accounts });
            const _contract = new SocialNetworkWrapper(_web3);
            console.log('CONTRACT::', _contract);
            setContract(_contract);

            const postCount = await _contract.postCount(account);
            setPublishedPostCount(postCount);
            if (_accounts && _accounts[0]) {
                const _l2Balance = BigInt(await _web3.eth.getBalance(_accounts[0]));
                setL2Balance(_l2Balance);
            }
        })();
    });

    const LoadingIndicator = () => <span className="rotating-icon">⚙️</span>;

    return (
        <div className="app">
            <Navbar ethAccount={accounts?.[0]} polyAccount={polyjuiceAddress || ' - '} />
            {publishedPostCount > 0 && (
                <div style={{ textAlign: 'center' }}>
                    {' '}
                    <h3>Published Ideas: {publishedPostCount}</h3>
                </div>
            )}
            <div>
                <div className="add-post">
                    <textarea
                        rows={3}
                        placeholder="Share your ideas with Nervos Network"
                        onChange={e => setPostContent(e.target.value)}
                    />
                    <button onClick={createNewPost}>Share</button>
                </div>
                <div className="ideas">
                    <button className="ideas-btn" onClick={getRandomPost}>
                        Get Random Idea
                    </button>
                </div>
                <div className="ideas2">
                    {publishedPostCount > 0 && (
                        <input
                            type="number"
                            max={publishedPostCount}
                            onChange={e => setUserGivenId(e.target.value)}
                        />
                    )}
                    <button className="ideas-btn" onClick={getPostById}>
                        Get By Id
                    </button>
                </div>
                <div className="idea-wrapper">
                    {ideaLoading ? (
                        <LoadingIndicator />
                    ) : (
                        idea?.content.length > 0 && (
                            <div className="idea">
                                <div>
                                    <p>
                                        Idea author: <strong>{idea.author}</strong>
                                    </p>
                                </div>
                                <hr />
                                <h3>{idea.content}</h3>
                            </div>
                        )
                    )}
                </div>{' '}
            </div>

            {/* <br />
            <br />
            <br />
            <br />
            <input type="text" onChange={e => setPostContent(e.target.value)} />
            <button onClick={createNewPost} disabled={!contract}>
                Set new stored value
            </button>
            <br />
            <br />
            <br />
            <br />
            <hr />
            The contract is deployed on Nervos Layer 2 - Godwoken + Polyjuice. After each
            transaction you might need to wait up to 120 seconds for the status to be reflected. */}
            <ToastContainer />
        </div>
    );
}
