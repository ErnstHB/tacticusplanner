﻿import axios, { AxiosRequestConfig, AxiosResponse, Method } from 'axios';

const baseUrl = 'https://dev-tacticus.azurewebsites.net/api/';
// const baseUrl = 'https://helloworldseveryn.azurewebsites.net/api/';
// const baseUrl = 'http://localhost:7071/api/';

export const callApi = <TData = any | null, TError = any | null, TResponse = TData>(
    method: Method,
    url: string,
    data?: TData
): Promise<AxiosResponse<TResponse, TError>> => {
    const config: AxiosRequestConfig<TData> = {
        method,
        url: baseUrl + url,
        headers: {
            'Content-Type': 'application/json',
            // 'x-functions-key': 'HCBedLkPMCgfKqOboAhxkW_Q6SOvw4mQg0Ompp690ca0AzFuUXyDKg==',
            'x-functions-key': 'mU8qN58rHNj5X3C8HnDOvDUS_pCUxppQzTGf5I5Js0waAzFuySrrYg==',
            Authorization: localStorage.getItem('token'),
        },
        data: data,
    };

    return axios.request<TResponse>(config);
};
