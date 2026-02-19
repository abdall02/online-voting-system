import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const { token } = useContext(AuthContext);
    const [socket, setSocket] = useState(null);

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://online-voting-system-backend-1aph.onrender.com';

    useEffect(() => {
        const newSocket = io(SOCKET_URL, {
            auth: { token }
        });

        setSocket(newSocket);

        return () => newSocket.close();
    }, [token, SOCKET_URL]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
