import Chrome from "../Chrome";

export interface ISessions {
    restore(sessionId : string, inBackground? : boolean) : Promise<void>;
}

export class Sessions implements ISessions {
    restore(sessionId : string, inBackground? : boolean) : Promise<void> {
        return Chrome.sessions.restore(sessionId, inBackground);
    }
}
