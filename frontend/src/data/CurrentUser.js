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

    /**
     * Determines (via server side function call) if the current user is one of the defined admin users
     * @returns {Promise<*>}
     */
    async isAdmin() {
        if (window.__inventory_is_admin) {
            console.log(window.__inventory_is_admin);
            return window.__inventory_is_admin;
        }


        const isAdminResult = await this.stitch.callFunction("isAdmin", []);

        window.__inventory_is_admin = isAdminResult;

        return isAdminResult;
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

    id() {
        if (! this.isLoggedIn()) {
            return null;
        }

        return this.stitch.auth.user.id;
    }

    profile() {
        if (! this.isLoggedIn()) {
            return null;
        }

        return this.stitch.auth.user.profile;
    }
}