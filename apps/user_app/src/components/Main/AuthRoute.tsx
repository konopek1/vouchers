import React from "react";
import { Redirect, Route } from "react-router-dom";
import { LOGIN } from "../../Constants/routes";
import { KeyStorageProvider } from "../../lib/Storage/KeyStorageProvider";

export interface AuthRouteProps {
    component: any,
    isAuth: boolean,
    path: string
}

export function AuthRoute({ component, isAuth, path }: AuthRouteProps) {
    return (
            <Route
                path={path}
                render={(props) => isAuth
                    ? <KeyStorageProvider>{component}</KeyStorageProvider>
                    : <Redirect to={LOGIN} />}
            />
    )
}