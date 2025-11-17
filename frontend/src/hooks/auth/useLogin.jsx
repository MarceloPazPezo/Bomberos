import { useState } from 'react';

const useLogin = () => {
    const [errorRun, setErrorRun] = useState('');
    const [errorPassword, setErrorPassword] = useState('');

    const errorData = (dataMessage) => {
        if (dataMessage.dataInfo === 'run') {
            setErrorRun(dataMessage.message);
        } else if (dataMessage.dataInfo === 'password') {
            setErrorPassword(dataMessage.message);
        }
    };

    const clearErrors = () => {
        setErrorRun('');
        setErrorPassword('');
    };

    return {
        errorRun,
        errorPassword,
        errorData,
        clearErrors,
    };
};

export default useLogin;