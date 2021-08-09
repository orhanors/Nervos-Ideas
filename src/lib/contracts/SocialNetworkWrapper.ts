import Web3 from 'web3';
import * as SocialNetworkJSON from '../../../build/contracts/SocialNetwork.json';
import { SocialNetwork } from '../../types/SocialNetwork';

const DEFAULT_SEND_OPTIONS = {
    gas: 6000000
};

export class SocialNetworkWrapper {
    web3: Web3;

    contract: SocialNetwork;

    address: string;

    constructor(web3: Web3) {
        this.web3 = web3;
        this.address = '0xec1706d0A6b351784cADF40E91aCA8a56cd6adad';
        this.contract = new this.web3.eth.Contract(SocialNetworkJSON.abi as any) as any;
        this.contract.options.address = '0xec1706d0A6b351784cADF40E91aCA8a56cd6adad';
    }

    get isDeployed() {
        return Boolean(this.address);
    }

    async postCount(fromAddress: string) {
        const data = await this.contract.methods.postCount().call({ from: fromAddress });

        return parseInt(data, 10);
    }

    async posts(postId: number, fromAddress: string) {
        const data = await this.contract.methods.posts(postId).call({ from: fromAddress });

        return data;
    }

    async createPost(content: string, fromAddress: string) {
        const tx = await this.contract.methods
            .createPost(content)
            .send({ ...DEFAULT_SEND_OPTIONS, from: fromAddress });

        return tx;
    }

    async tipPost(postId: string, fromAddress: string) {
        const _postId = parseInt(postId, 10);
        const tx = await this.contract.methods
            .tipPost(_postId)
            .send({ ...DEFAULT_SEND_OPTIONS, from: fromAddress });

        return tx;
    }

    // async getStoredValue(fromAddress: string) {
    //     const data = await this.contract.methods.get().call({ from: fromAddress });

    //     return parseInt(data, 10);
    // }

    // async setStoredValue(value: number, fromAddress: string) {
    //     const tx = await this.contract.methods.set(value).send({
    //         ...DEFAULT_SEND_OPTIONS,
    //         from: fromAddress,
    //         value
    //     });

    //     return tx;
    // }

    async deploy(fromAddress: string) {
        const deployTx = await (this.contract
            .deploy({
                data: SocialNetworkJSON.bytecode,
                arguments: []
            })
            .send({
                ...DEFAULT_SEND_OPTIONS,
                from: fromAddress,
                to: '0x0000000000000000000000000000000000000000'
            } as any) as any);

        this.useDeployed(deployTx.contractAddress);

        return deployTx.transactionHash;
    }

    useDeployed(contractAddress: string) {
        this.address = contractAddress;
        this.contract.options.address = contractAddress;
    }
}
