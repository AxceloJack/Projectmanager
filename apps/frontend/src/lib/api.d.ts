declare const API: import("axios").AxiosInstance;
export declare const authAPI: {
    register: (email: string, password: string, workspaceName: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    login: (email: string, password: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    refresh: () => Promise<import("axios").AxiosResponse<any, any, {}>>;
};
export declare const clientsAPI: {
    list: () => Promise<import("axios").AxiosResponse<any, any, {}>>;
    get: (id: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    create: (data: any) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    update: (id: string, data: any) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    delete: (id: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
};
export declare const tasksAPI: {
    list: (clientId?: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    get: (id: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    create: (data: any) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    update: (id: string, data: any) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    delete: (id: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    addComment: (taskId: string, content: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
};
export declare const publicAPI: {
    getClient: (publicKey: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    addComment: (publicKey: string, taskId: string, content: string, clientName: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    approveTask: (publicKey: string, taskId: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    requestRevisions: (publicKey: string, taskId: string, reason: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
};
export declare const adminAPI: {
    getPendingUsers: () => Promise<import("axios").AxiosResponse<any, any, {}>>;
    approveUser: (userId: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    rejectUser: (userId: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
};
export declare const slackAPI: {
    getIntegration: () => Promise<import("axios").AxiosResponse<any, any, {}>>;
    connectWorkspace: (data: any) => Promise<import("axios").AxiosResponse<any, any, {}>>;
};
export default API;
//# sourceMappingURL=api.d.ts.map