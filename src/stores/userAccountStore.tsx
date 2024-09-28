import React from 'react';
import { observable } from 'mobx';
import { useLocalStore } from 'mobx-react-lite';
import { io } from 'socket.io-client'

const socket = io()

const createStore = () => {
    socket.on("RESPONSE_consoleLogin", (success: string) => {
        const successObject = JSON.parse(success)
        store.setUserLoggedIn(successObject)   
    })

    // socket.on("RESPONSE_podiumAuthStatus", (authorized: string) => {
    //     const isAuthorized: boolean = JSON.parse(authorized)
    //     store.setIsAuthorizedWithPodium(isAuthorized)
    // })

    const store = {
        loggedIn: observable.box(false),
        authorizedWithPodium: observable.box(false),

        get isLoggedIn() {
            return store.loggedIn.get()
        },

        setUserLoggedIn: (isLoggedIn: boolean) => {
            store.loggedIn.set(isLoggedIn)
        },

        attemptLogin: (password: string) => {
            socket.emit("REQUEST_consoleLogin", password)
        },

        get isAuthorizedWithPodium() {
            return store.authorizedWithPodium.get()
        },

        setIsAuthorizedWithPodium: (isAuthorized: boolean) => {
            store.authorizedWithPodium.set(isAuthorized)
        }

    }

    return store
}

type TStore = ReturnType<typeof createStore>

export const storeContext = React.createContext<TStore | null>(null)

export const StoreProvider: React.FC = ({ children }) => {
    const store = useLocalStore(createStore)

    return (
        <storeContext.Provider value={store}>
            {children}
        </storeContext.Provider>
    )
}

export default StoreProvider