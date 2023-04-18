import {ContractClass, Provider} from 'starknet';

interface Inputs {
    name: string;
    type: string;
}

export interface Selectors {
    name: string;
    inputs: Inputs[];
}

const emptySelectors = [{name:"",inputs:[{name:"",type:""}]}];

export const getContractFunctions = async (provider: Provider,contractAddress: string): Promise<Selectors[]> => {
    if (!contractAddress || contractAddress === "") return [];
    const code: ContractClass = await provider.getClassAt(contractAddress);
    let selectors: Selectors[] = [];
    if (code && code.abi) {
        for (let i = 0; i < code.abi.length; i++) {
            if (code.abi[i].type === "function") {
                selectors.push({name:code.abi[i].name,inputs:code.abi[i].inputs});
            }
        }
        return selectors;
    }
    return emptySelectors;
}