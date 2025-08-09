import { useState } from 'react';

const useLogin = () => {
    const [errorRut, setErrorRut] = useState('');
    const [errorPassword, setErrorPassword] = useState('');

    const errorData = (dataMessage) => {
        if (dataMessage.dataInfo === 'run') {
            setErrorRut(dataMessage.message);
        } else if (dataMessage.dataInfo === 'password') {
            setErrorPassword(dataMessage.message);
        }
    };

    const clearErrors = () => {
        setErrorRut('');
        setErrorPassword('');
    };

    return {
        errorRut,
        errorPassword,
        errorData,
        clearErrors,
    };
};

export default useLogin;