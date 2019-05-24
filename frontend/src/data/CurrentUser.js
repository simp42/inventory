import {StitchServiceError, UserPasswordCredential} from 'mongodb-stitch-browser-sdk';

export default class CurrentUser {
    constructor(stitchClient, db) {
        this.stitch = stitchClient;
        this.db = db;
    }

    isLoggedIn() {
        return this.stitch &&
            this.stitch.auth &&
            this.stitch.auth.isLoggedIn;

    }

    async logout() {
        return await this.stitch.auth.logout();
    }

    async login(username, password) {
        if (this.isLoggedIn()) {
            return true;
        }

        const credentials = new UserPasswordCredential(username, password);

        try {
            const userObj = await this.stitch.auth.loginWithCredential(credentials);
            if (userObj) {
                return true;
            }
        }
        catch (e) {
            if (e instanceof StitchServiceError) {
                if (e.errorCode === 46) {
                    // invalid username / password
                    return false;
                }

            }
            console.error(e);

            alert(e);
        }
    }

    profile() {
        if (! this.isLoggedIn()) {
            return null;
        }

        return this.stitch.auth.user.profile;
    }
}