import { createContext, useContext, useState } from 'react';

const initialState = {
    setBranch: () => { },
    branch: null,
};

const BranchContext = createContext(initialState);

export const useBranch = () => useContext(BranchContext);

const BranchProvider = ({ children }) => {
    const [branch, setBranchState] = useState(null);

    const setBranch = (branch) => {
        setBranchState(branch);
    };

    return (
        <BranchContext.Provider value={{ setBranch, branch }}>
            {children}
        </BranchContext.Provider>
    );
};

export default BranchProvider;
